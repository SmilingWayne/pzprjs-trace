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
			cojun: { name: "Cojun", header: "pzprv3", fields: fields },
			kazunori: { name: "Kazunori Room", header: "pzprv3", fields: fields },
			renban: { name: "Renban-Madoguchi", header: "pzprv3", fields: fields },
			meander: { name: "Meandering Numbers", header: "pzprv3", fields: fields },
			tontonbeya: { name: "Tontonbeya", header: "pzprv3", fields: fields },
			roma: { name: "Roma", header: "pzprv3", fields: fields.slice(0, 3) },
			hanare: {
				name: "Hanare-gumi",
				header: "pzprv3",
				fields: fields.slice(0, 3)
			},
			lollipops: {
				name: "Lollipops",
				header: "pzprv3",
				fields: fields.slice(0, 3)
			},
			evolmino: {
				name: "Evolmino",
				header: "pzprv3",
				fields: fields.slice(0, 3)
			},
			goishi: { name: "Goishi", header: "pzprv3", fields: fields.slice(0, 3) },
			symmarea: {
				name: "Symmetry Area",
				header: "pzprv3",
				fields: fields.concat([
					{ group: "border", property: "qans" },
					{ group: "border", property: "qsub" }
				])
			},
			heyabon: {
				name: "Heya-Bon",
				header: "pzprv3",
				fields: fields.slice(0, 3).concat([
					{ group: "border", property: "line" },
					{ group: "border", property: "qsub" }
				])
			},
			hakoiri: { name: "Hakoiri-masashi", header: "pzprv3", fields: fields },
			minarism: { name: "Minarism", header: "pzprv3", fields: fields },
			tents: {
				name: "Tents",
				header: "pzprv3",
				fields: fields.concat([
					{ group: "border", property: "qans" },
					{ group: "border", property: "qsub" },
					{ group: "excell", property: "qcmp" }
				])
			},
			putteria: { name: "Putteria", header: "pzprv3", fields: fields },
			walllogic: { name: "Wall Logic", header: "pzprv3", fields: fields },
			easyasabc: { name: "Easy as ABC", header: "pzprv3", fields: fields },
			pentominous: {
				name: "Pentominous",
				header: "pzprv3",
				fields: fields.concat([
					{ group: "border", property: "qans" },
					{ group: "border", property: "qsub" }
				])
			},
			makaro: { name: "Makaro", header: "pzprv3", fields: fields },
			view: { name: "View", header: "pzprv3", fields: fields },
			skyscrapers: { name: "Skyscrapers", header: "pzprv3", fields: fields },
			sukoro: { name: "Sukoro", header: "pzprv3", fields: fields },
			nanro: { name: "Nanro", header: "pzprv3.1", fields: fields },
			yinyang: {
				name: "Yin-Yang",
				header: "pzprv3",
				fields: fields.concat([
					{ group: "border", property: "qans" },
					{ group: "border", property: "qsub" }
				])
			},
			kropki: { name: "Kropki", header: "pzprv3", fields: fields },
			toichika: { name: "Toichika", header: "pzprv3", fields: fields },
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
