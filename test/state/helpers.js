var fs = require("fs");
var pzpr = require("../../dist/js/pzpr.js");
var state = require("../../src-ui/state.js");

var samples = {
	slither: "slither/6/7/do838dk883dk38d",
	nurikabe: "nurikabe/10/10/j2zg2l5i4s8i6h9u7r3q1",
	yajilin: "yajilin/6/6/n22h10b21i"
};

function open(query) {
	return new pzpr.Puzzle({ type: "player" }).open(query);
}

function fixture(name) {
	return fs.readFileSync(
		__dirname + "/../fixtures/" + name + "_state.txt",
		"utf8"
	);
}

function apply(puzzle, text) {
	var ops = state.changes(puzzle, state.target(puzzle, text));
	state.apply(puzzle, ops);
	return ops;
}

module.exports = {
	pzpr: pzpr,
	state: state,
	samples: samples,
	open: open,
	fixture: fixture,
	apply: apply
};
