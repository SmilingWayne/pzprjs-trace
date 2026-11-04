# Puzzle states

A state saves the current puzzle progress in a link, without a database. It can be an empty, partial, complete, or incorrect board. Open **Trace → Export state** to copy the compressed state or its link; open **Trace → Import state** to paste a compressed state or native pzpr text. A state is a snapshot, not a solving history. Use [recordings](Recordings.md) for replay and step history.

## What is saved

The uncompressed state is exactly the current board's native pzpr file as exported by FileIO, including its clues and all player marks that the file format records. There is no extra state payload. The native file version depends on the puzzle. Marks that FileIO does not record cannot be restored from a state.

| Puzzle | Native file | Player marks saved | Not saved |
| --- | --- | --- | --- |
| Standard Slitherlink (`slither`) | `pzprv3.1` | Lines, border crosses, cell background colors | — |
| Nurikabe (`nurikabe`) | `pzprv3` | Black cells and non-black marks | Clue completion marks |
| Yajilin (`yajilin`, `yajirin`) and Yajilin Regions (`yajilin-regions`, `yajirin-regions`) | `pzprv3` | Black cells, non-black marks, lines and border crosses | Clue completion marks |
| Heyawake (`heyawake`, `heyawacky`), Ayeheya (`ayeheya`), Aqre (`aqre`) | `pzprv3.1` | Black cells, non-black marks, border lines and crosses | Clue completion marks |
| Nonogram (`nonogram`) | `pzprv3` | Black cells, non-black marks, outside-clue completion marks | — |
| Stostone (`stostone`), Kurotto (`kurotto`) | `pzprv3.1` (Stostone), `pzprv3` (Kurotto) | Black cells and non-black marks | Clue completion marks |
| Tapa (`tapa`) | `pzprv3` | Black cells, non-black marks, auxiliary lines and border crosses | Clue completion marks |
| Shimaguni (`shimaguni`) | `pzprv3.1` | Black cells, non-black marks, candidate numbers | Clue completion marks |
| Nurimisaki (`nurimisaki`) | `pzprv3` | Black cells and non-black marks | Clue completion marks |
| Hitori (`hitori`), Kurodoko (`kurodoko`), Cave (`cave`, `bag`) | `pzprv3` | Black cells, non-black marks, auxiliary lines and border crosses | Clue completion marks |
| LITS (`lits`), Norinori (`norinori`) | `pzprv3.1` | Black cells, non-black marks, auxiliary lines and border crosses | Completion marks |
| Masyu (`mashu`, `pearl`), Mid-loop (`midloop`), Simple Loop (`simpleloop`), Pipelink (`pipelink`), Numberlink (`numlin`), Arukone (`arukone`) | `pzprv3` | Lines and border crosses | Cell completion and background marks |
| Shikaku (`shikaku`) | `pzprv3` | Answer and auxiliary borders, including both on the same border | Cell completion and background marks |
| Akari (`lightup`, `akari`) | `pzprv3` | Bulbs, non-bulb marks and clue completion marks | — |
| Sudoku (`sudoku`), Fillomino (`fillomino`) | `pzprv3` | Answer numbers, candidate numbers, cell background and completion marks; Fillomino also saves answer and auxiliary borders | Candidate, background and completion marks hidden by an answer number; background marks hidden by completion marks |

Slitherlink's full-clue variant, Masyu's Ura-masyu mode and other puzzle types are not currently supported. Ura-masyu reverses the pearl rules but its setting is not stored in native files, so a state cannot identify that mode. Yajilin's `b` display flag is supported. Its `o` rule flag, Aqre's `aqre_borders`, Masyu's and Mid-loop's `loop_full`, Arukone's `dontpassallcell`, and Fillomino's `fillomino_tri` rule settings must match.

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

To add a puzzle, inspect its native `FileIO`, player input and operations. Group profiles by their state semantics, such as shading or answer numbers, and define the native file version and every player field needed to reproduce a fresh-board import, including fields that must be cleared because FileIO does not save them. Register it in `state.js`; the UI bundle includes profile files automatically. Scalar fields default to zero unless the profile specifies `empty`; candidate-number slots default to −1. Test native export equality, empty and partial states, supported marks, clearing existing and opposite marks, undo/redo, foreign clues and rules, and compressed round trips.

From the repository root, with Node.js 24 or newer:

```sh
npm run build
npx mocha 'test/state/*_test.js' test/trace_replay_test.js
```

The tests read `dist/js/pzpr.js`; rebuild after core changes.
