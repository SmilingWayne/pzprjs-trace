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
			balancelink: { name: "Balance Link", header: "pzprv3", fields: fields },
			bwloop: { name: "Kuroshiro Loop", header: "pzprv3", fields: fields },
			dotchi2: {
				name: "Dotchi Dotchi Loop",
				header: "pzprv3.2",
				fields: fields
			},
			elasticlink: { name: "Elastic Link", header: "pzprv3", fields: fields },
			golemgrad: { name: "Golem Grad", header: "pzprv3", fields: fields },
			lineofsight: { name: "Line of Sight", header: "pzprv3", fields: fields },
			lring: { name: "L-Ring", header: "pzprv3", fields: fields },
			nuriloop: { name: "Nurikabe Loop", header: "pzprv3", fields: fields },
			orbital: { name: "Orbital", header: "pzprv3", fields: fields },
			hamlepaths: {
				name: "Hamle Paths",
				header: "pzprv3",
				fields: fields.concat([{ group: "cell", property: "anum", empty: -1 }])
			},
			roundtrip: { name: "Round Trip", header: "pzprv3", fields: fields },
			balloon: {
				name: "Balloon Box",
				header: "pzprv3",
				fields: fields.concat([{ group: "border", property: "qans" }])
			},
			vslither: {
				name: "Vertex Slitherlink",
				header: "pzprv3",
				fields: fields.concat([{ group: "cross", property: "qsub" }])
			},
			tslither: {
				name: "Touch Slitherlink",
				header: "pzprv3",
				fields: fields.concat([{ group: "cross", property: "qsub" }])
			},
			tajmahal: {
				name: "Taj Mahal",
				header: "pzprv3",
				fields: [],
				segments: true
			},
			disloop: { name: "Disorderly Loop", header: "pzprv3", fields: fields },
			nanameguri: { name: "Nanameguri", header: "pzprv3", fields: fields },
			ovotovata: { name: "Ovotovata", header: "pzprv3.2", fields: fields },
			mukkonn: { name: "Mukkonn Enn", header: "pzprv3", fields: fields },
			trainstations: {
				name: "Train Stations",
				header: "pzprv3",
				fields: fields
			},
			bdwalk: { name: "Building Walk", header: "pzprv3", fields: fields },
			brownies: { name: "Brownies", header: "pzprv3", fields: fields },
			ichimagax: {
				name: "Crossing Ichimaga",
				header: "pzprv3",
				fields: fields
			},
			kaisu: { name: "Kaisu", header: "pzprv3.1", fields: fields },
			myopia: { name: "Myopia", header: "pzprv3", fields: fields },
			turnaround: { name: "Turnaround", header: "pzprv3", fields: fields },
			coffeemilk: { name: "Coffee Milk", header: "pzprv3", fields: fields },
			mintonette: { name: "Mintonette", header: "pzprv3", fields: fields },
			icelom2: { name: "Icelom 2", header: "pzprv3", fields: fields },
			nothing: { name: "All or Nothing", header: "pzprv3.2", fields: fields },
			bunnyhop: { name: "Bunnyhop", header: "pzprv3", fields: fields },
			tontti: { name: "Tonttiraja", header: "pzprv3", fields: fields },
			swslither: {
				name: "Sheep Wolf Slitherlink",
				header: "pzprv3.1",
				fields: fields
			},
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
