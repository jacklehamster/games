injector.register("worldmap", [ 
	"utils",
	(Utils) => {

	const HORIZONTAL = 0;
	const VERTICAL = 1;
	const BEFORE = 0;
	const AFTER = 1;

	let tempRange = { left: 0, right: 0, top: 0, bottom: 0 };

	class Line {
		constructor(position) {
			this.elementHashes = [
				{},
				{},
			];
			this.position = position;
		}

		addElement(element, before, after) {
			const { elementHashes } = this;
			const { id } = element;
			if (before) {
				elementHashes[BEFORE][id] = element;
			}
			if (after) {
				elementHashes[AFTER][id] = element;
			}
			if (elementHashes[BEFORE][id] === elementHashes[AFTER][id]) {
				this.removeElement(element);
			}
		}

		removeElement(element) {
			const { elementHashes } = this;
			const { id } = element;
			delete elementHashes[BEFORE][id];
			delete elementHashes[AFTER][id];
		}
	}

	const ADD = 1;
	const REMOVE = 2;
	const UPDATE = 3;

	class Area {
		constructor(worldmap, left, right, top, bottom) {
			this.range = {
				left, right, top, bottom,
			};
			this.lineIndexRange = {
				left: 0, right: 0, top: 0, bottom: 0,
			};
			this.worldmap = worldmap;
			this.elementHash = {};
			this.callbacks = [];
		}

		checkElement(element, range) {
			const { left, right, top, bottom } = range;
			if (Utils.intersect(element.range, left, right, top, bottom)) {
				if (!this.elementHash[element.id]) {
					this.addElement(element, range);
				}
			} else {
				this.removeElement(element, range);
			}
		}

		addElement(element, range) {
			this.elementHash[element.id] = element;	
			this.callbacks.forEach(callback => {
				callback(ADD, element, range);
			});
		}

		removeElement(element, range) {
			const { id } = element;
			if (this.elementHash[id]) {
				delete this.elementHash[id];
				this.callbacks.forEach(callback => {
					callback(REMOVE, element, range);
				});
			}
		}

		updateElement(element, range, oldRange) {
			this.callbacks.forEach(callback => {
				callback(UPDATE, element, range, oldRange);
			});
		}

		setLines(leftLine, rightLine, topLine, bottomLine) {
			this.lineIndexRange.left = leftLine;
			this.lineIndexRange.right = rightLine;
			this.lineIndexRange.top = topLine;
			this.lineIndexRange.bottom = bottomLine;
		}

		getElements() {
			return this.elementHash;
		}

		update(range) {
			const oldRange = { ... this.range };
			const { left, right, top, bottom } = range;
			const verticleLines = this.worldmap.lineGroups[VERTICAL];
			if (left < this.range.left) {
				for (let l = this.lineIndexRange.left; l >= 0; l--) {
					const { position, elementHashes } = verticleLines[l];
					const elementsNew = elementHashes[BEFORE];
					for (let e in elementsNew) {
						this.checkElement(elementsNew[e], range);
					}
					this.lineIndexRange.left = l;
					if (position < left) {
						break;
					}
				}
			} else if (left > this.range.left) {
				for (let l = this.lineIndexRange.left; l < verticleLines.length; l++) {
					const { position, elementHashes } = verticleLines[l];
					if (position > left) {
						break;
					}
					const elementsGone = elementHashes[BEFORE];
					for (let e in elementsGone) {
						this.removeElement(elementsGone[e], range);
					}
					this.lineIndexRange.left = l;
				}
			}
			this.range.left = left;

			if (right > this.range.right) {
				for (let l = this.lineIndexRange.right; l < verticleLines.length; l++) {
					const { position, elementHashes } = verticleLines[l];
					const elementsNew = elementHashes[AFTER];
					for (let e in elementsNew) {
						this.checkElement(elementsNew[e], range);
					}
					this.lineIndexRange.right = l;
					if (position > right) {
						break;
					}
				}
			} else if (right < this.range.right) {
				for (let l = this.lineIndexRange.right; l >=0; l--) {
					const { position, elementHashes } = verticleLines[l];
					if (position < right) {
						break;
					}
					const elementsGone = elementHashes[AFTER];
					for (let e in elementsGone) {
						this.removeElement(elementsGone[e], range);
					}
					this.lineIndexRange.right = l;
				}

			}
			this.range.right = right;

			const horizontalLines = this.worldmap.lineGroups[HORIZONTAL];
			if (top < this.range.top) {
				for (let l = this.lineIndexRange.top; l >= 0; l--) {
					const { position, elementHashes } = horizontalLines[l];
					const elementsNew = elementHashes[BEFORE];
					for (let e in elementsNew) {
						this.checkElement(elementsNew[e], range);
					}
					this.lineIndexRange.top = l;
					if (position < top) {
						break;
					}
				}
			} else if (top > this.range.top) {
				for (let l = this.lineIndexRange.top; l < horizontalLines.length; l++) {
					const { position, elementHashes } = horizontalLines[l];
					if (position > top) {
						break;
					}
					const elementsGone = elementHashes[BEFORE];
					for (let e in elementsGone) {
						this.removeElement(elementsGone[e], range);
					}
					this.lineIndexRange.top = l;
				}
			}
			this.range.top = top;

			if (bottom > this.range.bottom) {
				for (let l = this.lineIndexRange.bottom; l < horizontalLines.length; l++) {
					const { position, elementHashes } = horizontalLines[l];
					const elementsNew = elementHashes[AFTER];
					for (let e in elementsNew) {
						this.checkElement(elementsNew[e], range);
					}
					this.lineIndexRange.bottom = l;
					if (position > bottom) {
						break;
					}
				}
			} else if (bottom < this.range.bottom) {
				for (let l = this.lineIndexRange.bottom; l >= 0; l--) {
					const { position, elementHashes } = horizontalLines[l];
					if (position < bottom) {
						break;
					}
					const elementsGone = elementHashes[AFTER];
					for (let e in elementsGone) {
						this.removeElement(elementsGone[e], range);
					}
					this.lineIndexRange.bottom = l;
				}
			}
			this.range.bottom = bottom;

			const elements = this.getElements();
			for (let id in elements) {
				this.updateElement(elements[id], range, oldRange);
			}
		}

		addCallback(callback) {
			this.callbacks.push(callback);

			const elements = this.getElements();
			for (let id in elements) {
				callback(ADD, elements[id], this.range);
			}
		}

		removeCallback(callback) {
			this.callbacks = this.callbacks.filter(c => c !== callback);
		}

		makeRangeAutoUpdate(rangeSize) {
			const area = this;
			let first = true;
			return (from, to) => {
				const newCell = Utils.checkNewCell(first ? null : from, to);
				first = false;
				if (newCell) {
					const [ x, y, z ] = newCell;
					tempRange.left = x - rangeSize / 2;
					tempRange.right = x + rangeSize / 2;
					tempRange.top = z - rangeSize / 2;
					tempRange.bottom = z + rangeSize / 2;
					area.update(tempRange);
				}
			};
		}				
	}

	const INFINITY_RANGE = { 
		left: Number.NEGATIVE_INFINITY,
		right: Number.POSITIVE_INFINITY,
		top: Number.NEGATIVE_INFINITY,
		bottom: Number.POSITIVE_INFINITY,
	}

	class WorldMap {
		constructor() {
			this.lineGroups = [
				[new Line(Number.NEGATIVE_INFINITY), new Line(Number.POSITIVE_INFINITY)],
				[new Line(Number.NEGATIVE_INFINITY), new Line(Number.POSITIVE_INFINITY)],
			];
			this.idCount = 1;
		}

		add(...elements) {
			elements.forEach(element => {
				const { range } = element; 
				const { left, right, top, bottom } = range ? range : INFINITY_RANGE;
				if (!element.id) {
					element.id = this.idCount++;
				}
				this.findLineOrCreate(left, VERTICAL).addElement(element, 0, 1);
				this.findLineOrCreate(right, VERTICAL).addElement(element, 1, 0);
				this.findLineOrCreate(top, HORIZONTAL).addElement(element, 0, 1);
				this.findLineOrCreate(bottom, HORIZONTAL).addElement(element, 1, 0);
			});
		}

		findLineOrCreate(position, VERTICAL_OR_HORIZONTAL) {
			const lines = this.lineGroups[VERTICAL_OR_HORIZONTAL];
			const lineIndex = WorldMap.binarySearch(position, lines, 0, lines.length - 1);
			
			if (lines[lineIndex].position === position) {
				return lines[lineIndex];
			} else {
				const line = new Line(position);
				lines.splice(lineIndex, 0, line);
				return line;
			}
		}

		static binarySearch(position, lines, first, last) {
			if (first === undefined) {
				first = 0;
				last = lines.length - 1;
			}
			if (first === last) {
				return first;
			}
			const mid = Math.floor((first + last) / 2);
			if (position <= lines[mid].position) {
				return WorldMap.binarySearch(position, lines, first, mid);
			} else {
				return WorldMap.binarySearch(position, lines, mid + 1, last);
			}
		}

		static iterate(lines, start, end, checkCallback) {
			let startLine = null, endLine = null;
			for (let l = 0; l < lines.length; l++) {
				const { position, elementHashes } = lines[l];

				endLine = l;
				if (position > end) {
					break;
				}

				if (position < start) {
					startLine = l;
				}

				const elementsNew = elementHashes[AFTER];
				for (let e in elementsNew) {
					checkCallback(elementsNew[e]);
				}
			}
			return [ startLine, endLine ];
		}

		getArea(range) {
			const {left, right, top, bottom} = range;
			const area = new Area(this, left, right, top, bottom);
			const elementsCount = {};
			const [ leftLine, rightLine ] = WorldMap.iterate(this.lineGroups[VERTICAL], left, right, element => {
				area.checkElement(element, range);
			});
			const [ topLine, bottomLine ] = WorldMap.iterate(this.lineGroups[HORIZONTAL], top, bottom, element => {
				//	no need to check. Previous iterate does that.
			});

			area.setLines(leftLine, rightLine, topLine, bottomLine);
			return area;
		}

		static makeRange(x, y, size) {
			return {
				left: x - size / 2,
				right: x + size / 2,
				top: y - size / 2,
				bottom: y + size / 2,
			};
		}
	}
	WorldMap.HORIZONTAL = HORIZONTAL;
	WorldMap.VERTICAL = VERTICAL;
	WorldMap.ADD = ADD;
	WorldMap.REMOVE = REMOVE;
	WorldMap.UPDATE = UPDATE;

	return WorldMap;
}]);
