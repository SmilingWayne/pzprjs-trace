# Puzzle states

A state saves the current puzzle progress in a link, without a database. It can be an empty, partial, complete, or incorrect board. Open **Trace → Export state** to copy the compressed state or its link; open **Trace → Import state** to paste a compressed state or native pzpr text. A state is a snapshot, not a solving history. Use [recordings](Recordings.md) for replay and step history.

## What is saved

The uncompressed state is exactly the current board's native pzpr file as exported by FileIO, including its clues and all player marks that the file format records. There is no extra state payload. The native file version depends on the puzzle. Marks that FileIO does not record cannot be restored from a state.

| Puzzle | Native file | Player marks saved | Not saved |
| --- | --- | --- | --- |
| Standard Slitherlink (`slither`) | `pzprv3.1` | Lines, border crosses, cell background colors | — |
| Nurikabe (`nurikabe`) | `pzprv3` | Black cells and non-black marks | Clue completion marks |
| Yajilin (`yajilin`, `yajirin`) and Yajilin Regions (`yajilin-regions`, `yajirin-regions`) | `pzprv3` | Black cells, non-black marks, lines and border crosses | Clue completion marks |
| Heyawake (`heyawake`, `heyawacky`), Ayeheya (`ayeheya`), Aqre (`aqre`) | `pzprv3.1` | Black cells, non-black marks, border lines and crosses | Clue completion marks |
| Nonogram (`nonogram`) | `pzprv3` | Black cells, non-black marks, outside-clue completion marks | — |
| Stostone (`stostone`), Kurotto (`kurotto`) | `pzprv3.1` (Stostone), `pzprv3` (Kurotto) | Black cells and non-black marks | Clue completion marks |
| Shakashaka (`shakashaka`) | `pzprv3` | Triangles, dots and completion marks | Dots and completion marks hidden by a triangle; completion marks hidden by a dot |
| Nuri-Maze (`nurimaze`), Yajisan-Kazusan (`yajikazu`) | `pzprv3` | Black cells, non-black marks, auxiliary lines and border crosses | Completion marks |
| Tapa (`tapa`) | `pzprv3` | Black cells, non-black marks, auxiliary lines and border crosses | Clue completion marks |
| Shimaguni (`shimaguni`) | `pzprv3.1` | Black cells, non-black marks, candidate numbers | Clue completion marks |
| Nurimisaki (`nurimisaki`) | `pzprv3` | Black cells and non-black marks | Clue completion marks |
| Hitori (`hitori`), Kurodoko (`kurodoko`), Cave (`cave`, `bag`) | `pzprv3` | Black cells, non-black marks, auxiliary lines and border crosses | Clue completion marks |
| LITS (`lits`), Norinori (`norinori`) | `pzprv3.1` | Black cells, non-black marks, auxiliary lines and border crosses | Completion marks |
| Masyu (`mashu`, `pearl`), Mid-loop (`midloop`), Simple Loop (`simpleloop`), Pipelink (`pipelink`), Numberlink (`numlin`), Arukone (`arukone`), Hotaru Beam (`firefly`), Hashiwokakero (`hashikake`, `hashi`, `bridges`) | `pzprv3` | Lines and border crosses | Cell completion and background marks |
| Slalom (`slalom`, `suraromu`), Icebarn (`icebarn`) | `pzprv3.3` (Slalom), `pzprv3` (Icebarn) | Lines, border crosses and direction marks, including lines with crosses or direction marks | Cell completion and background marks |
| Country Road (`country`) | `pzprv3.2` | Lines, border crosses and cell background colors | Cell completion marks |
| Slant (`gokigen`) | `pzprv3` | Slashes in both directions | Cell completion and background marks |
| Double Choco (`dbchoco`) | `pzprv3` | Answer and auxiliary borders, including both on the same border | Cell completion and background marks |
| Sashigane (`sashigane`) | `pzprv3` | Answer and auxiliary borders, cell shading and non-black marks | Cell completion marks; cell marks hidden by clues, and shading hidden by non-black marks |
| Tentaisho (`tentaisho`) | `pzprv3` | Answer and auxiliary borders, including both on the same border, and cell background colors | Cell completion marks |
| Shikaku (`shikaku`) | `pzprv3` | Answer and auxiliary borders, including both on the same border | Cell completion and background marks |
| Akari (`lightup`, `akari`) | `pzprv3` | Bulbs, non-bulb marks and clue completion marks | — |
| Sudoku (`sudoku`), Fillomino (`fillomino`) | `pzprv3` | Answer numbers, candidate numbers, cell background and completion marks; Fillomino also saves answer and auxiliary borders | Candidate, background and completion marks hidden by an answer number; background marks hidden by completion marks |
| Reflect Link (`reflect`), Herugolf (`herugolf`) | `pzprv3` | Lines and border crosses | Cell completion and background marks; crosses hidden by lines |
| Moon or Sun (`moonsun`) | `pzprv3.2` | Lines, border crosses and cell background colors | Cell completion marks; crosses hidden by lines |
| Kakuro (`kakuro`) | `pzprv3` | Answer numbers, candidate numbers, cell background and completion marks | Candidate, background and completion marks hidden by an answer number; background marks hidden by completion marks |
| Hebi-Ichigo (`hebi`, `snakes`) | `pzprv3` | Answer numbers, cell background and completion marks | Background and completion marks hidden by an answer number; background marks hidden by completion marks |
| Tasquare (`tasquare`) | `pzprv3` | Black cells and non-black marks | Clue completion marks; cell marks hidden by clues and non-black marks hidden by shading |
| School Trip (`shugaku`) | `pzprv3` | Futon shapes, shaded cells and non-black marks | Cell completion marks; cell marks hidden by clues and non-black marks hidden by futons or shading |
| Minesweeper (`mines`) | `pzprv3` | Black cells and non-black marks | Clue completion marks; non-black marks hidden by shading |
| FiveCells (`fivecells`) | `pzprv3` | Answer and auxiliary borders, including both on the same border | Cell completion and background marks |
| Castle Wall (`castle`) | `pzprv3` | Lines, border crosses and clue completion marks | Cell background marks; crosses hidden by lines |
| Mochikoro (`mochikoro`), Paintarea (`paintarea`), Chocona (`chocona`) | `pzprv3` (Mochikoro, Paintarea), `pzprv3.1` (Chocona) | Black cells and non-black marks | Cell completion marks; non-black marks hidden by shading |
| Kin-Kon-Kan (`kinkonkan`) | `pzprv3.1` | Mirrors in both directions and non-mirror marks | Cell completion marks; non-mirror marks hidden by mirrors |
| Yosenabe (`yosenabe`) | `pzprv3.1` | Lines, border crosses, cell background and completion marks | Crosses hidden by lines |
| Curve Data (`curvedata`) | `pzprv3` | Lines and border crosses | Cell background and completion marks; lines and crosses hidden by clue borders, crosses hidden by lines |
| Goats and Wolves (`shwolf`) | `pzprv3` | Answer and auxiliary borders, including both on the same border | Cell background and completion marks |
| Ring-ring (`ringring`), Barns (`barns`) | `pzprv3` | Lines and border crosses | Cell background and completion marks; crosses hidden by lines |
| Pencils (`pencils`) | `pzprv3` | Pencil arrows, cell background colors, answer and auxiliary borders, lines and border crosses | Cell completion marks; crosses hidden by lines |
| Rooms of Factors (`factors`) | `pzprv3` | Answer numbers, candidate numbers, cell background and completion marks | Candidate, background and completion marks hidden by an answer number; background marks hidden by completion marks |
| Tatebo-Yokobo (`tateyoko`) | `pzprv3` | Horizontal and vertical bars | Cell background and completion marks; bars hidden by blocked cells |
| Nuribou (`nuribou`), Look-Air (`lookair`) | `pzprv3` | Black cells and non-black marks | Cell completion marks; non-black marks hidden by shading |
| Chained Block (`chainedb`) | `pzprv3` | Black cells and non-black marks | Cell completion marks; cell marks hidden by clues and non-black marks hidden by shading |
| Wagiri (`wagiri`) | `pzprv3` | Slashes in both directions | Cell completion and background marks |
| Border Block (`bdblock`), Tatamibari (`tatamibari`), Combi Block (`cbblock`) | `pzprv3` | Answer and auxiliary borders, including both on the same border | Cell completion and background marks |
| Nagareru-Loop (`nagare`) | `pzprv3` | Lines, border crosses and direction marks, including lines with crosses or direction marks | Cell completion and background marks |
| Geradeweg (`geradeweg`) | `pzprv3` | Lines and border crosses | Cell completion and background marks; crosses hidden by lines |
| Uso-one (`usoone`) | `pzprv3` | Black cells, non-black marks, clue circles and crosses, auxiliary lines and border crosses | Cell marks hidden by shading; border crosses hidden by lines |
| Ripple Effect (`ripple`) | `pzprv3` | Answer numbers, candidate numbers, cell background and completion marks | Candidate, background and completion marks hidden by an answer number; background marks hidden by completion marks |
| Skyscrapers (`skyscrapers`) | `pzprv3` | Answer numbers and candidates | Marks hidden by clues; candidates hidden by answers |
| Kropki (`kropki`) | `pzprv3` | Answer numbers, candidates, background and completion marks | Candidates, background and completion marks hidden by answers; background hidden by completion marks |
| Sukoro (`sukoro`), Nanro (`nanro`), Toichika (`toichika`), Yin-Yang (`yinyang`) | `pzprv3.1` (Nanro), `pzprv3` (others) | Answer numbers, arrows or circles, background and completion marks | Background and completion marks hidden by answers; background hidden by completion marks; Yin-Yang auxiliary borders |
| Snake (`snake`) | `pzprv3` | Black cells, non-black marks and outside-clue completion marks | Non-black marks hidden by shading |
| Choco Banana (`cbanana`), Tawamurenga (`tawa`) | `pzprv3` | Black cells and non-black marks | Non-black marks hidden by shading; Tawamurenga marks hidden by clues |
| Dosun-Fuwari (`dosufuwa`) | `pzprv3` | Balloons, iron balls and empty marks | Empty marks hidden by objects |
| Compass (`compass`) | `pzprv3` | Answer and auxiliary borders, including both on the same border | Cell background and completion marks |
| Return Home (`kaero`), Rectangle-Slider (`rectslider`) | `pzprv3` | Movement lines, border crosses and cell background colors; Rectangle-Slider also saves completion marks | Crosses hidden by lines; Return Home completion marks |
| Tapa-Like Loop (`tapaloop`), Balance Loop (`balance`), Detour (`detour`) | `pzprv3.2` (Detour), `pzprv3` (others) | Lines and border crosses; Tapa-Like Loop and Detour also save cell circles and crosses | Crosses hidden by lines |
| Icelom (`icelom`), Haisu (`haisu`) | `pzprv3.1` (Haisu), `pzprv3` (Icelom) | Lines, border crosses and direction marks, including marks on lines | Cell background and completion marks |
| Juosan (`juosan`) | `pzprv3` | Horizontal and vertical bars | Cell background and completion marks; bars hidden by blocked cells |
| Guide Arrow (`guidearrow`) | `pzprv3` | Black cells, non-black marks, auxiliary lines and border crosses | Non-black marks hidden by shading; crosses hidden by lines |
| Shirokuro-link (`wblink`) | `pzprv3` | Lines and border crosses | Cell background and completion marks; crosses hidden by lines |
| Kouchoku (`kouchoku`), Angle Loop (`angleloop`) | `pzprv3` | Free segments | — |
| Statue Park (`statuepark`) | `pzprv3` | Black cells, non-black marks and piece-bank completion marks | Cell completion marks; non-black marks hidden by shading |
| Akichiwake (`akichi`), Koburin (`koburin`) | `pzprv3.1` (Akichiwake), `pzprv3` (Koburin) | Black cells, non-black marks, auxiliary lines and border crosses | Cell completion marks; crosses hidden by lines |
| Hakoiri-masashi (`hakoiri`), Minarism (`minarism`), Makaro (`makaro`), View (`view`) | `pzprv3` | Answer numbers, candidates, background and completion marks | Candidates, background and completion marks hidden by answers; background hidden by completion marks |
| Putteria (`putteria`) | `pzprv3` | Answer numbers, background and completion marks | Candidate numbers; background and completion marks hidden by answers; background hidden by completion marks |
| Tents (`tents`) | `pzprv3` | Tents, non-tent marks, answer and auxiliary borders and outside-clue completion marks | Cell marks hidden by trees or answers |
| Amibo (`amibo`) | `pzprv3` | Bars, crosses, cell circles, lines and border crosses | Cell completion marks; crosses hidden by lines |
| Aquarium (`aquarium`) | `pzprv3` | Black cells, non-black marks and outside-clue completion marks | Non-black marks hidden by shading |
| Maxi Loop (`maxi`), Nagenawa (`nagenawa`), Double Back (`doubleback`) | `pzprv3.2` (Maxi Loop and Double Back), `pzprv3` (Nagenawa) | Lines, border crosses and cell background colors | Cell completion marks; crosses hidden by lines |
| Rail Pool (`railpool`), Onsen-meguri (`onsen`), Mejilink (`mejilink`) | `pzprv3.2` (Onsen-meguri), `pzprv3` (others) | Lines and border crosses | Cell background and completion marks; crosses hidden by lines |
| Bonsan (`bonsan`), Satogaeri (`satogaeri`) | `pzprv3` | Movement lines, border crosses, cell background, completion and stationary marks | Crosses hidden by lines |
| Scrin (`scrin`), Cocktail Lamp (`cocktail`), International Borders (`interbd`), Box (`box`), Kuroclone (`kuroclone`) | `pzprv3.1` (Cocktail Lamp), `pzprv3` (others) | Black cells and non-black marks | Cell completion marks; non-black marks hidden by shading; International Borders marks hidden by clues |
| Wall Logic (`walllogic`) | `pzprv3` | Direction answers and completion marks | Cell background and candidates; completion marks hidden by answers |
| Easy as ABC (`easyasabc`) | `pzprv3` | Answers, candidates and presence/empty marks | Cell completion marks; some marks hidden by clues or answers |
| Araf (`araf`), Heteromino (`heteromino`), Square Jam (`squarejam`), Voxas (`voxas`) | `pzprv3` | Answer and auxiliary borders, including both on the same border | Cell background and completion marks |
| Ice Walk (`icewalk`) | `pzprv3` | Lines, border crosses and native ice-cell answer marks | Cell background and completion marks; crosses hidden by lines |
| Pentominous (`pentominous`) | `pzprv3` | Answer numbers, candidates, background and completion marks, answer and auxiliary borders | Candidates, background and completion marks hidden by answers; background hidden by completion marks |
| La Paz (`lapaz`) | `pzprv3` | Black cells, non-black marks, answer and auxiliary borders | Cell completion marks; non-black marks hidden by shading |
| Mochinyoro (`mochinyoro`), Circles and Squares (`circlesquare`), Ant Mill (`antmill`), Dominion (`dominion`), Heyablock (`heyablock`), Hinge (`hinge`), Ququ (`ququ`) | `pzprv3.1` (Heyablock, Hinge), `pzprv3` (others) | Black cells and non-black marks | Cell completion marks; non-black marks hidden by shading |
| Tilepaint (`tilepaint`), Nondango (`nondango`) | `pzprv3` | Black cells and non-black marks | Cell completion marks; allowed marks depend on the cell, and shading hides non-black marks |
| Canal View (`canal`), Kurochute (`kurochute`) | `pzprv3` | Black cells, non-black and completion marks; Kurochute also saves auxiliary lines and crosses | Mutually exclusive cell marks; border crosses hidden by lines |
| Coral (`coral`) | `pzprv3` | Black cells, non-black marks and outside-clue completion marks | Non-black marks hidden by shading |
| Light and Shadow (`lightshadow`) | `pzprv3` | Black and white shading | Cell completion marks |
| Aquapelago (`aquapelago`), Context (`context`), No Three (`nothree`), One Room One Door (`oneroom`) | `pzprv3.1` (One Room One Door), `pzprv3` (others) | Black cells, non-black marks, auxiliary lines and crosses | Cell completion marks; shading hides non-black marks, lines hide crosses, and Aquapelago clues hide cell marks |
| Kusabi (`kusabi`), Loop Special (`loopsp`), Ichimaga (`ichimaga`), Magnetic Ichimaga (`ichimagam`), Anglers (`anglers`), Pipelink Returns (`pipelinkr`) | `pzprv3` | Lines and border crosses | Cell background and completion marks; crosses hidden by lines |
| Litherslink (`lither`), Rassi Silai (`rassi`), Dotchi-Loop (`dotchi`) | `pzprv3.1` (Litherslink), `pzprv3.2` (others) | Lines, border crosses and cell background colors | Cell completion marks; crosses hidden by lines |
| Remembered Length (`remlen`) | `pzprv3.2` | Lines, crosses and direction marks, including marks on lines | Cell background and completion marks |
| NIKOJI (`nikoji`), FourCells (`fourcells`), Lohkous (`lohkous`), Aho-ni-Narikire (`aho`), Fillmat (`fillmat`), Nawabari (`nawabari`), Yajitatami (`yajitatami`) | `pzprv3.1` (FourCells), `pzprv3` (others) | Answer and auxiliary borders, including both on the same border | Cell background and completion marks |
| Tri-place (`triplace`) | `pzprv3` | Answer and auxiliary borders, cell background colors | Cell completion marks |
| L-route (`loute`), Tren (`tren`) | `pzprv3` | Answer and auxiliary borders and cell marks | Cell completion marks; L-route clues hide cell marks and non-black marks hide shading |
| Cojun (`cojun`), Kazunori Room (`kazunori`), Renban-Madoguchi (`renban`), Meandering Numbers (`meander`), Tontonbeya (`tontonbeya`) | `pzprv3` | Answer numbers, candidates, cell background and completion marks | Candidates, background and completion marks hidden by answers; background hidden by completion marks |
| Symmetry Area (`symmarea`) | `pzprv3` | Answer numbers, candidates, cell background and completion marks, answer and auxiliary borders | Candidates, background and completion marks hidden by answers; background hidden by completion marks |
| Roma (`roma`) | `pzprv3` | Answer arrows and direction masks | Masks hidden by answers |
| Hanare-gumi (`hanare`), Lollipops (`lollipops`) | `pzprv3` | Answer numbers, background and completion marks | Background and completion marks hidden by answers |
| Evolmino (`evolmino`) | `pzprv3` | Squares and dots | Dots hidden by squares |
| Goishi (`goishi`) | `pzprv3` | Picked-up stones and their order | Other cell marks |
| Army Ants (`armyants`) | `pzprv3` | Cell marks, background colors, lines and border crosses | Crosses hidden by lines |
| Takoyaki (`takoyaki`) | `pzprv3` | Cell circles, non-black marks, internal lines, completion marks, border lines and crosses | Crosses hidden by lines |
| Yajisan-Sokoban (`yajisoko`), Heya-Bon (`heyabon`) | `pzprv3` | Cell background and completion marks, lines and crosses; Heya-Bon also saves stationary marks | Crosses hidden by lines |
| Pentopia (`pentopia`) | `pzprv3` | Black cells, non-black marks and piece-bank completion marks | Cell completion marks; non-black marks hidden by shading |
| Bosanowa (`bosanowa`) | `pzprv3` | Answer numbers and border difference numbers | Other cell marks; answers hidden by clues or empty cells |
| Crossstitch (`crossstitch`), Slash Pack (`slashpack`) | `pzprv3` | Diagonal segments and cell auxiliary marks; Crossstitch also saves cell completion and vertex marks | Completion marks hidden by segments; Slash Pack completion marks |
| Disorderly Loop (`disloop`), Nanameguri (`nanameguri`), Mukkonn Enn (`mukkonn`), Crossing Ichimaga (`ichimagax`), Coffee Milk (`coffeemilk`), Mintonette (`mintonette`), Round Trip (`roundtrip`), Turnaround (`turnaround`) | `pzprv3` | Lines and border crosses | Cell background and completion marks; crosses hidden by lines |
| Ovotovata (`ovotovata`), All or Nothing (`nothing`), Myopia (`myopia`), Sheep Wolf Slitherlink (`swslither`), Bunnyhop (`bunnyhop`), Tonttiraja (`tontti`) | `pzprv3.2` (Ovotovata, All or Nothing), `pzprv3.1` (Sheep Wolf Slitherlink), `pzprv3` (others) | Lines, border crosses and cell background marks | Cell completion marks; crosses hidden by lines |
| Train Stations (`trainstations`), Building Walk (`bdwalk`), Kaisu (`kaisu`), Icelom 2 (`icelom2`) | `pzprv3.1` (Kaisu), `pzprv3` (others) | Lines, border crosses and direction marks, including marks on lines | Cell background and completion marks |
| Vertex Slitherlink (`vslither`), Touch Slitherlink (`tslither`) | `pzprv3` | Lines, border crosses, cell background and vertex marks | Cell completion marks; crosses hidden by lines |
| Forest Walk (`forestwalk`), Water Walk (`waterwalk`), Fire Walk (`firewalk`) | `pzprv3` | Lines, border crosses and special-cell answer marks; Fire Walk also saves vertex marks | Cell background and completion marks; crosses hidden by lines |
| Stairwell (`kaidan`), Wittgenstein Briquet (`wittgen`) | `pzprv3` | Cell marks, internal cell lines, completion marks, lines and border crosses | Border crosses hidden by lines |
| Brownies (`brownies`) | `pzprv3` | Lines, border crosses, cell background and completion marks | Border crosses hidden by lines |
| Oyakodori (`oyakodori`) | `pzprv3` | Movement lines and border crosses | Cell answer, background and completion marks; crosses hidden by lines |
| Balloon Box (`balloon`) | `pzprv3` | Answer and auxiliary borders, lines and border crosses | Cell background and completion marks; border marks may overlap according to the native file |
| Ladders (`ladders`) | `pzprv3.1` | Bars, lines, border crosses and cell background marks | Cell completion marks; crosses hidden by lines |
| Kurarin (`kurarin`) | `pzprv3` | Black cells, non-black marks, lines and border crosses | Cell completion marks; non-black marks hidden by shading and crosses hidden by lines |
| Taj Mahal (`tajmahal`) | `pzprv3` | Free segments and their centers | — |
| Uso-tatami (`usotatami`), KaitoRamma (`kramma`), New KaitoRamma (`kramman`), Family Photo (`familyphoto`), Fractional Division (`fracdiv`), Sashikazune (`sashikazune`), Mirror Block (`mirrorbk`) | `pzprv3` | Answer and auxiliary borders, including both on the same border; Sashikazune also saves cell background marks | Cell completion marks; other cell background marks |
| Norinuri (`norinuri`), Parquet (`parquet`), Tetro Chain-Y (`tetrochain`), Kuromenbun (`kuromenbun`), Nuri-uzu (`nuriuzu`), Tile City (`tilecity`), Martini (`martini`) | `pzprv3.1` (Martini), `pzprv3` (others) | Black cells and non-black marks | Cell completion marks; non-black marks hidden by shading |
| Cross the Streams (`cts`) | `pzprv3` | Black cells, non-black marks and outside-clue completion marks | Cell completion marks; non-black marks hidden by shading |
| Penta Touch (`pentatouch`), Battleship (`battleship`), Snake Egg (`snakeegg`) | `pzprv3` | Black cells, non-black marks and piece-bank completion; Battleship also saves outside-clue completion and Snake Egg saves candidates | Cell completion marks except Battleship clue completion; shading hides non-black marks |
| Territory (`teri`), Patchwork (`patchwork`) | `pzprv3` | Black cells, non-black marks and answer and auxiliary borders | Cell completion marks; non-black marks hidden by shading; Territory emits borders only when auxiliary borders exist |
| Mannequin Gate (`mannequin`) | `pzprv3` | Cell answers, non-black marks and candidates | Cell completion marks; non-black marks hidden by answers |
| Diamond Chain (`diamond`) | `pzprv3` | Diamonds, crossed vertices and cell shading and non-black marks | Cell completion marks; mutually exclusive marks follow native FileIO |
| Sukoro-room (`sukororoom`), Simple Gako (`simplegako`), NEWS (`news`), Toichika 2 (`toichika2`) | `pzprv3` | Answer numbers or arrows, cell background and completion marks; Simple Gako and NEWS also save candidates | Candidates, background and completion marks hidden by answers; background hidden by completion marks |
| Arrow Flow (`arrowflow`) | `pzprv3` | Answer arrows and direction masks | Completion marks; masks hidden by answers |
| Kakuru (`kakuru`), Number Rope (`numrope`), San-Anko (`sananko`) | `pzprv3` | Answer numbers, candidates and cell auxiliary marks | Cell completion marks; answers and auxiliary marks hidden by clues, candidates hidden by answers |
| Snake Pit (`snakepit`), Wafusuma (`wafusuma`) | `pzprv3.1` (Wafusuma), `pzprv3` (Snake Pit) | Answer numbers, candidates, cell background and completion marks, answer and auxiliary borders | Candidates, background and completion marks hidden by answers; background hidden by completion marks |
| Key West (`keywest`) | `pzprv3` | Answer numbers, candidates, cell background and completion marks, lines and border crosses | Candidates, background and completion marks hidden by answers; border crosses hidden by lines |
| Magnets (`magnets`) | `pzprv3` | Answer symbols, auxiliary marks and outside-clue completion | Cell completion marks; clues hide cell answers and auxiliary marks hide answer symbols |
| Alternation (`alter`), Mr. OK and Mr. NO (`mrokmrno`), JaTaHoKu (`jatahoku`) | `pzprv3` | Answer numbers, candidates and auxiliary marks; Alternation and Mr. OK and Mr. NO also save completion marks | Marks hidden by clues or answers follow native FileIO precedence |
| Anymino (`anymino`), Archipelago (`archipelago`), Bosnian Road (`bosnianroad`), Bramble (`bramble`), City Space (`cityspace`), Corner Chain (`cornerch`), Creek (`creek`), Disconnection (`disco`), Hasu no Mura (`hasunomura`), Inaba's Island (`island`), Land Measurement (`landmeasure`), Marutaring (`marutaring`), Mirroring Tile (`mrtile`), Nuritwin (`nuritwin`) | `pzprv3.1` (Bramble, Marutaring, Nuritwin), `pzprv3` (others) | Black cells and non-black marks | Cell completion marks; marks hidden by clues or shading follow native FileIO precedence |
| Nibun-nogo (`nibunnogo`) | `pzprv3` | Black and white shading | Cell completion marks |
| Battenberg Painting (`batten`) | `pzprv3` | Black cells, non-black marks and outside-clue completion marks | Cell completion marks; non-black marks hidden by shading |
| Bhai Bahan (`bhaibahan`), Curving Road (`curving`), Fake Arrow (`fakearrow`), Heyajirimisaki (`heyajirimisaki`), Inverse LITSO (`invlitso`), LIX Loop (`lixloop`), Out Of Sight (`outofsight`) | `pzprv3.1` (Inverse LITSO), `pzprv3` (others) | Cell marks, lines and border crosses; Fake Arrow also saves border direction marks | Cell completion marks; overlapping marks follow native FileIO precedence |
| Circuit Walk (`circuitwalk`), Energy Walk (`energywalk`), Morning Walk (`morningwalk`) | `pzprv3` | Lines, border crosses and special-cell answer marks | Cell background and completion marks; crosses hidden by lines |
| Balance Link (`balancelink`), Kuroshiro Loop (`bwloop`), Dotchi Dotchi Loop (`dotchi2`), Elastic Link (`elasticlink`), Golem Grad (`golemgrad`), Line of Sight (`lineofsight`), L-Ring (`lring`), Nurikabe Loop (`nuriloop`), Orbital (`orbital`) | `pzprv3.2` (Dotchi Dotchi Loop), `pzprv3` (others) | Lines and border crosses; Dotchi Dotchi Loop and Nurikabe Loop also save cell background marks | Cell completion marks; crosses hidden by lines |
| Blind Rush (`blindrush`) | `pzprv3` | Answer numbers, cell background and completion marks, lines and border crosses | Candidate numbers; cell marks hidden by answers and crosses hidden by lines |
| Doppelblock (`doppelblock`), Japanese Sums (`japanesesums`) | `pzprv3` | Answer numbers, candidates, black cells and non-black marks | Cell completion marks; marks hidden by clues or answers follow native FileIO precedence |
| Isowatari (`isowatari`) | `pzprv3` | Answer numbers, black cells, non-black and completion marks | Candidate numbers; overlapping marks follow native FileIO precedence |
| Edamame (`edamame`) | `pzprv3` | Cell marks, internal cell lines, completion marks, lines and border crosses | Border crosses hidden by lines |
| Distopia (`distopia`), Kissing Polyominoes (`kissing`) | `pzprv3` | Black cells, non-black marks and piece-bank completion marks | Cell completion marks; non-black marks hidden by shading |
| Gravel (`gravel`) | `pzprv3` | Black cells, non-black marks and answer and auxiliary borders | Cell completion marks; non-black marks hidden by shading |
| Hamle Paths (`hamlepaths`) | `pzprv3` | Movement lines, border crosses, cell background, completion and stationary marks | Crosses hidden by lines |
| Heavy Dots (`heavydots`), Narrowfence (`narrow`), The Longest (`longest`) | `pzprv3` | Answer and auxiliary borders | Cell background and completion marks; The Longest uses mutually exclusive border marks |
| Heyapin (`heyapin`) | `pzprv3.1` | Pins and crossed vertices | Cell background and completion marks |
| Korokoro Ball Place (`korokoro`) | `pzprv3` | Black cells, non-black marks and candidate numbers | Cell completion marks; marks hidden by blocked cells or shading |
| Meidjuluk (`meidjuluk`) | `pzprv3` | Answer and auxiliary borders, candidate numbers and piece-bank completion marks | Cell shading, background and completion marks |
| Number City (`numcity`) | `pzprv3` | Answer numbers, candidates, cell background and completion marks, answer and auxiliary borders | Candidates, background and completion marks hidden by answers; background hidden by completion marks |
| Oasis (`oasis`) | `pzprv3` | Black cells, non-black and completion marks, auxiliary lines and border crosses | Mutually exclusive cell marks; crosses hidden by lines |

