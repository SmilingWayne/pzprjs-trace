var assert = require("assert");
var h = require("./helpers");
var state = h.state;

var samples = require("./native_codec_fixtures");
function open(pid) {
	return h.open(pid + "/" + samples[pid]);
}
function set(piece, property, value) {
	piece.setdata(property, value, true);
}
function verify(pid, mark, check) {
	var source = open(pid),
		puzzle = open(pid);
	mark(source);
	var text = state.exportText(source),
		parsed = h.open(text);
	assert.equal(state.exportText(parsed), text);
	check(parsed);
	var before = state.exportText(puzzle),
		pos = puzzle.opemgr.position;
	h.apply(puzzle, text);
	assert.equal(puzzle.opemgr.position, pos + 1);
	check(puzzle);
	assert.equal(state.exportText(puzzle), text);
	puzzle.undo();
	assert.equal(state.exportText(puzzle), before);
	puzzle.redo();
	assert.equal(state.exportText(puzzle), text);
	h.apply(puzzle, before);
	assert.equal(state.exportText(puzzle), before);
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
}

describe("Special native state marks", function() {
	it("preserves Bosanowa border numbers with their nonzero empty default", function() {
		return verify(
			"bosanowa",
			function(p) {
				var c = Array.prototype.find.call(p.board.cell, function(c) {
					return c.ques === 0 && c.qnum === -1;
				});
				set(c, "anum", 4);
				set(p.board.border[0], "qsub", 0);
			},
			function(p) {
				assert.equal(p.board.border[0].qsub, 0);
				assert(
					p.board.cell.some(function(c) {
						return c.anum === 4;
					})
				);
			}
		);
	});
	["crossstitch", "slashpack"].forEach(function(pid) {
		it("preserves slashes and auxiliary marks in " + pid, function() {
			return verify(
				pid,
				function(p) {
					set(p.board.cell[0], "qans", 31);
					set(p.board.cell[0], "qsub", 2);
					if (pid === "crossstitch") {
						set(p.board.cross[0], "qsub", 1);
					}
				},
				function(p) {
					assert.equal(p.board.cell[0].qans, 31);
					assert.equal(p.board.cell[0].qsub, 2);
					if (pid === "crossstitch") {
						assert.equal(p.board.cross[0].qsub, 1);
					}
				}
			);
		});
	});
	it("preserves diamonds and crossed vertices", function() {
		return verify(
			"diamond",
			function(p) {
				p.board.getx(2, 2).setDiamond(1, true);
				p.board.getx(4, 2).setDiamond(2, true);
			},
			function(p) {
				assert.equal(p.board.getx(2, 2).getDiamond(), 1);
				assert.equal(p.board.getx(4, 2).getDiamond(), 2);
			}
		);
	});
	["firewalk", "vslither", "tslither"].forEach(function(pid) {
		it("preserves vertex marks in " + pid, function() {
			return verify(
				pid,
				function(p) {
					set(p.board.cross[0], "qsub", 1);
				},
				function(p) {
					assert.equal(p.board.cross[0].qsub, 1);
				}
			);
		});
	});
	["pentatouch", "battleship", "snakeegg"].forEach(function(pid) {
		it("preserves piece-bank marks in " + pid, function() {
			return verify(
				pid,
				function(p) {
					p.board.bank.pieces[0].setQcmp(1);
				},
				function(p) {
					assert.equal(p.board.bank.pieces[0].qcmp, 1);
				}
			);
		});
	});
	it("preserves Ladders bars", function() {
		return verify(
			"ladders",
			function(p) {
				set(p.board.cell[7], "qans", 12);
			},
			function(p) {
				assert.equal(p.board.cell[7].qans, 12);
			}
		);
	});
	it("preserves Taj Mahal segments with their centers", function() {
		return verify(
			"tajmahal",
			function(p) {
				p.board.segment.addSegmentByAddr(2, 2, 6, 0, 5, 3);
			},
			function(p) {
				assert.equal(p.board.segment.length, 1);
				assert.equal(p.board.segment[0].ox, 5);
				assert.equal(p.board.segment[0].oy, 3);
			}
		);
	});
});

