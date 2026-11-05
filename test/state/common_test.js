var assert = require("assert");
var zlib = require("zlib");
var h = require("./helpers");
var state = h.state;

describe("Puzzle state: shared behavior", function() {
	Object.keys(h.samples).forEach(function(name) {
		it("round-trips " + name + " and replaces existing progress", function() {
			var source = h.open(h.fixture(name));
			var text = source.getFileData(h.pzpr.parser.FILE_PZPR);
			var puzzle = h.open(h.samples[name]);
			var empty = state.exportText(puzzle);
			assert.equal(state.exportText(source), text);
			return state
				.encode(text)
				.then(function(encoded) {
					return state.decode(encoded, false);
				})
				.then(function(decoded) {
					assert.equal(decoded, text);
					h.apply(puzzle, decoded);
					assert.equal(state.exportText(puzzle), text);
					puzzle.undo();
					assert.equal(state.exportText(puzzle), empty);
					puzzle.redo();
					assert.equal(state.exportText(puzzle), text);
					h.apply(puzzle, empty);
					assert.equal(state.exportText(puzzle), empty);
					puzzle.undo();
					assert.equal(state.exportText(puzzle), text);
				});
		});
	});

	it("accepts manual zlib input and rejects malformed or foreign files", function() {
		var text = h.fixture("nurikabe");
		var puzzle = h.open(h.samples.nurikabe);
		assert.throws(function() {
			state.target(puzzle, text.replace(". . . . 2", ". . . . 3"));
		}, /different puzzle/);
		assert.throws(function() {
			state.target(puzzle, text.replace("\n10\n10\n", "\n11\n10\n"));
		}, /different puzzle/);
		assert.throws(function() {
			state.target(puzzle, text.replace("#", "x"));
		}, /Invalid Nurikabe/);
		assert.throws(function() {
			state.target(puzzle, text + "history: {}\n");
		}, /Invalid Nurikabe/);
		assert.throws(function() {
			state.target(puzzle, h.fixture("slither"));
		}, /Invalid Nurikabe/);
		assert.throws(function() {
			state.exportText(h.open("tajmahal/4/4/"));
		}, /not supported/);
		return state
			.decode(zlib.deflateSync(Buffer.from(text)).toString("base64"), true)
			.then(function(decoded) {
				assert.equal(decoded, text);
			});
	});

	it("ends trial on import and restores nested trial marks in undo and replay", function() {
		var puzzle = h.open(h.samples.slither);
		var empty = state.exportText(puzzle);
		puzzle.board.border[0].setLine();
		puzzle.enterTrial();
		puzzle.board.border[1].setPeke();
		puzzle.enterTrial();
		puzzle.board.cell[0].setQsub(1);
		var before = state.exportText(puzzle);
		var position = puzzle.opemgr.position;
		h.apply(puzzle, empty);
		assert.equal(puzzle.opemgr.position, position + 1);
		assert.equal(puzzle.board.trialstage, 0);
		assert.equal(state.exportText(puzzle), empty);
		puzzle.undo();
		assert.equal(puzzle.board.trialstage, 2);
		assert.equal(puzzle.board.border[1].trial, 1);
		assert.equal(puzzle.board.cell[0].trial, 2);
		assert.equal(state.exportText(puzzle), before);
		puzzle.redo();
		var recording = puzzle.getFileData(h.pzpr.parser.FILE_PZPR, {
			history: true
		});
		var replay = h.open(recording);
		replay.undo();
		assert.equal(replay.board.trialstage, 2);
		assert.equal(replay.board.cell[0].trial, 2);
		assert.equal(state.exportText(replay), before);
		replay.redo();
		assert.equal(replay.board.trialstage, 0);
		assert.equal(state.exportText(replay), empty);
	});
});
