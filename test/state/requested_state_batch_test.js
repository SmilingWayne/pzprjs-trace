var assert = require("assert");
var h = require("./helpers");
var state = h.state;
var profiles = Object.assign(
	{},
	require("../../src-ui/state-profiles/lines"),
	require("../../src-ui/state-profiles/shading"),
	require("../../src-ui/state-profiles/numbers"),
	require("../../src-ui/state-profiles/partitions")
);
var groups = {
	line:
		"pmemory portal recoil tjunction turnrun urumi uturns vertigo wataridori timebomb ubahn roboticwalk zabajaba",
	shade:
		"regional-poly retroships retsurin ruleofthree sansaroad sashikabe seiza smullyan starbattle sumiwake tetrochaink tetroctb trizone yokeimoji",
	number:
		"scrabble slovak soulmates suguru tetrominous topo twinarea yajirushi yajirushi2",
	partition: "sendai subomino tachibk"
};
var pids = Object.keys(groups).reduce(function(all, group) {
	groups[group].split(" ").forEach(function(pid) {
		all[pid] = group;
	});
	return all;
}, {});
function set(piece, prop, value, pos) {
	if (pos === undefined) {
		piece.setdata(prop, value, true);
	} else {
		piece.setdata2(prop, pos, value, true);
	}
}
function base(pid) {
	var puzzle = h.open(pid + "/4/4/");
	// Supply special cells and outside clues to exercise their native codecs.
	if (pid === "roboticwalk") {
		set(puzzle.board.cell[6], "ques", 6);
	}
	if (pid === "ubahn") {
		set(puzzle.board.excell[0], "qnum", 2);
	}
	if (pid === "scrabble") {
		puzzle.board.bank.initialize(["CAT", "DOG"]);
	}
	return h.open(state.exportText(puzzle));
}
function mark(puzzle, group, prop, value, pos, exclude) {
	var pieces = puzzle.board[group];
	for (var i = 0; i < pieces.length; i++) {
		if (
			i === exclude ||
			(puzzle.pid === "roboticwalk" &&
				group === "cell" &&
				prop === "qans" &&
				pieces[i].ques !== 6)
		) {
			continue;
		}
		var piece = pieces[i],
			old = pos === undefined ? piece[prop] : piece[prop][pos];
		if (old === value) {
			continue;
		}
		set(piece, prop, value, pos);
		var saved = h.open(state.exportText(puzzle)).board[group][i];
		if ((pos === undefined ? saved[prop] : saved[prop][pos]) === value) {
			return i;
		}
		set(piece, prop, old, pos);
	}
	throw Error("No serializable " + group + "." + prop + " for " + puzzle.pid);
}
function equalFields(pid, actual, expected) {
	profiles[pid].fields.forEach(function(field) {
		Array.prototype.forEach.call(actual.board[field.group], function(piece, i) {
			var a = piece[field.property],
				b = expected.board[field.group][i][field.property];
			if (field.pos !== undefined) {
				a = a[field.pos];
				b = b[field.pos];
			}
			assert.strictEqual(
				a,
				b,
				pid + " " + field.group + "." + field.property + "[" + i + "]"
			);
		});
	});
	if (profiles[pid].bank) {
		assert.deepStrictEqual(
			actual.board.bank.pieces.map(function(p) {
				return p.qcmp;
			}),
			expected.board.bank.pieces.map(function(p) {
				return p.qcmp;
			})
		);
	}
}
describe("Requested native state batch", function() {
	Object.keys(pids).forEach(function(pid) {
		it("round-trips, replaces and undoes " + pid, function() {
			var source = base(pid),
				puzzle = base(pid),
				group = pids[pid];
			var category =
				group === "line" || group === "partition" ? "border" : "cell";
			var prop =
				group === "line" ? "line" : group === "number" ? "anum" : "qans";
			var value = pid === "ruleofthree" ? 12 : group === "number" ? 2 : 1;
			var sub = category === "border" && prop === "line" ? 2 : 1;
			var a = mark(source, category, prop, value);
			var b = mark(source, category, "qsub", sub, undefined, a);
			mark(puzzle, category, "qsub", sub, undefined, b);
			mark(puzzle, category, prop, value, undefined, a);
			set(puzzle.board.cell[15], "qcmp", 1);
			var text = state.exportText(source),
				parsed = h.open(text),
				before = state.exportText(puzzle),
				position = puzzle.opemgr.position;
			assert.strictEqual(state.exportText(parsed), text);
			h.apply(puzzle, text);
			assert.strictEqual(puzzle.opemgr.position, position + 1);
			assert.strictEqual(state.exportText(puzzle), text);
			equalFields(pid, puzzle, parsed);
			puzzle.undo();
			assert.strictEqual(state.exportText(puzzle), before);
			assert.strictEqual(puzzle.board.cell[15].qcmp, 1);
			puzzle.redo();
			equalFields(pid, puzzle, parsed);
			var empty = state.exportText(base(pid));
			h.apply(puzzle, empty);
			assert.strictEqual(state.exportText(puzzle), empty);
			puzzle.undo();
			assert.strictEqual(state.exportText(puzzle), text);
			assert.throws(function() {
				h.apply(puzzle, state.exportText(h.open(pid + "/3/3/")));
			}, /different puzzle/);
			assert.strictEqual(state.exportText(puzzle), text);
			return state
				.encode(text)
				.then(function(encoded) {
					return state.decode(encoded, false);
				})
				.then(function(decoded) {
					assert.strictEqual(decoded, text);
				});
		});
	});
});

