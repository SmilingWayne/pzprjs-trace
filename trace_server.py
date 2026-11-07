#!/usr/bin/env python3
"""Serve the built puzz.link pages and the trace sqlite database.

Runtime is the Python standard library, so a machine that only has the
built dist/ directory and this file can host it. Node is for the build.

    python3 trace_server.py
    PZPR_TRACE_DB=/var/lib/pzprjs/traces.sqlite python3 trace_server.py --host 0.0.0.0
"""

import argparse
import json
import math
import os
import re
import secrets
import sqlite3
import string
import time
from collections import deque
from datetime import datetime, timezone
from http.server import HTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
from urllib.parse import urlsplit, urlunsplit

ID_ALPHABET = string.ascii_letters + string.digits + "_"
ID_LENGTH = 12
ID_RE = re.compile(r"^[A-Za-z0-9_]+$")

MAX_BODY_BYTES = int(os.environ.get("PZPR_TRACE_MAX_BODY_BYTES", 256 * 1024))
DB_MAX_BYTES = int(os.environ.get("PZPR_TRACE_DB_MAX_BYTES", 4 * 1024**3))
POST_RATE_LIMIT = int(os.environ.get("PZPR_TRACE_POST_RATE_LIMIT", 10))
POST_RATE_WINDOW = float(os.environ.get("PZPR_TRACE_POST_RATE_WINDOW", 60.0))
RATE_MAX_IPS = 4096
LOOPBACK_PEERS = ("127.0.0.1", "::1")

SCHEMA = """
CREATE TABLE IF NOT EXISTS traces (
    id TEXT PRIMARY KEY,
    puzzle TEXT NOT NULL,
    body TEXT NOT NULL,
    name TEXT NOT NULL,
    note TEXT NOT NULL,
    marked_at TEXT NOT NULL,
    elapsed_ms INTEGER NOT NULL,
    created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS traces_puzzle ON traces(puzzle);
"""


