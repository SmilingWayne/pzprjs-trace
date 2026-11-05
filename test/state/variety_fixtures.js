var h = require("./helpers");
var profiles = Object.assign(
	{},
	require("../../src-ui/state-profiles/shading"),
	require("../../src-ui/state-profiles/numbers"),
	require("../../src-ui/state-profiles/lines"),
	require("../../src-ui/state-profiles/partitions")
);
// These groups select the test setup: explicit marks, profile-based marks, or
// per-field mark scanning. All samples use their native puzzle URLs.
var direct = {
	skyscrapers: "4/4/k13h4j3g",
	sukoro: "5/5/2a2c4a2g2a4c2a2",
	snake: "4/4/060300g1h4i",
	kaero: "3/3/egh0BCBcAaA",
	cbanana: "5/5/g13t6h6i1",
	nanro: "4/4/6r0s1oi13n1h",
	yinyang: "5/5/016612300",
	compass: "5/5/l2.21g.2.4m.4.3g.1..l",
	tawa: "5/5/0/a2b2b3g5b2c2",
	kropki: "4/4/aa7fioco",
	tapaloop: "6/6/g3t+32hart2g",
	icelom: "a/6/6/9e50an10i3zl2g1i/15/4",
	dosufuwa: "5/5/7pnsmrhf31d1",
	balance: "5/5/g9m1k0m8g",
	toichika: "4/4/n70kt84j",
	haisu: "5/5/1551688s120mg2n1g2g3n1g",
	rectslider: "6/6/2h2.4.t.j.g1g3g3i",
	detour: "6/5/i5rpid6hgqh423",
	juosan: "5/5/8mdnvues132g213g22g",
	guidearrow: "4/4/33i3ele"
};
var profiled = {
	statuepark: "7/7/078ii6000000290f0//t",
	akichi: "6/6/lll199007rs11434g1g0",
	hakoiri: "5/5/4qb44qb41c3c1f23a2b1b1",
	minarism: "4/4/hhhq21pgi",
	tents: "5/5/2g0h1i1j82323",
	amibo: "5/5/2c4a.c3f.3f",
	aquarium: "4/4/bu8i90/i3213g",
	maxi: "6/6/2859nc6dh1oi6g21",
	putteria: "6/6/2anr5pu5r2pezv",
	railpool: "5/5/k12s1r300q5i41k80h0000g",
	bonsan: "c/5/5/i.h.i2i.i3h2i",
	koburin: "5/5/clcbg.n",
	nagenawa: "6/6/alrrlafbaaqu3011314g223h",
	scrin: "6/6/g2h.zl.h4g",
	cocktail: "6/6/2aaaaauco3o043g12513",
	interbd: "6/6/n0i-21h-18g-21pah-16j",
	walllogic: "5/5/h1k2g2i5g5k4h",
	easyasabc: "4/4/3/1m2h3g3h",
	araf: "5/5/457m3i8ma57",
	onsen: "6/6/8828887vvsu03v2.w",
	box: "5/5/7a9979672f",
	icewalk: "4/4/8hi0i5p1g",
	heteromino: "5/5/d7b7a7b7b77c7d",
	satogaeri: "4/4/94g1g02m1h.j",
	doubleback: "4/4/14063o",
	mejilink: "4/4/g9rm4",
	pentominous: "5/5/g4g2h4g4o4l",
	voxas: "5/5/hdhbhchbk7dh8bi",
	squarejam: "6/6/i3s32s1i",
	lapaz: "6/6/00j20l1l2l02j02",
	makaro: "5/5/lfflu7qdemei2icmb",
	view: "5/5/m401g3g2g101m",
	kuroclone: "6/6/44ii000f01u0a32h13u44c"
};
var scanned = {
	mochinyoro: "5/5/l4g2m2m1",
	circlesquare: "5/5/0799i8010",
	tilepaint: "6/6/mfttf5ovqrrvzv234232243331",
	nondango: "6/6/5jlp72e15tpq2i3ikht0",
	antmill: "6/6/g16k6k6k3k3g2i3h",
	dominion: "5/5/h2l2g3k1h1i2",
	canal: "6/6/3i3h2z4h5i2",
	coral: "5/5/11g11g5k3h3h31j3h2h",
	ququ: "2/2/i13k1i.g",
	lightshadow: "6/6/g54i6k7p1k2i-149g",
	heyablock: "6/6/jllh99207rs02g20g0g2",
	hinge: "5/5/88gh43t0g46g",
	kurochute: "5/5/132k1i1i2k332",
	aquapelago: "6/6/j.zg4g2h4j",
	context: "8/8/h2i1g1o30g1g1k1j1k1g3g33o2g1i1h",
	nothree: "6/6/ien62ezo2ek282aelem",
	kusabi: "5/5/311e2c12c1f3",
	loopsp: "5/5/sgnmn1n1n2njnls",
	ichimaga: "5/5/gdiedgdbic",
	ichimagam: "5/5/7cgegbegbgcc",
	anglers: "5/5/h0j1l1k11g1g9h6i.k3k4",
	pipelinkr: "5/5/ma0j2j0fm",
	remlen: "4/4/1qotl0/13i",
	rassi: "5/5/932287g010004",
	dotchi: "6/6/0402223u0c00231530k21420",
	lither: "4/4/8a638d6c",
	nikoji: "4/4/h1g2h3h2h43g",
	lohkous: "5/5/f2b234m2a31c",
	aho: "6/6/4i264n6j3n223i4",
	fillmat: "5/5/3b3h1h1b4",
	nawabari: "5/5/f0b1f2a1f",
	yajitatami: "5/5/b3233a2222p1233",
	triplace: "5/5/@2m_m@1m_.0.1....11",
	fourcells: "6/6/b1d2a3e3d1f2b2a3b2",
	loute: "5/5/5i3h1h1i1h2h4i5",
	tren: "6/6/l2m0h22h4m1l",
	cojun: "4/4/pd0hsoh3p3h",
	kazunori: "4/4/94g1s0g4k2p2k",
	renban: "4/4/vmok3g1p5g2h",
	meander: "4/4/94g0f0i2n2h4",
	tontonbeya: "4/4/9807i0a12j31a",
	roma: "4/4/augddgb2a12d53a3b",
	hanare: "4/4/jegf6gu3",
	lollipops: "5/5/3m12g3a",
	evolmino: "5/5/i71027000222k44j23344",
	goishi: "6/7/vsten1tvo",
	symmarea: "6/6/g1i1g6i82p53i5g1i4g",
	oneroom: "5/5/cpj600o01h0",
	armyants: "4/4/m38dtgh1g2h43h1g2h",
	takoyaki: "6/6/.1.r915dp.0./",
	yajisoko: "4/4/h.h.-1c..g-15g-18g-13g",
	heyabon: "5/5/co360rr0g1h0g.j121g3h1h.g.g",
	pentopia: "7/6/l6o3bi8q9l5g//t"
};

var samples = Object.assign({}, direct, profiled, scanned);
function open(pid) {
	return h.open(pid + "/" + samples[pid]);
}
function set(piece, field, value) {
	if (field.pos === undefined) {
		piece.setdata(field.property, value, true);
	} else {
		piece.setdata2(field.property, field.pos, value, true);
	}
}
function get(piece, field) {
	return field.pos === undefined
		? piece[field.property]
		: piece[field.property][field.pos];
}
module.exports = {
	direct: direct,
	profiled: profiled,
	scanned: scanned,
	profiles: profiles,
	open: open,
	set: set,
	get: get
};
