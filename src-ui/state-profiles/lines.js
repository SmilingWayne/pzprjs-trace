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
			nagare: { name: "Nagareru-Loop", header: "pzprv3", fields: fields },
			geradeweg: { name: "Geradeweg", header: "pzprv3", fields: fields },
			castle: { name: "Castle Wall", header: "pzprv3", fields: fields },
			yosenabe: { name: "Yosenabe", header: "pzprv3.1", fields: fields },
			curvedata: { name: "Curve Data", header: "pzprv3", fields: fields },
			ringring: { name: "Ring-ring", header: "pzprv3", fields: fields },
			barns: { name: "Barns", header: "pzprv3", fields: fields },
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
			arukone: { name: "Arukone", header: "pzprv3", fields: fields },
			firefly: { name: "Hotaru Beam", header: "pzprv3", fields: fields },
			hashikake: { name: "Hashiwokakero", header: "pzprv3", fields: fields },
			icebarn: { name: "Icebarn", header: "pzprv3", fields: fields },
			slalom: { name: "Slalom", header: "pzprv3.3", fields: fields },
			country: { name: "Country Road", header: "pzprv3.2", fields: fields },
			reflect: { name: "Reflect Link", header: "pzprv3", fields: fields },
			herugolf: { name: "Herugolf", header: "pzprv3", fields: fields },
			moonsun: { name: "Moon or Sun", header: "pzprv3.2", fields: fields }
		};
	})()
);
