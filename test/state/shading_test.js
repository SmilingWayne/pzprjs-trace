var assert = require("assert");
var h = require("./helpers");
var state = h.state;

describe("Shading puzzle states", function() {
	var samples = {
		heyawake: "heyawake/6/6/lll155007rs12222j",
		nonogram: "nonogram/6/6/12g1111h11112j12g11g21j11g3h",
		shimaguni: "shimaguni/6/6/7fe608s0e3uf3g3g2g43",
		nurimisaki: "nurimisaki/5/5/g.i.m2l.j"
	};

	Object.keys(samples).forEach(function(pid) {
		it(
			"round-trips and replaces " + pid + " progress in one operation",
			function() {
				var source = h.open(samples[pid]);
				var puzzle = h.open(samples[pid]);
				var available = Array.prototype.filter.call(source.board.cell, function(
					cell
				) {
					return cell.qnum === -1;
				});
				var ids = available.slice(0, 3).map(function(cell) {
					return cell.id;
				});
				source.board.cell[ids[0]].setQans(1);
				source.board.cell[ids[1]].setQsub(1);
				puzzle.board.cell[ids[0]].setQsub(1);
				puzzle.board.cell[ids[1]].setQans(1);
				puzzle.board.cell[ids[2]].setQans(1);
				puzzle.board.cell[ids[2]].setQcmp(1);
				if (pid === "heyawake") {
					source.board.border[0].setLine();
					source.board.border[1].setQsub(2);
					puzzle.board.border[0].setQsub(2);
					puzzle.board.border[1].setLine();
				} else if (pid === "nonogram") {
					var clue = Array.prototype.find.call(source.board.excell, function(
						ex
					) {
						return ex.qnum >= 0;
					});
					clue.setQcmp(1);
				} else if (pid === "shimaguni") {
					source.board.cell[ids[0]].setSnum(0, 3);
					source.board.cell[ids[1]].setSnum(3, 4);
					puzzle.board.cell[ids[0]].setSnum(0, 9);
					puzzle.board.cell[ids[2]].setSnum(2, 2);
				}
				var text = state.exportText(source);
				var before = state.exportText(puzzle);
				var position = puzzle.opemgr.position;
				assert.equal(state.exportText(h.open(text)), text);
				h.apply(puzzle, text);
				assert.equal(puzzle.opemgr.position, position + 1);
				assert.equal(state.exportText(puzzle), text);
				assert.deepEqual(
					ids.map(function(id) {
						var cell = puzzle.board.cell[id];
						return [cell.qans, cell.qsub];
					}),
					[
						[1, 0],
						[0, 1],
						[0, 0]
					]
				);
				if (pid === "heyawake") {
					assert.equal(puzzle.board.border[0].line, 1);
					assert.equal(puzzle.board.border[1].qsub, 2);
				} else if (pid === "nonogram") {
					assert.equal(puzzle.board.getex(clue.bx, clue.by).qcmp, 1);
				} else if (pid === "shimaguni") {
					assert.equal(puzzle.board.cell[ids[0]].snum[0], 3);
					assert.equal(puzzle.board.cell[ids[1]].snum[3], 4);
					assert.equal(puzzle.board.cell[ids[2]].snum[2], -1);
				}
				assert.equal(puzzle.board.cell[ids[2]].qcmp, 0);
				puzzle.undo();
				assert.equal(state.exportText(puzzle), before);
				assert.equal(puzzle.board.cell[ids[2]].qcmp, 1);
				puzzle.redo();
				assert.equal(state.exportText(puzzle), text);
				var empty = state.exportText(h.open(samples[pid]));
				h.apply(puzzle, empty);
				assert.equal(state.exportText(puzzle), empty);
				puzzle.undo();
				assert.equal(state.exportText(puzzle), text);

				var foreign = h.open(samples[pid]);
				var clues =
					pid === "nonogram" ? foreign.board.excell : foreign.board.cell;
				var changed = Array.prototype.find.call(clues, function(cell) {
					return cell.qnum >= 0;
				});
				changed.setQnum(changed.qnum + 1);
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
			}
		);
	});

	it("matches room boundaries and supports the Heyawake alias", function() {
		["heyawake", "shimaguni"].forEach(function(pid) {
			var puzzle = h.open(samples[pid]);
			var foreign = h.open(samples[pid]);
			foreign.board.border[0].setQues(1 - foreign.board.border[0].ques);
			assert.throws(function() {
				state.target(puzzle, state.exportText(foreign));
			}, /different puzzle/);
		});
		var alias = h.open(samples.heyawake.replace("heyawake", "heyawacky"));
		assert.equal(alias.pid, "heyawake");
		h.apply(alias, state.exportText(h.open(samples.heyawake)));
	});

	it("restores Shimaguni candidate numbers across a trial import", function() {
		var puzzle = h.open(samples.shimaguni);
		var empty = state.exportText(puzzle);
		var cell = Array.prototype.find.call(puzzle.board.cell, function(c) {
			return c.qnum === -1;
		});
		puzzle.enterTrial();
		cell.setSnum(1, 4);
		h.apply(puzzle, empty);
		assert.equal(cell.snum[1], -1);
		puzzle.undo();
		assert.equal(puzzle.board.trialstage, 1);
		assert.equal(cell.snum[1], 4);
		puzzle.redo();
		assert.equal(cell.snum[1], -1);
	});

	it("imports marks on clue cells even when normal input blocks them", function() {
		var source = h.open(samples.shimaguni);
		var cell = Array.prototype.find.call(source.board.cell, function(c) {
			return c.qnum >= 0;
		});
		cell.setdata("qans", 1, true);
		cell.setdata2("snum", 0, 2, true);
		var text = state.exportText(source);
		var puzzle = h.open(samples.shimaguni);
		h.apply(puzzle, text);
		assert.equal(state.exportText(puzzle), text);
		puzzle.undo();
		assert.equal(puzzle.board.cell[cell.id].snum[0], -1);
		puzzle.redo();
		assert.equal(state.exportText(puzzle), text);
	});
});
