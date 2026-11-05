var assert = require("assert");
var h = require("./helpers");
var state = h.state;
var groups = {
	nuribou: "shade",
	lookair: "shade",
	chainedb: "shade",
	wagiri: "slash",
	bdblock: "partition",
	tatamibari: "partition",
	cbblock: "partition",
	nagare: "line",
	geradeweg: "line",
	usoone: "usoone",
	ripple: "number"
};
function set(piece, prop, value) {
	piece.setdata(prop, value, true);
}
function base(pid) {
	var puzzle = h.open(pid + "/4/4/");
	if (pid === "cbblock") {
		set(puzzle.board.border[0], "ques", 0);
		set(puzzle.board.border[1], "ques", 0);
	} else if (pid === "wagiri") {
		set(puzzle.board.cross[0], "qnum", 2);
		set(puzzle.board.cell[3], "qnum", 1);
	} else if (pid === "nagare") {
		set(puzzle.board.cell[3], "qdir", 1);
	} else if (pid === "tatamibari") {
		set(puzzle.board.cell[3], "qnum", 1);
	} else {
		set(puzzle.board.cell[3], "qnum", 2);
	}
	return h.open(puzzle.getFileData());
}
function setup(pid, source, puzzle) {
	var s = source.board,
		p = puzzle.board,
		group = groups[pid];
	if (group === "shade" || group === "usoone") {
		set(s.cell[0], "qans", 1);
		set(s.cell[1], "qsub", 1);
		set(p.cell[0], "qsub", 1);
		set(p.cell[1], "qans", 1);
		if (group === "usoone") {
			set(s.cell[3], "qcmp", 2);
			set(s.border[0], "qsub", 2);
			set(s.border[1], "line", 1);
			set(p.cell[3], "qcmp", 1);
		} else {
			set(p.cell[3], "qcmp", 1);
		}
	} else if (group === "slash") {
		set(s.cell[0], "qans", 31);
		set(s.cell[1], "qans", 32);
		set(p.cell[0], "qans", 32);
		set(p.cell[2], "qsub", 1);
		set(p.cell[3], "qcmp", 1);
	} else if (group === "partition") {
		set(s.border[0], "qans", 1);
		set(s.border[0], "qsub", 1);
		set(s.border[1], "qsub", 1);
		set(p.border[1], "qans", 1);
		set(p.cell[2], "qsub", 1);
		set(p.cell[3], "qcmp", 1);
		if (pid === "cbblock") {
			set(s.border[2], "qsub", 1);
		}
	} else if (group === "line") {
		set(s.border[0], "line", 1);
		set(s.border[1], "qsub", 2);
		set(p.border[0], "qsub", 2);
		set(p.border[1], "line", 1);
		set(p.cell[2], "qsub", 1);
		set(p.cell[3], "qcmp", 1);
		if (pid === "nagare") {
			set(s.border[0], "qsub", 11);
			set(s.border[2], "qsub", 14);
		}
	} else {
		set(s.cell[0], "anum", 3);
		s.cell[1].setdata2("snum", 0, 2, true);
		set(s.cell[2], "qsub", 2);
		set(s.cell[3], "qcmp", 1);
		set(p.cell[0], "anum", 2);
		p.cell[1].setdata2("snum", 1, 4, true);
	}
}
function fields(pid) {
	var g = groups[pid];
	return g === "number"
		? { cell: ["anum", "qsub", "qcmp", "snum"] }
		: g === "partition"
		? { cell: ["qsub", "qcmp"], border: ["qans", "qsub"] }
		: g === "line"
		? { cell: ["qsub", "qcmp"], border: ["line", "qsub"] }
		: g === "usoone"
		? { cell: ["qans", "qsub", "qcmp"], border: ["line", "qsub"] }
		: { cell: ["qans", "qsub", "qcmp"] };
}
function equalMarks(pid, a, b) {
	var groups = fields(pid);
	Object.keys(groups).forEach(function(group) {
		groups[group].forEach(function(field) {
			for (var i = 0; i < a.board[group].length; i++) {
				assert.deepEqual(
					a.board[group][i][field],
					b.board[group][i][field],
					pid + " " + group + " " + i + " " + field
				);
			}
		});
	});
}
describe("Requested native state varieties", function() {
	Object.keys(groups).forEach(function(pid) {
		it("round-trips and replaces " + pid, function() {
			var source = base(pid),
				puzzle = base(pid);
			setup(pid, source, puzzle);
			var text = state.exportText(source),
				parsed = h.open(text);
			var before = state.exportText(puzzle);
			// FileIO omits some marks, so retain the actual previous board for undo.
			var saved = fields(pid),
				old = {};
			Object.keys(saved).forEach(function(g) {
				old[g] = saved[g].map(function(f) {
					return Array.prototype.map.call(puzzle.board[g], function(piece) {
						return Array.isArray(piece[f]) ? piece[f].slice() : piece[f];
					});
				});
			});
			assert.equal(state.exportText(parsed), text);
			var position = puzzle.opemgr.position;
			h.apply(puzzle, text);
			assert.equal(puzzle.opemgr.position, position + 1);
			assert.equal(state.exportText(puzzle), text);
			equalMarks(pid, puzzle, parsed);
			puzzle.undo();
			assert.equal(state.exportText(puzzle), before);
			Object.keys(saved).forEach(function(g) {
				saved[g].forEach(function(f, n) {
					for (var i = 0; i < puzzle.board[g].length; i++) {
						assert.deepEqual(puzzle.board[g][i][f], old[g][n][i]);
					}
				});
			});
			puzzle.redo();
			equalMarks(pid, puzzle, parsed);
			var empty = state.exportText(base(pid));
			h.apply(puzzle, empty);
			assert.equal(state.exportText(puzzle), empty);
			puzzle.undo();
			assert.equal(state.exportText(puzzle), text);
			assert.throws(function() {
				h.apply(puzzle, state.exportText(h.open(pid + "/3/3/")));
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
	it("rejects changed clues, regions and rule flags", function() {
		Object.keys(groups).forEach(function(pid) {
			var puzzle = base(pid),
				foreign = base(pid);
			if (pid === "usoone") {
				set(foreign.board.cell[0].adjborder.right, "ques", 1);
				set(foreign.board.cell[0].adjborder.bottom, "ques", 1);
			} else if (pid === "cbblock" || pid === "ripple") {
				set(
					foreign.board.border[3],
					"ques",
					foreign.board.border[3].ques ? 0 : 1
				);
			} else if (pid === "nagare") {
				set(foreign.board.cell[3], "qdir", 2);
			} else if (pid === "wagiri") {
				set(foreign.board.cross[0], "qnum", 3);
			} else {
				set(foreign.board.cell[3], "qnum", pid === "tatamibari" ? 2 : 3);
			}
			var before = state.exportText(puzzle),
				text = state.exportText(h.open(foreign.getFileData()));
			assert.throws(
				function() {
					h.apply(puzzle, text);
				},
				/different puzzle/,
				pid
			);
			assert.equal(state.exportText(puzzle), before);
		});
		var a = base("geradeweg"),
			b = base("geradeweg");
		b.setConfig("loop_full", true);
		assert.throws(function() {
			h.apply(a, state.exportText(b));
		}, /different puzzle/);
	});
	it("imports incorrect clue-cell shading and clears marks hidden by FileIO", function() {
		var source = base("nuribou"),
			puzzle = base("nuribou");
		set(source.board.cell[3], "qans", 1);
		h.apply(puzzle, state.exportText(source));
		assert.equal(puzzle.board.cell[3].qans, 1);
		puzzle.undo();
		assert.equal(puzzle.board.cell[3].qans, 0);

		source = base("usoone");
		puzzle = base("usoone");
		set(source.board.cell[0], "qans", 1);
		set(puzzle.board.cell[0], "qcmp", 2);
		h.apply(puzzle, state.exportText(source));
		assert.equal(puzzle.board.cell[0].qcmp, 0);
		puzzle.undo();
		assert.equal(puzzle.board.cell[0].qcmp, 2);

		source = base("ripple");
		puzzle = base("ripple");
		set(source.board.cell[0], "anum", 3);
		puzzle.board.cell[0].setdata2("snum", 0, 2, true);
		h.apply(puzzle, state.exportText(source));
		assert.equal(puzzle.board.cell[0].snum[0], -1);
		puzzle.undo();
		assert.equal(puzzle.board.cell[0].snum[0], 2);
	});
	it("restores marks and trial state in one undo", function() {
		var puzzle = base("usoone"),
			source = base("usoone");
		set(source.board.cell[3], "qcmp", 2);
		set(source.board.border[0], "qsub", 2);
		puzzle.enterTrial();
		set(puzzle.board.cell[3], "qcmp", 1);
		h.apply(puzzle, state.exportText(source));
		assert.equal(puzzle.board.trialstage, 0);
		assert.equal(puzzle.board.cell[3].qcmp, 2);
		puzzle.undo();
		assert.equal(puzzle.board.trialstage, 1);
		assert.equal(puzzle.board.cell[3].qcmp, 1);
		puzzle.redo();
		assert.equal(puzzle.board.cell[3].qcmp, 2);
	});
});
