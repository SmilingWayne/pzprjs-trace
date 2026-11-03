var assert = require("assert");
var h = require("./helpers");
var state = h.state;

describe("Slitherlink state", function() {
	it("replaces a partial board's colors, crosses and lines and can be undone", function() {
		var source = h.open(h.samples.slither);
		source.board.cell[0].setQsub(2);
		source.board.border[0].setPeke();
		source.board.border[1].setLine();
		var text = state.exportText(source);
		var puzzle = h.open(h.samples.slither);
		puzzle.board.cell[0].setQsub(1);
		puzzle.board.cell[1].setQsub(1);
		puzzle.board.border[0].setLine();
		puzzle.board.border[1].setPeke();
		var before = state.exportText(puzzle);
		h.apply(puzzle, text);
		assert.equal(state.exportText(puzzle), text);
		assert.deepEqual(
			[
				puzzle.board.cell[0].qsub,
				puzzle.board.cell[1].qsub,
				puzzle.board.border[0].qsub,
				puzzle.board.border[1].line
			],
			[2, 0, 2, 1]
		);
		puzzle.undo();
		assert.equal(state.exportText(puzzle), before);
		puzzle.redo();
		assert.equal(state.exportText(puzzle), text);
		puzzle.board.border[2].setLine();
		assert.equal(puzzle.board.border[2].line, 1);
	});

	it("imports the solution and rejects different clues or full-clue mode", function() {
		var puzzle = h.open(h.samples.slither);
		var text = h.fixture("slither");
		assert.throws(function() {
			state.target(puzzle, text.replace("3 . . . . .", "2 . . . . ."));
		}, /different puzzle/);
		h.apply(puzzle, text);
		assert.equal(puzzle.check(true).complete, true);
		puzzle.setConfig("slither_full", true);
		assert.throws(function() {
			state.exportText(puzzle);
		}, /not supported/);
	});
});
