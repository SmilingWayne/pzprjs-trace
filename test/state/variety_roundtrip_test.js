var assert = require("assert");
var h = require("./helpers");
var state = h.state;
var fixtures = require("./variety_fixtures");
var open = fixtures.open;
var profiles = fixtures.profiles;
var get = fixtures.get;
var mark = fixtures.set;
var numeric = [
	"skyscrapers",
	"sukoro",
	"nanro",
	"yinyang",
	"kropki",
	"toichika"
];
var shade = ["snake", "cbanana", "tawa", "dosufuwa", "juosan"];
function set(piece, prop, val) {
	piece.setdata(prop, val, true);
}
function setup(pid, source, puzzle) {
	var s = source.board,
		p = puzzle.board;
	var cells = Array.prototype.filter.call(s.cell, function(c) {
		return c.qnum <= 0 && c.ques === 0;
	});
	var i = cells[0].id,
		j = cells[1].id;
	if (numeric.indexOf(pid) >= 0) {
		set(s.cell[i], "anum", 1);
		set(p.cell[i], "anum", 2);
		if (pid !== "toichika" && pid !== "yinyang") {
			s.cell[j].setdata2("snum", 0, 2, true);
			p.cell[j].setdata2("snum", 1, 3, true);
		} else {
			set(s.cell[j], "qsub", 1);
			set(p.cell[j], "qsub", 2);
		}
	} else if (shade.indexOf(pid) >= 0) {
		set(s.cell[i], "qans", pid === "juosan" ? 12 : 1);
		set(s.cell[j], "qsub", 1);
		set(p.cell[i], "qsub", 1);
		set(p.cell[j], "qans", pid === "juosan" ? 13 : 1);
	} else if (pid === "compass") {
		set(s.border[0], "qans", 1);
		set(s.border[1], "qsub", 1);
		set(p.border[0], "qsub", 1);
		set(p.border[1], "qans", 1);
	} else {
		set(s.border[0], "line", 1);
		set(s.border[1], "qsub", 2);
		set(p.border[0], "qsub", 2);
		set(p.border[1], "line", 1);
		if (
			pid === "kaero" ||
			pid === "rectslider" ||
			pid === "detour" ||
			pid === "tapaloop"
		) {
			set(s.cell[i], "qsub", 1);
			set(p.cell[i], "qsub", 2);
		}
		if (pid === "guidearrow") {
			set(s.cell[i], "qans", 1);
			set(p.cell[j], "qans", 1);
		}
	}
	set(p.cell[j], "qcmp", 1);
	return numeric.indexOf(pid) >= 0
		? ["cell", i, "anum", 1]
		: shade.indexOf(pid) >= 0
		? ["cell", i, "qans", pid === "juosan" ? 12 : 1]
		: ["border", 0, pid === "compass" ? "qans" : "line", 1];
}
function snapshot(puzzle, fields) {
	return fields.map(function(f) {
		return Array.prototype.map.call(puzzle.board[f.group], function(p) {
			return f.pos === undefined ? p[f.property] : p[f.property][f.pos];
		});
	});
}
function setupProfile(pid, puzzle, opposite) {
	var cell = Array.prototype.filter.call(puzzle.board.cell, function(c) {
		return c.qnum === -1 && c.ques === 0;
	});
	var border = Array.prototype.filter.call(puzzle.board.border, function(b) {
		return b.ques === 0;
	});
	var fields = profiles[pid].fields;
	var used = { cell: 0, border: 0, excell: 0 };
	fields.forEach(function(f) {
		if (pid === "icewalk" && f.group === "cell" && f.property === "qans") {
			return;
		}
		var list =
			f.group === "cell"
				? cell
				: f.group === "border"
				? border
				: Array.prototype.filter.call(puzzle.board.excell, function(e) {
						return e.qnum >= 0;
				  });
		if (!list.length) {
			return;
		}
		var piece = list[(used[f.group]++ + (opposite ? 1 : 0)) % list.length];
		var val =
			f.property === "anum"
				? pid === "bonsan" || pid === "satogaeri"
					? 0
					: 2
				: f.property === "qans" && f.group === "cell" && pid === "amibo"
				? 12
				: f.property === "qsub" &&
				  f.group === "border" &&
				  fields.some(function(g) {
						return g.property === "line";
				  })
				? 2
				: 1;
		if (f.pos === undefined) {
			piece.setdata(f.property, val, true);
		} else {
			piece.setdata2(f.property, f.pos, 2, true);
		}
	});
	if (pid === "icewalk") {
		var ice = Array.prototype.find.call(puzzle.board.cell, function(c) {
			return c.ques === 6;
		});
		if (ice) {
			ice.setdata("qans", opposite ? 2 : 1, true);
		}
	}
	if (pid === "statuepark") {
		puzzle.board.bank.pieces[opposite ? 1 : 0].setQcmp(1);
	}
}
function setDifferent(puzzle, field, start) {
	var pieces = puzzle.board[field.group];
	for (var i = 0; i < pieces.length; i++) {
		var piece = pieces[(i + start) % pieces.length];
		if (field.pos !== undefined && !Array.isArray(piece[field.property])) {
			return false;
		}
		var old = get(piece, field);
		var values = field.property === "anum" ? [1, 2, 0] : [1, 2, 3];
		for (var j = 0; j < values.length; j++) {
			if (values[j] === old) {
				continue;
			}
			mark(piece, field, values[j]);
			if (get(piece, field) !== old) {
				return true;
			}
		}
	}
	return false;
}

