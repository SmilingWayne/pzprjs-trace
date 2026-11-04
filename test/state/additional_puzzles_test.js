var assert = require("assert");
var h = require("./helpers");
var state = h.state;

var shading = ["ayeheya", "aqre", "stostone", "kurotto", "tapa"];
var lines = ["midloop", "simpleloop", "pipelink", "numlin", "arukone"];

function base(pid) {
	var puzzle = h.open(pid + "/4/4/");
	var cell = puzzle.board.cell[15];
	if (["ayeheya", "aqre", "stostone"].indexOf(pid) >= 0) {
		puzzle.board.border[0].setQues(1);
		cell = puzzle.board.roommgr.components[0].top;
	}
	if (pid === "midloop") {
		puzzle.board.dots[0].setDot(2);
	} else if (pid === "simpleloop") {
		cell.setQues(7);
	} else if (pid === "pipelink") {
		cell.setQues(12);
	} else if (pid === "tapa") {
		cell.setQnums([1, 2]);
	} else {
		cell.setQnum(2);
	}
	return h.open(state.exportText(puzzle));
}

describe("Additional puzzle states", function() {
	shading.concat(lines).forEach(function(pid) {
		it("round-trips and replaces " + pid + " progress", function() {
			var source = base(pid);
			var puzzle = base(pid);
			var isShading = shading.indexOf(pid) >= 0;
			var hasLines =
				lines.indexOf(pid) >= 0 ||
				["ayeheya", "aqre", "tapa"].indexOf(pid) >= 0;
			if (isShading) {
				source.board.cell[0].setQans(1);
				source.board.cell[1].setQsub(1);
				puzzle.board.cell[0].setQsub(1);
				puzzle.board.cell[1].setQans(1);
				puzzle.board.cell[2].setQans(1);
			}
			if (hasLines) {
				source.board.border[1].setdata("line", 1, true);
				source.board.border[2].setdata("qsub", 2, true);
				puzzle.board.border[1].setdata("qsub", 2, true);
				puzzle.board.border[2].setdata("line", 1, true);
			}
			puzzle.board.cell[3].setQcmp(1);
			if (!isShading) {
				puzzle.board.cell[4].setQsub(1);
			}
			var text = state.exportText(source);
			var before = state.exportText(puzzle);
			var position = puzzle.opemgr.position;
			assert.equal(state.exportText(h.open(text)), text);
			h.apply(puzzle, text);
			assert.equal(puzzle.opemgr.position, position + 1);
			assert.equal(state.exportText(puzzle), text);
			if (isShading) {
				assert.equal(puzzle.board.cell[0].qans, 1);
				assert.equal(puzzle.board.cell[1].qsub, 1);
				assert.equal(puzzle.board.cell[2].qans, 0);
			}
			if (hasLines) {
				assert.equal(puzzle.board.border[1].line, 1);
				assert.equal(puzzle.board.border[2].qsub, 2);
			}
			assert.equal(puzzle.board.cell[3].qcmp, 0);
			if (!isShading) {
				assert.equal(puzzle.board.cell[4].qsub, 0);
			}
			puzzle.undo();
			assert.equal(state.exportText(puzzle), before);
			assert.equal(puzzle.board.cell[3].qcmp, 1);
			puzzle.redo();
			assert.equal(state.exportText(puzzle), text);
			var empty = state.exportText(base(pid));
			h.apply(puzzle, empty);
			assert.equal(state.exportText(puzzle), empty);
			puzzle.undo();
			assert.equal(state.exportText(puzzle), text);
			var foreign = base(pid);
			if (pid === "midloop") {
				foreign.board.dots[0].setDot(0);
			} else if (pid === "simpleloop" || pid === "pipelink") {
				foreign.board.cell[15].setQues(0);
			} else if (pid === "tapa") {
				foreign.board.cell[15].setQnums([1, 3]);
			} else if (["ayeheya", "aqre", "stostone"].indexOf(pid) >= 0) {
				foreign.board.roommgr.components[0].top.setQnum(3);
			} else {
				foreign.board.cell[15].setQnum(3);
			}
			assert.throws(function() {
				h.apply(puzzle, state.exportText(foreign));
			}, /different puzzle/);
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

	it("matches region boundaries and rule variants", function() {
		["ayeheya", "aqre", "stostone"].forEach(function(pid) {
			var puzzle = base(pid);
			var foreign = base(pid);
			foreign.board.border[1].setQues(1);
			assert.throws(function() {
				h.apply(puzzle, state.exportText(foreign));
			}, /different puzzle/);
		});
		[
			["aqre", "aqre_borders"],
			["midloop", "loop_full"],
			["arukone", "dontpassallcell"]
		].forEach(function(pair) {
			var puzzle = base(pair[0]);
			var foreign = base(pair[0]);
			foreign.setConfig(pair[1], true);
			assert.throws(function() {
				h.apply(puzzle, state.exportText(foreign));
			}, /different puzzle/);
			puzzle.setConfig(pair[1], true);
			h.apply(puzzle, state.exportText(foreign));
		});
	});

	it("ends a trial and restores its marks on undo", function() {
		var puzzle = base("tapa");
		var source = base("tapa");
		source.board.cell[1].setQans(1);
		puzzle.enterTrial();
		puzzle.board.cell[1].setQsub(1);
		h.apply(puzzle, state.exportText(source));
		assert.equal(puzzle.board.trialstage, 0);
		assert.equal(puzzle.board.cell[1].qans, 1);
		puzzle.undo();
		assert.equal(puzzle.board.trialstage, 1);
		assert.equal(puzzle.board.cell[1].qsub, 1);
		puzzle.redo();
		assert.equal(puzzle.board.cell[1].qans, 1);
	});

	it("restores a Pipelink line even when a pipe blocks normal input", function() {
		var puzzle = base("pipelink");
		var source = base("pipelink");
		var border = source.board.cell[15].adjborder.left;
		border.setdata("line", 1, true);
		var text = state.exportText(source);
		h.apply(puzzle, text);
		assert.equal(puzzle.board.border[border.id].line, 1);
		puzzle.undo();
		assert.equal(puzzle.board.border[border.id].line, 0);
		puzzle.redo();
		assert.equal(state.exportText(puzzle), text);
	});
});
