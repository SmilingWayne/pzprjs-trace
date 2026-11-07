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
			{ group: "cell", property: "anum", empty: -1 },
			{ group: "cell", property: "qsub" },
			{ group: "cell", property: "qcmp" }
		].concat(
			[0, 1, 2, 3].map(function(pos) {
				return { group: "cell", property: "snum", pos: pos };
			})
		);
		return {
			scrabble: {
				name: "Scrabble",
				header: "pzprv3",
				fields: fields,
				bank: true
			},
			slovak: { name: "Slovak Sums", header: "pzprv3", fields: fields },
			soulmates: { name: "Soul Mates", header: "pzprv3", fields: fields },
			suguru: { name: "Suguru", header: "pzprv3", fields: fields },
			twinarea: { name: "Twin Area", header: "pzprv3", fields: fields },
			yajirushi: { name: "Yajirushi", header: "pzprv3", fields: fields },
			yajirushi2: { name: "Yajirushi 2", header: "pzprv3", fields: fields },
			tetrominous: {
				name: "Tetrominous",
				header: "pzprv3",
				fields: fields.concat([
					{ group: "border", property: "qans" },
					{ group: "border", property: "qsub" }
				])
			},
			topo: {
				name: "Topo",
				header: "pzprv3.1",
				fields: fields.concat([
					{ group: "border", property: "qans" },
					{ group: "border", property: "qsub" }
				])
			},
			alter: { name: "Alternation", header: "pzprv3", fields: fields },
			jatahoku: { name: "JaTaHoKu", header: "pzprv3", fields: fields },
			mrokmrno: { name: "Mr. OK and Mr. NO", header: "pzprv3", fields: fields },
			doppelblock: {
				name: "Doppelblock",
				header: "pzprv3",
				fields: fields.concat([{ group: "cell", property: "qans" }])
			},
			japanesesums: {
				name: "Japanese Sums",
				header: "pzprv3",
				fields: fields.concat([{ group: "cell", property: "qans" }])
			},
			isowatari: {
				name: "Isowatari",
				header: "pzprv3",
				fields: fields.concat([{ group: "cell", property: "qans" }])
			},
			numcity: {
				name: "Number City",
				header: "pzprv3",
				fields: fields.concat([
					{ group: "border", property: "qans" },
					{ group: "border", property: "qsub" }
				])
			},
			blindrush: {
				name: "Blind Rush",
				header: "pzprv3",
				fields: fields.concat([
					{ group: "border", property: "line" },
					{ group: "border", property: "qsub" }
				])
			},
			bosanowa: {
				name: "Bosanowa",
				header: "pzprv3",
				fields: fields
					.slice(0, 3)
					.concat([{ group: "border", property: "qsub", empty: -1 }])
			},
			snakepit: {
				name: "Snake Pit",
				header: "pzprv3",
				fields: fields.concat([
					{ group: "border", property: "qans" },
					{ group: "border", property: "qsub" }
				])
			},
			wafusuma: {
				name: "Wafusuma",
				header: "pzprv3.1",
				fields: fields.concat([
					{ group: "border", property: "qans" },
					{ group: "border", property: "qsub" }
				])
			},
			kakuru: { name: "Kakuru", header: "pzprv3", fields: fields },
			numrope: { name: "Number Rope", header: "pzprv3", fields: fields },
			sananko: { name: "San-Anko", header: "pzprv3", fields: fields },
			keywest: {
				name: "Key West",
				header: "pzprv3",
				fields: fields.concat([
					{ group: "border", property: "line" },
					{ group: "border", property: "qsub" }
				])
			},
			magnets: {
				name: "Magnets",
				header: "pzprv3",
				fields: fields
					.slice(0, 3)
					.concat([{ group: "excell", property: "qcmp" }])
			},
			sukororoom: { name: "Sukoro-room", header: "pzprv3", fields: fields },
			arrowflow: { name: "Arrow Flow", header: "pzprv3", fields: fields },
			simplegako: { name: "Simple Gako", header: "pzprv3", fields: fields },
			news: { name: "NEWS", header: "pzprv3", fields: fields },
			toichika2: { name: "Toichika 2", header: "pzprv3", fields: fields },
			cojun: { name: "Cojun", header: "pzprv3", fields: fields },
			kazunori: { name: "Kazunori Room", header: "pzprv3", fields: fields },
			renban: { name: "Renban-Madoguchi", header: "pzprv3", fields: fields },
			meander: { name: "Meandering Numbers", header: "pzprv3", fields: fields },
			tontonbeya: { name: "Tontonbeya", header: "pzprv3", fields: fields },
			roma: { name: "Roma", header: "pzprv3", fields: fields.slice(0, 3) },
			hanare: {
				name: "Hanare-gumi",
				header: "pzprv3",
				fields: fields.slice(0, 3)
			},
			lollipops: {
				name: "Lollipops",
				header: "pzprv3",
				fields: fields.slice(0, 3)
			},
			evolmino: {
				name: "Evolmino",
				header: "pzprv3",
				fields: fields.slice(0, 3)
			},
			goishi: { name: "Goishi", header: "pzprv3", fields: fields.slice(0, 3) },
			symmarea: {
				name: "Symmetry Area",
				header: "pzprv3",
				fields: fields.concat([
					{ group: "border", property: "qans" },
					{ group: "border", property: "qsub" }
				])
			},
			heyabon: {
				name: "Heya-Bon",
				header: "pzprv3",
				fields: fields.slice(0, 3).concat([
					{ group: "border", property: "line" },
					{ group: "border", property: "qsub" }
				])
			},
			hakoiri: { name: "Hakoiri-masashi", header: "pzprv3", fields: fields },
			minarism: { name: "Minarism", header: "pzprv3", fields: fields },
			tents: {
				name: "Tents",
				header: "pzprv3",
				fields: fields.concat([
					{ group: "border", property: "qans" },
					{ group: "border", property: "qsub" },
					{ group: "excell", property: "qcmp" }
				])
			},
			putteria: { name: "Putteria", header: "pzprv3", fields: fields },
			walllogic: { name: "Wall Logic", header: "pzprv3", fields: fields },
			easyasabc: { name: "Easy as ABC", header: "pzprv3", fields: fields },
			pentominous: {
				name: "Pentominous",
				header: "pzprv3",
				fields: fields.concat([
					{ group: "border", property: "qans" },
					{ group: "border", property: "qsub" }
				])
			},
			makaro: { name: "Makaro", header: "pzprv3", fields: fields },
			view: { name: "View", header: "pzprv3", fields: fields },
			skyscrapers: { name: "Skyscrapers", header: "pzprv3", fields: fields },
			sukoro: { name: "Sukoro", header: "pzprv3", fields: fields },
			nanro: { name: "Nanro", header: "pzprv3.1", fields: fields },
			yinyang: {
				name: "Yin-Yang",
				header: "pzprv3",
				fields: fields.concat([
					{ group: "border", property: "qans" },
					{ group: "border", property: "qsub" }
				])
			},
			kropki: { name: "Kropki", header: "pzprv3", fields: fields },
			toichika: { name: "Toichika", header: "pzprv3", fields: fields },
			ripple: { name: "Ripple Effect", header: "pzprv3", fields: fields },
			factors: { name: "Rooms of Factors", header: "pzprv3", fields: fields },
			kakuro: { name: "Kakuro", header: "pzprv3", fields: fields },
			hebi: {
				name: "Hebi-Ichigo",
				header: "pzprv3",
				fields: fields.slice(0, 3)
			},
			sudoku: {
				name: "Sudoku",
				header: "pzprv3",
				square: true,
				fields: fields
			},
			fillomino: {
				name: "Fillomino",
				header: "pzprv3",
				fields: fields.concat([
					{ group: "border", property: "qans" },
					{ group: "border", property: "qsub" }
				])
			}
		};
	})()
);