def connect(path):
    Path(path).parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(path)
    try:
        conn.row_factory = sqlite3.Row
        page_size = conn.execute("PRAGMA page_size").fetchone()[0]
        max_pages = max(2, DB_MAX_BYTES // page_size)
        conn.execute("PRAGMA max_page_count = %d" % max_pages)
        conn.execute("PRAGMA journal_mode=WAL")
        conn.executescript(SCHEMA)
    except BaseException:
        conn.close()
        raise
    return conn


def new_id(conn):
    for _ in range(8):
        ident = "".join(secrets.choice(ID_ALPHABET) for _ in range(ID_LENGTH))
        if conn.execute("SELECT 1 FROM traces WHERE id = ?", (ident,)).fetchone() is None:
            return ident
    raise RuntimeError("id")


def create_trace(conn, data):
    if not isinstance(data, dict):
        raise ValueError("json")
    puzzle = data.get("puzzle")
    body = data.get("body")
    name = data.get("name", "")
    note = data.get("note", "")
    marked_at = data.get("marked_at")
    elapsed = data.get("elapsed_ms")
    if not isinstance(puzzle, str) or puzzle == "":
        raise ValueError("puzzle")
    if not isinstance(body, str) or "history:" not in body:
        raise ValueError("body")
    if not isinstance(name, str) or not isinstance(note, str):
        raise ValueError("text")
    if not isinstance(marked_at, str) or marked_at == "":
        raise ValueError("marked_at")
    if isinstance(elapsed, bool) or not isinstance(elapsed, int) or elapsed < 0:
        raise ValueError("elapsed_ms")
    ident = new_id(conn)
    created = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    conn.execute(
        "INSERT INTO traces (id, puzzle, body, name, note, marked_at, elapsed_ms, created_at)"
        " VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        (ident, puzzle, body, name, note, marked_at, elapsed, created),
    )
    conn.commit()
    return get_trace(conn, ident)


def get_trace(conn, ident):
    if ID_RE.fullmatch(ident) is None:
        return None
    row = conn.execute("SELECT * FROM traces WHERE id = ?", (ident,)).fetchone()
    if row is None:
        return None
    return {key: row[key] for key in row.keys()}


def make_handler(db_path, dist_dir):
    db_path = str(db_path)
    dist_dir = str(dist_dir)
    post_hits = {}

    def rate_limit_retry_after(client_address, headers):
        """Return seconds to retry after when this POST is over the limit."""
        limit = POST_RATE_LIMIT
        if limit <= 0:
            return None
        peer = client_address[0]
        forwarded = headers.get("CF-Connecting-IP")
        if peer in LOOPBACK_PEERS:
            if not forwarded:
                return None
            key = forwarded.strip()
        else:
            key = peer
        now = time.monotonic()
        window = POST_RATE_WINDOW
        hits = post_hits.get(key)
        if hits is None:
            if len(post_hits) >= RATE_MAX_IPS:
                stale = [
                    other
                    for other, stamps in post_hits.items()
                    if not stamps or now - stamps[-1] >= window
                ]
                for other in stale:
                    del post_hits[other]
                if len(post_hits) >= RATE_MAX_IPS:
                    del post_hits[next(iter(post_hits))]
            hits = post_hits[key] = deque()
        while hits and now - hits[0] >= window:
            hits.popleft()
        if len(hits) >= limit:
            return max(1, math.ceil(hits[0] + window - now))
        hits.append(now)
        return None

    class TraceHandler(SimpleHTTPRequestHandler):
        def __init__(self, *args, **kwargs):
            super().__init__(*args, directory=dist_dir, **kwargs)

        def end_headers(self):
            self.send_header("Cache-Control", "no-cache")
            super().end_headers()

        def route_player(self):
            parts = urlsplit(self.path)
            if parts.path == "/p.html":
                target = urlunsplit(("", "", "/p", parts.query, ""))
                self.send_response(302)
                self.send_header("Location", target)
                self.send_header("Content-Length", "0")
                self.end_headers()
                return True
            if parts.path in ("/p", "/p/"):
                self.path = urlunsplit(("", "", "/p.html", parts.query, ""))
            return False

        def do_HEAD(self):
            if self.route_player():
                return
            super().do_HEAD()

        def do_GET(self):
            if self.path.startswith("/api/traces/"):
                self.handle_get_trace()
                return
            if self.route_player():
                return
            super().do_GET()

        def do_POST(self):
            if self.path != "/api/traces":
                self.send_error(404)
                return
            self.handle_post_trace()

        def handle_get_trace(self):
            ident = self.path[len("/api/traces/") :]
            conn = connect(db_path)
            try:
                row = get_trace(conn, ident)
            finally:
                conn.close()
            if row is None:
                self.send_json(404, {"error": "missing"})
                return
            self.send_json(200, row)

        def handle_post_trace(self):
            retry_after = rate_limit_retry_after(self.client_address, self.headers)
            if retry_after is not None:
                self.close_connection = True
                self.send_json(
                    429, {"error": "rate limit"}, {"Retry-After": str(retry_after)}
                )
                return
            raw_length = self.headers.get("Content-Length")
            try:
                length = int(raw_length) if raw_length is not None else 0
            except (TypeError, ValueError):
                length = 0
            if length <= 0:
                self.close_connection = True
                self.send_json(400, {"error": "bad"})
                return
            if length > MAX_BODY_BYTES:
                self.close_connection = True
                self.send_json(413, {"error": "too large"})
                return
            try:
                data = json.loads(self.rfile.read(length).decode("utf-8"))
                conn = connect(db_path)
                try:
                    row = create_trace(conn, data)
                finally:
                    conn.close()
            except (ValueError, json.JSONDecodeError, UnicodeError):
                self.send_json(400, {"error": "bad"})
                return
            except sqlite3.Error as exc:
                self.log_error(
                    "storage failure from %s: %s", self.client_address[0], exc
                )
                self.send_json(507, {"error": "storage"})
                return
            self.send_json(201, row)

        def send_json(self, code, payload, headers=None):
            raw = json.dumps(payload, ensure_ascii=False).encode("utf-8")
            self.send_response(code)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.send_header("Content-Length", str(len(raw)))
            self.send_header("Cache-Control", "no-store")
            for name, value in (headers or {}).items():
                self.send_header(name, value)
            self.end_headers()
            self.wfile.write(raw)

    return TraceHandler


def main():
    parser = argparse.ArgumentParser(description="Serve dist/ and the trace database.")
    parser.add_argument("--host", default="127.0.0.1")
    parser.add_argument("--port", type=int, default=8765)
    parser.add_argument(
        "--db", default=os.environ.get("PZPR_TRACE_DB", "data/traces.sqlite")
    )
    parser.add_argument("--dist", default="dist")
    args = parser.parse_args()
    dist = Path(args.dist)
    if not (dist / "p.html").is_file():
        raise SystemExit("dist/p.html is missing; run npm run build first")
    connect(args.db).close()
    httpd = HTTPServer((args.host, args.port), make_handler(args.db, dist))
    print("http://%s:%s/  db=%s" % (args.host, args.port, args.db))
    httpd.serve_forever()


if __name__ == "__main__":
    main()
