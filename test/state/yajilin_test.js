var assert = require("assert");
var h = require("./helpers");
var state = h.state;

describe("Yajilin state", function() {
	it("imports a solution through its alias, replacing marks and clearing completion", function() {
		var puzzle = h.open("yajirin/b/6/6/n22h10b21i");
		var text = h.fixture("yajilin");
		var desired = state.target(puzzle, text);
		var black = puzzle.board.cell[10];
		var white = puzzle.board.cell[0];
		var line = Array.prototype.find.call(puzzle.board.border, function(border) {
			return desired.board.border[border.id].line === 1;
		});
		var cross = Array.prototype.find.call(puzzle.board.border, function(
			border
		) {
			return desired.board.border[border.id].qsub === 2;
		});
		var clue = puzzle.board.cell[14];
		black.setQsub(1);
		white.setQans(1);
		line.setQsub(2);
		cross.setLine(1);
		clue.setQcmp(1);
		var before = state.exportText(puzzle);
		assert.equal(puzzle.pid, "yajilin");
		h.apply(puzzle, text);
		assert.deepEqual(
			[
				black.qans,
				black.qsub,
				white.qans,
				white.qsub,
				line.line,
				line.qsub,
				cross.line,
				cross.qsub,
				clue.qcmp
			],
			[1, 0, 0, 1, 1, 0, 0, 2, 0]
		);
		assert.equal(puzzle.getConfig("disptype_yajilin"), 2);
		assert.equal(puzzle.check(true).complete, true);
		puzzle.undo();
		assert.equal(state.exportText(puzzle), before);
		assert.equal(clue.qcmp, 1);
		puzzle.redo();
		assert.equal(state.exportText(puzzle), state.exportText(desired));
	});

	it("restores an incorrect partial board and can continue playing", function() {
		var source = h.open(h.samples.yajilin);
		source.board.cell[0].setQsub(1);
		source.board.cell[10].setQans(1);
		source.board.border[0].setPeke();
		source.board.cell[14].adjborder.right.setdata("line", 1, true);
		var text = state.exportText(source);
		var puzzle = h.open(h.samples.yajilin);
		puzzle.board.cell[0].setQans(1);
		puzzle.board.border[0].setLine();
		var before = state.exportText(puzzle);
		h.apply(puzzle, text);
		assert.equal(state.exportText(puzzle), text);
		assert.equal(puzzle.board.cell[10].qans, 1);
		assert.equal(puzzle.board.border[0].qsub, 2);
		puzzle.undo();
		assert.equal(state.exportText(puzzle), before);
		puzzle.redo();
		assert.equal(state.exportText(puzzle), text);
		puzzle.board.cell[1].setQsub(1);
		assert.equal(puzzle.board.cell[1].qsub, 1);
	});

	it("checks clues, rule flags and region boundaries", function() {
		var text = h.fixture("yajilin");
		var puzzle = h.open(h.samples.yajilin);
		assert.throws(function() {
			state.target(puzzle, text.replace("2,2", "2,3"));
		}, /different puzzle/);
		var outside = h.open("yajilin/o/6/6/n22h10b21i");
		assert.throws(function() {
			state.target(outside, text);
		}, /different puzzle/);
		assert.equal(
			state.exportText(state.target(outside, state.exportText(outside))),
			state.exportText(outside)
		);
		var query = "yajirin-regions/5/5/49j60s3020g1g";
		var regional = h.open(query);
		assert.equal(regional.pid, "yajilin-regions");
		var marked = h.open(query);
		marked.board.cell[0].setQans(1);
		marked.board.cell[1].setQsub(1);
		marked.board.border[0].setLine(1);
		marked.board.border[1].setQsub(2);
		var regionalText = state.exportText(marked);
		h.apply(regional, regionalText);
		assert.equal(state.exportText(regional), regionalText);
		regional.undo();
		assert.notEqual(state.exportText(regional), regionalText);
		regional.redo();
		assert.equal(state.exportText(regional), regionalText);
		var foreign = h.open(query);
		foreign.setMode("edit");
		foreign.board.cell[0].adjborder.right.setQues(1);
		foreign.board.cell[0].adjborder.bottom.setQues(1);
		assert.throws(function() {
			state.target(regional, state.exportText(foreign));
		}, /different puzzle/);
	});
});