Slitherlink's full-clue variant, Masyu's Ura-masyu mode and other puzzle types are not currently supported. Ura-masyu reverses the pearl rules but its setting is not stored in native files, so a state cannot identify that mode. Yajilin's `b` display flag is supported. Its `o` rule flag, Aqre's `aqre_borders`, Masyu's, Mid-loop's and Geradeweg's `loop_full`, Arukone's `dontpassallcell`, Country Road's `country_empty`, Fillomino's `fillomino_tri`, Balance Loop's and Tapa-Like Loop's `loop_full` rule settings must match. Akichiwake's `akichi_maximum`, Aquarium's `aquarium_regions`, Koburin's `koburin_minesweeper` and `yajilin_out`, Ice Walk's `loop_full`, Pentominous's `fillomino_tri`, Voxas's `voxas_tatami`, La Paz's `lapaz_liar`, Tren's `tren_new`, and Pentopia's `pentopia_transparent` and piece bank also must match. For these additional puzzles, `loop_full` must match for Disorderly Loop, Ovotovata, Train Stations, Forest Walk, Water Walk, Fire Walk and Turnaround; `slither_full` for Myopia, Sheep Wolf Slitherlink, Vertex Slitherlink and Touch Slitherlink; `fillomino_tri` for Snake Pit and Wafusuma. Bhai Bahan's, Kuroshiro Loop's, Circuit Walk's, Energy Walk's, Morning Walk's and L-Ring's `loop_full`, Line of Sight's `slither_full`, Heyapin's `heyapin_overlap`, Distopia's `pentopia_transparent`, LIX Loop's `yajilin_out`, and Number City's `fillomino_tri` must match. Nuri-uzu's `nuriuzu_connect`, Building Walk's `bdwalk_height`, Balloon Box's `balloon_adjacent`, Magnets' `magnets_anti`, NEWS's `tren_new`, and each puzzle's piece bank must also match.