describe("Puzzle state round trips", function() {
	Object.keys(fixtures.direct).forEach(function(pid) {
		it("replaces, round-trips and undoes " + pid, function() {
			var source = open(pid),
				puzzle = open(pid);
			var marker = setup(pid, source, puzzle);
			var text = state.exportText(source),
				parsed = h.open(text);
			assert.equal(state.exportText(parsed), text);
			assert.equal(
				parsed.board[marker[0]][marker[1]][marker[2]],
				marker[3],
				pid + " mark survived native FileIO"
			);
			var before = state.exportText(puzzle),
				position = puzzle.opemgr.position;
			h.apply(puzzle, text);
			assert.equal(puzzle.opemgr.position, position + 1);
			assert.equal(state.exportText(puzzle), text);
			profiles[pid].fields.forEach(function(f) {
				for (var i = 0; i < parsed.board[f.group].length; i++) {
					var actual = puzzle.board[f.group][i][f.property];
					var expected = parsed.board[f.group][i][f.property];
					if (f.pos !== undefined) {
						actual = actual[f.pos];
						expected = expected[f.pos];
					}
					assert.equal(
						actual,
						expected,
						pid + " " + f.group + " " + i + " " + f.property
					);
				}
			});
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
				.then(function(value) {
					return state.decode(value, false);
				})
				.then(function(value) {
					assert.equal(value, text);
				});
		});
	});
});

describe("Puzzle state replacement", function() {
	Object.keys(fixtures.profiled).forEach(function(pid) {
		it("round trips, replaces and undoes " + pid + " puzzle", function() {
			var source = open(pid),
				puzzle = open(pid),
				fields = profiles[pid].fields;
			setupProfile(pid, source, false);
			setupProfile(pid, puzzle, true);
			var text = state.exportText(source),
				parsed = h.open(text);
			var before = snapshot(puzzle, fields),
				beforeText = state.exportText(puzzle);
			assert.equal(state.exportText(parsed), text);
			var position = puzzle.opemgr.position;
			h.apply(puzzle, text);
			assert.equal(puzzle.opemgr.position, position + 1);
			assert.equal(state.exportText(puzzle), text);
			assert.deepEqual(snapshot(puzzle, fields), snapshot(parsed, fields));
			puzzle.undo();
			assert.deepEqual(snapshot(puzzle, fields), before);
			assert.equal(state.exportText(puzzle), beforeText);
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
});
describe("Profile state round trips", function() {
	Object.keys(fixtures.scanned).forEach(function(pid) {
		it(
			"preserves native marks, replaces progress and undoes " + pid,
			function() {
				var source = open(pid),
					puzzle = open(pid);
				var profile = profiles[pid];
				assert.strictEqual(
					source.getFileData().split("\n")[0],
					profile.header,
					pid
				);
				profile.fields.forEach(function(field, i) {
					setDifferent(source, field, i * 3);
					setDifferent(puzzle, field, i * 3 + 1);
				});
				var text = state.exportText(source);
				var parsed = h.open(text);
				text = state.exportText(parsed);
				var before = state.exportText(puzzle);
				var position = puzzle.opemgr.position;
				h.apply(puzzle, text);
				assert.strictEqual(state.exportText(puzzle), text, pid);
				profile.fields.forEach(function(field) {
					var pieces = puzzle.board[field.group],
						expected = parsed.board[field.group];
					for (var i = 0; i < pieces.length; i++) {
						assert.strictEqual(
							get(pieces[i], field),
							get(expected[i], field),
							pid + " " + field.group + "." + field.property + " " + i
						);
					}
				});
				if (puzzle.opemgr.position > position) {
					puzzle.undo();
					assert.strictEqual(state.exportText(puzzle), before);
					puzzle.redo();
					assert.strictEqual(state.exportText(puzzle), text);
				}
				var empty = state.exportText(open(pid));
				h.apply(puzzle, empty);
				assert.strictEqual(state.exportText(puzzle), empty);
				assert.throws(function() {
					h.apply(puzzle, state.exportText(h.open(pid + "/3/3/")));
				}, /different puzzle/);
				return state
					.encode(text)
					.then(function(encoded) {
						return state.decode(encoded, false);
					})
					.then(function(decoded) {
						assert.strictEqual(decoded, text);
					});
			}
		);
	});
});
