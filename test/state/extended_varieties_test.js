var assert = require("assert");
var h = require("./helpers");
var state = h.state;
var samples = require("./extended_variety_fixtures");
var profiles = Object.assign(
	{},
	require("../../src-ui/state-profiles/shading"),
	require("../../src-ui/state-profiles/lines"),
	require("../../src-ui/state-profiles/numbers"),
	require("../../src-ui/state-profiles/partitions")
);

var linePids = "balancelink bwloop circuitwalk dotchi2 elasticlink energywalk golemgrad lineofsight lring morningwalk nuriloop orbital hamlepaths".split(
	" "
);
var borderPids = "heavydots narrow longest meidjuluk".split(" ");
var numberPids = "alter blindrush doppelblock isowatari japanesesums jatahoku mrokmrno numcity".split(
	" "
);

function open(pid) {
	return h.open(pid + "/" + samples[pid]);
}

// Find a location where the native codec actually retains this mark. This also
// avoids placing answers on clues or blocked cells in the source puzzle.
function mark(puzzle, group, property, value, pos, excluded) {
	var pieces = puzzle.board[group];
	for (var i = 0; i < pieces.length; i++) {
		if (i === excluded) {
			continue;
		}
		var piece = pieces[i];
		if (puzzle.pid === "longest" && piece.ques) {
			continue;
		}
		var old = pos === undefined ? piece[property] : piece[property][pos];
		if (old === value) {
			continue;
		}
		if (pos === undefined) {
			piece.setdata(property, value, true);
		} else {
			piece.setdata2(property, pos, value, true);
		}
		var text = state.exportText(puzzle);
		var parsed = h.open(text).board[group][i];
		var saved = pos === undefined ? parsed[property] : parsed[property][pos];
		if (saved === value) {
			return i;
		}
		if (pos === undefined) {
			piece.setdata(property, old, true);
		} else {
			piece.setdata2(property, pos, old, true);
		}
	}
	throw Error(
		"No serializable " + group + "." + property + " for " + puzzle.pid
	);
}

