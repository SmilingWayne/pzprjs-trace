var assert = require("assert");
var h = require("./helpers");
var state = h.state;
var samples = {
	shakashaka: "shakashaka/6/6/cgbhdhegdrb",
	dbchoco: "dbchoco/6/6/ueoq8p30g42j4n5s22j",
	sashigane: "sashigane/5/5/jm.o3khkgojm4",
	firefly: "firefly/5/5/40c21a3.a30g10a22a11c11",
	nurimaze: "nurimaze/6/6/6efjsstsvjun1e374i2547",
	tentaisho: "tentaisho/5/5/6fl94fi65en8dbf10000",
	slalom: "slalom/d/6/6/9314131314131a1131ag0404j0101/33",
	yajikazu: "yajikazu/6/6/40d23663i32h12b32a12a11c",
	icebarn: "icebarn/8/8/73btfk05ovbjghzpwz9bwm/3/11",
	gokigen: "gokigen/4/4/iaegcgcj6a",
	country: "country/5/5/amda0uf02h12h",
	hashikake: "hashikake/5/5/4g2i3h23k3g1g3g4g3"
};
var partitions = ["dbchoco", "sashigane", "tentaisho"];
var shading = ["nurimaze", "yajikazu"];
var lines = ["firefly", "slalom", "icebarn", "country", "hashikake"];

function open(pid) {
	return h.open(samples[pid]);
}

function set(piece, prop, value) {
	piece.setdata(prop, value, true);
}

