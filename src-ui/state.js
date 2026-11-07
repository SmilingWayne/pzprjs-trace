/* global module, require */
// Native puzzle states for supported puzzle types.
(function(root, factory) {
	if (typeof module !== "undefined" && module.exports) {
		var yajilin = require("./state-profiles/yajilin");
		var shading = require("./state-profiles/shading");
		var numbers = require("./state-profiles/numbers");
		var lines = require("./state-profiles/lines");
		var partitions = require("./state-profiles/partitions");
		module.exports = factory(
			Object.assign(
				{
					slither: require("./state-profiles/slither"),
					nurikabe: require("./state-profiles/nurikabe"),
					lightup: require("./state-profiles/lightup")
				},
				yajilin,
				shading,
				numbers,
				lines,
				partitions
			)
		);
	} else {
		root.puzzleState = factory(root.stateProfiles);
	}
})(this, function(profiles) {
	var MAX_TEXT = 1024 * 1024;

	function checkPuzzle(puzzle) {
		var profile = Object.prototype.hasOwnProperty.call(profiles, puzzle.pid)
			? profiles[puzzle.pid]
			: null;
		if (!profile || (profile.supported && !profile.supported(puzzle))) {
			throw Error("State is not supported for this puzzle or variant.");
		}
		return profile;
	}

	function clone(puzzle) {
		var result = new puzzle.pzpr.Puzzle({ type: "player" });
		result.open(puzzle.getFileData(puzzle.pzpr.parser.FILE_PZPR));
		if (!result.ready) {
			throw Error("Could not open the puzzle state.");
		}
		return result;
	}

	function clean(puzzle) {
		var profile = checkPuzzle(puzzle);
		puzzle.opemgr.disableRecord();
		profile.fields.forEach(function(field) {
			var pieces = puzzle.board[field.group];
			for (var i = 0; i < pieces.length; i++) {
				if (field.pos !== undefined) {
					pieces[i].setdata2(field.property, field.pos, -1, true);
				} else {
					pieces[i].setdata(
						field.property,
						field.empty === undefined ? 0 : field.empty,
						true
					);
				}
			}
		});
		if (profile.segments) {
			puzzle.board.segment.ansclear();
		}
		if (profile.bank) {
			puzzle.board.bank.pieces.forEach(function(piece) {
				piece.qcmp = 0;
			});
		}
		puzzle.opemgr.enableRecord();
	}

	function file(puzzle) {
		return puzzle.getFileData(puzzle.pzpr.parser.FILE_PZPR);
	}

	function normalized(text) {
		return text
			.trim()
			.split(/\r?\n/)
			.map(function(line) {
				return line.trim().replace(/\s+/g, " ");
			})
			.join("\n");
	}

	function exportText(puzzle) {
		checkPuzzle(puzzle);
		return file(puzzle);
	}

	function target(puzzle, text) {
		var profile = checkPuzzle(puzzle);
		var header = text.split(/\r?\n/, 2);
		if (
			text.length > MAX_TEXT ||
			header[0] !== profile.header ||
			header[1] !== puzzle.pid
		) {
			throw Error("Invalid " + profile.name + " state file.");
		}
		// Check dimensions before parsing to avoid allocating a board from untrusted input.
		var lines = text.split(/\r?\n/);
		if (
			+lines[2] !== puzzle.board.rows ||
			(profile.square ? +lines[2] : +lines[3]) !== puzzle.board.cols
		) {
			throw Error("The state belongs to a different puzzle.");
		}
		var copy = new puzzle.pzpr.Puzzle({ type: "player" }).open(text);
		checkPuzzle(copy);
		if (!copy.ready) {
			throw Error("Could not open the puzzle state.");
		}
		if (normalized(file(copy)) !== normalized(text)) {
			throw Error("Invalid " + profile.name + " state file.");
		}
		var original = clone(puzzle);
		var blank = clone(copy);
		clean(original);
		clean(blank);
		if (normalized(file(original)) !== normalized(file(blank))) {
			throw Error("The state belongs to a different puzzle.");
		}
		return copy;
	}

	function segmentKey(seg) {
		return [seg.bx1, seg.by1, seg.bx2, seg.by2, seg.ox, seg.oy].join(",");
	}

	function changes(puzzle, desired) {
		var profile = checkPuzzle(puzzle);
		var ops = [];
		if (puzzle.opemgr.trialpos.length) {
			ops.push(
				new puzzle.klass.TrialFinalizeOperation(puzzle.opemgr.trialpos.slice())
			);
		}
		profile.fields.forEach(function(field) {
			var pieces = puzzle.board[field.group];
			var targetPieces = desired.board[field.group];
			for (var i = 0; i < pieces.length; i++) {
				var piece = pieces[i];
				var current = piece[field.property];
				var value = targetPieces[i][field.property];
				if (field.pos !== undefined) {
					current = current[field.pos];
					value = value[field.pos];
				}
				if (current !== value) {
					ops.push(
						new puzzle.klass.ObjectOperation(
							piece,
							field.property + (field.pos !== undefined ? field.pos : ""),
							current,
							value
						)
					);
				}
			}
		});
		if (profile.segments) {
			var currentSegments = puzzle.board.segment;
			var desiredSegments = desired.board.segment;
			var currentKeys = Array.prototype.map.call(currentSegments, segmentKey);
			var desiredKeys = Array.prototype.map.call(desiredSegments, segmentKey);
			if (currentKeys.join(";") !== desiredKeys.join(";")) {
				for (var s = currentSegments.length - 1; s >= 0; s--) {
					ops.push(new puzzle.klass.SegmentOperation(currentSegments[s], 1, 0));
				}
				for (var d = 0; d < desiredSegments.length; d++) {
					ops.push(new puzzle.klass.SegmentOperation(desiredSegments[d], 0, 1));
				}
			}
		}
		if (profile.bank) {
			puzzle.board.bank.pieces.forEach(function(piece, i) {
				var value = desired.board.bank.pieces[i].qcmp;
				if (piece.qcmp !== value) {
					ops.push(
						new puzzle.klass.BankPieceOperation(i, "qcmp", piece.qcmp, value)
					);
				}
			});
		}
		return ops;
	}

	function apply(puzzle, ops) {
		puzzle.errclear();
		if (!ops.length) {
			return;
		}
		// A state import must not merge with adjacent player operations.
		var disCombine = puzzle.opemgr.disCombine;
		puzzle.opemgr.newOperation();
		puzzle.opemgr.disCombine = true;
		try {
			ops.forEach(function(op) {
				if (op instanceof puzzle.klass.TrialFinalizeOperation) {
					puzzle.opemgr.add(op);
					op.redo();
					puzzle.opemgr.limitTrialUndo = false;
					puzzle.opemgr.checkexec();
				} else if (profileOperation(op, puzzle, "SegmentOperation")) {
					op.redo(); // SegmentList records the native operation.
				} else if (profileOperation(op, puzzle, "BankPieceOperation")) {
					op.redo();
					puzzle.opemgr.add(op);
				} else {
					var piece = op.getPiece();
					// As with native undo/redo, restore even an incorrect board.
					if (op.pos !== null) {
						piece.setdata2(op.property, op.pos, op.num, true);
					} else {
						piece.setdata(op.property, op.num, true);
					}
				}
			});
		} finally {
			puzzle.opemgr.disCombine = disCombine;
			puzzle.opemgr.lastope = null;
		}
		puzzle.redraw();
	}

	function profileOperation(op, puzzle, name) {
		return puzzle.klass[name] && op instanceof puzzle.klass[name];
	}

	function transform(bytes, stream) {
		var writer = stream.writable.getWriter();
		var reader = stream.readable.getReader();
		var chunks = [];
		var size = 0;
		var write = writer.write(bytes).then(function() {
			return writer.close();
		});
		function read() {
			return reader.read().then(function(part) {
				if (part.done) {
					var result = new Uint8Array(size);
					var offset = 0;
					chunks.forEach(function(chunk) {
						result.set(chunk, offset);
						offset += chunk.length;
					});
					return result;
				}
				size += part.value.length;
				if (size > MAX_TEXT) {
					reader.cancel();
					throw Error("State is too large.");
				}
				chunks.push(part.value);
				return read();
			});
		}
		return Promise.all([write, read()]).then(function(results) {
			return results[1];
		});
	}

	function encode(text) {
		return transform(
			new TextEncoder().encode(text),
			new CompressionStream("deflate-raw")
		).then(function(bytes) {
			var binary = "";
			bytes.forEach(function(byte) {
				binary += String.fromCharCode(byte);
			});
			return btoa(binary)
				.replace(/\+/g, "-")
				.replace(/\//g, "_")
				.replace(/=+$/, "");
		});
	}

	function decode(value, manual) {
		if (manual) {
			value = value.replace(/\s/g, "");
		}
		var pattern = manual ? /^[A-Za-z0-9_+\/-]+={0,2}$/ : /^[A-Za-z0-9_-]+$/;
		if (!pattern.test(value) || value.length > MAX_TEXT) {
			return Promise.reject(Error("Invalid state encoding."));
		}
		var binary = atob(value.replace(/-/g, "+").replace(/_/g, "/"));
		var bytes = new Uint8Array(binary.length);
		for (var i = 0; i < binary.length; i++) {
			bytes[i] = binary.charCodeAt(i);
		}
		var decompressed = transform(bytes, new DecompressionStream("deflate-raw"));
		if (manual) {
			decompressed = decompressed.catch(function() {
				return transform(bytes, new DecompressionStream("deflate"));
			});
		}
		return decompressed.then(function(result) {
			return new TextDecoder("utf-8", { fatal: true }).decode(result);
		});
	}

	return {
		exportText: exportText,
		target: target,
		changes: changes,
		apply: apply,
		encode: encode,
		decode: decode
	};
});
