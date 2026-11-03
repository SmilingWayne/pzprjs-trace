/* global module */
(function(root, profiles) {
	if (typeof module !== "undefined" && module.exports) {
		module.exports = profiles;
	} else {
		var registry = (root.stateProfiles = root.stateProfiles || {});
		registry.yajilin = profiles.yajilin;
		registry["yajilin-regions"] = profiles["yajilin-regions"];
	}
})(
	this,
	(function() {
		var fields = [
			{ group: "cell", property: "qans" },
			{ group: "cell", property: "qsub" },
			// FileIO does not save completion marks; importing clears them.
			{ group: "cell", property: "qcmp" },
			{ group: "border", property: "line" },
			{ group: "border", property: "qsub" }
		];
		return {
			yajilin: { name: "Yajilin", header: "pzprv3", fields: fields },
			"yajilin-regions": {
				name: "Yajilin Regions",
				header: "pzprv3",
				fields: fields
			}
		};
	})()
);
