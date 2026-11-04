/* global module */
(function(root, profiles) {
	if (typeof module !== "undefined" && module.exports) {
		module.exports = profiles;
	} else {
		var registry = (root.stateProfiles = root.stateProfiles || {});
		registry.sudoku = profiles.sudoku;
		registry.fillomino = profiles.fillomino;
	}
})(
	this,
	(function() {
		var fields = [
			{ group: "cell", property: "anum", empty: -1 },
			{ group: "cell", property: "qsub" },
			{ group: "cell", property: "qcmp" }
		].concat(
			[0, 1, 2, 3].map(function(pos) {
				return { group: "cell", property: "snum", pos: pos };
			})
		);
		return {
			sudoku: {
				name: "Sudoku",
				header: "pzprv3",
				square: true,
				fields: fields
			},
			fillomino: {
				name: "Fillomino",
				header: "pzprv3",
				fields: fields.concat([
					{ group: "border", property: "qans" },
					{ group: "border", property: "qsub" }
				])
			}
		};
	})()
);
