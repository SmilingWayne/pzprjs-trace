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
		var cells = [
			{ group: "cell", property: "qans" },
			{ group: "cell", property: "qsub" },
			{ group: "cell", property: "qcmp" }
		];
		var cellsAndLines = cells.concat([
			{ group: "border", property: "line" },
			{ group: "border", property: "qsub" }
		]);
		return {
			retsurin: {
				name: "Retsurin",
				header: "pzprv3",
				fields: cellsAndLines,
				ignoreIdentityConfig: ["disptype_yajilin"]
			},
			roboticwalk: {
				name: "Robotic Walk",
				header: "pzprv3",
				fields: cellsAndLines
			},
			ruleofthree: {
				name: "Rule of Three",
				header: "pzprv3",
				fields: cellsAndLines
			},
			sansaroad: {
				name: "Sansa Road",
				header: "pzprv3",
				fields: cellsAndLines
			},
			sashikabe: { name: "Sashikabe", header: "pzprv3", fields: cells },
			seiza: { name: "Seiza", header: "pzprv3", fields: cellsAndLines },
			smullyan: {
				name: "Smullyanic Dynasty",
				header: "pzprv3",
				fields: cellsAndLines
			},
			starbattle: { name: "Star Battle", header: "pzprv3", fields: cells },
			sumiwake: { name: "Sumiwake", header: "pzprv3.1", fields: cellsAndLines },
			tetrochaink: {
				name: "Tetro Chain-K",
				header: "pzprv3",
				fields: cellsAndLines
			},
			tetroctb: { name: "Tetro Chain-CTB", header: "pzprv3.1", fields: cells },
			yokeimoji: {
				name: "Yokeimoji Cross",
				header: "pzprv3",
				fields: cellsAndLines
			},
			"regional-poly": {
				name: "Regional Polyominoes",
				header: "pzprv3",
				fields: cells,
				bank: true
			},
			retroships: {
				name: "Retrograde Battleships",
				header: "pzprv3",
				fields: cells,
				bank: true
			},
			trizone: {
				name: "Trizone",
				header: "pzprv3",
				fields: cells.concat([
					{ group: "border", property: "qans" },
					{ group: "border", property: "qsub" }
				])
			},
			zabajaba: {
				name: "Zabajaba",
				header: "pzprv3",
				fields: cellsAndLines.concat([{ group: "cell", property: "line" }])
			},
			anymino: { name: "Anymino", header: "pzprv3", fields: cells },
			archipelago: { name: "Archipelago", header: "pzprv3", fields: cells },
			bosnianroad: { name: "Bosnian Road", header: "pzprv3", fields: cells },
			bramble: { name: "Bramble", header: "pzprv3.1", fields: cells },
			cityspace: { name: "City Space", header: "pzprv3", fields: cells },
			cornerch: { name: "Corner Chain", header: "pzprv3", fields: cells },
			creek: { name: "Creek", header: "pzprv3", fields: cells },
			disco: { name: "Disconnection", header: "pzprv3", fields: cells },
			hasunomura: { name: "Hasu no Mura", header: "pzprv3", fields: cells },
			island: { name: "Inaba's Island", header: "pzprv3", fields: cells },
			landmeasure: {
				name: "Land Measurement",
				header: "pzprv3",
				fields: cells
			},
			marutaring: { name: "Marutaring", header: "pzprv3.1", fields: cells },
			mrtile: { name: "Mirroring Tile", header: "pzprv3", fields: cells },
			nibunnogo: { name: "Nibun-nogo", header: "pzprv3", fields: cells },
			nuritwin: { name: "Nuritwin", header: "pzprv3.1", fields: cells },
			bhaibahan: {
				name: "Bhai Bahan",
				header: "pzprv3",
				fields: cellsAndLines
			},
			circuitwalk: {
				name: "Circuit Walk",
				header: "pzprv3",
				fields: cellsAndLines
			},
			curving: {
				name: "Curving Road",
				header: "pzprv3",
				fields: cellsAndLines
			},
			energywalk: {
				name: "Energy Walk",
				header: "pzprv3",
				fields: cellsAndLines
			},
			fakearrow: {
				name: "Fake Arrow",
				header: "pzprv3",
				fields: cellsAndLines
			},
			heyajirimisaki: {
				name: "Heyajirimisaki",
				header: "pzprv3",
				fields: cellsAndLines
			},
			invlitso: {
				name: "Inverse LITSO",
				header: "pzprv3.1",
				fields: cellsAndLines
			},
			lixloop: { name: "LIX Loop", header: "pzprv3", fields: cellsAndLines },
			morningwalk: {
				name: "Morning Walk",
				header: "pzprv3",
				fields: cellsAndLines
			},
			oasis: { name: "Oasis", header: "pzprv3", fields: cellsAndLines },
			outofsight: {
				name: "Out Of Sight",
				header: "pzprv3",
				fields: cellsAndLines
			},
			batten: {
				name: "Battenberg Painting",
				header: "pzprv3",
				fields: cells.concat([{ group: "excell", property: "qcmp" }])
			},
			gravel: {
				name: "Gravel",
				header: "pzprv3",
				fields: cells.concat([
					{ group: "border", property: "qans" },
					{ group: "border", property: "qsub" }
				])
			},
			korokoro: {
				name: "Korokoro Ball Place",
				header: "pzprv3",
				fields: cells.concat(
					[0, 1, 2, 3].map(function(pos) {
						return { group: "cell", property: "snum", pos: pos };
					})
				)
			},
			edamame: {
				name: "Edamame",
				header: "pzprv3",
				fields: cells.concat([
					{ group: "cell", property: "line" },
					{ group: "border", property: "line" },
					{ group: "border", property: "qsub" }
				])
			},
			distopia: {
				name: "Distopia",
				header: "pzprv3",
				fields: cells,
				bank: true
			},
			kissing: {
				name: "Kissing Polyominoes",
				header: "pzprv3",
				fields: cells,
				bank: true
			},
			heyapin: {
				name: "Heyapin",
				header: "pzprv3.1",
				fields: cells.concat([
					{ group: "cross", property: "qans" },
					{ group: "cross", property: "qsub" }
				])
			},
			meidjuluk: {
				name: "Meidjuluk",
				header: "pzprv3",
				fields: cells.concat(
					[
						{ group: "border", property: "qans" },
						{ group: "border", property: "qsub" }
					],
					[0, 1, 2, 3].map(function(pos) {
						return { group: "cell", property: "snum", pos: pos };
					})
				),
				bank: true
			},
			oyakodori: { name: "Oyakodori", header: "pzprv3", fields: cellsAndLines },
			ladders: { name: "Ladders", header: "pzprv3.1", fields: cellsAndLines },
			diamond: {
				name: "Diamond Chain",
				header: "pzprv3",
				fields: cells.concat([
					{ group: "cross", property: "qans" },
					{ group: "cross", property: "qsub" }
				])
			},
			kurarin: { name: "Kurarin", header: "pzprv3", fields: cellsAndLines },
			slashpack: { name: "Slash Pack", header: "pzprv3", fields: cells },
			crossstitch: {
				name: "Crossstitch",
				header: "pzprv3",
				fields: cells.concat([{ group: "cross", property: "qsub" }])
			},
			pentatouch: {
				name: "Penta Touch",
				header: "pzprv3",
				fields: cells,
				bank: true
			},
			battleship: {
				name: "Battleship",
				header: "pzprv3",
				fields: cells.concat([{ group: "excell", property: "qcmp" }]),
				bank: true
			},
			snakeegg: {
				name: "Snake Egg",
				header: "pzprv3",
				fields: cells.concat(
					[0, 1, 2, 3].map(function(pos) {
						return { group: "cell", property: "snum", pos: pos };
					})
				),
				bank: true
			},
			martini: { name: "Martini", header: "pzprv3.1", fields: cells },
			forestwalk: {
				name: "Forest Walk",
				header: "pzprv3",
				fields: cellsAndLines
			},
			waterwalk: {
				name: "Water Walk",
				header: "pzprv3",
				fields: cellsAndLines
			},
			firewalk: {
				name: "Fire Walk",
				header: "pzprv3",
				fields: cellsAndLines.concat([{ group: "cross", property: "qsub" }])
			},
			kaidan: {
				name: "Stairwell",
				header: "pzprv3",
				fields: cellsAndLines.concat([{ group: "cell", property: "line" }])
			},
			wittgen: {
				name: "Wittgenstein Briquet",
				header: "pzprv3",
				fields: cellsAndLines.concat([{ group: "cell", property: "line" }])
			},
			mannequin: {
				name: "Mannequin Gate",
				header: "pzprv3",
				fields: cells.concat(
					[0, 1, 2, 3].map(function(pos) {
						return { group: "cell", property: "snum", pos: pos };
					})
				)
			},
			teri: {
				name: "Territory",
				header: "pzprv3",
				fields: cells.concat([
					{ group: "border", property: "qans" },
					{ group: "border", property: "qsub" }
				])
			},
			patchwork: {
				name: "Patchwork",
				header: "pzprv3",
				fields: cells.concat([
					{ group: "border", property: "qans" },
					{ group: "border", property: "qsub" }
				])
			},
			norinuri: { name: "Norinuri", header: "pzprv3", fields: cells },
			parquet: { name: "Parquet", header: "pzprv3", fields: cells },
			tetrochain: { name: "Tetro Chain-Y", header: "pzprv3", fields: cells },
			kuromenbun: { name: "Kuromenbun", header: "pzprv3", fields: cells },
			nuriuzu: { name: "Nuri-uzu", header: "pzprv3", fields: cells },
			tilecity: { name: "Tile City", header: "pzprv3", fields: cells },
			cts: {
				name: "Cross the Streams",
				header: "pzprv3",
				fields: cells.concat([{ group: "excell", property: "qcmp" }])
			},
			mochinyoro: { name: "Mochinyoro", header: "pzprv3", fields: cells },
			circlesquare: {
				name: "Circles and Squares",
				header: "pzprv3",
				fields: cells
			},
			tilepaint: { name: "Tilepaint", header: "pzprv3", fields: cells },
			nondango: { name: "Nondango", header: "pzprv3", fields: cells },
			antmill: { name: "Ant Mill", header: "pzprv3", fields: cells },
			dominion: { name: "Dominion", header: "pzprv3", fields: cells },
			canal: { name: "Canal View", header: "pzprv3", fields: cells },
			ququ: { name: "Ququ", header: "pzprv3", fields: cells },
			lightshadow: {
				name: "Light and Shadow",
				header: "pzprv3",
				fields: cells
			},
			coral: {
				name: "Coral",
				header: "pzprv3",
				fields: cells.concat([{ group: "excell", property: "qcmp" }])
			},
			heyablock: { name: "Heyablock", header: "pzprv3.1", fields: cells },
			hinge: { name: "Hinge", header: "pzprv3.1", fields: cells },
			kurochute: { name: "Kurochute", header: "pzprv3", fields: cellsAndLines },
			aquapelago: {
				name: "Aquapelago",
				header: "pzprv3",
				fields: cellsAndLines
			},
			context: { name: "Context", header: "pzprv3", fields: cellsAndLines },
			nothree: { name: "No Three", header: "pzprv3", fields: cellsAndLines },
			oneroom: {
				name: "One Room One Door",
				header: "pzprv3.1",
				fields: cellsAndLines
			},
			armyants: { name: "Army Ants", header: "pzprv3", fields: cellsAndLines },
			takoyaki: {
				name: "Takoyaki",
				header: "pzprv3",
				fields: cells.concat([
					{ group: "cell", property: "line" },
					{ group: "border", property: "line" },
					{ group: "border", property: "qsub" }
				])
			},
			pentopia: {
				name: "Pentopia",
				header: "pzprv3",
				fields: cells,
				bank: true
			},
			statuepark: {
				name: "Statue Park",
				header: "pzprv3",
				fields: cells,
				bank: true
			},
			akichi: { name: "Akichiwake", header: "pzprv3.1", fields: cellsAndLines },
			amibo: { name: "Amibo", header: "pzprv3", fields: cellsAndLines },
			aquarium: {
				name: "Aquarium",
				header: "pzprv3",
				fields: cells.concat([{ group: "excell", property: "qcmp" }])
			},
			koburin: {
				name: "Koburin",
				header: "pzprv3",
				fields: cellsAndLines,
				ignoreIdentityConfig: ["disptype_yajilin"]
			},
			scrin: { name: "Scrin", header: "pzprv3", fields: cells },
			cocktail: { name: "Cocktail Lamp", header: "pzprv3.1", fields: cells },
			interbd: {
				name: "International Borders",
				header: "pzprv3",
				fields: cells
			},
			box: { name: "Box", header: "pzprv3", fields: cells },
			icewalk: { name: "Ice Walk", header: "pzprv3", fields: cellsAndLines },
			lapaz: {
				name: "La Paz",
				header: "pzprv3",
				fields: cells.concat([
					{ group: "border", property: "qans" },
					{ group: "border", property: "qsub" }
				])
			},
			kuroclone: { name: "Kuroclone", header: "pzprv3", fields: cells },
			snake: {
				name: "Snake",
				header: "pzprv3",
				fields: cells.concat([{ group: "excell", property: "qcmp" }])
			},
			kaero: { name: "Return Home", header: "pzprv3", fields: cellsAndLines },
			cbanana: { name: "Choco Banana", header: "pzprv3", fields: cells },
			tawa: { name: "Tawamurenga", header: "pzprv3", fields: cells },
			dosufuwa: { name: "Dosun-Fuwari", header: "pzprv3", fields: cells },
			juosan: { name: "Juosan", header: "pzprv3", fields: cells },
			guidearrow: {
				name: "Guide Arrow",
				header: "pzprv3",
				fields: cellsAndLines
			},
			nuribou: { name: "Nuribou", header: "pzprv3", fields: cells },
			lookair: { name: "Look-Air", header: "pzprv3", fields: cells },
			chainedb: { name: "Chained Block", header: "pzprv3", fields: cells },
			wagiri: { name: "Wagiri", header: "pzprv3", fields: cells },
			usoone: { name: "Uso-one", header: "pzprv3", fields: cellsAndLines },
			mochikoro: { name: "Mochikoro", header: "pzprv3", fields: cells },
			kinkonkan: { name: "Kin-Kon-Kan", header: "pzprv3.1", fields: cells },
			paintarea: { name: "Paintarea", header: "pzprv3", fields: cells },
			chocona: { name: "Chocona", header: "pzprv3.1", fields: cells },
			tateyoko: { name: "Tatebo-Yokobo", header: "pzprv3", fields: cells },
			heyawake: {
				name: "Heyawake",
				header: "pzprv3.1",
				fields: cellsAndLines
			},
			ayeheya: { name: "Ayeheya", header: "pzprv3.1", fields: cellsAndLines },
			aqre: { name: "Aqre", header: "pzprv3.1", fields: cellsAndLines },
			stostone: { name: "Stostone", header: "pzprv3.1", fields: cells },
			kurotto: { name: "Kurotto", header: "pzprv3", fields: cells },
			mines: { name: "Minesweeper", header: "pzprv3", fields: cells },
			tasquare: { name: "Tasquare", header: "pzprv3", fields: cells },
			shugaku: { name: "School Trip", header: "pzprv3", fields: cells },
			tapa: { name: "Tapa", header: "pzprv3", fields: cellsAndLines },
			shakashaka: { name: "Shakashaka", header: "pzprv3", fields: cells },
			gokigen: { name: "Slant", header: "pzprv3", fields: cells },
			nurimaze: { name: "Nuri-Maze", header: "pzprv3", fields: cellsAndLines },
			yajikazu: {
				name: "Yajisan-Kazusan",
				header: "pzprv3",
				fields: cellsAndLines
			},
			nonogram: {
				name: "Nonogram",
				header: "pzprv3",
				fields: cells.concat([{ group: "excell", property: "qcmp" }])
			},
			shimaguni: {
				name: "Shimaguni",
				header: "pzprv3.1",
				fields: cells.concat(
					[0, 1, 2, 3].map(function(pos) {
						return { group: "cell", property: "snum", pos: pos };
					})
				)
			},
			nurimisaki: { name: "Nurimisaki", header: "pzprv3", fields: cells },
			hitori: { name: "Hitori", header: "pzprv3", fields: cellsAndLines },
			kurodoko: { name: "Kurodoko", header: "pzprv3", fields: cellsAndLines },
			cave: { name: "Cave", header: "pzprv3", fields: cellsAndLines },
			lits: { name: "LITS", header: "pzprv3.1", fields: cellsAndLines },
			norinori: { name: "Norinori", header: "pzprv3.1", fields: cellsAndLines }
		};
	})()
);
