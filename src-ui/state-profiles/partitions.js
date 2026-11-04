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
			shikaku: { name: "Shikaku", header: "pzprv3", fields: fields },
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
