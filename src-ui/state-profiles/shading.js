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
			nuribou: { name: "Nuribou", header: "pzprv3", fields: cells },
			lookair: { name: "Look-Air", header: "pzprv3", fields: cells },
			chainedb: { name: "Chained Block", header: "pzprv3", fields: cells },
			wagiri: { name: "Wagiri", header: "pzprv3", fields: cells },
			usoone: { name: "Uso-one", header: "pzprv3", fields: cellsAndLines },
			mochikoro: { name: "Mochikoro", header: "pzprv3", fields: cells },
			kinkonkan: { name: "Kin-Kon-Kan", header: "pzprv3.1", fields: cells },
			paintarea: { name: "Paintarea", header: "pzprv3", fields: cells },
			chocona: { name: "Chocona", header: "pzprv3.1", fields: cells },
			tateyoko: { name: "Tatebo-Yokobo", header: "pzprv3", fields: cells },
			heyawake: {
				name: "Heyawake",
				header: "pzprv3.1",
				fields: cellsAndLines
			},
			ayeheya: { name: "Ayeheya", header: "pzprv3.1", fields: cellsAndLines },
			aqre: { name: "Aqre", header: "pzprv3.1", fields: cellsAndLines },
			stostone: { name: "Stostone", header: "pzprv3.1", fields: cells },
			kurotto: { name: "Kurotto", header: "pzprv3", fields: cells },
			mines: { name: "Minesweeper", header: "pzprv3", fields: cells },
			tasquare: { name: "Tasquare", header: "pzprv3", fields: cells },
			shugaku: { name: "School Trip", header: "pzprv3", fields: cells },
			tapa: { name: "Tapa", header: "pzprv3", fields: cellsAndLines },
			shakashaka: { name: "Shakashaka", header: "pzprv3", fields: cells },
			gokigen: { name: "Slant", header: "pzprv3", fields: cells },
			nurimaze: { name: "Nuri-Maze", header: "pzprv3", fields: cellsAndLines },
			yajikazu: {
				name: "Yajisan-Kazusan",
				header: "pzprv3",
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
