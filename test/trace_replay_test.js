// test/trace_replay_test.js

var assert = require("assert");

var pzpr = require("../dist/js/pzpr.js");

var QUERY = "nurikabe/6/6/3g3t3g3n3m";

function shadeCount(puzzle) {
	var count = 0;
	var cells = puzzle.board.cell;
	for (var i = 0; i < cells.length; i++) {
		if (cells[i].qans) {
			count++;
		}
	}
	return count;
}

describe("trace file history", function() {
	it("stores step times and replays with undo and redo", function() {
		var puzzle = new pzpr.Puzzle({ type: "player" }).open(QUERY);
		assert.equal(shadeCount(puzzle), 0);
		puzzle.mouse.inputPath(3, 1);
		puzzle.mouse.inputPath(3, 3);
		assert.equal(puzzle.opemgr.position, 2);

		var info = puzzle.opemgr.encodeHistory({ time: true });
		assert.equal(typeof info.time, "number");
		assert.equal(info.datas.length, 2);
		assert.equal(typeof info.datas[0].time, "number");
		assert.equal(typeof info.datas[1].time, "number");

		var text = puzzle.getFileData(pzpr.parser.FILE_PZPR, {
			history: true,
			time: true
		});
		assert.ok(text.indexOf("\nhistory:") > 0);

		var again = new pzpr.Puzzle({ type: "player" }).open(text);
		assert.equal(again.opemgr.position, 2);
		assert.equal(shadeCount(again), shadeCount(puzzle));
		again.undo();
		again.undo();
		assert.equal(again.opemgr.position, 0);
		assert.equal(shadeCount(again), 0);
		again.redo();
		assert.equal(again.opemgr.position, 1);
		assert.ok(shadeCount(again) > 0);
	});

	it("drops steps that were not reached when a new move is made", function() {
		var puzzle = new pzpr.Puzzle({ type: "player" }).open(QUERY);
		puzzle.mouse.inputPath(3, 1);
		puzzle.mouse.inputPath(3, 3);
		puzzle.undo();
		puzzle.mouse.inputPath(7, 1);
		assert.equal(puzzle.opemgr.history.length, 2);
		assert.equal(puzzle.opemgr.position, 2);
	});

	it("applies a history block onto the open puzzle", function() {
		var puzzle = new pzpr.Puzzle({ type: "player" }).open(QUERY);
		puzzle.mouse.inputPath(3, 1);
		var info = JSON.parse(
			JSON.stringify(puzzle.opemgr.encodeHistory({ time: true }))
		);
		var current = info.current;
		info.current = 0;

		var fresh = new pzpr.Puzzle({ type: "player" }).open(QUERY);
		fresh.opemgr.decodeHistory(info);
		while (fresh.opemgr.position < current) {
			fresh.redo();
		}
		assert.equal(fresh.opemgr.position, 1);
		assert.equal(shadeCount(fresh), shadeCount(puzzle));
	});
});
