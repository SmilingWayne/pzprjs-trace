var assert = require("assert");
var h = require("./helpers");
var state = h.state;
var samples = {
	castle: "5/5/c230021k111a210f",
	mochikoro: "5/5/4p2n1i1",
	kinkonkan: "4/4/94gof0BAaDbBaCbCaAaD21122211",
	paintarea: "5/5/pmvmfuejf4k1f",
	yosenabe: "5/5/d1hgm1i3j2i5k5ki2o1l2k3",
	curvedata: "4/4/=g1l0l/b000080/3/3/5e85/3/3/06a4",
	shwolf: "5/5/0282bocb6ajf9",
	chocona: "6/6/8guumlfvo1eq33122g21g32",
	ringring: "5/5/02084",
	barns: "5/5/06ec080000100",
	pencils: "5/5/p.3k1ngkh3q",
	factors: "5/5/rvvcm9jf54653-28ca2833-14",
	tateyoko: "5/5/i23i3ono2i25i22pnqi33i2"
};
var lines = ["castle", "yosenabe", "curvedata", "ringring", "barns"];
var shade = ["mochikoro", "kinkonkan", "paintarea", "chocona", "tateyoko"];

function open(pid) {
	return h.open(pid + "/" + samples[pid]);
}
function set(piece, prop, value) {
	piece.setdata(prop, value, true);
}
function setup(pid, source, puzzle) {
	var s = source.board;
	var p = puzzle.board;
	if (lines.indexOf(pid) >= 0) {
		var borders = Array.prototype.filter.call(s.border, function(b) {
			return b.ques === 0;
		});
		var b0 = borders[0].id,
			b1 = borders[1].id;
		set(s.border[b0], "line", 1);
		set(s.border[b1], "qsub", 2);
		set(p.border[b0], "qsub", 2);
		set(p.border[b1], "line", 1);
		if (pid === "castle" || pid === "yosenabe") {
			set(s.cell[0], "qcmp", 1);
		}
		if (pid === "yosenabe") {
			set(s.cell[1], "qsub", 2);
		}
	} else if (shade.indexOf(pid) >= 0) {
		set(
			s.cell[0],
			"qans",
			pid === "kinkonkan" ? 31 : pid === "tateyoko" ? 12 : 1
		);
		set(s.cell[1], "qsub", 1);
		set(p.cell[0], "qsub", 1);
		set(
			p.cell[1],
			"qans",
			pid === "kinkonkan" ? 32 : pid === "tateyoko" ? 13 : 1
		);
	} else if (pid === "shwolf" || pid === "pencils") {
		set(s.border[0], "qans", 1);
		set(s.border[0], "qsub", 1);
		set(s.border[1], "qsub", 1);
		set(p.border[0], "qsub", 1);
		set(p.border[1], "qans", 1);
		if (pid === "pencils") {
			set(s.cell[0], "qans", 3);
			set(s.cell[0], "qsub", 2);
			set(s.border[2], "line", 1);
			set(s.border[3], "qsub", 2);
		}
	} else {
		set(s.cell[0], "anum", 4);
		s.cell[1].setdata2("snum", 0, 2, true);
		set(s.cell[2], "qsub", 2);
		set(p.cell[0], "anum", 2);
		p.cell[1].setdata2("snum", 1, 4, true);
	}
	if (pid !== "castle" && pid !== "yosenabe" && pid !== "factors") {
		set(p.cell[3], "qcmp", 1);
	}
}

