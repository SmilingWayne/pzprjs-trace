# Solving recordings

A recording preserves a puzzle's native pzpr file data and operation history, including step times and the current history position. It can be unfinished. The Trace menu is available on a puzzle player page with a puzzle body; it is hidden in edit mode. Users can export or manually import a recording, replay it, or continue from a selected step. A new move after rewinding discards the later history.

## URL and storage

A saved recording uses `/p?trace=ID&PUZZLE`, where `PUZZLE` is the usual pzpr puzzle query. On opening, the client requests `GET /api/traces/ID` and opens the stored body. Saving sends `POST /api/traces` with `puzzle`, `body`, `name`, `note`, `marked_at`, and `elapsed_ms`; the response contains a new ID. Names and notes may be empty. Each save creates a new record. IDs generated now have 12 letters, digits or underscores; existing shorter IDs remain readable.

`trace_server.py` serves `dist/` and uses SQLite, defaulting to `data/traces.sqlite`. The `traces` table also stores `created_at` and indexes `puzzle`. A recording link requires access to the server and database containing that ID; it does not embed the history. There is no login in the current implementation. See [answer states](PuzzleState.md) for precedence when both URL parameters are present.

The import dialog accepts a full pzpr file with `history:` or a history JSON block for the open puzzle. Playback uses native undo and redo. The replay bar supports dragging, stepping, speed from 0.125× to 32×, and optional recorded timing; its default timing is 400 ms per step at 1×. The bar displays recorded step timing; the existing page timer remains a separate session clock.

## Code and local verification

- [`src-ui/trace.js`](../src-ui/trace.js): URL handling, recording import/export and playback, plus answer-state UI integration.
- [`src-ui/p.html`](../src-ui/p.html), [`src-ui/css/trace.css`](../src-ui/css/trace.css), and [`src-ui/res/`](../src-ui/res/): controls, styling and strings.
- [`trace_server.py`](../trace_server.py): static pages, `/p` routing and the trace API. `/p.html` redirects to `/p`.
- [`test/trace_replay_test.js`](../test/trace_replay_test.js) and [`test/trace_server_test.py`](../test/trace_server_test.py): history and server tests.

From the repository root, use Node.js 24 or newer:

```sh
npm install
npm run build
python3 trace_server.py
```

Open `http://127.0.0.1:8765/`. The server accepts `--host`, `--port`, `--dist`, and `--db`; `PZPR_TRACE_DB` also selects the database. A static server such as `make serve` does not provide the trace API. Run the relevant tests after changes:

```sh
npx mocha test/trace_replay_test.js
python3 -m unittest test.trace_server_test
```

The JavaScript test reads the built `dist/js/pzpr.js`, so rebuild after core changes. One server test reads `../puzzlekit-dataset/puzzlink_crawlers/logs/merged_puzzles.csv` from the workspace.

After editing `src-ui/css/trace.css`, format it with `npx prettier --write src-ui/css/trace.css`. CI runs `npm run check-format` for JavaScript and CSS.
