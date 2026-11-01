# Answer states

The Trace menu provides Import state and Export state for **standard Slitherlink**.
A state represents the current answer, which may be incomplete; it is not a
claim that the answer is correct. The puzzle's Check button can check it.
Other varieties and the Slitherlink full-clue variant are intentionally not
supported until their answer symbols have been defined.

Export uses the pzprv3.1 file format and preserves the puzzle clues and line
answers. It omits cell background colors and border crosses. The UTF-8 file is
compressed with raw DEFLATE (no zlib/gzip wrapper) and encoded with unpadded
URL-safe Base64. Compression is performed locally using the browser's
Compression Streams API with `deflate-raw` support. The export dialog shows
the original byte length, the encoded character count, and a shareable URL.

The import dialog accepts a pzprv3.1 file as plain text, or compressed text
using raw DEFLATE or zlib with ordinary or URL-safe Base64. Cell background
colors and border crosses in an imported file are ignored; its clues and lines
are retained. The URL only accepts the raw-DEFLATE, unpadded URL-safe form.

The URL form is `/p?trace=ID&state=STATE&slither/cols/rows/clues` (the trace
and state parameters are optional, and state may be empty). A nonempty trace
takes precedence: state is not automatically applied, even if trace loading
fails. To apply it deliberately, paste it into Import state. With no nonempty
trace, a nonempty state is applied automatically. The imported puzzle type,
dimensions and clues must match the current puzzle. Unsupported file data is
rejected.

Import replaces current lines and auxiliary marks in one undoable operation.
The import dialog's **Show board changes** expands the actual pzprjs operation
strings, one per line. For example, `BL,1,2,0,1` changes the line at board
coordinate (1, 2) from 0 to 1; `BS` and `CS` may appear when removing border
or cell annotations. These operations describe the change from the current
board, not a human solving trace.

Example of the 7-by-6 solution in `test/fixtures/slither_state.txt`:

```text
/p?state=rU5JCoAwDLznFXlBcCjoiwQFD6WKB19vTUwXzxLaDrNkGq-YziCgfVuPZU400UiBxYekwQ8fWO-OF-OU_2bdP3CZ3zAqZmQFbEx-VYOPaqb4DvO687vFcz12zZtRfoEm_R4qDY0H2l49Nw&slither/6/7/do838dk883dk38d
```