## Importing progress

Import first checks that the type, dimensions, clues, region boundaries and rule flags match the open puzzle. Invalid or mismatched input does not change the board. A successful import **replaces** the current player progress: it has the effect of clearing the board to the initial puzzle and applying the marks in the state. Existing marks that are absent from the state, including marks the file format cannot save, are cleared. An active trial ends on import. Import is one undoable operation, so Undo restores the previous board, including trial marks, and Redo restores the imported state. Continue playing normally after importing. Use the puzzle's Check button when you want to check the answer.

**Show board changes** displays the native operations produced by the import; these are not the original solving steps. State does not store operation history, the session timer or transient highlights.

## URL and encoding

```text
/p?state=STATE&PUZZLE/cols/rows/clues
```

`STATE` is the UTF-8 native pzpr text compressed with raw DEFLATE and encoded as unpadded URL-safe Base64. Encoding and decoding happen locally using the browser's `CompressionStream` and `DecompressionStream` with `deflate-raw` support. Manual import also accepts plain pzpr text or Base64 using raw DEFLATE or zlib. State imports use the supported native file version for each puzzle.

A newly exported state link does not include a `trace` parameter. For existing URLs with both parameters, a nonempty `trace` takes precedence even if loading it fails; paste the state into the import dialog to apply it manually. With no nonempty trace, a nonempty state is applied automatically.

