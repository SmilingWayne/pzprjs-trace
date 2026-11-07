var assert = require("assert");
var h = require("./helpers");
var state = h.state;
var profiles = Object.assign(
	{},
	require("../../src-ui/state-profiles/lines"),
	require("../../src-ui/state-profiles/partitions"),
	require("../../src-ui/state-profiles/shading"),
	require("../../src-ui/state-profiles/numbers")
);

// Native examples from the corresponding variety scripts.
var samples = require("./native_codec_fixtures");
var groups = {
	lines: "disloop nanameguri ovotovata mukkonn trainstations bdwalk brownies ichimagax kaisu myopia turnaround coffeemilk mintonette icelom2 nothing bunnyhop tontti swslither vslither tslither forestwalk waterwalk firewalk kaidan wittgen oyakodori ladders roundtrip balloon kurarin".split(
		" "
	),
	partitions: "usotatami kramma kramman familyphoto fracdiv sashikazune mirrorbk".split(
		" "
	),
	shading: "norinuri parquet tetrochain kuromenbun nuriuzu tilecity cts martini mannequin teri patchwork pentatouch battleship snakeegg".split(
		" "
	),
	numbers: "sukororoom arrowflow simplegako news toichika2 numrope sananko kakuru keywest magnets snakepit wafusuma".split(
		" "
	)
};

function setMark(piece, property, value) {
	piece.setdata(property, value, true);
}

Object.keys(groups).forEach(function(kind) {
	describe("Native " + kind + " states", function() {
		groups[kind].forEach(function(pid) {
			it("replaces and round trips " + pid, function() {
				function open() {
					return h.open(pid + "/" + samples[pid]);
				}
				var source = open(),
					puzzle = open();
				var cells = Array.prototype.filter.call(source.board.cell, function(
					cell
				) {
					return (
						(pid === "nuriuzu" ? cell.qnum === 0 : cell.qnum === -1) &&
						cell.ques === 0
					);
				});
				var borders = Array.prototype.filter.call(source.board.border, function(
					border
				) {
					return border.ques === 0 && !border.isnull;
				});
				var a, b, property, sub;
				if (kind === "lines" || kind === "partitions") {
					a = borders[0].id;
					b = borders[1].id;
					property = kind === "lines" ? "line" : "qans";
					sub = kind === "lines" ? 2 : 1;
					source.board.border[a].setdata(property, 1, true);
					source.board.border[b].setdata("qsub", sub, true);
					puzzle.board.border[a].setdata("qsub", sub, true);
					puzzle.board.border[b].setdata(property, 1, true);
				} else {
					a = cells[0].id;
					b = cells[1].id;
					property = kind === "numbers" ? "anum" : "qans";
					source.board.cell[a].setdata(
						property,
						kind === "numbers" ? 2 : 1,
						true
					);
					source.board.cell[b].setdata("qsub", 1, true);
					puzzle.board.cell[a].setdata("qsub", 1, true);
					puzzle.board.cell[b].setdata(
						property,
						kind === "numbers" ? 3 : 1,
						true
					);
				}
				var group =
					kind === "lines" || kind === "partitions" ? "border" : "cell";
				setMark(puzzle.board.cell[0], "qcmp", 1);
				var text = state.exportText(source),
					parsed = h.open(text);
				assert.strictEqual(state.exportText(parsed), text);
				assert.strictEqual(
					parsed.board[group][a][property],
					kind === "numbers" ? 2 : 1,
					"answer survives FileIO"
				);
				assert.strictEqual(
					parsed.board[group][b].qsub,
					kind === "lines" ? 2 : 1,
					"auxiliary mark survives FileIO"
				);
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
				assert.strictEqual(puzzle.board.cell[0].qcmp, 1);
				assert.strictEqual(state.exportText(puzzle), before);
				puzzle.redo();
				assert.strictEqual(state.exportText(puzzle), text);
				assert.throws(function() {
					h.apply(puzzle, state.exportText(h.open(pid + "/3/3/")));
				}, /different puzzle/);
				assert.strictEqual(state.exportText(puzzle), text);
				var empty = state.exportText(open());
				h.apply(puzzle, empty);
				assert.strictEqual(state.exportText(puzzle), empty);
				puzzle.undo();
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
});
