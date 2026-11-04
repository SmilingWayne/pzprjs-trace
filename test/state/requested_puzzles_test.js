var assert = require("assert");
var h = require("./helpers");
var state = h.state;
var pids = [
	"reflect",
	"kakuro",
	"tasquare",
	"shugaku",
	"hebi",
	"mines",
	"herugolf",
	"moonsun",
	"fivecells"
];

function set(piece, property, value) {
	piece.setdata(property, value, true);
}

function base(pid) {
	var puzzle = h.open(pid + "/4/4/");
	var cell = puzzle.board.cell[15];
	if (pid === "reflect") {
		set(cell, "ques", 2);
		set(cell, "qnum", 2);
	} else if (pid === "kakuro") {
		set(puzzle.board.excell[1], "qnum2", 12);
		set(cell, "ques", 51);
		set(cell, "qnum", 4);
		set(cell, "qnum2", 6);
	} else if (pid === "herugolf") {
		set(cell, "ques", 31);
		set(puzzle.board.cell[14], "ques", 6);
		set(puzzle.board.cell[13], "qnum", 3);
	} else if (pid === "hebi") {
		set(cell, "qnum", 2);
		set(cell, "qdir", 4);
	} else {
		set(cell, "qnum", pid === "moonsun" ? 1 : 2);
		if (pid === "moonsun") {
			set(puzzle.board.border[5], "ques", 1);
		} else if (pid === "fivecells") {
			set(puzzle.board.cell[14], "ques", 7);
		}
	}
	return h.open(state.exportText(puzzle));
}

function populate(pid, source, puzzle) {
	var s = source.board;
	var p = puzzle.board;
	if (["reflect", "herugolf", "moonsun"].indexOf(pid) >= 0) {
		set(s.border[0], "line", 1);
		set(s.border[1], "qsub", 2);
		set(p.border[0], "qsub", 2);
		set(p.border[1], "line", 1);
		if (pid === "moonsun") {
			set(s.cell[2], "qsub", 2);
		} else {
			set(p.cell[2], "qsub", 1);
		}
	} else if (pid === "fivecells") {
		set(s.border[0], "qans", 1);
		set(s.border[0], "qsub", 1);
		set(s.border[1], "qsub", 1);
		set(p.border[0], "qsub", 1);
		set(p.border[1], "qans", 1);
		set(p.cell[2], "qsub", 1);
	} else if (pid === "hebi" || pid === "kakuro") {
		set(s.cell[0], "anum", 3);
		set(s.cell[1], "qsub", 1);
		set(p.cell[0], "qsub", 1);
		set(p.cell[1], "anum", 2);
		if (pid === "kakuro") {
			s.cell[2].setdata2("snum", 0, 4, true);
			p.cell[2].setdata2("snum", 1, 5, true);
		}
	} else {
		set(s.cell[0], "qans", pid === "shugaku" ? 41 : 1);
		set(s.cell[1], "qsub", 1);
		set(p.cell[0], "qsub", 1);
		set(p.cell[1], "qans", 1);
		if (pid === "shugaku") {
			set(s.cell[2], "qans", 50);
		}
	}
	set(p.cell[3], "qcmp", 1);
}

