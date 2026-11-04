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
			{ group: "border", property: "line" },
			{ group: "border", property: "qsub" }
		];
		return {
			mashu: {
				name: "Masyu",
				header: "pzprv3",
				supported: function(puzzle) {
					return !puzzle.getConfig("uramashu");
				},
				fields: fields
			},
			midloop: { name: "Mid-loop", header: "pzprv3", fields: fields },
			simpleloop: { name: "Simple Loop", header: "pzprv3", fields: fields },
			pipelink: { name: "Pipelink", header: "pzprv3", fields: fields },
			numlin: { name: "Numberlink", header: "pzprv3", fields: fields },
			arukone: { name: "Arukone", header: "pzprv3", fields: fields }
		};
	})()
);
