var assert = require("assert");
var h = require("./helpers");
var state = h.state;
var samples = require("./native_codec_fixtures");

var changes = {
	disloop: ["cell", 0, "qdir", 2],
	nanameguri: ["cell", 1, "ques", 7],
	mukkonn: ["cell", 4, "qnum", 2],
	brownies: ["cell", 2, "qnum", 2],
	bunnyhop: ["cell", 0, "ques", 0],
	parquet: ["border", 0, "ques", 7],
	cts: ["excell", 0, "qnum", 2],
	roundtrip: ["excell", 0, "qnum", 3],
	pentatouch: ["cell", 0, "ques", 7],
	bosanowa: ["cell", 1, "qnum", 3]
};
function open(pid) {
	return h.open(pid + "/" + samples[pid]);
}

describe("Native state clue identity", function() {
	Object.keys(samples).forEach(function(pid) {
		it(
			"rejects changed " + pid + " clues without changing progress",
			function() {
				var puzzle = open(pid),
					foreign = open(pid);
				var before = state.exportText(puzzle);
				var change = changes[pid];
				if (change) {
					foreign.board[change[0]][change[1]][change[2]] = change[3];
				} else {
					var cell = foreign.board.cell[0];
					cell.qnum = cell.qnum === 2 ? 3 : 2;
				}
				var text = state.exportText(foreign);
				assert.notEqual(text, before);
				assert.equal(state.exportText(h.open(text)), text);
				assert.throws(function() {
					h.apply(puzzle, text);
				}, /different puzzle/);
				assert.equal(state.exportText(puzzle), before);
			}
		);
	});
});

describe("Native state rule identity", function() {
	[
		["disloop", "loop_full"],
		["ovotovata", "loop_full"],
		["trainstations", "loop_full"],
		["forestwalk", "loop_full"],
		["waterwalk", "loop_full"],
		["firewalk", "loop_full"],
		["turnaround", "loop_full"],
		["myopia", "slither_full"],
		["swslither", "slither_full"],
		["vslither", "slither_full"],
		["tslither", "slither_full"],
		["snakepit", "fillomino_tri"],
		["wafusuma", "fillomino_tri"],
		["nuriuzu", "nuriuzu_connect"],
		["bdwalk", "bdwalk_height"],
		["balloon", "balloon_adjacent"],
		["magnets", "magnets_anti"],
		["news", "tren_new"]
	].forEach(function(pair) {
		it("rejects a different " + pair.join(" ") + " setting", function() {
			var puzzle = open(pair[0]),
				foreign = open(pair[0]);
			foreign.setConfig(pair[1], !puzzle.getConfig(pair[1]));
			var before = state.exportText(puzzle),
				text = state.exportText(foreign);
			assert.notEqual(text, before);
			assert.throws(function() {
				h.apply(puzzle, text);
			}, /different puzzle/);
			assert.equal(state.exportText(puzzle), before);
		});
	});
});