describe("Nine additional native puzzle states", function() {
	pids.forEach(function(pid) {
		it("replaces, undoes and encodes " + pid + " progress", function() {
			var source = base(pid);
			var puzzle = base(pid);
			populate(pid, source, puzzle);
			var text = state.exportText(source);
			var before = state.exportText(puzzle);
			assert.equal(state.exportText(h.open(text)), text);
			var position = puzzle.opemgr.position;
			h.apply(puzzle, text);
			assert.equal(puzzle.opemgr.position, position + 1);
			assert.equal(state.exportText(puzzle), text);
			assert.equal(puzzle.board.cell[3].qcmp, 0);
			if (pid === "kakuro") {
				assert.deepEqual(puzzle.board.cell[2].snum, [4, -1, -1, -1]);
			} else if (pid === "shugaku") {
				assert.equal(puzzle.board.cell[0].qans, 41);
				assert.equal(puzzle.board.cell[2].qans, 50);
			} else if (pid === "moonsun") {
				assert.equal(puzzle.board.cell[2].qsub, 2);
			} else if (pid === "fivecells") {
				assert.equal(puzzle.board.border[0].qans, 1);
				assert.equal(puzzle.board.border[0].qsub, 1);
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
			if (pid === "reflect" || pid === "herugolf") {
				set(foreign.board.cell[15], "ques", 0);
			} else if (pid === "kakuro") {
				set(foreign.board.excell[1], "qnum2", 13);
			} else {
				set(foreign.board.cell[15], "qnum", 3);
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

	it("preserves numeric marks and clears marks hidden by native file precedence", function() {
		["kakuro", "hebi"].forEach(function(pid) {
			var source = base(pid);
			var puzzle = base(pid);
			set(source.board.cell[0], "qcmp", 1);
			set(source.board.cell[1], "qsub", 4);
			set(source.board.cell[2], "anum", 5);
			set(source.board.cell[2], "qsub", 1);
			if (pid === "kakuro") {
				source.board.cell[2].setdata2("snum", 0, 3, true);
				puzzle.board.cell[2].setdata2("snum", 1, 4, true);
			}
			set(puzzle.board.cell[2], "qsub", 2);
			h.apply(puzzle, state.exportText(source));
			assert.equal(puzzle.board.cell[0].qcmp, 1);
			assert.equal(puzzle.board.cell[1].qsub, 4);
			assert.equal(puzzle.board.cell[2].anum, 5);
			assert.equal(puzzle.board.cell[2].qsub, 0);
			if (pid === "kakuro") {
				assert.deepEqual(puzzle.board.cell[2].snum, [-1, -1, -1, -1]);
			}
		});
	});

	it("supports Hebi-Ichigo's old alias and rejects changed direction", function() {
		assert.equal(h.open("snakes/4/4/").pid, "hebi");
		var puzzle = base("hebi");
		var foreign = base("hebi");
		set(foreign.board.cell[15], "qdir", 3);
		assert.throws(function() {
			h.apply(puzzle, state.exportText(foreign));
		}, /different puzzle/);
	});

	it("preserves all native School Trip futon shapes", function() {
		var source = base("shugaku");
		var puzzle = base("shugaku");
		for (var i = 0; i < 10; i++) {
			set(source.board.cell[i], "qans", 41 + i);
		}
		h.apply(puzzle, state.exportText(source));
		for (var j = 0; j < 10; j++) {
			assert.equal(puzzle.board.cell[j].qans, 41 + j);
		}
	});

	it("rejects a different puzzle type without changing progress", function() {
		var puzzle = base("mines");
		set(puzzle.board.cell[0], "qans", 1);
		var before = state.exportText(puzzle);
		assert.throws(function() {
			h.apply(puzzle, state.exportText(h.open("kurotto/4/4/")));
		}, /Invalid/);
		assert.equal(state.exportText(puzzle), before);
	});

	it("matches distinct Moon or Sun regions and FiveCells empty cells", function() {
		["moonsun", "fivecells"].forEach(function(pid) {
			var puzzle = base(pid);
			var foreign = base(pid);
			if (pid === "moonsun") {
				set(foreign.board.border[4], "ques", 1);
			} else {
				set(foreign.board.cell[14], "ques", 0);
			}
			assert.throws(function() {
				h.apply(puzzle, state.exportText(foreign));
			}, /different puzzle/);
		});
	});

	it("ends a School Trip trial and restores futon marks on undo", function() {
		var puzzle = base("shugaku");
		var source = base("shugaku");
		set(source.board.cell[0], "qans", 50);
		puzzle.enterTrial();
		set(puzzle.board.cell[0], "qans", 41);
		h.apply(puzzle, state.exportText(source));
		assert.equal(puzzle.board.trialstage, 0);
		assert.equal(puzzle.board.cell[0].qans, 50);
		puzzle.undo();
		assert.equal(puzzle.board.trialstage, 1);
		assert.equal(puzzle.board.cell[0].qans, 41);
		puzzle.redo();
		assert.equal(puzzle.board.cell[0].qans, 50);
	});
});
