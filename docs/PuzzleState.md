# Puzzle states

A state saves the current puzzle progress in a link, without a database. It can be an empty, partial, complete, or incorrect board. Open **Trace → Export state** to copy the compressed state or its link; open **Trace → Import state** to paste a compressed state or native pzpr text. A state is a snapshot, not a solving history. Use [recordings](Recordings.md) for replay and step history.

## What is saved

The uncompressed state is exactly the current board's native pzpr file as exported by FileIO, including its clues and all player marks that the file format records. There is no extra state payload. The native file version depends on the puzzle. Marks that FileIO does not record cannot be restored from a state.

| Puzzle | Native file | Player marks saved | Not saved |
| --- | --- | --- | --- |
| Standard Slitherlink (`slither`) | `pzprv3.1` | Lines, border crosses, cell background colors | — |
| Nurikabe (`nurikabe`) | `pzprv3` | Black cells and non-black marks | Clue completion marks |
| Yajilin (`yajilin`, `yajirin`) and Yajilin Regions (`yajilin-regions`, `yajirin-regions`) | `pzprv3` | Black cells, non-black marks, lines and border crosses | Clue completion marks |
| Heyawake (`heyawake`, `heyawacky`) | `pzprv3.1` | Black cells, non-black marks, border lines and crosses | Clue completion marks |
| Nonogram (`nonogram`) | `pzprv3` | Black cells, non-black marks, outside-clue completion marks | — |
| Shimaguni (`shimaguni`) | `pzprv3.1` | Black cells, non-black marks, candidate numbers | Clue completion marks |
| Nurimisaki (`nurimisaki`) | `pzprv3` | Black cells and non-black marks | Clue completion marks |

Slitherlink's full-clue variant and other puzzle types are not currently supported. Yajilin's `b` display flag is supported; its `o` rule flag must match.

## Importing progress

Import first checks that the type, dimensions, clues, region boundaries and rule flags match the open puzzle. Invalid or mismatched input does not change the board. A successful import **replaces** the current player progress: it has the effect of clearing the board to the initial puzzle and applying the marks in the state. Existing marks that are absent from the state, including marks the file format cannot save, are cleared. An active trial ends on import. Import is one undoable operation, so Undo restores the previous board, including trial marks, and Redo restores the imported state. Continue playing normally after importing. Use the puzzle's Check button when you want to check the answer.

**Show board changes** displays the native operations produced by the import; these are not the original solving steps. State does not store operation history, the session timer or transient highlights.

## URL and encoding

```text
/p?state=STATE&PUZZLE/cols/rows/clues
```

`STATE` is the UTF-8 native pzpr text compressed with raw DEFLATE and encoded as unpadded URL-safe Base64. Encoding and decoding happen locally using the browser's `CompressionStream` and `DecompressionStream` with `deflate-raw` support. Manual import also accepts plain pzpr text or Base64 using raw DEFLATE or zlib. State imports use the supported native file version for each puzzle.

A newly exported state link does not include a `trace` parameter. For existing URLs with both parameters, a nonempty `trace` takes precedence even if loading it fails; paste the state into the import dialog to apply it manually. With no nonempty trace, a nonempty state is applied automatically.

Old state links remain readable. Older Slitherlink exports omitted crosses and background colors, so those marks cannot be recovered from an old link; importing it clears the corresponding current marks.

## Implementation and verification

- [`src-ui/state.js`](../src-ui/state.js): shared native-file validation, compression, diff and undoable application.
- [`src-ui/state-profiles/`](../src-ui/state-profiles/): per-puzzle field profiles, including marks to clear that FileIO does not persist. `state.js` registers the profiles for Node; the UI build bundles the directory into `state-profiles.js`.
- [`src-ui/trace.js`](../src-ui/trace.js) and [`src-ui/p.html`](../src-ui/p.html): URL handling and dialogs.
- [`test/state/`](../test/state/) and [`test/fixtures/`](../test/fixtures/): round trips, replacement, undo/redo, matching and examples.

To add a puzzle, inspect its native `FileIO`, player input and operations. Define its profile with the native file version and every player field needed to reproduce a fresh-board import, including fields that must be cleared because FileIO does not save them. Register it in `state.js`; the UI bundle includes profile files automatically. The shared logic supports zero-default scalar fields and Shimaguni's candidate-number slots (default −1); use dedicated handling for other cases. Test native export equality, empty and partial states, supported marks, clearing existing and opposite marks, undo/redo, foreign clues and rules, and compressed round trips.

From the repository root, with Node.js 24 or newer:

```sh
npm run build
npx mocha 'test/state/*_test.js' test/trace_replay_test.js
```

The tests read `dist/js/pzpr.js`; rebuild after core changes.
