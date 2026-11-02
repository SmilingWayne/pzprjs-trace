# Agent guide

This is the custom pzprjs fork on `main`. Start with the relevant document:

- [Project purpose and boundaries](docs/ProjectPropose.md)
- [Solving recordings: URL, replay, server and tests](docs/Recordings.md)
- [Answer states: URL, encoding, import and supported puzzles](docs/PuzzleState.md)
- [Upstream structure, build and puzzle types](README.md); [core API](docs/PublicAPI.md)

Before adding complexity for a speculative or vanishingly unlikely race or security edge case, explain the concrete failure mods, likelihood, and complexity cost to the user and get their buy-in. Do not silently expand scope for theoretical robustness.

Keep these entry points short; update the relevant topic document when behavior changes. Do not commit unless asked.
