/* global module */
(function(root, profiles) {
	if (typeof module !== "undefined" && module.exports) {
		module.exports = profiles;
	} else {
		var registry = (root.stateProfiles = root.stateProfiles || {});
		Object.keys(profiles).forEach(function(pid) {
			registry[pid] = profiles[pid];
		});
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
			ripple: { name: "Ripple Effect", header: "pzprv3", fields: fields },
			factors: { name: "Rooms of Factors", header: "pzprv3", fields: fields },
			kakuro: { name: "Kakuro", header: "pzprv3", fields: fields },
			hebi: {
				name: "Hebi-Ichigo",
				header: "pzprv3",
				fields: fields.slice(0, 3)
			},
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