describe("Requested state marks and identity", function() {
	var marks = [
		["pmemory", "cell", "qsub", 1],
		["recoil", "border", "qsub", 11],
		["turnrun", "border", "qsub", 11],
		["vertigo", "border", "qsub", 11],
		["timebomb", "cell", "anum", 0],
		["timebomb", "cell", "qcmp", 1],
		["roboticwalk", "cell", "qans", 1],
		["ruleofthree", "cell", "qsub", 1],
		["yajirushi2", "cell", "qsub", 2],
		["seiza", "border", "line", 1],
		["sumiwake", "border", "line", 1],
		["retsurin", "border", "line", 1],
		["smullyan", "border", "line", 1],
		["trizone", "border", "qans", 1],
		["zabajaba", "cell", "line", 1],
		["zabajaba", "cell", "qsub", 2],
		["zabajaba", "cell", "qcmp", 1],
		["ubahn", "excell", "qcmp", 1],
		["ubahn", "cell", "snum", 2, 0],
		["tachibk", "cell", "snum", 2, 0],
		["scrabble", "cell", "snum", 2, 0],
		["slovak", "cell", "snum", 2, 0],
		["soulmates", "cell", "snum", 2, 0],
		["suguru", "cell", "snum", 2, 0],
		["tetrominous", "border", "qans", 1],
		["topo", "border", "qans", 1]
	];
	marks.forEach(function(item) {
		it("restores " + item.slice(0, 3).join(" "), function() {
			var source = base(item[0]),
				puzzle = base(item[0]);
			var i = mark(source, item[1], item[2], item[3], item[4]);
			h.apply(puzzle, state.exportText(source));
			var piece = puzzle.board[item[1]][i];
			assert.strictEqual(
				item[4] === undefined ? piece[item[2]] : piece[item[2]][item[4]],
				item[3]
			);
			puzzle.undo();
			assert.strictEqual(
				item[4] === undefined ? piece[item[2]] : piece[item[2]][item[4]],
				item[2] === "anum" || item[4] !== undefined ? -1 : 0
			);
			puzzle.redo();
			assert.strictEqual(
				item[4] === undefined ? piece[item[2]] : piece[item[2]][item[4]],
				item[3]
			);
		});
	});
	Object.keys(pids).forEach(function(pid) {
		it("rejects a changed " + pid + " clue", function() {
			var puzzle = base(pid),
				foreign = base(pid),
				before = state.exportText(puzzle);
			if (pid === "starbattle") {
				foreign.board.starCount.count = puzzle.board.starCount.count + 1;
				assert.throws(function() {
					h.apply(puzzle, state.exportText(foreign));
				}, /different puzzle/);
				assert.strictEqual(state.exportText(puzzle), before);
				return;
			}
			var choices = [
				["cell", "qdir", 1],
				["cell", "qnum", 1],
				["cell", "qnum", 2],
				["cross", "qnum", 2],
				["border", "ques", 1],
				["cell", "ques", 7],
				["cell", "ques", 6],
				["excell", "qnum", 2]
			];
			foreign.opemgr.disableRecord();
			var changed = choices.some(function(c) {
				return Array.prototype.some.call(foreign.board[c[0]], function(piece) {
					var old = piece[c[1]];
					if (old === c[2]) {
						return false;
					}
					set(piece, c[1], c[2]);
					var text = state.exportText(foreign),
						parsed = h.open(text);
					if (
						text !== before &&
						state.exportText(parsed) === text &&
						parsed.board[c[0]][piece.id][c[1]] === c[2]
					) {
						assert.throws(
							function() {
								h.apply(puzzle, text);
							},
							/different puzzle/,
							pid
						);
						assert.strictEqual(state.exportText(puzzle), before);
						return true;
					}
					set(piece, c[1], old);
					return false;
				});
			});
			assert(changed, "no serializable clue for " + pid);
		});
	});
	[
		["retsurin", "yajilin_out"],
		["retsurin", "koburin_minesweeper"],
		["roboticwalk", "loop_full"],
		["scrabble", "scrabble_given"],
		["tetrominous", "fillomino_tri"],
		["topo", "fillomino_tri"],
		["trizone", "trizone_ghost"],
		["turnrun", "loop_full"],
		["wataridori", "loop_full"]
	].forEach(function(pair) {
		it("rejects a different " + pair.join(" "), function() {
			var puzzle = base(pair[0]),
				foreign = base(pair[0]);
			foreign.setConfig(pair[1], !puzzle.getConfig(pair[1]));
			var before = state.exportText(puzzle),
				text = state.exportText(foreign);
			assert.notStrictEqual(text, before);
			assert.throws(function() {
				h.apply(puzzle, text);
			}, /different puzzle/);
			assert.strictEqual(state.exportText(puzzle), before);
		});
	});
});

