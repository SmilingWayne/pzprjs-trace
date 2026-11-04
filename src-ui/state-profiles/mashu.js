/* global module */
(function(root, profile) {
	if (typeof module !== "undefined" && module.exports) {
		module.exports = profile;
	} else {
		(root.stateProfiles = root.stateProfiles || {}).mashu = profile;
	}
})(this, {
	name: "Masyu",
	header: "pzprv3",
	supported: function(puzzle) {
		return !puzzle.getConfig("uramashu");
	},
	fields: [
		{ group: "cell", property: "qsub" },
		{ group: "cell", property: "qcmp" },
		{ group: "border", property: "line" },
		{ group: "border", property: "qsub" }
	]
});
