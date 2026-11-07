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
			{ group: "cell", property: "qsub" },
			{ group: "cell", property: "qcmp" },
			{ group: "border", property: "qans" },
			{ group: "border", property: "qsub" }
		];
		return {
			usotatami: { name: "Uso-tatami", header: "pzprv3", fields: fields },
			kramma: { name: "KaitoRamma", header: "pzprv3", fields: fields },
			kramman: { name: "New KaitoRamma", header: "pzprv3", fields: fields },
			familyphoto: { name: "Family Photo", header: "pzprv3", fields: fields },
			fracdiv: {
				name: "Fractional Division",
				header: "pzprv3",
				fields: fields
			},
			sashikazune: { name: "Sashikazune", header: "pzprv3", fields: fields },
			mirrorbk: { name: "Mirror Block", header: "pzprv3", fields: fields },
			nikoji: { name: "NIKOJI", header: "pzprv3", fields: fields },
			lohkous: { name: "Lohkous", header: "pzprv3", fields: fields },
			aho: { name: "Aho-ni-Narikire", header: "pzprv3", fields: fields },
			fillmat: { name: "Fillmat", header: "pzprv3", fields: fields },
			nawabari: { name: "Nawabari", header: "pzprv3", fields: fields },
			yajitatami: { name: "Yajitatami", header: "pzprv3", fields: fields },
			triplace: { name: "Tri-place", header: "pzprv3", fields: fields },
			fourcells: { name: "FourCells", header: "pzprv3.1", fields: fields },
			loute: {
				name: "L-route",
				header: "pzprv3",
				fields: fields.concat([{ group: "cell", property: "qans" }])
			},
			tren: {
				name: "Tren",
				header: "pzprv3",
				fields: fields.concat([{ group: "cell", property: "qans" }])
			},
			araf: { name: "Araf", header: "pzprv3", fields: fields },
			heteromino: { name: "Heteromino", header: "pzprv3", fields: fields },
			voxas: { name: "Voxas", header: "pzprv3", fields: fields },
			squarejam: { name: "Square Jam", header: "pzprv3", fields: fields },
			compass: { name: "Compass", header: "pzprv3", fields: fields },
			bdblock: { name: "Border Block", header: "pzprv3", fields: fields },
			tatamibari: { name: "Tatamibari", header: "pzprv3", fields: fields },
			cbblock: { name: "Combi Block", header: "pzprv3", fields: fields },
			shwolf: { name: "Goats and Wolves", header: "pzprv3", fields: fields },
			pencils: {
				name: "Pencils",
				header: "pzprv3",
				fields: fields.concat([
					{ group: "cell", property: "qans" },
					{ group: "border", property: "line" }
				])
			},
			shikaku: { name: "Shikaku", header: "pzprv3", fields: fields },
			fivecells: { name: "FiveCells", header: "pzprv3", fields: fields },
			dbchoco: { name: "Double Choco", header: "pzprv3", fields: fields },
			tentaisho: { name: "Tentaisho", header: "pzprv3", fields: fields },
			sashigane: {
				name: "Sashigane",
				header: "pzprv3",
				fields: fields.concat([{ group: "cell", property: "qans" }])
			}
		};
	})()
);