describe("Extended puzzle state profiles", function() {
	Object.keys(samples).forEach(function(pid) {
		it("round-trips and replaces " + pid, function() {
			var source = open(pid),
				puzzle = open(pid);
			var group =
				linePids.indexOf(pid) >= 0 || borderPids.indexOf(pid) >= 0
					? "border"
					: pid === "heyapin"
					? "cross"
					: "cell";
			var property =
				linePids.indexOf(pid) >= 0
					? "line"
					: numberPids.indexOf(pid) >= 0
					? "anum"
					: "qans";
			var value = property === "anum" ? 2 : 1;
			var sub = group === "border" && property === "line" ? 2 : 1;
			var a = mark(source, group, property, value);
			var subProperty = pid === "nibunnogo" ? "qans" : "qsub";
			if (pid === "nibunnogo") {
				sub = 2;
			}
			var b = mark(source, group, subProperty, sub, undefined, a);
			mark(puzzle, group, subProperty, sub, undefined, b);
			mark(puzzle, group, property, value, undefined, a);
			puzzle.board.cell[0].setdata("qcmp", 1, true);
			var text = state.exportText(source),
				parsed = h.open(text);
			assert.strictEqual(state.exportText(parsed), text);
			var before = state.exportText(puzzle),
				position = puzzle.opemgr.position;
			h.apply(puzzle, text);
			assert.strictEqual(puzzle.opemgr.position, position + 1);
			assert.strictEqual(state.exportText(puzzle), text);
			profiles[pid].fields.forEach(function(field) {
				Array.prototype.forEach.call(puzzle.board[field.group], function(
					piece,
					i
				) {
					var actual = piece[field.property],
						expected = parsed.board[field.group][i][field.property];
					if (field.pos !== undefined) {
						actual = actual[field.pos];
						expected = expected[field.pos];
					}
					assert.strictEqual(
						actual,
						expected,
						pid + " " + field.group + "." + field.property + " " + i
					);
				});
			});
			puzzle.undo();
			assert.strictEqual(state.exportText(puzzle), before);
			assert.strictEqual(puzzle.board.cell[0].qcmp, 1);
			puzzle.redo();
			assert.strictEqual(state.exportText(puzzle), text);
			var empty = state.exportText(open(pid));
			h.apply(puzzle, empty);
			assert.strictEqual(state.exportText(puzzle), empty);
			puzzle.undo();
			assert.strictEqual(state.exportText(puzzle), text);
			assert.throws(function() {
				h.apply(puzzle, state.exportText(h.open(pid + "/2/2/")));
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

	Object.keys(samples).forEach(function(pid) {
		it("rejects a changed " + pid + " clue or region", function() {
			var puzzle = open(pid),
				foreign = open(pid);
			var original = state.exportText(foreign);
			foreign.opemgr.disableRecord();
			var choices = [
				["cell", "qnum"],
				["cross", "qnum"],
				["border", "ques"],
				["cell", "ques"]
			];
			var changed = false;
			choices.some(function(choice) {
				return Array.prototype.some.call(foreign.board[choice[0]], function(
					piece
				) {
					var old = piece[choice[1]];
					var value = choice[1] === "qnum" ? (old === 2 ? 3 : 2) : old ? 0 : 1;
					piece.setdata(choice[1], value, true);
					var text = state.exportText(foreign),
						parsed = h.open(text);
					var saved = parsed.board[choice[0]][piece.id][choice[1]];
					if (
						text !== original &&
						saved === value &&
						state.exportText(parsed) === text
					) {
						assert.throws(
							function() {
								h.apply(puzzle, text);
							},
							/different puzzle/,
							pid + " " + choice.join(".")
						);
						assert.strictEqual(state.exportText(puzzle), original);
						changed = true;
						return true;
					}
					piece.setdata(choice[1], old, true);
					return false;
				});
			});
			assert(changed, "no serializable clue found for " + pid);
		});
	});

	[
		"doppelblock",
		"japanesesums",
		"jatahoku",
		"korokoro",
		"meidjuluk",
		"numcity"
	].forEach(function(pid) {
		it("restores " + pid + " candidate numbers", function() {
			var source = open(pid),
				puzzle = open(pid);
			var index = mark(source, "cell", "snum", 3, 0);
			puzzle.board.cell[index].setdata2("snum", 1, 4, true);
			var text = state.exportText(source);
			h.apply(puzzle, text);
			assert.deepStrictEqual(
				puzzle.board.cell[index].snum,
				h.open(text).board.cell[index].snum
			);
			puzzle.undo();
			assert.strictEqual(puzzle.board.cell[index].snum[1], 4);
			puzzle.redo();
			assert.strictEqual(puzzle.board.cell[index].snum[0], 3);
		});
	});

	["distopia", "kissing", "meidjuluk"].forEach(function(pid) {
		it("restores " + pid + " piece-bank marks", function() {
			var source = open(pid),
				puzzle = open(pid);
			source.board.bank.pieces[0].setQcmp(1);
			var text = state.exportText(source);
			assert.strictEqual(h.open(text).board.bank.pieces[0].qcmp, 1);
			h.apply(puzzle, text);
			assert.strictEqual(puzzle.board.bank.pieces[0].qcmp, 1);
			puzzle.undo();
			assert.strictEqual(puzzle.board.bank.pieces[0].qcmp, 0);
			puzzle.redo();
			assert.strictEqual(puzzle.board.bank.pieces[0].qcmp, 1);
		});
		it("rejects a different " + pid + " piece bank", function() {
			var puzzle = open(pid),
				foreign = open(pid);
			foreign.board.bank.setPiece(null, 0);
			assert.throws(function() {
				h.apply(puzzle, state.exportText(foreign));
			}, /different puzzle/);
		});
	});

	["jatahoku", "japanesesums", "isowatari"].forEach(function(pid) {
		it("checks " + pid + " number range or cluster size", function() {
			var puzzle = open(pid),
				foreign = open(pid);
			var indicator =
				pid === "isowatari"
					? foreign.board.clusterSize
					: foreign.board.indicator;
			indicator.count = indicator.count === 2 ? 3 : 2;
			assert.throws(function() {
				h.apply(puzzle, state.exportText(foreign));
			}, /different puzzle/);
		});
	});

	["circuitwalk", "energywalk", "morningwalk"].forEach(function(pid) {
		it("restores " + pid + " special-cell marks", function() {
			var source = open(pid),
				puzzle = open(pid);
			var cell = Array.prototype.find.call(source.board.cell, function(c) {
				return c.ques === 6;
			});
			cell.setdata("qans", 2, true);
			var text = state.exportText(source);
			h.apply(puzzle, text);
			assert.strictEqual(puzzle.board.cell[cell.id].qans, 2);
			puzzle.undo();
			assert.strictEqual(puzzle.board.cell[cell.id].qans, 0);
		});
	});

	[
		["batten", "excell", "qcmp", 1],
		["bhaibahan", "cell", "qans", 1],
		["blindrush", "border", "line", 1],
		["curving", "border", "line", 1],
		["edamame", "cell", "line", 1],
		["edamame", "cell", "qcmp", 1],
		["fakearrow", "cell", "qans", 1],
		["fakearrow", "border", "qsub", 11],
		["gravel", "border", "qans", 1],
		["hamlepaths", "cell", "anum", 0],
		["heyajirimisaki", "border", "line", 1],
		["invlitso", "border", "line", 1],
		["isowatari", "cell", "qans", 1],
		["lixloop", "border", "line", 1],
		["meidjuluk", "border", "qsub", 1],
		["numcity", "border", "qans", 1],
		["nuriloop", "cell", "qsub", 1],
		["oasis", "cell", "qcmp", 1],
		["outofsight", "border", "line", 1]
	].forEach(function(spec) {
		it("restores " + spec[0] + " " + spec[1] + "." + spec[2], function() {
			var source = open(spec[0]),
				puzzle = open(spec[0]);
			var index = mark(source, spec[1], spec[2], spec[3]);
			var text = state.exportText(source);
			h.apply(puzzle, text);
			assert.strictEqual(puzzle.board[spec[1]][index][spec[2]], spec[3]);
			puzzle.undo();
			assert.strictEqual(
				state.exportText(puzzle),
				state.exportText(open(spec[0]))
			);
			puzzle.redo();
			assert.strictEqual(state.exportText(puzzle), text);
		});
	});

	it("restores Heyapin pins and trial progress on undo", function() {
		var source = open("heyapin"),
			puzzle = open("heyapin");
		source.board.cross[0].setPin(1);
		puzzle.enterTrial();
		puzzle.board.cross[0].setPin(2);
		h.apply(puzzle, state.exportText(source));
		assert.strictEqual(puzzle.board.trialstage, 0);
		assert.strictEqual(puzzle.board.cross[0].getPin(), 1);
		puzzle.undo();
		assert.strictEqual(puzzle.board.trialstage, 1);
		assert.strictEqual(puzzle.board.cross[0].getPin(), 2);
		puzzle.redo();
		assert.strictEqual(puzzle.board.cross[0].getPin(), 1);
	});

	[
		["bhaibahan", "loop_full"],
		["bwloop", "loop_full"],
		["circuitwalk", "loop_full"],
		["energywalk", "loop_full"],
		["morningwalk", "loop_full"],
		["lring", "loop_full"],
		["lineofsight", "slither_full"],
		["heyapin", "heyapin_overlap"],
		["distopia", "pentopia_transparent"],
		["lixloop", "yajilin_out"],
		["numcity", "fillomino_tri"]
	].forEach(function(pair) {
		it("checks " + pair[0] + " rule configuration", function() {
			var puzzle = open(pair[0]),
				foreign = open(pair[0]);
			foreign.setConfig(pair[1], !puzzle.getConfig(pair[1]));
			var before = state.exportText(puzzle);
			assert.throws(function() {
				h.apply(puzzle, state.exportText(foreign));
			}, /different puzzle/);
			assert.strictEqual(state.exportText(puzzle), before);
		});
	});
});
