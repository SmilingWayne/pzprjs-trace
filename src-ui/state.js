/* global module */
// Canonical answer states for supported puzzle types.
(function(root, factory) {
	if (typeof module !== "undefined" && module.exports) {
		module.exports = factory();
	} else {
		root.puzzleState = factory();
	}
})(this, function() {
	var MAX_TEXT = 1024 * 1024;

	// Each field is either part of the answer or an auxiliary mark to clear.
	// Add a puzzle only after verifying its native file format and operations.
	var profiles = {
		slither: {
			name: "Slitherlink",
			header: "pzprv3.1",
			fields: [
				{ group: "cell", property: "qsub", answer: false },
				{ group: "border", property: "qsub", answer: false },
				{ group: "border", property: "line", answer: true }
			]
		},
		nurikabe: {
			name: "Nurikabe",
			header: "pzprv3",
			fields: [
				{ group: "cell", property: "qans", answer: true },
				{ group: "cell", property: "qsub", answer: true }
			]
		}
	};

	function checkPuzzle(puzzle) {
		var profile = Object.prototype.hasOwnProperty.call(profiles, puzzle.pid)
			? profiles[puzzle.pid]
			: null;
		if (
			!profile ||
			(puzzle.pid === "slither" && puzzle.getConfig("slither_full"))
		) {
			throw Error("Only standard Slitherlink and Nurikabe are supported.");
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

	function clean(puzzle, clearAnswers) {
		var profile = checkPuzzle(puzzle);
		puzzle.opemgr.disableRecord();
		profile.fields.forEach(function(field) {
			if (!field.answer || clearAnswers) {
				var pieces = puzzle.board[field.group];
				for (var i = 0; i < pieces.length; i++) {
					pieces[i].setdata(field.property, 0);
				}
			}
		});
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
		var copy = clone(puzzle);
		clean(copy, false);
		return file(copy);
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
		if (+lines[2] !== puzzle.board.rows || +lines[3] !== puzzle.board.cols) {
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
		var canonical = exportText(copy);
		var original = clone(puzzle);
		clean(original, true);
		clean(copy, true);
		if (normalized(file(original)) !== normalized(file(copy))) {
			throw Error("The state belongs to a different puzzle.");
		}
		return new puzzle.pzpr.Puzzle({ type: "player" }).open(canonical);
	}

	function changes(puzzle, desired) {
		var profile = checkPuzzle(puzzle);
		var ops = [];
		profile.fields.forEach(function(field) {
			var pieces = puzzle.board[field.group];
			var targetPieces = desired.board[field.group];
			for (var i = 0; i < pieces.length; i++) {
				var piece = pieces[i];
				var value = field.answer ? targetPieces[i][field.property] : 0;
				if (piece[field.property] !== value) {
					ops.push(
						new puzzle.klass.ObjectOperation(
							piece,
							field.property,
							piece[field.property],
							value
						)
					);
				}
			}
		});
		return ops;
	}

	function apply(puzzle, ops) {
		if (!ops.length) {
			return;
		}
		puzzle.opemgr.newOperation();
		ops.forEach(function(op) {
			var piece = op.getPiece();
			piece.setdata(op.property, op.num);
		});
		puzzle.redraw();
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
