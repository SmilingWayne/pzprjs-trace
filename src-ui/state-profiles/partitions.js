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
