# Answer states

An answer state shares the current board answer, complete or incomplete, without a database. It contains the puzzle clues and answer lines, not a solving history or a guarantee of correctness. Use **Trace → Export state** or **Import state** on the puzzle player page.

## URL and format

```text
/p?state=STATE&slither/cols/rows/clues
```

`STATE` is a UTF-8 pzprv3.1 file compressed with raw DEFLATE and encoded as unpadded URL-safe Base64. Encoding and decoding happen locally using the browser's `CompressionStream` and `DecompressionStream` with `deflate-raw` support. The manual import dialog also accepts plain pzprv3.1 text or Base64 using raw DEFLATE or zlib.

A nonempty `state` is applied automatically when there is no nonempty `trace` parameter. If both are present, `trace` takes precedence even when loading it fails; paste the state into the import dialog to apply it manually. See [solving recordings](Recordings.md) for the server-backed history format.

## Import behavior

The state must match the open puzzle's type, dimensions and clues. Import replaces its answer lines and clears cell background colors and border crosses as one undoable operation. Export omits those auxiliary marks. **Show board changes** displays the native operations produced by the import, not a solving trace. Use the puzzle's Check button to verify an answer.

## Code and verification

- [`src-ui/state.js`](../src-ui/state.js): state validation, conversion, compression and operations.
- [`src-ui/trace.js`](../src-ui/trace.js) and [`src-ui/p.html`](../src-ui/p.html): URL handling and dialogs.
- [`test/state_test.js`](../test/state_test.js) and [`test/fixtures/slither_state.txt`](../test/fixtures/slither_state.txt): state tests and example.

After building with Node.js 24 or newer, run `npx mocha test/state_test.js`. The test reads `dist/js/pzpr.js`; rebuild after core changes.

## Supported puzzle types

- Standard Slitherlink (`slither`). The full-clue variant and all other puzzle types are not currently supported.
