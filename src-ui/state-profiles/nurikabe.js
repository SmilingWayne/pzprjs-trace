/* global module */
(function(root, profile) {
	if (typeof module !== "undefined" && module.exports) {
		module.exports = profile;
	} else {
		(root.stateProfiles = root.stateProfiles || {}).nurikabe = profile;
	}
})(this, {
	name: "Nurikabe",
	header: "pzprv3",
	fields: [
		{ group: "cell", property: "qans" },
		{ group: "cell", property: "qsub" },
		// FileIO does not save completion marks; importing clears them.
		{ group: "cell", property: "qcmp" }
	]
});
