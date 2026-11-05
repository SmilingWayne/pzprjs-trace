var assert = require("assert");
var h = require("./helpers");
var state = h.state;
var fixtures = require("./variety_fixtures");
var open = fixtures.open;
function set(piece, prop, value) {
	piece.setdata(prop, value, true);
}
describe("Puzzle clue identity", function() {
	Object.keys(fixtures.direct).forEach(function(pid) {
		it("rejects altered clues in " + pid, function() {
			var puzzle = open(pid),
				foreign = open(pid),
				piece;
			if (pid === "skyscrapers") {
				piece = foreign.board.excell[0];
			} else if (pid === "kropki") {
				piece = foreign.board.border[0];
			} else if (pid === "compass") {
				piece = Array.prototype.find.call(foreign.board.cell, function(c) {
					return c.ques === 51;
				});
			} else {
				piece = foreign.board.cell[0];
			}
			assert(piece, pid);
			if (pid === "tapaloop") {
				piece.setQnums([1, 2]);
			} else if (pid === "dosufuwa") {
				set(piece, "ques", piece.ques === 1 ? 0 : 1);
			} else {
				var old = piece.qnum;
				set(piece, "qnum", old === 1 ? 2 : 1);
			}
			var foreignText = state.exportText(foreign);
			assert.notEqual(foreignText, state.exportText(puzzle));
			foreignText = state.exportText(h.open(foreignText));
			var before = state.exportText(puzzle);
			assert.throws(function() {
				h.apply(puzzle, foreignText);
			}, /different puzzle/);
			assert.equal(state.exportText(puzzle), before);
		});
	});
});

function changeClue(pid, puzzle) {
	var bd = puzzle.board;
	if (["tents", "aquarium", "box"].indexOf(pid) >= 0) {
		var ex = Array.prototype.find.call(bd.excell, function(e) {
			return e.qnum >= 0;
		});
		ex.qnum++;
	} else if (pid === "easyasabc") {
		bd.indicator.count++;
	} else if (pid === "railpool") {
		bd.cell[0].qnums = [99];
	} else if (pid === "minarism") {
		bd.border[0].qdir = 0;
		bd.border[0].qnum = 99;
	} else if (pid === "voxas" || pid === "mejilink") {
		bd.border[0].ques = bd.border[0].ques === 1 ? 0 : 1;
	} else if (pid === "doubleback") {
		bd.cell[0].ques = bd.cell[0].ques === 7 ? 0 : 7;
	} else {
		var cell = Array.prototype.find.call(bd.cell, function(c) {
			return c.ques === 0;
		});
		cell.qnum = cell.qnum === 2 ? 3 : 2;
	}
}

describe("Puzzle clue identity for profile varieties", function() {
	Object.keys(fixtures.profiled).forEach(function(pid) {
		it("rejects altered clues in " + pid, function() {
			var puzzle = open(pid),
				foreign = open(pid);
			puzzle.board.cell[0].setdata("qsub", 2, true);
			var mark = puzzle.board.cell[0].qsub;
			var before = state.exportText(puzzle);
			changeClue(pid, foreign);
			assert.throws(
				function() {
					h.apply(puzzle, state.exportText(foreign));
				},
				/different puzzle/,
				pid
			);
			assert.equal(state.exportText(puzzle), before);
			assert.equal(puzzle.board.cell[0].qsub, mark);
		});
	});
});

var clueChanges = {
	tilepaint: ["border", 0, "ques", 0],
	nondango: ["cell", 3, "ques", 0],
	antmill: ["border", 0, "ques", 7],
	coral: ["excell", 0, "qnum", -1],
	nothree: ["cell", 26, "qnum", -1],
	rassi: ["cell", 0, "ques", 7],
	loute: ["cell", 0, "qdir", -1],
	kazunori: ["border", 0, "qnum", 2],
	goishi: ["cell", 0, "ques", 0],
	yajisoko: ["cell", 2, "qnum", -1]
};
describe("Puzzle clue identity for native varieties", function() {
	Object.keys(fixtures.scanned).forEach(function(pid) {
		it("rejects altered clues in " + pid, function() {
			var puzzle = open(pid),
				foreign = open(pid);
			var before = state.exportText(puzzle);
			if (pid === "lohkous") {
				foreign.board.cell[0].setQnums([1, 2]);
			} else if (clueChanges[pid]) {
				var change = clueChanges[pid];
				set(foreign.board[change[0]][change[1]], change[2], change[3]);
			} else {
				var cell = foreign.board.cell[0];
				set(cell, "qnum", cell.qnum === -1 ? 2 : -1);
			}
			var text = state.exportText(foreign);
			assert.notEqual(text, before, pid);
			assert.equal(state.exportText(h.open(text)), text, pid);
			assert.throws(
				function() {
					h.apply(puzzle, text);
				},
				/different puzzle/,
				pid
			);
			assert.equal(state.exportText(puzzle), before);
		});
	});
	it("checks Pentopia's transparent rule", function() {
		var puzzle = open("pentopia"),
			foreign = open("pentopia");
		foreign.setConfig(
			"pentopia_transparent",
			!foreign.getConfig("pentopia_transparent")
		);
		assert.throws(function() {
			h.apply(puzzle, state.exportText(foreign));
		}, /different puzzle/);
	});
});
describe("Puzzle rule identity", function() {
	it("rejects rule setting mismatches", function() {
		[
			["akichi", "akichi_maximum"],
			["aquarium", "aquarium_regions"],
			["koburin", "koburin_minesweeper"],
			["koburin", "yajilin_out"],
			["icewalk", "loop_full"],
			["pentominous", "fillomino_tri"],
			["voxas", "voxas_tatami"],
			["lapaz", "lapaz_liar"]
		].forEach(function(pair) {
			var puzzle = open(pair[0]),
				foreign = open(pair[0]);
			foreign.setConfig(pair[1], !puzzle.getConfig(pair[1]));
			var before = state.exportText(puzzle);
			assert.throws(
				function() {
					h.apply(puzzle, state.exportText(foreign));
				},
				/different puzzle/,
				pair.join(":")
			);
			assert.equal(state.exportText(puzzle), before);
		});
	});
});

describe("Additional rule and board identity", function() {
	it("rejects a different Balance rule and Tawa shape", function() {
		var balance = open("balance"),
			foreign = open("balance");
		foreign.setConfig("loop_full", !balance.getConfig("loop_full"));
		assert.throws(function() {
			h.apply(balance, state.exportText(foreign));
		}, /different puzzle/);
		var tawa = open("tawa"),
			other = h.open("tawa/5/5/1/");
		assert.throws(function() {
			h.apply(tawa, state.exportText(other));
		}, /different puzzle/);
	});
	it("matches Tren's rule setting", function() {
		var puzzle = open("tren"),
			foreign = open("tren");
		foreign.setConfig("tren_new", !foreign.getConfig("tren_new"));
		assert.throws(function() {
			h.apply(puzzle, state.exportText(foreign));
		}, /different puzzle/);
	});
});
