var assert = require("assert");
var h = require("./helpers");
var state = h.state;

describe("Nurikabe state", function() {
	it("replaces opposite black and non-black marks and clears completion", function() {
		var puzzle = h.open(h.samples.nurikabe);
		var black = puzzle.board.getc(5, 5);
		var white = puzzle.board.getc(15, 3);
		var removed = puzzle.board.getc(1, 1);
		var clue = Array.prototype.find.call(puzzle.board.cell, function(cell) {
			return cell.qnum >= 0;
		});
		black.setQsub(1);
		white.setQans(1);
		removed.setQans(1);
		clue.setQcmp(1);
		var before = state.exportText(puzzle);
		h.apply(puzzle, h.fixture("nurikabe"));
		assert.deepEqual(
			[black.qans, black.qsub, white.qans, white.qsub, removed.qans, clue.qcmp],
			[1, 0, 0, 1, 0, 0]
		);
		puzzle.undo();
		assert.equal(state.exportText(puzzle), before);
		assert.equal(clue.qcmp, 1);
		puzzle.redo();
		assert.equal(clue.qcmp, 0);
	});
});
