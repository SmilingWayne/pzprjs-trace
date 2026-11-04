/* global module */
(function(root, profile) {
	if (typeof module !== "undefined" && module.exports) {
		module.exports = profile;
	} else {
		(root.stateProfiles = root.stateProfiles || {}).lightup = profile;
	}
})(this, {
	name: "Akari",
	header: "pzprv3",
	fields: [
		{ group: "cell", property: "qans" },
		{ group: "cell", property: "qsub" },
		{ group: "cell", property: "qcmp" }
	]
});
