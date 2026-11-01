import csv
import http.client
import json
import sys
import tempfile
import threading
import unittest
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


if __name__ == "__main__":
    unittest.main()
