// Local solving trace. Playback uses puzzle.undo / puzzle.redo.
(function() {
	var STEP_MS = 400;
	var RATES = [0.125, 0.25, 0.5, 1, 2, 4, 8, 16, 32];

	var playBtn = null;
	var backBtn = null;
	var forwardBtn = null;
	var slowBtn = null;
	var fastBtn = null;
	var slider = null;
	var countEl = null;
	var speedEl = null;
	var playLabel = null;
	var bar = null;
	var menu = null;
	var statusEl = null;
	var importStatusEl = null;
	var nameInput = null;
	var noteInput = null;
	var timeInput = null;
	var elapsedEl = null;
	var textEl = null;
	var importEl = null;
	var linkEl = null;

	var driving = false;
	var playing = false;
	var playTimer = null;
	var realTime = false;
	var speedIndex = 3;
	var barWanted = false;
	var recordHeld = false;
	var seenLength = -1;
	var loadedElapsed = null;
	var mutated = false;
	var traceRequested = false;
	var traceOpening = false;
	var announce = false;
	var pendingElapsed = 0;
	var loadedInfo = { name: "", note: "" };

	function t(key, vars) {
		var text = ui.i18n(key);
		if (!vars) {
			return text;
		}
		for (var name in vars) {
			text = text.split("{" + name + "}").join(String(vars[name]));
		}
		return text;
	}

	function splitSearch() {
		var search = location.search;
		if (search.charAt(0) === "?") {
			search = search.slice(1);
		}
		var trace = "";
		var options = [];
		var matched;
		while ((matched = /^(\w+)=(\w+)&(.*)$/.exec(search))) {
			if (matched[1] === "trace") {
				trace = matched[2];
			} else {
				options.push(matched[1] + "=" + matched[2]);
			}
			search = matched[3];
		}
		return { trace: trace, options: options, puzzle: search };
	}

	function puzzleHasBody() {
		var puzzle = splitSearch().puzzle;
		if (!puzzle || !ui.puzzle) {
			return false;
		}
		var parsed = pzpr.parser.parseURL(puzzle);
		return !!parsed && !!parsed.body;
	}

	function shareSearch(id) {
		var parts = splitSearch();
		var head = ["trace=" + id].concat(parts.options);
		return "?" + head.join("&") + "&" + parts.puzzle;
	}

	function shareHref(id) {
		return location.origin + "/p" + shareSearch(id);
	}

	function elapsedMs() {
		var session = ui.puzzle.getTime();
		if (loadedElapsed === null) {
			return session;
		}
		if (mutated) {
			return loadedElapsed + session;
		}
		return loadedElapsed;
	}

	function buildBody() {
		var text = ui.puzzle.getFileData(pzpr.parser.FILE_PZPR, {
			history: true,
			time: true
		});
		var ms = elapsedMs() | 0;
		return text.replace(/"time":\s*\d+/, '"time": ' + ms);
	}

	function historyFrom(text) {
		var trimmed = text.replace(/^\s+/, "");
		var jsonText = null;
		if (trimmed.charAt(0) === "{") {
			jsonText = trimmed;
		} else {
			var at = text.indexOf("history:");
			if (at < 0) {
				return null;
			}
			jsonText = text.slice(at + "history:".length);
		}
		try {
			return JSON.parse(jsonText);
		} catch (err) {
			return null;
		}
	}

	function stampNow() {
		var date = new Date();
		function pad(num) {
			return (num < 10 ? "0" : "") + num;
		}
		return (
			date.getFullYear() +
			"-" +
			pad(date.getMonth() + 1) +
			"-" +
			pad(date.getDate()) +
			"T" +
			pad(date.getHours()) +
			":" +
			pad(date.getMinutes()) +
			":" +
			pad(date.getSeconds())
		);
	}

	function request(method, url, payload, done) {
		var xhr = new XMLHttpRequest();
		xhr.open(method, url, true);
		xhr.onload = function() {
			var data = null;
			if (xhr.responseText && xhr.responseText.charAt(0) === "{") {
				data = JSON.parse(xhr.responseText);
			}
			done(xhr.status, data);
		};
		xhr.onerror = function() {
			done(0, null);
		};
		if (payload) {
			xhr.setRequestHeader("Content-Type", "application/json");
			xhr.send(JSON.stringify(payload));
		} else {
			xhr.send();
		}
	}

	function rate() {
		return RATES[speedIndex];
	}

	function stepDelay(index) {
		var base = STEP_MS;
		if (realTime) {
			var hist = ui.puzzle.opemgr.history;
			var now = hist[index].time || 0;
			var prev = index > 0 ? hist[index - 1].time || 0 : 0;
			var gap = now - prev;
			if (gap >= 0) {
				base = gap;
			}
		}
		var delay = Math.round(base / rate());
		if (delay < 16) {
			return 16;
		}
		return delay;
	}

	function stopPlay() {
		playing = false;
		if (playTimer !== null) {
			clearTimeout(playTimer);
			playTimer = null;
		}
	}

	function render() {
		if (!slider || !ui.puzzle || !ui.puzzle.opemgr) {
			return;
		}
		var op = ui.puzzle.opemgr;
		slider.max = String(op.history.length);
		slider.value = String(op.position);
		countEl.textContent = op.position + " / " + op.history.length;
		speedEl.textContent = rate() + "x";
		playLabel.textContent = playing ? t("trace.pause") : t("trace.play");
		backBtn.disabled = op.position <= 0;
		forwardBtn.disabled = op.position >= op.history.length;
		slowBtn.disabled = speedIndex <= 0;
		fastBtn.disabled = speedIndex >= RATES.length - 1;
		playBtn.disabled = op.history.length === 0;
	}

	function jumpTo(pos) {
		var puzzle = ui.puzzle;
		var op = puzzle.opemgr;
		if (pos < 0) {
			pos = 0;
		}
		if (pos > op.history.length) {
			pos = op.history.length;
		}
		driving = true;
		while (op.position > pos) {
			if (!puzzle.undo()) {
				break;
			}
		}
		while (op.position < pos) {
			if (!puzzle.redo()) {
				break;
			}
		}
		driving = false;
		render();
	}

	function queueStep() {
		if (!playing) {
			return;
		}
		var op = ui.puzzle.opemgr;
		if (op.position >= op.history.length) {
			stopPlay();
			render();
			return;
		}
		playTimer = setTimeout(function() {
			playTimer = null;
			if (!playing) {
				return;
			}
			jumpTo(ui.puzzle.opemgr.position + 1);
			queueStep();
		}, stepDelay(op.position));
	}

	function startPlay(rewindIfDone) {
		var op = ui.puzzle.opemgr;
		if (op.history.length === 0) {
			return;
		}
		if (rewindIfDone && op.position >= op.history.length) {
			jumpTo(0);
		}
		if (ui.puzzle.opemgr.position >= ui.puzzle.opemgr.history.length) {
			render();
			return;
		}
		playing = true;
		queueStep();
		render();
	}

	function syncShowItem() {
		var item = document.getElementById("menu_trace_show");
		if (item) {
			item.className = barWanted ? "checked" : "check";
		}
		var realItem = document.getElementById("menu_trace_real");
		if (realItem) {
			realItem.className = realTime ? "checked" : "check";
		}
	}

	function showBar() {
		barWanted = true;
		if (ui.puzzle && !ui.puzzle.editmode) {
			bar.classList.add("on");
		}
		syncShowItem();
		render();
	}

	function hideBar() {
		barWanted = false;
		stopPlay();
		if (bar) {
			bar.classList.remove("on");
		}
		syncShowItem();
		render();
	}

	function changeSpeed(delta) {
		var next = speedIndex + delta;
		if (next < 0 || next >= RATES.length) {
			return;
		}
		speedIndex = next;
		if (playing) {
			if (playTimer !== null) {
				clearTimeout(playTimer);
				playTimer = null;
			}
			queueStep();
		}
		render();
	}

	function sync() {
		if (!bar) {
			return;
		}
		var edit = !!(ui.puzzle && ui.puzzle.editmode);
		if (ui.puzzle) {
			if (edit && !recordHeld) {
				ui.puzzle.opemgr.disableRecord();
				recordHeld = true;
				stopPlay();
			} else if (!edit && recordHeld) {
				ui.puzzle.opemgr.enableRecord();
				recordHeld = false;
			}
		}
		if (edit || !puzzleHasBody()) {
			bar.classList.remove("on");
			menu.style.display = "none";
		} else {
			menu.style.display = "";
			if (barWanted) {
				bar.classList.add("on");
			}
		}
		syncShowItem();
		render();
	}

	function onHistory() {
		if (!driving) {
			stopPlay();
			if (
				seenLength >= 0 &&
				ui.puzzle.opemgr.history.length !== seenLength
			) {
				mutated = true;
			}
		}
		if (ui.puzzle && ui.puzzle.opemgr) {
			seenLength = ui.puzzle.opemgr.history.length;
		}
		render();
	}

	function placeText() {
		var op = ui.puzzle.opemgr;
		var steps = op.history.length;
		if (op.position <= 0) {
			return t("trace.at_start", { steps: steps });
		}
		if (op.position >= steps) {
			return t("trace.at_end", { steps: steps });
		}
		return t("trace.at_step", { steps: steps, pos: op.position });
	}

	function fillLoadMeta() {
		var lines = [];
		if (loadedInfo.name) {
			lines.push(t("trace.name") + loadedInfo.name);
		}
		if (loadedInfo.note) {
			lines.push(t("trace.note") + loadedInfo.note);
		}
		lines.push(placeText());
		document.getElementById("trace_load_meta").textContent = lines.join("\n");
	}

	function centerPopup(pop) {
		var rect = pzpr.util.getRect(pop);
		var left =
			(window.pageXOffset || 0) + (window.innerWidth - rect.width) / 2;
		var top =
			(window.pageYOffset || 0) + (window.innerHeight - rect.height) / 2;
		if (left < 8) {
			left = 8;
		}
		if (top < 8) {
			top = 8;
		}
		pop.style.left = Math.round(left) + "px";
		pop.style.top = Math.round(top) + "px";
	}

	function openLoadPopup() {
		if (!ui.puzzle || ui.puzzle.opemgr.history.length === 0) {
			return;
		}
		ui.popupmgr.open("trace_load", 0, 0);
	}

	function refreshExport() {
		elapsedEl.textContent = t("trace.seconds", {
			n: Math.round(elapsedMs() / 1000)
		});
		textEl.value = buildBody();
	}

	function saveTrace() {
		refreshExport();
		var marked = timeInput.value;
		if (marked.length === 16) {
			marked += ":00";
		}
		request(
			"POST",
			"/api/traces",
			{
				puzzle: splitSearch().puzzle,
				body: textEl.value,
				name: nameInput.value,
				note: noteInput.value,
				marked_at: marked,
				elapsed_ms: elapsedMs() | 0
			},
			function(status, data) {
				if (status !== 201 || !data || !data.id) {
					statusEl.textContent = t("trace.not_saved");
					return;
				}
				linkEl.href = shareHref(data.id);
				linkEl.textContent = linkEl.href;
				linkEl.style.display = "block";
				statusEl.textContent = "";
			}
		);
	}

	function applyHistory(info) {
		var current = info.current || 0;
		var blank = JSON.parse(JSON.stringify(info));
		blank.current = 0;
		var op = ui.puzzle.opemgr;
		driving = true;
		op.disableRecord();
		ui.puzzle.undoall();
		ui.puzzle.ansclear();
		op.enableRecord();
		op.decodeHistory(blank);
		while (ui.puzzle.opemgr.position < current) {
			if (!ui.puzzle.redo()) {
				break;
			}
		}
		driving = false;
		loadedElapsed = typeof info.time === "number" ? info.time : 0;
		loadedInfo = { name: "", note: "" };
		mutated = false;
		seenLength = ui.puzzle.opemgr.history.length;
		importStatusEl.textContent = "";
		sync();
		openLoadPopup();
	}

	function importText() {
		var text = importEl.value;
		var trimmed = text.replace(/^\s+/, "");
		if (!trimmed) {
			importStatusEl.textContent = t("trace.empty");
			return;
		}
		if (trimmed.indexOf("history:") === 0 || trimmed.charAt(0) === "{") {
			var only = historyFrom(trimmed);
			if (!only) {
				importStatusEl.textContent = t("trace.bad");
				return;
			}
			ui.popupmgr.popups.trace_import.close();
			applyHistory(only);
			return;
		}
		var info = historyFrom(text);
		if (!info) {
			importStatusEl.textContent = t("trace.bad");
			return;
		}
		pendingElapsed = typeof info.time === "number" ? info.time : 0;
		loadedInfo = { name: "", note: "" };
		announce = true;
		traceOpening = true;
		driving = true;
		ui.popupmgr.popups.trace_import.close();
		ui.puzzle.open(text);
	}

	function loadTrace(id) {
		request("GET", "/api/traces/" + id, null, function(status, data) {
			if (status !== 200 || !data || !data.body) {
				ui.notify.alert(t("trace.missing"));
				return;
			}
			pendingElapsed = data.elapsed_ms;
			loadedInfo = {
				name: data.name || "",
				note: data.note || ""
			};
			announce = true;
			traceOpening = true;
			driving = true;
			ui.puzzle.open(data.body);
		});
	}

	function onReady() {
		if (!puzzleHasBody()) {
			sync();
			return;
		}
		if (!traceRequested) {
			traceRequested = true;
			var id = splitSearch().trace;
			if (id) {
				loadTrace(id);
			}
		} else if (traceOpening) {
			traceOpening = false;
			loadedElapsed = pendingElapsed;
			mutated = false;
			if (announce) {
				announce = false;
				openLoadPopup();
			}
		}
		seenLength = ui.puzzle.opemgr.history.length;
		driving = false;
		sync();
	}

	function bindControls() {
		bar = document.getElementById("trace_recbar");
		menu = document.getElementById("menu_trace");
		playBtn = document.getElementById("trace_recplay");
		backBtn = document.getElementById("trace_recback");
		forwardBtn = document.getElementById("trace_recfwd");
		slowBtn = document.getElementById("trace_recslow");
		fastBtn = document.getElementById("trace_recfast");
		slider = document.getElementById("trace_recpos");
		countEl = document.getElementById("trace_reclabel");
		speedEl = document.getElementById("trace_recspeed");
		playLabel = document.getElementById("trace_recplay_label");
		statusEl = document.getElementById("trace_status");
		importStatusEl = document.getElementById("trace_import_status");
		nameInput = document.trace_export.name;
		noteInput = document.trace_export.note;
		timeInput = document.trace_export.marked;
		elapsedEl = document.getElementById("trace_elapsed");
		textEl = document.trace_export.ta;
		importEl = document.trace_import.ta;
		linkEl = document.getElementById("trace_link");

		playBtn.addEventListener("click", function() {
			if (playing) {
				stopPlay();
				render();
			} else {
				startPlay(true);
			}
		});
		backBtn.addEventListener("click", function() {
			stopPlay();
			jumpTo(ui.puzzle.opemgr.position - 1);
		});
		forwardBtn.addEventListener("click", function() {
			stopPlay();
			jumpTo(ui.puzzle.opemgr.position + 1);
		});
		slowBtn.addEventListener("click", function() {
			changeSpeed(-1);
		});
		fastBtn.addEventListener("click", function() {
			changeSpeed(1);
		});
		slider.addEventListener("input", function() {
			stopPlay();
			jumpTo(+slider.value);
		});
	}

	function setRealTime(next) {
		realTime = next;
		syncShowItem();
		if (!playing) {
			render();
			return;
		}
		if (playTimer !== null) {
			clearTimeout(playTimer);
			playTimer = null;
		}
		queueStep();
		render();
	}

	function applyTraceText() {
		if (!backBtn) {
			return;
		}
		backBtn.textContent = t("trace.back");
		slowBtn.textContent = t("trace.slower");
		fastBtn.textContent = t("trace.faster");
		forwardBtn.textContent = t("trace.forward");
		document.getElementById("trace_recplay_play").textContent = t("trace.play");
		document.getElementById("trace_recplay_pause").textContent = t(
			"trace.pause"
		);
		var loadPop = document.getElementById("trace_load_pop");
		if (loadPop && loadPop.style.display === "inline") {
			fillLoadMeta();
		}
		render();
	}

	var displayAll = ui.displayAll;
	ui.displayAll = function() {
		displayAll.call(ui);
		applyTraceText();
	};

	ui.menuarea.trace_show = function() {
		if (!puzzleHasBody() || ui.puzzle.editmode) {
			return;
		}
		if (barWanted) {
			hideBar();
		} else {
			showBar();
		}
	};

	ui.menuarea.trace_realtime = function() {
		if (!puzzleHasBody() || ui.puzzle.editmode) {
			return;
		}
		setRealTime(!realTime);
	};

	ui.popupmgr.addpopup("trace_load", {
		formname: "trace_load",
		show: function(px, py) {
			ui.popupmgr.popups.template.show.call(this, px, py);
			fillLoadMeta();
			centerPopup(this.pop);
		},
		from_start: function() {
			this.close();
			showBar();
			jumpTo(0);
			startPlay(false);
		},
		from_here: function() {
			this.close();
			showBar();
			startPlay(false);
		}
	});

	ui.popupmgr.addpopup("trace_export", {
		formname: "trace_export",
		show: function(px, py) {
			ui.popupmgr.popups.template.show.call(this, px, py);
			nameInput.value = "";
			noteInput.value = "";
			timeInput.value = stampNow();
			linkEl.style.display = "none";
			linkEl.removeAttribute("href");
			statusEl.textContent = "";
			refreshExport();
		},
		save: function() {
			saveTrace();
		}
	});

	ui.popupmgr.addpopup("trace_import", {
		formname: "trace_import",
		show: function(px, py) {
			ui.popupmgr.popups.template.show.call(this, px, py);
			importStatusEl.textContent = "";
		},
		read: function() {
			importText();
		}
	});

	bindControls();
	applyTraceText();

	pzpr.on("load", function() {
		if (!ui.puzzle) {
			return;
		}
		ui.puzzle.on("ready", onReady);
		ui.puzzle.on("mode", sync);
		ui.puzzle.on("history", onHistory);
		if (ui.puzzle.ready) {
			onReady();
		}
	});
})();