["regional-poly", "retroships", "scrabble"].forEach(function(pid) {
	describe(pid + " piece bank", function() {
		it("replaces marks and checks the bank", function() {
			var source = base(pid),
				puzzle = base(pid),
				foreign = base(pid);
			source.board.bank.pieces[0].setQcmp(1);
			puzzle.board.bank.pieces[1].setQcmp(1);
			var text = state.exportText(source);
			h.apply(puzzle, text);
			assert.strictEqual(puzzle.board.bank.pieces[0].qcmp, 1);
			assert.strictEqual(puzzle.board.bank.pieces[1].qcmp, 0);
			puzzle.undo();
			assert.strictEqual(puzzle.board.bank.pieces[0].qcmp, 0);
			assert.strictEqual(puzzle.board.bank.pieces[1].qcmp, 1);
			puzzle.redo();
			assert.strictEqual(state.exportText(puzzle), text);
			foreign.board.bank.setPiece(null, 0);
			assert.throws(function() {
				h.apply(puzzle, state.exportText(foreign));
			}, /different puzzle/);
		});
	});
});

describe("Generated puzzle URLs", function() {
	Object.keys(pids).forEach(function(pid) {
		it("imports " + pid + " progress onto its puzzle URL", function() {
			var source = base(pid),
				group = pids[pid];
			var category =
				group === "line" || group === "partition" ? "border" : "cell";
			var prop =
				group === "line" ? "line" : group === "number" ? "anum" : "qans";
			mark(
				source,
				category,
				prop,
				pid === "ruleofthree" ? 12 : group === "number" ? 2 : 1
			);
			var url = source.getURL(),
				puzzle = h.open(url),
				text = state.exportText(source);
			assert.strictEqual(puzzle.pid, pid);
			h.apply(puzzle, text);
			assert.strictEqual(state.exportText(puzzle), text);
		});
	});
});

