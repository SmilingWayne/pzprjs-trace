/* global module */
(function(root, profile) {
	if (typeof module !== "undefined" && module.exports) {
		module.exports = profile;
	} else {
		(root.stateProfiles = root.stateProfiles || {}).shikaku = profile;
	}
})(this, {
	name: "Shikaku",
	header: "pzprv3",
	fields: [
		{ group: "cell", property: "qsub" },
		{ group: "cell", property: "qcmp" },
		{ group: "border", property: "qans" },
		{ group: "border", property: "qsub" }
	]
});
