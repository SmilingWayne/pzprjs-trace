import contextlib
import csv
import http.client
import io
import json
import socket
import sys
import tempfile
import threading
import unittest
import urllib.error
import urllib.request
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

import trace_server


CSV_PATH = (
    Path(__file__).resolve().parents[2]
    / "puzzlekit-dataset"
    / "puzzlink_crawlers"
    / "logs"
    / "merged_puzzles.csv"
)


def puzzle_query(url):
    mark = url.find("p?")
    if mark < 0:
        return ""
    return url[mark + 2 :]


def first_small_puzzle():
    with CSV_PATH.open(newline="") as handle:
        for row in csv.DictReader(handle):
            query = puzzle_query(row["puzz_link_url"])
            parts = query.split("/")
            if len(parts) < 4 or parts[3] == "":
                continue
            if parts[0] != "nurikabe":
                continue
            rows, cols = int(parts[1]), int(parts[2])
            if 4 <= rows <= 6 and 4 <= cols <= 6:
                return query
    raise AssertionError("no small nurikabe in the crawler log")


class TraceStoreTest(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.db = str(Path(self.tmp.name) / "traces.sqlite")

    def tearDown(self):
        self.tmp.cleanup()

    def payload(self, **extra):
        data = {
            "puzzle": "nurikabe/6/6/3g3t3g3n3m",
            "body": 'pzprv3\nnurikabe\n6\n6\n.\nhistory:{"type":"pzpr","time":1500}',
            "name": "",
            "note": "",
            "marked_at": "2026-10-18T20:00:00",
            "elapsed_ms": 1500,
        }
        data.update(extra)
        return data

    def test_roundtrip_keeps_empty_name_and_new_id(self):
        conn = trace_server.connect(self.db)
        first = trace_server.create_trace(conn, self.payload(note="一步"))
        second = trace_server.create_trace(conn, self.payload())
        conn.close()
        self.assertRegex(first["id"], r"^[A-Za-z0-9_]{12}$")
        self.assertNotEqual(first["id"], second["id"])
        self.assertEqual(first["name"], "")
        self.assertEqual(first["note"], "一步")
        self.assertEqual(first["elapsed_ms"], 1500)
        self.assertIn("history:", first["body"])
        again = trace_server.connect(self.db)
        self.assertEqual(trace_server.get_trace(again, first["id"])["puzzle"], first["puzzle"])
        self.assertIsNone(trace_server.get_trace(again, "has space"))
        again.execute(
            "INSERT INTO traces (id, puzzle, body, name, note, marked_at, elapsed_ms, created_at)"
            " VALUES (?, ?, ?, '', '', ?, ?, ?)",
            (
                "k1CbfIrm",
                first["puzzle"],
                first["body"],
                first["marked_at"],
                first["elapsed_ms"],
                first["created_at"],
            ),
        )
        again.commit()
        self.assertEqual(trace_server.get_trace(again, "k1CbfIrm")["body"], first["body"])
        again.close()

    def test_rejects_body_without_history(self):
        conn = trace_server.connect(self.db)
        with self.assertRaises(ValueError):
            trace_server.create_trace(conn, self.payload(body="pzprv3\nnurikabe\n"))
        conn.close()

    def test_csv_puzzle_key_roundtrip(self):
        query = first_small_puzzle()
        conn = trace_server.connect(self.db)
        row = trace_server.create_trace(conn, self.payload(puzzle=query))
        conn.close()
        self.assertEqual(row["puzzle"], query)
        self.assertGreaterEqual(len(query.split("/")), 4)

    def test_http_post_and_get(self):
        dist = tempfile.TemporaryDirectory()
        httpd = trace_server.HTTPServer(
            ("127.0.0.1", 0), trace_server.make_handler(self.db, dist.name)
        )
        thread = threading.Thread(target=httpd.serve_forever, daemon=True)
        thread.start()
        port = httpd.server_address[1]
        try:
            body = json.dumps(self.payload(name="ada")).encode("utf-8")
            request = urllib.request.Request(
                "http://127.0.0.1:%s/api/traces" % port,
                data=body,
                headers={"Content-Type": "application/json"},
            )
            with urllib.request.urlopen(request) as response:
                saved = json.loads(response.read().decode("utf-8"))
                self.assertEqual(response.status, 201)
                self.assertRegex(saved["id"], r"^[A-Za-z0-9_]{12}$")
            with urllib.request.urlopen(
                "http://127.0.0.1:%s/api/traces/%s" % (port, saved["id"])
            ) as response:
                loaded = json.loads(response.read().decode("utf-8"))
            self.assertEqual(loaded["name"], "ada")
            self.assertEqual(loaded["body"], self.payload()["body"])
        finally:
            httpd.shutdown()
            thread.join(timeout=3)
            dist.cleanup()

    def test_player_page_drops_html_suffix(self):
        dist = tempfile.TemporaryDirectory()
        Path(dist.name, "p.html").write_text("PLAYER", encoding="utf-8")
        httpd = trace_server.HTTPServer(
            ("127.0.0.1", 0), trace_server.make_handler(self.db, dist.name)
        )
        thread = threading.Thread(target=httpd.serve_forever, daemon=True)
        thread.start()
        port = httpd.server_address[1]
        query = "trace=abc&nurikabe/6/6/3g3t3g3n3m"
        try:
            conn = http.client.HTTPConnection("127.0.0.1", port)
            conn.request("GET", "/p?" + query)
            response = conn.getresponse()
            body = response.read().decode("utf-8")
            self.assertEqual(response.status, 200)
            self.assertEqual(body, "PLAYER")
            conn.close()

            conn = http.client.HTTPConnection("127.0.0.1", port)
            conn.request("GET", "/p.html?" + query)
            response = conn.getresponse()
            self.assertEqual(response.status, 302)
            self.assertEqual(response.getheader("Location"), "/p?" + query)
            response.read()
            conn.close()

            conn = http.client.HTTPConnection("127.0.0.1", port)
            conn.request("HEAD", "/p.html?" + query)
            response = conn.getresponse()
            self.assertEqual(response.status, 302)
            self.assertEqual(response.getheader("Location"), "/p?" + query)
            response.read()
            conn.close()
        finally:
            httpd.shutdown()
            thread.join(timeout=3)
            dist.cleanup()


class TraceHardeningTest(unittest.TestCase):
    """Write-path limits: body size, database size and POST rate limiting."""

    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.db = str(Path(self.tmp.name) / "traces.sqlite")
        self.dist = tempfile.TemporaryDirectory()
        Path(self.dist.name, "index.html").write_text("INDEX", encoding="utf-8")
        self.saved = {
            name: getattr(trace_server, name)
            for name in (
                "MAX_BODY_BYTES",
                "DB_MAX_BYTES",
                "POST_RATE_LIMIT",
                "POST_RATE_WINDOW",
                "RATE_MAX_IPS",
            )
        }

    def tearDown(self):
        for name, value in self.saved.items():
            setattr(trace_server, name, value)
        self.dist.cleanup()
        self.tmp.cleanup()

    @contextlib.contextmanager
    def serve(self):
        httpd = trace_server.HTTPServer(
            ("127.0.0.1", 0), trace_server.make_handler(self.db, self.dist.name)
        )
        thread = threading.Thread(target=httpd.serve_forever, daemon=True)
        thread.start()
        try:
            yield httpd.server_address[1]
        finally:
            httpd.shutdown()
            thread.join(timeout=3)
            httpd.server_close()

    def payload(self, **extra):
        data = {
            "puzzle": "nurikabe/6/6/3g3t3g3n3m",
            "body": 'pzprv3\nnurikabe\n6\n6\n.\nhistory:{"type":"pzpr","time":1500}',
            "name": "",
            "note": "",
            "marked_at": "2026-10-18T20:00:00",
            "elapsed_ms": 1500,
        }
        data.update(extra)
        return data

    def post(self, port, headers=None, data=None):
        body = json.dumps(self.payload() if data is None else data).encode("utf-8")
        request = urllib.request.Request(
            "http://127.0.0.1:%s/api/traces" % port,
            data=body,
            headers={"Content-Type": "application/json", **(headers or {})},
        )
        try:
            with urllib.request.urlopen(request) as response:
                return response.status, response.headers, response.read()
        except urllib.error.HTTPError as exc:
            return exc.code, exc.headers, exc.read()

    def get(self, port, path):
        try:
            with urllib.request.urlopen(
                "http://127.0.0.1:%s%s" % (port, path)
            ) as response:
                return response.status, response.read()
        except urllib.error.HTTPError as exc:
            return exc.code, exc.read()

    def raw_post(self, port, header_lines, body=b""):
        request = (
            "POST /api/traces HTTP/1.0\r\nHost: 127.0.0.1\r\n" + header_lines + "\r\n"
        )
        with socket.create_connection(("127.0.0.1", port), timeout=10) as sock:
            sock.sendall(request.encode("ascii") + body)
            chunks = []
            while True:
                chunk = sock.recv(65536)
                if not chunk:
                    break
                chunks.append(chunk)
        return int(b"".join(chunks).split(b" ", 2)[1])

    def trace_count(self):
        conn = trace_server.connect(self.db)
        try:
            return conn.execute("SELECT COUNT(*) FROM traces").fetchone()[0]
        finally:
            conn.close()

    def test_body_at_limit_is_accepted_and_saved(self):
        data = self.payload()
        trace_server.MAX_BODY_BYTES = len(json.dumps(data).encode("utf-8"))
        with self.serve() as port:
            status, _, raw = self.post(port, data=data)
        self.assertEqual(status, 201)
        self.assertRegex(json.loads(raw)["id"], r"^[A-Za-z0-9_]{12}$")

    def test_missing_or_invalid_content_length_is_rejected(self):
        with self.serve() as port:
            self.assertEqual(self.raw_post(port, ""), 400)
            self.assertEqual(self.raw_post(port, "Content-Length: nope\r\n"), 400)
            self.assertEqual(self.raw_post(port, "Content-Length: 0\r\n"), 400)
        self.assertEqual(self.trace_count(), 0)

    def test_oversize_body_is_rejected_without_write(self):
        conn = trace_server.connect(self.db)
        trace_server.create_trace(conn, self.payload())
        conn.close()
        self.assertEqual(self.trace_count(), 1)
        with self.serve() as port:
            # Declared length only: the server must reject before reading the body.
            status = self.raw_post(
                port, "Content-Type: application/json\r\nContent-Length: 300000\r\n"
            )
        self.assertEqual(status, 413)
        self.assertEqual(self.trace_count(), 1)

    def test_normal_body_is_saved_and_read_back(self):
        with self.serve() as port:
            status, _, raw = self.post(port, data=self.payload(name="ada"))
            self.assertEqual(status, 201)
            saved = json.loads(raw)
            self.assertRegex(saved["id"], r"^[A-Za-z0-9_]{12}$")
            status, raw = self.get(port, "/api/traces/" + saved["id"])
            self.assertEqual(status, 200)
            loaded = json.loads(raw)
            self.assertEqual(loaded["name"], "ada")
            self.assertEqual(loaded["body"], self.payload()["body"])

    def test_external_posts_are_rate_limited_by_cf_header(self):
        trace_server.POST_RATE_LIMIT = 2
        with self.serve() as port:
            first = self.post(port, {"CF-Connecting-IP": "203.0.113.7"})
            second = self.post(port, {"CF-Connecting-IP": "203.0.113.7"})
            third = self.post(port, {"CF-Connecting-IP": "203.0.113.7"})
            other = self.post(port, {"CF-Connecting-IP": "203.0.113.8"})
        self.assertEqual([first[0], second[0], other[0]], [201, 201, 201])
        self.assertEqual(third[0], 429)
        self.assertEqual(json.loads(third[2]), {"error": "rate limit"})
        retry_after = int(third[1]["Retry-After"])
        self.assertGreaterEqual(retry_after, 1)
        self.assertLessEqual(retry_after, 60)

    def test_direct_loopback_posts_are_exempt_from_rate_limit(self):
        trace_server.POST_RATE_LIMIT = 2
        with self.serve() as port:
            statuses = [self.post(port)[0] for _ in range(5)]
        self.assertEqual(statuses, [201] * 5)

    def test_db_full_returns_507_logs_and_recovers(self):
        trace_server.DB_MAX_BYTES = 1
        with self.serve() as port:
            with contextlib.redirect_stderr(io.StringIO()) as captured:
                status, _, raw = self.post(port)
            self.assertEqual(status, 507)
            self.assertEqual(json.loads(raw), {"error": "storage"})
            self.assertIn("storage failure from 127.0.0.1", captured.getvalue())
            # Static pages keep working while writes are refused.
            status, body = self.get(port, "/index.html")
            self.assertEqual((status, body), (200, b"INDEX"))
            trace_server.DB_MAX_BYTES = 4 * 1024**3
            status, _, raw = self.post(port)
            self.assertEqual(status, 201)
            saved = json.loads(raw)
            status, _ = self.get(port, "/api/traces/" + saved["id"])
            self.assertEqual(status, 200)

    def test_get_and_static_pages_are_not_rate_limited(self):
        trace_server.POST_RATE_LIMIT = 1
        with self.serve() as port:
            self.assertEqual(
                self.post(port, {"CF-Connecting-IP": "198.51.100.9"})[0], 201
            )
            self.assertEqual(
                self.post(port, {"CF-Connecting-IP": "198.51.100.9"})[0], 429
            )
            status, _ = self.get(port, "/api/traces/AAAAAAAAAAAA")
            self.assertEqual(status, 404)
            status, body = self.get(port, "/index.html")
            self.assertEqual((status, body), (200, b"INDEX"))


if __name__ == "__main__":
    unittest.main()
