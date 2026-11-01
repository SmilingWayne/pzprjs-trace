var assert = require("assert");
var fs = require("fs");
var pzpr = require("../dist/js/pzpr.js");
var state = require("../src-ui/state.js");
var solution = fs.readFileSync(
	__dirname + "/fixtures/slither_state.txt",
	"utf8"
);
var query = "slither/6/7/do838dk883dk38d";

describe("Slitherlink answer state", function() {
	it("imports the supplied solution as native, undoable operations", function() {
		var puzzle = new pzpr.Puzzle({ type: "player" }).open(query);
		var target = state.target(puzzle, solution);
		var ops = state.changes(puzzle, target);
		assert(ops.length > 0);
		assert(
			ops.every(function(op) {
				return /^BL,\d+,\d+,0,1$/.test(op.toString());
			})
		);
		state.apply(puzzle, ops);
		assert.equal(puzzle.check(true).complete, true);
		assert.equal(state.changes(puzzle, target).length, 0);
		puzzle.undo();
		assert.equal(state.changes(puzzle, target).length, ops.length);
		puzzle.redo();
		assert.equal(state.changes(puzzle, target).length, 0);
	});

	it("removes existing annotations and lines in the recorded diff", function() {
		var puzzle = new pzpr.Puzzle({ type: "player" }).open(query);
		var target = state.target(puzzle, solution);
		var cell = puzzle.board.cell[0];
		var border = puzzle.board.border[0];
		cell.setQsub(1);
		border.setQsub(2);
		var ops = state.changes(puzzle, target);
		assert(
			ops.some(function(op) {
				return op.toString() === "CS,1,1,1,0";
			})
		);
		assert(
			ops.some(function(op) {
				return op.property === "qsub" && op.group === "border";
			})
		);
		state.apply(puzzle, ops);
		assert.equal(cell.qsub, 0);
		assert.equal(border.qsub, 0);
		puzzle.undo();
		assert.equal(cell.qsub, 1);
		assert.equal(border.qsub, 2);
	});

	it("rejects unsupported puzzle types and full-clue Slitherlink", function() {
		var other = new pzpr.Puzzle({ type: "player" }).open(
			"nurikabe/6/6/3g3t3g3n3m"
		);
		assert.throws(function() {
			state.exportText(other);
		}, /standard Slitherlink/);
		var full = new pzpr.Puzzle({ type: "player" }).open(query);
		full.setConfig("slither_full", true);
		assert.throws(function() {
			state.exportText(full);
		}, /standard Slitherlink/);
	});

	it("excludes annotations and rejects foreign or non-canonical states", function() {
		var puzzle = new pzpr.Puzzle({ type: "player" }).open(query);
		var original = state.exportText(puzzle);
		puzzle.board.cell[0].setQsub(1);
		puzzle.board.border[0].setQsub(2);
		assert.equal(state.exportText(puzzle), original);
		assert.throws(function() {
			state.target(puzzle, solution.replace("3 . . . . .", "2 . . . . ."));
		}, /different puzzle/);
		var withMarks = new pzpr.Puzzle({ type: "player" }).open(solution);
		withMarks.board.cell[0].setQsub(1);
		withMarks.board.border[0].setQsub(2);
		var imported = state.target(
			puzzle,
			withMarks.getFileData(pzpr.parser.FILE_PZPR)
		);
		assert.equal(state.exportText(imported), state.exportText(withMarks));
		assert.equal(imported.board.cell[0].qsub, 0);
		assert.equal(imported.board.border[0].qsub, 0);
		assert.throws(function() {
			state.target(puzzle, solution + "history: {}\n");
		}, /Invalid Slitherlink/);
		assert.throws(function() {
			state.target(puzzle, solution.replace("\n7\n6\n", "\n99999\n6\n"));
		}, /different puzzle/);
	});
});
