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
			"nuribou/6/6/3g3t3g3n3m"
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

var nurikabeQuery = "nurikabe/10/10/j2zg2l5i4s8i6h9u7r3q1";
var nurikabeState = fs.readFileSync(
	__dirname + "/fixtures/nurikabe_state.txt",
	"utf8"
);

describe("Nurikabe answer state", function() {
	it("imports both black cells and non-black marks as undoable operations", function() {
		var puzzle = new pzpr.Puzzle({ type: "player" }).open(nurikabeQuery);
		var desired = state.target(puzzle, nurikabeState);
		var ops = state.changes(puzzle, desired);
		assert.equal(ops.length, 10);
		assert.equal(
			ops.filter(function(op) {
				return op.property === "qans";
			}).length,
			6
		);
		assert.equal(
			ops.filter(function(op) {
				return op.property === "qsub";
			}).length,
			4
		);
		state.apply(puzzle, ops);
		assert.equal(state.changes(puzzle, desired).length, 0);
		assert.equal(
			state.exportText(puzzle),
			desired.getFileData(pzpr.parser.FILE_PZPR)
		);
		puzzle.undo();
		assert.equal(state.changes(puzzle, desired).length, 10);
		puzzle.redo();
		assert.equal(state.changes(puzzle, desired).length, 0);
	});

	it("replaces existing black and non-black states, including opposite marks", function() {
		var puzzle = new pzpr.Puzzle({ type: "player" }).open(nurikabeQuery);
		var desired = state.target(puzzle, nurikabeState);
		var black = puzzle.board.getc(5, 5);
		var white = puzzle.board.getc(15, 3);
		var removed = puzzle.board.getc(1, 1);
		black.setQsub(1);
		white.setQans(1);
		removed.setQans(1);
		state.apply(puzzle, state.changes(puzzle, desired));
		assert.deepEqual(
			[black.qans, black.qsub, white.qans, white.qsub, removed.qans],
			[1, 0, 0, 1, 0]
		);
		puzzle.undo();
		assert.deepEqual(
			[black.qans, black.qsub, white.qans, white.qsub, removed.qans],
			[0, 1, 1, 0, 1]
		);
		puzzle.redo();
		assert.equal(state.changes(puzzle, desired).length, 0);
	});

	it("round-trips compressed state and rejects foreign or malformed files", function() {
		var puzzle = new pzpr.Puzzle({ type: "player" }).open(nurikabeQuery);
		var desired = state.target(puzzle, nurikabeState);
		var text = state.exportText(desired);
		assert.throws(function() {
			state.target(puzzle, nurikabeState.replace(". . . . 2", ". . . . 3"));
		}, /different puzzle/);
		assert.throws(function() {
			state.target(puzzle, nurikabeState.replace("\n10\n10\n", "\n11\n10\n"));
		}, /different puzzle/);
		assert.throws(function() {
			state.target(puzzle, nurikabeState.replace("#", "x"));
		}, /Invalid Nurikabe/);
		assert.throws(function() {
			state.target(puzzle, nurikabeState + "history: {}\n");
		}, /Invalid Nurikabe/);
		assert.throws(function() {
			state.target(puzzle, solution);
		}, /Invalid Nurikabe/);
		return state
			.encode(text)
			.then(function(encoded) {
				return state.decode(encoded, false);
			})
			.then(function(decoded) {
				assert.equal(decoded, text);
			});
	});
});