describe("Additional puzzle native state profiles", function() {
	Object.keys(samples).forEach(function(pid) {
		it("round-trips, replaces and undoes " + pid, function() {
			var source = open(pid),
				puzzle = open(pid);
			setup(pid, source, puzzle);
			var text = state.exportText(source);
			var parsed = h.open(text);
			var before = state.exportText(puzzle);
			assert.equal(state.exportText(parsed), text);
			var position = puzzle.opemgr.position;
			h.apply(puzzle, text);
			assert.equal(puzzle.opemgr.position, position + 1);
			assert.equal(state.exportText(puzzle), text);
			var cellFields =
				pid === "factors"
					? ["anum", "qsub", "qcmp"]
					: lines.indexOf(pid) >= 0
					? ["qsub", "qcmp"]
					: ["qans", "qsub", "qcmp"];
			cellFields.forEach(function(field) {
				for (var i = 0; i < parsed.board.cell.length; i++) {
					assert.equal(
						puzzle.board.cell[i][field],
						parsed.board.cell[i][field],
						pid + " cell " + i + " " + field
					);
				}
			});
			if (pid === "factors") {
				assert.deepEqual(puzzle.board.cell[1].snum, parsed.board.cell[1].snum);
			}
			if (pid === "pencils" || pid === "shwolf" || lines.indexOf(pid) >= 0) {
				var borderFields =
					pid === "pencils"
						? ["qans", "qsub", "line"]
						: pid === "shwolf"
						? ["qans", "qsub"]
						: ["line", "qsub"];
				borderFields.forEach(function(field) {
					for (var i = 0; i < parsed.board.border.length; i++) {
						assert.equal(
							puzzle.board.border[i][field],
							parsed.board.border[i][field],
							pid + " border " + i + " " + field
						);
					}
				});
			}
			if (pid !== "castle" && pid !== "yosenabe" && pid !== "factors") {
				assert.equal(puzzle.board.cell[3].qcmp, 0);
			}
			puzzle.undo();
			assert.equal(state.exportText(puzzle), before);
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

	it("matches clues, regions and curve shapes", function() {
		Object.keys(samples).forEach(function(pid) {
			var puzzle = open(pid),
				foreign = open(pid),
				bd = foreign.board;
			if (pid === "curvedata") {
				bd.shapes[0].bits[0] ^= 1;
			} else if (pid === "kinkonkan") {
				set(bd.excell[0], "qchar", bd.excell[0].qchar === 1 ? 2 : 1);
			} else if (
				["paintarea", "chocona", "factors", "barns"].indexOf(pid) >= 0
			) {
				set(bd.border[0], "ques", bd.border[0].ques ? 0 : 1);
			} else if (pid === "ringring") {
				set(bd.cell[0], "ques", bd.cell[0].ques ? 0 : 1);
			} else if (pid === "shwolf") {
				set(bd.cross[0], "qnum", bd.cross[0].qnum === 1 ? -1 : 1);
			} else if (pid === "tateyoko") {
				set(bd.cell[0], "ques", bd.cell[0].ques ? 0 : 1);
			} else if (pid === "pencils") {
				set(bd.cell[0], "qnum", bd.cell[0].qnum === 7 ? 8 : 7);
			} else if (pid === "yosenabe") {
				set(bd.cell[0], "ques", bd.cell[0].ques === 6 ? 0 : 6);
			} else {
				set(bd.cell[0], "qnum", bd.cell[0].qnum === 2 ? 3 : 2);
			}
			var before = state.exportText(puzzle);
			var foreignText = state.exportText(h.open(state.exportText(foreign)));
			assert.throws(
				function() {
					h.apply(puzzle, foreignText);
				},
				/different puzzle/,
				pid
			);
			assert.equal(state.exportText(puzzle), before);
		});
	});

	it("restores pencil arrows and their boundaries through a trial", function() {
		var puzzle = h.open("pencils/4/4/"),
			source = h.open("pencils/4/4/");
		source.board.cell[5].setArrow(3, false);
		set(source.board.cell[5], "qsub", 2);
		var arrow = source.board.cell[5].qans;
		var border = source.board.cell[5].adjborder.right.id;
		assert.equal(source.board.border[border].qans, 1);
		puzzle.enterTrial();
		set(puzzle.board.cell[5], "qsub", 1);
		h.apply(puzzle, state.exportText(source));
		assert.equal(puzzle.board.trialstage, 0);
		assert.equal(puzzle.board.cell[5].qans, arrow);
		assert.equal(puzzle.board.border[border].qans, 1);
		assert.equal(puzzle.board.cell[5].qsub, 2);
		puzzle.undo();
		assert.equal(puzzle.board.trialstage, 1);
		assert.equal(puzzle.board.cell[5].qsub, 1);
		puzzle.redo();
		assert.equal(puzzle.board.cell[5].qans, arrow);
	});

	it("restores a Barns line through a clue border and clears hidden Curve Data marks", function() {
		var source = open("barns"),
			puzzle = open("barns");
		var border = Array.prototype.find.call(source.board.border, function(b) {
			return b.ques === 1;
		});
		set(border, "line", 1);
		var text = state.exportText(source);
		h.apply(puzzle, text);
		assert.equal(puzzle.board.border[border.id].line, 1);
		puzzle.undo();
		assert.equal(puzzle.board.border[border.id].line, 0);
		puzzle.redo();
		assert.equal(state.exportText(puzzle), text);

		puzzle = open("curvedata");
		border = Array.prototype.find.call(puzzle.board.border, function(b) {
			return b.ques === 1;
		});
		set(border, "line", 1);
		set(border, "qsub", 2);
		h.apply(puzzle, state.exportText(open("curvedata")));
		assert.equal(border.line, 0);
		assert.equal(border.qsub, 0);
		puzzle.undo();
		assert.equal(border.line, 1);
		assert.equal(border.qsub, 2);
	});
});