describe("Native mixed marks", function() {
	["forestwalk", "waterwalk", "firewalk"].forEach(function(pid) {
		it("preserves special-cell marks in " + pid, function() {
			return verify(
				pid,
				function(p) {
					var cell = Array.prototype.find.call(p.board.cell, function(c) {
						return c.ques === 6;
					});
					set(cell, "qans", 2);
				},
				function(p) {
					assert(
						p.board.cell.some(function(c) {
							return c.ques === 6 && c.qans === 2;
						})
					);
				}
			);
		});
	});
	["kaidan", "wittgen"].forEach(function(pid) {
		it(
			"preserves internal cell lines and completion marks in " + pid,
			function() {
				return verify(
					pid,
					function(p) {
						set(p.board.cell[0], "line", 1);
						set(p.board.cell[0], "qcmp", 1);
					},
					function(p) {
						assert.equal(p.board.cell[0].line, 1);
						assert.equal(p.board.cell[0].qcmp, 1);
					}
				);
			}
		);
	});
	["trainstations", "bdwalk", "kaisu", "icelom2"].forEach(function(pid) {
		it("preserves directions on lines in " + pid, function() {
			return verify(
				pid,
				function(p) {
					set(p.board.border[0], "line", 1);
					set(p.board.border[0], "qsub", 11);
				},
				function(p) {
					assert.equal(p.board.border[0].line, 1);
					assert.equal(p.board.border[0].qsub, 11);
				}
			);
		});
	});
	[
		"numrope",
		"sananko",
		"kakuru",
		"snakepit",
		"wafusuma",
		"mannequin",
		"snakeegg"
	].forEach(function(pid) {
		it("preserves candidate slots in " + pid, function() {
			return verify(
				pid,
				function(p) {
					var c = Array.prototype.find.call(p.board.cell, function(c) {
						return c.qnum === -1 && c.ques === 0;
					});
					c.setdata2("snum", 0, 2, true);
				},
				function(p) {
					assert(
						p.board.cell.some(function(c) {
							return c.snum[0] === 2;
						})
					);
				}
			);
		});
	});
	["cts", "magnets", "battleship"].forEach(function(pid) {
		it("preserves outside clue completion in " + pid, function() {
			return verify(
				pid,
				function(p) {
					var c = Array.prototype.find.call(p.board.excell, function(c) {
						return c.qnum >= 0;
					});
					set(c, "qcmp", 1);
				},
				function(p) {
					assert(
						p.board.excell.some(function(c) {
							return c.qnum >= 0 && c.qcmp === 1;
						})
					);
				}
			);
		});
	});
});

describe("State import operation boundaries", function() {
	it("keeps consecutive imports and the next candidate edit independently undoable", function() {
		var source = open("kakuru"),
			puzzle = open("kakuru");
		var cell = Array.prototype.find.call(source.board.cell, function(c) {
			return c.qnum === -1 && c.ques === 0;
		});
		cell.setdata2("snum", 0, 2, true);
		var marked = state.exportText(source),
			empty = state.exportText(puzzle);
		h.apply(puzzle, marked);
		puzzle.opemgr.newOperation();
		puzzle.board.cell[cell.id].setdata2("snum", 0, 3, true);
		assert.equal(puzzle.board.cell[cell.id].snum[0], 3);
		puzzle.undo();
		assert.equal(state.exportText(puzzle), marked);
		puzzle.undo();
		assert.equal(state.exportText(puzzle), empty);
		puzzle.redo();
		assert.equal(state.exportText(puzzle), marked);
		h.apply(puzzle, empty);
		assert.equal(state.exportText(puzzle), empty);
		puzzle.undo();
		assert.equal(state.exportText(puzzle), marked);
	});
});

describe("Segment and special-default replacement", function() {
	it("replaces Taj Mahal segments in a trial and restores them on undo", function() {
		var source = open("tajmahal"),
			puzzle = open("tajmahal");
		source.board.segment.addSegmentByAddr(2, 2, 6, 0, 5, 3);
		puzzle.board.segment.addSegmentByAddr(2, 8, 4, 6, 2, 6);
		puzzle.enterTrial();
		puzzle.board.segment.addSegmentByAddr(0, 0, 0, 2, 1, 1);
		var before = state.exportText(puzzle),
			text = state.exportText(source),
			position = puzzle.opemgr.position;
		h.apply(puzzle, text);
		assert.equal(puzzle.opemgr.position, position + 1);
		assert.equal(puzzle.board.trialstage, 0);
		assert.equal(state.exportText(puzzle), text);
		puzzle.undo();
		assert.equal(puzzle.board.trialstage, 1);
		assert.equal(state.exportText(puzzle), before);
		puzzle.redo();
		assert.equal(state.exportText(puzzle), text);
	});
	it("clears Bosanowa border numbers to minus one and undoes the change", function() {
		var puzzle = open("bosanowa"),
			empty = state.exportText(open("bosanowa"));
		set(puzzle.board.border[0], "qsub", 5);
		h.apply(puzzle, empty);
		assert.equal(puzzle.board.border[0].qsub, -1);
		puzzle.undo();
		assert.equal(puzzle.board.border[0].qsub, 5);
		puzzle.redo();
		assert.equal(puzzle.board.border[0].qsub, -1);
	});
});
