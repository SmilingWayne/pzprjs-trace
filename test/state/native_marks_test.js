var assert = require("assert");
var h = require("./helpers");
var state = h.state;

var puzzles = {
	hitori: "hitori/4/4/",
	kurodoko: "kurodoko/4/4/",
	cave: "cave/4/4/",
	lits: "lits/4/4/",
	norinori: "norinori/4/4/",
	mashu: "mashu/4/4/",
	shikaku: "shikaku/4/4/",
	lightup: "lightup/4/4/",
	sudoku: "sudoku/4/4/",
	fillomino: "fillomino/4/4/"
};

function base(pid) {
	var puzzle = h.open(puzzles[pid]);
	if (pid === "lits" || pid === "norinori") {
		puzzle.board.border[0].setQues(1);
	} else {
		puzzle.board.cell[15].setQnum(pid === "mashu" ? 1 : 2);
	}
	return h.open(state.exportText(puzzle));
}

describe("Native puzzle marks", function() {
	Object.keys(puzzles).forEach(function(pid) {
		it(
			"replaces " + pid + " marks and restores them with undo and redo",
			function() {
				var source = base(pid);
				var puzzle = base(pid);
				var c = source.board.cell;
				var b = source.board.border;
				if (
					["hitori", "kurodoko", "cave", "lits", "norinori"].indexOf(pid) >= 0
				) {
					c[0].setQans(1);
					c[1].setQsub(1);
					b[1].setLine();
					b[2].setQsub(2);
					puzzle.board.cell[0].setQsub(1);
					puzzle.board.cell[1].setQans(1);
				} else if (pid === "mashu") {
					b[1].setLine();
					b[2].setPeke();
					puzzle.board.border[1].setPeke();
					puzzle.board.border[2].setLine();
				} else if (pid === "shikaku") {
					b[1].setQans(1);
					b[2].setQsub(1);
					puzzle.board.border[1].setQsub(1);
					puzzle.board.border[2].setQans(1);
				} else if (pid === "lightup") {
					c[0].setQans(1);
					c[5].setQsub(1);
					c[15].setQcmp(1);
					puzzle.board.cell[0].setQsub(1);
					puzzle.board.cell[5].setQans(1);
				} else {
					c[0].setAnum(3);
					c[1].setSnum(0, 2);
					c[1].setSnum(3, 4);
					c[2].setQsub(2);
					c[3].setQcmp(1);
					puzzle.board.cell[0].setSnum(1, 1);
					puzzle.board.cell[1].setAnum(1);
					puzzle.board.cell[4].setSnum(2, 3);
					if (pid === "fillomino") {
						b[1].setQans(1);
						b[1].setQsub(1);
						b[2].setQsub(1);
					}
				}
				if (pid !== "lightup" && pid !== "sudoku" && pid !== "fillomino") {
					puzzle.board.cell[4].setQcmp(1);
				}
				var text = state.exportText(source);
				var before = state.exportText(puzzle);
				var position = puzzle.opemgr.position;
				assert.equal(state.exportText(h.open(text)), text);
				h.apply(puzzle, text);
				assert.equal(puzzle.opemgr.position, position + 1);
				assert.equal(state.exportText(puzzle), text);
				if (pid === "sudoku" || pid === "fillomino") {
					assert.deepEqual(puzzle.board.cell[1].snum, [2, -1, -1, 4]);
					assert.equal(puzzle.board.cell[4].snum[2], -1);
					assert.equal(puzzle.board.cell[1].anum, -1);
				} else if (pid !== "lightup") {
					assert.equal(puzzle.board.cell[4].qcmp, 0);
				}
				puzzle.undo();
				assert.equal(state.exportText(puzzle), before);
				puzzle.redo();
				assert.equal(state.exportText(puzzle), text);
				var empty = state.exportText(base(pid));
				h.apply(puzzle, empty);
				assert.equal(state.exportText(puzzle), empty);
				puzzle.undo();
				assert.equal(state.exportText(puzzle), text);
				var foreign = base(pid);
				if (pid === "lits" || pid === "norinori") {
					foreign.board.border[1].setQues(1);
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
			}
		);
	});

	it("matches Masyu and Fillomino rule flags", function() {
		[
			["mashu", "loop_full"],
			["fillomino", "fillomino_tri"]
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
		assert.equal(h.open("pearl/4/4/").pid, "mashu");
		assert.equal(h.open("akari/4/4/").pid, "lightup");
		assert.equal(h.open("bag/4/4/").pid, "cave");
		var ura = base("mashu");
		var regular = state.exportText(ura);
		ura.setConfig("uramashu", true);
		ura.opemgr.disableRecord();
		assert.equal(ura.getFileData(h.pzpr.parser.FILE_PZPR), regular);
		ura.opemgr.enableRecord();
		assert.throws(function() {
			state.exportText(ura);
		}, /not supported/);
		assert.throws(function() {
			state.target(ura, regular);
		}, /not supported/);
	});

	it("restores numeric defaults and Fillomino boundary combinations in a trial", function() {
		var puzzle = base("fillomino");
		puzzle.board.border[0].setQues(1);
		var source = h.open(state.exportText(puzzle));
		source.board.cell[0].setAnum(3);
		source.board.cell[1].setSnum(2, 4);
		source.board.border[0].setQsub(1);
		source.board.border[1].setQans(1);
		source.board.border[1].setQsub(1);
		puzzle.enterTrial();
		puzzle.board.cell[0].setSnum(1, 2);
		puzzle.board.cell[1].setAnum(2);
		var text = state.exportText(source);
		h.apply(puzzle, text);
		assert.equal(puzzle.board.cell[0].anum, 3);
		assert.equal(puzzle.board.cell[0].snum[1], -1);
		assert.equal(puzzle.board.cell[1].anum, -1);
		assert.equal(puzzle.board.border[0].qsub, 1);
		assert.equal(puzzle.board.border[1].qans, 1);
		assert.equal(puzzle.board.border[1].qsub, 1);
		puzzle.undo();
		assert.equal(puzzle.board.trialstage, 1);
		assert.equal(puzzle.board.cell[0].anum, -1);
		assert.equal(puzzle.board.cell[0].snum[1], 2);
		assert.equal(puzzle.board.cell[1].anum, 2);
		puzzle.redo();
		assert.equal(state.exportText(puzzle), text);
	});

	it("imports native numeric values even when normal input rejects them", function() {
		var source = base("sudoku");
		source.board.cell[0].setdata("anum", 0, true);
		var puzzle = base("sudoku");
		h.apply(puzzle, state.exportText(source));
		assert.equal(puzzle.board.cell[0].anum, 0);
		puzzle.undo();
		assert.equal(puzzle.board.cell[0].anum, -1);
		puzzle.redo();
		assert.equal(puzzle.board.cell[0].anum, 0);
	});

	it("updates Akari illumination on import, undo and redo", function() {
		var puzzle = base("lightup");
		var source = base("lightup");
		puzzle.board.cell[5].setQans(1);
		source.board.cell[0].setQans(1);
		var before = Array.prototype.map.call(puzzle.board.cell, function(c) {
			return c.qlight;
		});
		var after = Array.prototype.map.call(source.board.cell, function(c) {
			return c.qlight;
		});
		h.apply(puzzle, state.exportText(source));
		function lights() {
			return Array.prototype.map.call(puzzle.board.cell, function(c) {
				return c.qlight;
			});
		}
		assert.deepEqual(lights(), after);
		puzzle.undo();
		assert.deepEqual(lights(), before);
		puzzle.redo();
		assert.deepEqual(lights(), after);
	});
});