Old state links remain readable. Older Slitherlink exports omitted crosses and background colors, so those marks cannot be recovered from an old link; importing it clears the corresponding current marks.

## Implementation and verification

- [`src-ui/state.js`](../src-ui/state.js): shared native-file validation, compression, diff and undoable application.
- [`src-ui/state-profiles/`](../src-ui/state-profiles/): per-puzzle field profiles, including marks to clear that FileIO does not persist. `state.js` registers the profiles for Node; the UI build bundles the directory into `state-profiles.js`.
- [`src-ui/trace.js`](../src-ui/trace.js) and [`src-ui/p.html`](../src-ui/p.html): URL handling and dialogs.
- [`test/state/`](../test/state/) and [`test/fixtures/`](../test/fixtures/): round trips, replacement, undo/redo, matching and examples.

To add a puzzle, inspect its native `FileIO`, player input and operations. Group profiles by their state semantics, such as shading or answer numbers, and define the native file version and every player field needed to reproduce a fresh-board import, including fields that must be cleared because FileIO does not save them. The shared engine also supports native segment operations (`segments: true`) and piece-bank completion marks (`bank: true`). Node and the UI both load the grouped profiles. Scalar fields default to zero unless the profile specifies `empty`; candidate-number slots default to −1. Test native export equality, empty and partial states, supported marks, clearing existing and opposite marks, undo/redo, foreign clues and rules, and compressed round trips.

From the repository root, with Node.js 24 or newer:

```sh
npm run build
npx mocha 'test/state/*_test.js' test/trace_replay_test.js
```

The tests read `dist/js/pzpr.js`; rebuild after core changes.
