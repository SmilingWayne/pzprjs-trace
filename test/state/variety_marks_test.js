var assert = require("assert");
var h = require("./helpers");
var state = h.state;
var fixtures = require("./variety_fixtures");
var open = fixtures.open;
var profiles = fixtures.profiles;
function set(piece, prop, value) {
	piece.setdata(prop, value, true);
}
var get = fixtures.get;
var mark = fixtures.set;
describe("Puzzle-specific state transitions", function() {
	it("preserves Snake outside clue completion and clears it on empty import", function() {
		var source = open("snake"),
			puzzle = open("snake");
		var clue = Array.prototype.find.call(source.board.excell, function(c) {
			return !c.isnull && c.qnum >= 0;
		});
		assert(clue);
		set(clue, "qcmp", 1);
		h.apply(puzzle, state.exportText(source));
		assert.equal(puzzle.board.excell[clue.id].qcmp, 1);
		h.apply(puzzle, state.exportText(open("snake")));
		assert.equal(puzzle.board.excell[clue.id].qcmp, 0);
		puzzle.undo();
		assert.equal(puzzle.board.excell[clue.id].qcmp, 1);
	});
	it("restores directional marks with lines in Haisu and Icelom", function() {
		["haisu", "icelom"].forEach(function(pid) {
			var source = open(pid),
				puzzle = open(pid);
			set(source.board.border[0], "line", 1);
			set(source.board.border[0], "qsub", 11);
			set(source.board.border[1], "qsub", 14);
			var text = state.exportText(source);
			h.apply(puzzle, text);
			assert.equal(puzzle.board.border[0].line, 1);
			assert.equal(puzzle.board.border[0].qsub, 11);
			assert.equal(puzzle.board.border[1].qsub, 14);
			puzzle.undo();
			assert.equal(puzzle.board.border[0].line, 0);
			puzzle.redo();
			assert.equal(state.exportText(puzzle), text);
		});
	});
	it("clears Yin-Yang borders omitted by its native file and restores trial on undo", function() {
		var puzzle = open("yinyang"),
			source = open("yinyang");
		puzzle.enterTrial();
		set(puzzle.board.border[0], "qans", 1);
		set(puzzle.board.border[1], "qsub", 1);
		set(source.board.cell[0], "anum", 1);
		h.apply(puzzle, state.exportText(source));
		assert.equal(puzzle.board.trialstage, 0);
		assert.equal(puzzle.board.border[0].qans, 0);
		assert.equal(puzzle.board.border[1].qsub, 0);
		puzzle.undo();
		assert.equal(puzzle.board.trialstage, 1);
		assert.equal(puzzle.board.border[0].qans, 1);
		assert.equal(puzzle.board.border[1].qsub, 1);
		puzzle.redo();
		assert.equal(puzzle.board.border[0].qans, 0);
	});
});

