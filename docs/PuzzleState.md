# Answer states

An answer state shares the current board answer, complete or incomplete, without a database. It contains the puzzle clues and the supported answer marks, not a solving history or a guarantee of correctness. Use **Trace → Export state** or **Import state** on the puzzle player page.

## URL and format

```text
/p?state=STATE&PUZZLE/cols/rows/clues
```

`STATE` is a UTF-8 native pzpr file (`pzprv3.1` for Slitherlink and `pzprv3` for Nurikabe) compressed with raw DEFLATE and encoded as unpadded URL-safe Base64. Encoding and decoding happen locally using the browser's `CompressionStream` and `DecompressionStream` with `deflate-raw` support. The manual import dialog also accepts plain pzpr text in the relevant version or Base64 using raw DEFLATE or zlib.

A nonempty `state` is applied automatically when there is no nonempty `trace` parameter. If both are present, `trace` takes precedence even when loading it fails; paste the state into the import dialog to apply it manually. See [solving recordings](Recordings.md) for the server-backed history format.

## Import behavior

The state must match the open puzzle's type, dimensions and clues. For standard Slitherlink, import replaces answer lines and clears cell background colors and border crosses; export omits those auxiliary marks. For Nurikabe, import replaces both black cells (`#`) and non-black marks (`+`); export preserves both. Each import is one undoable operation. **Show board changes** displays the native operations produced by the import, not a solving trace. Use the puzzle's Check button to verify an answer.

## Code and verification

- [`src-ui/state.js`](../src-ui/state.js): state validation, conversion, compression and operations.
- [`src-ui/trace.js`](../src-ui/trace.js) and [`src-ui/p.html`](../src-ui/p.html): URL handling and dialogs.
- [`test/state_test.js`](../test/state_test.js) and [`test/fixtures/`](../test/fixtures/): state tests and examples.

After building with Node.js 24 or newer, run `npx mocha test/state_test.js`. The test reads `dist/js/pzpr.js`; rebuild after core changes.

## Supported puzzle types

- Standard Slitherlink (`slither`); the full-clue variant is not supported.
- Nurikabe (`nurikabe`).

Other puzzle types are not currently supported. To add one, define its answer and auxiliary fields in `src-ui/state.js` after checking its native pzpr file version, serialization and operations. Test clue matching, export/import, replacement of existing marks, undo/redo and compressed round trips; puzzle types with more complex semantics may need additional handling rather than just a field profile.