describe("More native puzzle states", function() {
	Object.keys(samples).forEach(function(pid) {
		it("replaces and round-trips " + pid + " marks", function() {
			var source = open(pid);
			var puzzle = open(pid);
			var cells = source.board.cell;
			var free = Array.prototype.filter
				.call(cells, function(c) {
					return pid !== "sashigane" || c.qdir === 0;
				})
				.slice(0, 4)
				.map(function(c) {
					return c.id;
				});
			var c = source.board.cell;
			var old = puzzle.board.cell;
			var border = source.board.border;
			var oldBorder = puzzle.board.border;
			if (partitions.indexOf(pid) >= 0) {
				set(border[1], "qans", 1);
				set(border[1], "qsub", 1);
				set(border[2], "qsub", 1);
				set(oldBorder[1], "qsub", 1);
				set(oldBorder[2], "qans", 1);
			} else if (lines.indexOf(pid) >= 0 || shading.indexOf(pid) >= 0) {
				set(border[1], "line", pid === "hashikake" ? 2 : 1);
				set(border[2], "qsub", 2);
				set(oldBorder[1], "qsub", 2);
				set(oldBorder[2], "line", 1);
			}
			if (shading.indexOf(pid) >= 0 || pid === "sashigane") {
				set(c[free[0]], "qans", 1);
				set(c[free[1]], "qsub", 1);
				set(old[free[0]], "qsub", 1);
				set(old[free[1]], "qans", 1);
			} else if (pid === "shakashaka") {
				set(c[free[0]], "qans", 2);
				set(c[free[1]], "qsub", 1);
				set(c[free[2]], "qcmp", 1);
				set(old[free[0]], "qans", 5);
				set(old[free[1]], "qans", 3);
			} else if (pid === "gokigen") {
				set(c[free[0]], "qans", 31);
				set(c[free[1]], "qans", 32);
				set(old[free[0]], "qans", 32);
			} else if (pid === "tentaisho" || pid === "country") {
				set(c[free[0]], "qsub", 3);
				set(old[free[0]], "qsub", 2);
			}
			if (pid !== "shakashaka") {
				set(old[free[3]], "qcmp", 1);
			}
			if (
				[
					"dbchoco",
					"firefly",
					"slalom",
					"icebarn",
					"gokigen",
					"hashikake"
				].indexOf(pid) >= 0
			) {
				set(old[free[3]], "qsub", 1);
			}
			var text = state.exportText(source);
			var before = state.exportText(puzzle);
			var position = puzzle.opemgr.position;
			assert.equal(state.exportText(h.open(text)), text);
			h.apply(puzzle, text);
			assert.equal(puzzle.opemgr.position, position + 1);
			assert.equal(state.exportText(puzzle), text);
			if (pid !== "shakashaka") {
				assert.equal(old[free[3]].qcmp, 0);
			}
			if (
				[
					"dbchoco",
					"firefly",
					"slalom",
					"icebarn",
					"gokigen",
					"hashikake"
				].indexOf(pid) >= 0
			) {
				assert.equal(old[free[3]].qsub, 0);
			}
			if (pid === "hashikake") {
				assert.equal(oldBorder[1].line, 2);
			}
			if (pid === "shakashaka") {
				assert.equal(old[free[2]].qcmp, 1);
			}
			puzzle.undo();
			assert.equal(state.exportText(puzzle), before);
			if (pid !== "shakashaka") {
				assert.equal(old[free[3]].qcmp, 1);
			}
			puzzle.redo();
			assert.equal(state.exportText(puzzle), text);
			var empty = state.exportText(open(pid));
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

	it("preserves all Shakashaka triangles and native mark precedence", function() {
		var source = h.open("shakashaka/5/2/");
		var puzzle = h.open("shakashaka/5/2/");
		[2, 3, 4, 5].forEach(function(value, i) {
			set(source.board.cell[i], "qans", value);
		});
		set(source.board.cell[0], "qsub", 1);
		set(source.board.cell[0], "qcmp", 1);
		set(source.board.cell[4], "qsub", 1);
		set(source.board.cell[4], "qcmp", 1);
		h.apply(puzzle, state.exportText(source));
		assert.deepEqual(
			Array.prototype.map
				.call(puzzle.board.cell, function(cell) {
					return cell.qans;
				})
				.slice(0, 4),
			[2, 3, 4, 5]
		);
		assert.equal(puzzle.board.cell[0].qsub, 0);
		assert.equal(puzzle.board.cell[0].qcmp, 0);
		assert.equal(puzzle.board.cell[4].qsub, 1);
		assert.equal(puzzle.board.cell[4].qcmp, 0);
	});

	it("restores a complete Hashiwokakero bridge and can continue playing", function() {
		var base = h.open("hashikake/5/2/");
		base.board.cell[0].setQnum(2);
		base.board.cell[4].setQnum(2);
		var empty = state.exportText(base);
		var source = h.open(empty);
		var puzzle = h.open(empty);
		source.mouse.inputPath(1, 1, 9, 1);
		source.mouse.inputPath(1, 1, 9, 1);
		h.apply(puzzle, state.exportText(source));
		assert.deepEqual(
			Array.prototype.map
				.call(puzzle.board.border, function(border) {
					return border.line;
				})
				.slice(0, 4),
			[2, 2, 2, 2]
		);
		puzzle.mouse.inputPath(1, 1, 9, 1);
		assert.equal(state.exportText(puzzle), empty);
		puzzle.undo();
		assert.equal(state.exportText(puzzle), state.exportText(source));
	});

	it("preserves direction marks with lines and crosses in Slalom and Icebarn", function() {
		["slalom", "icebarn"].forEach(function(pid) {
			var source = open(pid);
			var puzzle = open(pid);
			set(source.board.border[0], "line", 1);
			set(source.board.border[0], "qsub", 11);
			set(source.board.border[1], "line", 1);
			set(source.board.border[1], "qsub", 2);
			set(puzzle.board.border[0], "qsub", 14);
			var text = state.exportText(source);
			h.apply(puzzle, text);
			assert.equal(puzzle.board.border[0].qsub, 11);
			assert.equal(puzzle.board.border[0].line, 1);
			assert.equal(puzzle.board.border[1].qsub, 2);
			assert.equal(puzzle.board.border[1].line, 1);
			puzzle.undo();
			assert.equal(puzzle.board.border[0].qsub, 14);
			puzzle.redo();
			assert.equal(state.exportText(puzzle), text);
		});
	});

	it("rejects changed clues without changing progress", function() {
		Object.keys(samples).forEach(function(pid) {
			var puzzle = open(pid);
			var foreign = open(pid);
			var bd = foreign.board;
			if (pid === "nurimaze" || pid === "slalom") {
				var target = Array.prototype.find.call(bd.cell, function(cell) {
					return (
						cell.ques === 0 &&
						!bd.startpos.equals(cell) &&
						(pid !== "nurimaze" || !bd.goalpos.equals(cell))
					);
				});
				bd.startpos.set(target);
			} else if (pid === "tentaisho") {
				var dot = bd.dots[0];
				dot.setDot(dot.getDot() ? 0 : 1);
			} else if (pid === "gokigen") {
				set(bd.cross[0], "qnum", bd.cross[0].qnum === 1 ? 2 : 1);
			} else if (pid === "dbchoco" || pid === "icebarn") {
				set(bd.cell[0], "ques", bd.cell[0].ques === 6 ? 0 : 6);
			} else if (pid === "country") {
				set(bd.border[0], "ques", bd.border[0].ques ? 0 : 1);
			} else if (pid === "sashigane") {
				set(bd.cell[0], "qdir", bd.cell[0].qdir === 1 ? 2 : 1);
			} else {
				set(bd.cell[0], "qnum", bd.cell[0].qnum === 1 ? 2 : 1);
			}
			var before = state.exportText(puzzle);
			assert.throws(
				function() {
					h.apply(puzzle, state.exportText(foreign));
				},
				/different puzzle/,
				pid
			);
			assert.equal(state.exportText(puzzle), before);
		});
	});

	it("matches Icebarn entrance, exit and clue arrows", function() {
		var puzzle = open("icebarn");
		var foreign = open("icebarn");
		foreign.board.arrowin.input(foreign.board.arrowout.getb());
		assert.throws(function() {
			h.apply(puzzle, state.exportText(foreign));
		}, /different puzzle/);
		foreign = open("icebarn");
		var border = foreign.board.border[0];
		border.setArrow(border.qdir ? 0 : border.isVert() ? border.LT : border.UP);
		assert.throws(function() {
			h.apply(puzzle, state.exportText(foreign));
		}, /different puzzle/);
	});

	it("restores trial marks and directional arrows with one undo", function() {
		var puzzle = open("slalom");
		var source = open("slalom");
		set(source.board.border[0], "qsub", 11);
		puzzle.enterTrial();
		set(puzzle.board.border[0], "qsub", 14);
		h.apply(puzzle, state.exportText(source));
		assert.equal(puzzle.board.trialstage, 0);
		assert.equal(puzzle.board.border[0].qsub, 11);
		puzzle.undo();
		assert.equal(puzzle.board.trialstage, 1);
		assert.equal(puzzle.board.border[0].qsub, 14);
		puzzle.redo();
		assert.equal(puzzle.board.border[0].qsub, 11);
	});

	it("matches the Country Road rule variant", function() {
		var puzzle = open("country");
		var foreign = open("country");
		foreign.setConfig("country_empty", true);
		assert.throws(function() {
			h.apply(puzzle, state.exportText(foreign));
		}, /different puzzle/);
		puzzle.setConfig("country_empty", true);
		h.apply(puzzle, state.exportText(foreign));
	});

	it("supports Hashiwokakero and Slalom aliases", function() {
		assert.equal(
			h.open(samples.hashikake.replace("hashikake/", "bridges/")).pid,
			"hashikake"
		);
		assert.equal(
			h.open(samples.slalom.replace("slalom/", "suraromu/")).pid,
			"slalom"
		);
	});
});