describe("Puzzle-specific native marks", function() {
	it("preserves both kinds of Dosun-Fuwari objects and the blank mark", function() {
		var source = open("dosufuwa"),
			puzzle = open("dosufuwa");
		var ids = Array.prototype.filter
			.call(source.board.cell, function(c) {
				return c.ques === 0;
			})
			.slice(0, 3)
			.map(function(c) {
				return c.id;
			});
		set(source.board.cell[ids[0]], "qans", 1);
		set(source.board.cell[ids[1]], "qans", 2);
		set(source.board.cell[ids[2]], "qsub", 1);
		h.apply(puzzle, state.exportText(source));
		assert.equal(puzzle.board.cell[ids[0]].qans, 1);
		assert.equal(puzzle.board.cell[ids[1]].qans, 2);
		assert.equal(puzzle.board.cell[ids[2]].qsub, 1);
	});
	it("preserves candidates for Skyscrapers and Kropki", function() {
		["skyscrapers", "kropki"].forEach(function(pid) {
			var source = open(pid),
				puzzle = open(pid);
			var cell = Array.prototype.find.call(source.board.cell, function(c) {
				return c.qnum === -1;
			});
			cell.setdata2("snum", 0, 2, true);
			cell.setdata2("snum", 3, 4, true);
			h.apply(puzzle, state.exportText(source));
			assert.equal(puzzle.board.cell[cell.id].snum[0], 2);
			assert.equal(puzzle.board.cell[cell.id].snum[3], 4);
		});
	});
	it("preserves both answer and auxiliary Compass borders", function() {
		var source = open("compass"),
			puzzle = open("compass");
		set(source.board.border[0], "qans", 1);
		set(source.board.border[0], "qsub", 1);
		h.apply(puzzle, state.exportText(source));
		assert.equal(puzzle.board.border[0].qans, 1);
		assert.equal(puzzle.board.border[0].qsub, 1);
	});
	it("preserves Sukoro, Nanro and Toichika object marks", function() {
		["sukoro", "nanro", "toichika"].forEach(function(pid) {
			var source = open(pid),
				puzzle = open(pid);
			var cells = Array.prototype.filter.call(source.board.cell, function(c) {
				return c.qnum === -1;
			});
			set(cells[0], "qsub", 1);
			set(cells[1], "qsub", 2);
			h.apply(puzzle, state.exportText(source));
			assert.equal(puzzle.board.cell[cells[0].id].qsub, 1);
			assert.equal(puzzle.board.cell[cells[1].id].qsub, 2);
		});
	});
});
describe("Piece banks and movement states", function() {
	it("replaces bank completion marks and checks the piece bank identity", function() {
		var source = open("statuepark"),
			puzzle = open("statuepark");
		source.board.bank.pieces[0].setQcmp(1);
		puzzle.board.bank.pieces[1].setQcmp(1);
		var text = state.exportText(source);
		h.apply(puzzle, text);
		assert.equal(puzzle.board.bank.pieces[0].qcmp, 1);
		assert.equal(puzzle.board.bank.pieces[1].qcmp, 0);
		puzzle.undo();
		assert.equal(puzzle.board.bank.pieces[0].qcmp, 0);
		assert.equal(puzzle.board.bank.pieces[1].qcmp, 1);
		puzzle.redo();
		assert.equal(state.exportText(puzzle), text);
		var foreign = h.open("statuepark/7/7/078ii6000000290f0//p");
		assert.throws(function() {
			h.apply(puzzle, state.exportText(foreign));
		}, /different puzzle/);
		assert.equal(state.exportText(puzzle), text);
	});
	it("restores and undoes a satogaeri file with isolated progress", function() {
		var source = open("satogaeri"),
			puzzle = open("satogaeri");
		var blank = Array.prototype.find.call(source.board.cell, function(c) {
			return !c.path;
		});
		var edge = Array.prototype.find.call(source.board.border, function(b) {
			return !b.sidecell[0].path && !b.sidecell[1].path;
		});
		// Native FileIO permits completion and a line even when no path contains a clue.
		blank.qcmp = 1;
		edge.line = 1;
		var text = source.getFileData(source.pzpr.parser.FILE_PZPR);
		var parsed = h.open(text);
		assert.equal(parsed.board.cell[blank.id].qcmp, 1);
		assert.equal(parsed.board.border[edge.id].line, 1);
		puzzle.enterTrial();
		puzzle.board.cell[1].setdata("qsub", 2, true);
		h.apply(puzzle, text);
		assert.equal(state.exportText(puzzle), text);
		assert.equal(puzzle.board.trialstage, 0);
		puzzle.undo();
		assert.equal(puzzle.board.trialstage, 1);
		assert.equal(puzzle.board.cell[1].qsub, 2);
		puzzle.redo();
		assert.equal(state.exportText(puzzle), text);
	});
});
describe("Native marks in profile varieties", function() {
	Object.keys(fixtures.scanned).forEach(function(pid) {
		it("round-trips representable profile marks for " + pid, function() {
			var saved = 0;
			profiles[pid].fields.forEach(function(field) {
				var base = open(pid),
					blank = state.exportText(base),
					pieces = base.board[field.group];
				for (var i = 0; i < pieces.length; i++) {
					var source = open(pid),
						piece = source.board[field.group][i];
					if (
						field.pos !== undefined &&
						!Array.isArray(piece[field.property])
					) {
						break;
					}
					var old = get(piece, field);
					var values = field.property === "anum" ? [1, 2, 0] : [1, 2, 3, 4];
					for (var j = 0; j < values.length; j++) {
						if (old === values[j]) {
							continue;
						}
						mark(piece, field, values[j]);
						var text = state.exportText(source),
							parsed = h.open(text);
						if (
							text === blank ||
							get(parsed.board[field.group][i], field) !== values[j] ||
							state.exportText(parsed) !== text
						) {
							continue;
						}
						var target = open(pid);
						h.apply(target, text);
						assert.strictEqual(
							get(target.board[field.group][i], field),
							values[j]
						);
						h.apply(target, blank);
						assert.strictEqual(
							get(target.board[field.group][i], field),
							get(base.board[field.group][i], field)
						);
						saved++;
						return;
					}
				}
			});
			assert(saved > 0, "No saved player mark found for " + pid);
		});
	});
});
describe("Movement and piece-bank states", function() {
	it("keeps Goishi's stone clues while replacing the removed-stone sequence", function() {
		var puzzle = open("goishi"),
			source = open("goishi");
		var stone = Array.prototype.find.call(source.board.cell, function(c) {
			return c.isStone();
		});
		assert(stone);
		source.mouse.inputPath(stone.bx, stone.by);
		assert.strictEqual(stone.anum, 1);
		var text = state.exportText(source),
			before = state.exportText(puzzle);
		h.apply(puzzle, text);
		assert.strictEqual(puzzle.board.cell[stone.id].ques, 0);
		assert.strictEqual(puzzle.board.cell[stone.id].anum, 1);
		puzzle.undo();
		assert.strictEqual(state.exportText(puzzle), before);
		puzzle.redo();
		assert.strictEqual(state.exportText(puzzle), text);
		var foreign = open("goishi");
		foreign.board.cell[stone.id].setQues(7);
		assert.throws(function() {
			h.apply(puzzle, state.exportText(foreign));
		}, /different puzzle/);
	});

	it("restores Takoyaki circles, completion and line fields even on an incorrect board", function() {
		var puzzle = open("takoyaki"),
			source = open("takoyaki");
		var cell = Array.prototype.find.call(source.board.cell, function(c) {
			return c.qnum === -1 && !c.adjborder.right.isnull;
		});
		assert(cell);
		cell.setQans(1);
		cell.setLineVal(1); // FileIO also accepts this combination although the UI does not create it.
		cell.adjborder.right.setdata("line", 1, true);
		var clue = Array.prototype.find.call(source.board.cell, function(c) {
			return c.qnum !== -1;
		});
		clue.setQcmp(1);
		var text = state.exportText(source),
			before = state.exportText(puzzle);
		assert.strictEqual(h.open(text).board.cell[cell.id].line, 1);
		h.apply(puzzle, text);
		assert.strictEqual(puzzle.board.cell[cell.id].line, 1);
		assert.strictEqual(state.exportText(puzzle), text);
		puzzle.undo();
		assert.strictEqual(state.exportText(puzzle), before);
		puzzle.redo();
		assert.strictEqual(state.exportText(puzzle), text);
	});
	it("replaces Pentopia's bank completion marks and matches its pieces", function() {
		var puzzle = open("pentopia"),
			source = open("pentopia");
		assert(source.board.bank.pieces.length > 1);
		source.board.bank.pieces[0].setQcmp(1);
		puzzle.board.bank.pieces[1].setQcmp(1);
		var text = state.exportText(source),
			before = state.exportText(puzzle),
			position = puzzle.opemgr.position;
		h.apply(puzzle, text);
		assert.strictEqual(puzzle.opemgr.position, position + 1);
		assert.strictEqual(puzzle.board.bank.pieces[0].qcmp, 1);
		assert.strictEqual(puzzle.board.bank.pieces[1].qcmp, 0);
		assert.strictEqual(state.exportText(puzzle), text);
		puzzle.undo();
		assert.strictEqual(state.exportText(puzzle), before);
		puzzle.redo();
		assert.strictEqual(state.exportText(puzzle), text);
		var foreign = open("pentopia");
		foreign.board.bank.initialize(["1:1"]);
		assert.throws(function() {
			h.apply(puzzle, state.exportText(foreign));
		}, /different puzzle/);
		assert.strictEqual(state.exportText(puzzle), text);
	});
});

