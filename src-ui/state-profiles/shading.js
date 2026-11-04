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
		var cells = [
			{ group: "cell", property: "qans" },
			{ group: "cell", property: "qsub" },
			{ group: "cell", property: "qcmp" }
		];
		var cellsAndLines = cells.concat([
			{ group: "border", property: "line" },
			{ group: "border", property: "qsub" }
		]);
		return {
			heyawake: {
				name: "Heyawake",
				header: "pzprv3.1",
				fields: cellsAndLines
			},
			nonogram: {
				name: "Nonogram",
				header: "pzprv3",
				fields: cells.concat([{ group: "excell", property: "qcmp" }])
			},
			shimaguni: {
				name: "Shimaguni",
				header: "pzprv3.1",
				fields: cells.concat(
					[0, 1, 2, 3].map(function(pos) {
						return { group: "cell", property: "snum", pos: pos };
					})
				)
			},
			nurimisaki: { name: "Nurimisaki", header: "pzprv3", fields: cells },
			hitori: { name: "Hitori", header: "pzprv3", fields: cellsAndLines },
			kurodoko: { name: "Kurodoko", header: "pzprv3", fields: cellsAndLines },
			cave: { name: "Cave", header: "pzprv3", fields: cellsAndLines },
			lits: { name: "LITS", header: "pzprv3.1", fields: cellsAndLines },
			norinori: { name: "Norinori", header: "pzprv3.1", fields: cellsAndLines }
		};
	})()
);
