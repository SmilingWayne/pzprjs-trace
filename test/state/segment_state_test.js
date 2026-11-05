var assert = require("assert");
var h = require("./helpers");
var state = h.state;

var samples = {
	kouchoku: "4/4/a2b5a.bc0b2.0.c0",
	angleloop: "5/5/1a1ab6b0c1c0a4c3a1a"
};

Object.keys(samples).forEach(function(pid) {
	describe(pid + " segment states", function() {
		it("replaces segments, handles trials and preserves native undo/redo", function() {
			var source = h.open(pid + "/" + samples[pid]);
			var puzzle = h.open(pid + "/" + samples[pid]);
			source.board.segment.addSegmentByAddr(0, 0, 4, 4);
			source.board.segment.addSegmentByAddr(0, 2, 6, 0);
			var text = state.exportText(source);
			assert.equal(state.exportText(h.open(text)), text);
			puzzle.board.segment.addSegmentByAddr(0, 0, 2, 0);
			puzzle.enterTrial();
			puzzle.board.segment.addSegmentByAddr(0, 2, 2, 2);
			var before = state.exportText(puzzle);
			var position = puzzle.opemgr.position;
			h.apply(puzzle, text);
			assert.equal(puzzle.opemgr.position, position + 1);
			assert.equal(puzzle.board.trialstage, 0);
			assert.equal(state.exportText(puzzle), text);
			puzzle.undo();
			assert.equal(puzzle.board.trialstage, 1);
			assert.equal(state.exportText(puzzle), before);
			puzzle.redo();
			assert.equal(state.exportText(puzzle), text);
			var foreign = h.open(pid + "/" + samples[pid]);
			foreign.board.cross[0].setdata("qnum", 7, true);
			assert.throws(function() {
				h.apply(puzzle, state.exportText(foreign));
			}, /different puzzle/);
			assert.equal(state.exportText(puzzle), text);
			h.apply(puzzle, state.exportText(h.open(pid + "/" + samples[pid])));
			assert.equal(puzzle.board.segment.length, 0);
			puzzle.undo();
			assert.equal(state.exportText(puzzle), text);
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
});

describe("Shirokuro-link state", function() {
	it("preserves lines and crosses and clears hidden marks", function() {
		var source = h.open("wblink/5/5/ci6a2ln1i");
		var puzzle = h.open("wblink/5/5/ci6a2ln1i");
		source.board.border[0].setdata("line", 1, true);
		source.board.border[1].setdata("qsub", 2, true);
		puzzle.board.border[0].setdata("qsub", 2, true);
		puzzle.board.cell[0].setdata("qcmp", 1, true);
		var before = state.exportText(puzzle);
		var text = state.exportText(source);
		var position = puzzle.opemgr.position;
		h.apply(puzzle, text);
		assert.equal(puzzle.opemgr.position, position + 1);
		assert.equal(state.exportText(puzzle), text);
		assert.equal(puzzle.board.cell[0].qcmp, 0);
		puzzle.undo();
		assert.equal(state.exportText(puzzle), before);
		assert.equal(puzzle.board.cell[0].qcmp, 1);
		puzzle.redo();
		assert.equal(state.exportText(puzzle), text);
		var foreign = h.open("wblink/5/5/ci6a2ln1i");
		foreign.board.cell[0].setdata("qnum", 7, true);
		assert.throws(function() {
			h.apply(puzzle, state.exportText(foreign));
		}, /different puzzle/);
		assert.equal(state.exportText(puzzle), text);
		h.apply(puzzle, state.exportText(h.open("wblink/5/5/ci6a2ln1i")));
		assert.equal(puzzle.board.border[0].line, 0);
		assert.equal(puzzle.board.border[1].qsub, 0);
		puzzle.undo();
		assert.equal(state.exportText(puzzle), text);
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
