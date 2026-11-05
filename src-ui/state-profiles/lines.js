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
			kusabi: { name: "Kusabi", header: "pzprv3", fields: fields },
			loopsp: { name: "Loop Special", header: "pzprv3", fields: fields },
			ichimaga: { name: "Ichimaga", header: "pzprv3", fields: fields },
			ichimagam: {
				name: "Magnetic Ichimaga",
				header: "pzprv3",
				fields: fields
			},
			anglers: { name: "Anglers", header: "pzprv3", fields: fields },
			pipelinkr: { name: "Pipelink Returns", header: "pzprv3", fields: fields },
			remlen: { name: "Remembered Length", header: "pzprv3.2", fields: fields },
			rassi: { name: "Rassi Silai", header: "pzprv3.2", fields: fields },
			dotchi: { name: "Dotchi-Loop", header: "pzprv3.2", fields: fields },
			lither: { name: "Litherslink", header: "pzprv3.1", fields: fields },
			yajisoko: { name: "Yajisan-Sokoban", header: "pzprv3", fields: fields },
			maxi: { name: "Maxi Loop", header: "pzprv3.2", fields: fields },
			railpool: { name: "Rail Pool", header: "pzprv3", fields: fields },
			bonsan: {
				name: "Bonsan",
				header: "pzprv3",
				fields: fields.concat([{ group: "cell", property: "anum", empty: -1 }])
			},
			nagenawa: { name: "Nagenawa", header: "pzprv3", fields: fields },
			onsen: { name: "Onsen-meguri", header: "pzprv3.2", fields: fields },
			satogaeri: {
				name: "Satogaeri",
				header: "pzprv3",
				fields: fields.concat([{ group: "cell", property: "anum", empty: -1 }])
			},
			doubleback: { name: "Double Back", header: "pzprv3.2", fields: fields },
			mejilink: { name: "Mejilink", header: "pzprv3", fields: fields },
			tapaloop: { name: "Tapa-Like Loop", header: "pzprv3", fields: fields },
			icelom: { name: "Icelom", header: "pzprv3", fields: fields },
			balance: { name: "Balance Loop", header: "pzprv3", fields: fields },
			haisu: { name: "Haisu", header: "pzprv3.1", fields: fields },
			rectslider: {
				name: "Rectangle-Slider",
				header: "pzprv3",
				fields: fields
			},
			detour: { name: "Detour", header: "pzprv3.2", fields: fields },
			wblink: { name: "Shirokuro-link", header: "pzprv3", fields: fields },
			kouchoku: {
				name: "Kouchoku",
				header: "pzprv3",
				fields: [],
				segments: true
			},
			angleloop: {
				name: "Angle Loop",
				header: "pzprv3",
				fields: [],
				segments: true
			},
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