describe("Requested special state transitions", function() {
	["ruleofthree", "topo", "regional-poly"].forEach(function(pid) {
		it("restores a " + pid + " trial on undo", function() {
			var source = base(pid),
				puzzle = base(pid),
				group = pids[pid];
			var category = "cell";
			var prop = group === "number" ? "anum" : "qans";
			var value = pid === "ruleofthree" ? 12 : group === "number" ? 2 : 1;
			var i = mark(source, category, prop, value);
			puzzle.enterTrial();
			set(puzzle.board.cell[i], "qsub", 1);
			h.apply(puzzle, state.exportText(source));
			assert.strictEqual(puzzle.board.trialstage, 0);
			assert.strictEqual(puzzle.board.cell[i][prop], value);
			puzzle.undo();
			assert.strictEqual(puzzle.board.trialstage, 1);
			assert.strictEqual(puzzle.board.cell[i].qsub, 1);
			puzzle.redo();
			assert.strictEqual(puzzle.board.cell[i][prop], value);
		});
	});
	it("matches Slovak Sums' number range", function() {
		var puzzle = base("slovak"),
			foreign = base("slovak");
		foreign.board.indicator.count++;
		assert.throws(function() {
			h.apply(puzzle, state.exportText(foreign));
		}, /different puzzle/);
	});
	it("matches Recoil's starting position", function() {
		var puzzle = base("recoil"),
			foreign = base("recoil");
		foreign.board.startpos.bx = foreign.board.startpos.bx === 1 ? 3 : 1;
		assert.throws(function() {
			h.apply(puzzle, state.exportText(foreign));
		}, /different puzzle/);
	});
	it("matches Yokeimoji kana clues", function() {
		var puzzle = base("yokeimoji"),
			foreign = base("yokeimoji");
		foreign.board.cell[0].setKana("ア");
		assert.notStrictEqual(state.exportText(puzzle), state.exportText(foreign));
		assert.throws(function() {
			h.apply(puzzle, state.exportText(foreign));
		}, /different puzzle/);
	});
	it("matches Topo border numbers and Sumiwake vertex clues", function() {
		[
			["topo", "border", "qnum", 2],
			["sumiwake", "cross", "qnum", 2]
		].forEach(function(item) {
			var puzzle = base(item[0]),
				foreign = base(item[0]);
			set(foreign.board[item[1]][0], item[2], item[3]);
			assert.throws(function() {
				h.apply(puzzle, state.exportText(foreign));
			}, /different puzzle/);
		});
	});
});

describe("Existing puzzle URL fixtures", function() {
	var samples = require("./requested_state_fixtures");
	Object.keys(pids).forEach(function(pid) {
		it("restores partial " + pid + " progress", function() {
			var source = h.open(pid + "/" + samples[pid]);
			var puzzle = h.open(pid + "/" + samples[pid]);
			var group = pids[pid];
			var category =
				group === "line" || group === "partition" ? "border" : "cell";
			var prop =
				group === "line" ? "line" : group === "number" ? "anum" : "qans";
			mark(
				source,
				category,
				prop,
				pid === "ruleofthree" ? 12 : group === "number" ? 2 : 1
			);
			var text = state.exportText(source);
			h.apply(puzzle, text);
			assert.strictEqual(state.exportText(puzzle), text);
			equalFields(pid, puzzle, h.open(text));
		});
	});
});

describe("Direction mark combinations", function() {
	["recoil", "turnrun", "vertigo"].forEach(function(pid) {
		it("preserves a line with a cross or direction in " + pid, function() {
			var source = base(pid),
				puzzle = base(pid);
			set(source.board.border[0], "line", 1);
			set(source.board.border[0], "qsub", 2);
			set(source.board.border[1], "line", 1);
			set(source.board.border[1], "qsub", 11);
			var text = state.exportText(source);
			h.apply(puzzle, text);
			assert.strictEqual(puzzle.board.border[0].line, 1);
			assert.strictEqual(puzzle.board.border[0].qsub, 2);
			assert.strictEqual(puzzle.board.border[1].line, 1);
			assert.strictEqual(puzzle.board.border[1].qsub, 11);
			puzzle.undo();
			assert.strictEqual(puzzle.board.border[0].line, 0);
			puzzle.redo();
			assert.strictEqual(state.exportText(puzzle), text);
		});
	});
});

describe("Display-only Yajilin settings", function() {
	["retsurin", "koburin"].forEach(function(pid) {
		it("imports " + pid + " without changing the display setting", function() {
			var source = h.open(pid + "/4/4/"),
				puzzle = h.open(pid + "/4/4/");
			set(source.board.cell[15], "qnum", -2);
			set(puzzle.board.cell[15], "qnum", -2);
			source.setConfig("disptype_yajilin", 2);
			mark(source, "cell", "qans", 1);
			assert.notStrictEqual(
				source.getConfig("disptype_yajilin"),
				puzzle.getConfig("disptype_yajilin")
			);
			h.apply(puzzle, state.exportText(source));
			assert.strictEqual(puzzle.getConfig("disptype_yajilin"), 1);
			assert.strictEqual(puzzle.board.cell[0].qans, 1);
			puzzle.undo();
			assert.strictEqual(puzzle.board.cell[0].qans, 0);
			puzzle.redo();
			assert.strictEqual(puzzle.board.cell[0].qans, 1);
			var other = h.open(pid + "/4/4/");
			set(other.board.cell[15], "qnum", -2);
			other.setConfig("disptype_yajilin", 2);
			h.apply(other, state.exportText(puzzle));
			assert.strictEqual(other.getConfig("disptype_yajilin"), 2);
			assert.strictEqual(other.board.cell[0].qans, 1);
		});
	});
});