describe("Additional native marks", function() {
	it("saves Coral's outside clue completion marks", function() {
		var source = open("coral"),
			puzzle = open("coral");
		var clue = Array.prototype.find.call(source.board.excell, function(c) {
			return c.qnum !== -1;
		});
		assert(clue);
		clue.setQcmp(1);
		var text = state.exportText(source);
		h.apply(puzzle, text);
		assert.strictEqual(puzzle.board.excell[clue.id].qcmp, 1);
		puzzle.undo();
		assert.strictEqual(puzzle.board.excell[clue.id].qcmp, 0);
		puzzle.redo();
		assert.strictEqual(puzzle.board.excell[clue.id].qcmp, 1);
	});
	it("preserves Remembered Length arrow marks and line with a cross", function() {
		var source = open("remlen"),
			puzzle = open("remlen");
		source.board.border[0].setdata("line", 1, true);
		source.board.border[0].setdata("qsub", 2, true);
		source.board.border[1].setdata("qsub", 11, true);
		var text = state.exportText(source);
		h.apply(puzzle, text);
		assert.strictEqual(puzzle.board.border[0].line, 1);
		assert.strictEqual(puzzle.board.border[0].qsub, 2);
		assert.strictEqual(puzzle.board.border[1].qsub, 11);
		puzzle.undo();
		assert.strictEqual(puzzle.board.border[1].qsub, 0);
		puzzle.redo();
		assert.strictEqual(state.exportText(puzzle), text);
	});
	it("preserves Roma's direction masks", function() {
		var source = open("roma"),
			puzzle = open("roma");
		var c = Array.prototype.find.call(source.board.cell, function(cell) {
			return cell.qnum === -1;
		});
		c.setQsub(4 | 16);
		h.apply(puzzle, state.exportText(source));
		assert.strictEqual(puzzle.board.cell[c.id].qsub, 20);
		puzzle.undo();
		assert.strictEqual(puzzle.board.cell[c.id].qsub, 0);
		puzzle.redo();
		assert.strictEqual(puzzle.board.cell[c.id].qsub, 20);
	});
});
