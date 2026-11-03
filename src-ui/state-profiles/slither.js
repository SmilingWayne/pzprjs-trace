/* global module */
(function(root, profile) {
	if (typeof module !== "undefined" && module.exports) {
		module.exports = profile;
	} else {
		(root.stateProfiles = root.stateProfiles || {}).slither = profile;
	}
})(this, {
	name: "Slitherlink",
	header: "pzprv3.1",
	supported: function(puzzle) {
		return !puzzle.getConfig("slither_full");
	},
	fields: [
		{ group: "cell", property: "qsub" },
		{ group: "cell", property: "qcmp" },
		{ group: "border", property: "qsub" },
		{ group: "border", property: "line" }
	]
});
