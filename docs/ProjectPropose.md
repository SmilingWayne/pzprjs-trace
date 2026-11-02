# Project purpose

This repository is a custom fork of [upstream pzprjs](https://github.com/robx/pzprjs), intended for integration into the owner's future projects. It retains the browser puzzle player and editor while adding two ways to share a puzzle's answer through a URL:

- A [solving recording](Recordings.md) stores the operation history on the server. Its URL carries an ID; the server and its database are needed to retrieve it. The recipient can replay the history or continue solving.
- An [answer state](PuzzleState.md) carries a compressed board state in the URL. Importing it needs no database or trace API. It describes an answer, including a partial one, rather than the steps used to reach it.

Both forms include the puzzle's usual pzpr URL body. These features are implemented in this repository; the sibling `pzprjs-replay/` repository and older workspace plans describe a different or historical approach.

The fork is currently developed on `main` and has not yet been deployed. Keep upstream puzzle behavior and the custom features understandable and maintainable as the fork evolves.
