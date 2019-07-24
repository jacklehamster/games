const WorldMap = (() => {

	const HORIZONTAL = 0;
	const VERTICAL = 1;
	const BEFORE = 0;
	const AFTER = 1;

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
			const { id } = element;
			delete elementHashes[BEFORE][id];
			delete elementHashes[AFTER][id];
		}
	}

	class Area {
		constructor(worldmap, left, right, top, bottom) {
			this.left = left;
			this.right = right;
			this.top = top;
			this.bottom = bottom;
			this.leftLine = 0;
			this.rightLine = 0;
			this.topLine = 0;
			this.bottomLine = 0
			this.worldmap = worldmap;
			this.elementHash = {};
		}

		checkElement(element, left, right, top, bottom) {
			if (Area.intersect(element, left, right, top, bottom)) {
				this.elementHash[element.id] = element;
			} else {
				this.removeElement(element);
			}
		}

		static intersect(element, left, right, top, bottom) {
			const range = element.range;
			return range.left <= right && range.right >= left
				&& range.top <= bottom && range.bottom >= top;
		}

		removeElement(element) {
			const { id } = element;
			if (this.elementHash[id]) {
				delete this.elementHash[id];
			}
		}

		setLines(leftLine, rightLine, topLine, bottomLine) {
			this.leftLine = leftLine;
			this.rightLine = rightLine;
			this.topLine = topLine;
			this.bottomLine = bottomLine;
		}

		getElements() {
			return this.elementHash;
		}

		update(range) {
			const { left, right, top, bottom } = range;
			const verticleLines = this.worldmap.lineGroups[VERTICAL];
			if (left < this.left) {
				for (let l = this.leftLine; l >= 0; l--) {
					const { position, elementHashes } = verticleLines[l];
					const elementsNew = elementHashes[BEFORE];
					for (let e in elementsNew) {
						this.checkElement(elementsNew[e], left, right, top, bottom);
					}
					this.leftLine = l;
					if (position < left) {
						break;
					}
				}
			} else if (left > this.left) {
				for (let l = this.leftLine; l < verticleLines.length; l++) {
					const { position, elementHashes } = verticleLines[l];
					if (position > left) {
						break;
					}
					const elementsGone = elementHashes[BEFORE];
					for (let e in elementsGone) {
						this.removeElement(elementsGone[e]);
					}
					this.leftLine = l;
				}
			}
			this.left = left;
			if (right > this.right) {
				for (let l = this.rightLine; l < verticleLines.length; l++) {
					const { position, elementHashes } = verticleLines[l];
					const elementsNew = elementHashes[AFTER];
					for (let e in elementsNew) {
						this.checkElement(elementsNew[e], left, right, top, bottom);
					}
					this.rightLine = l;
					if (position > right) {
						break;
					}
				}
			} else if (right < this.right) {
				for (let l = this.rightLine; l >=0; l--) {
					const { position, elementHashes } = verticleLines[l];
					if (position < right) {
						break;
					}
					const elementsGone = elementHashes[AFTER];
					for (let e in elementsGone) {
						this.removeElement(elementsGone[e]);
					}
					this.rightLine = l;
				}

			}
			this.right = right;

			const horizontalLines = this.worldmap.lineGroups[HORIZONTAL];
			if (top < this.top) {
				for (let l = this.topLine; l >= 0; l--) {
					const { position, elementHashes } = horizontalLines[l];
					const elementsNew = elementHashes[BEFORE];
					for (let e in elementsNew) {
						this.checkElement(elementsNew[e], left, right, top, bottom);
					}
					this.topLine = l;
					if (position < top) {
						break;
					}
				}
			} else if (top > this.top) {
				for (let l = this.topLine; l < horizontalLines.length; l++) {
					const { position, elementHashes } = horizontalLines[l];
					if (position > top) {
						break;
					}
					const elementsGone = elementHashes[BEFORE];
					for (let e in elementsGone) {
						this.removeElement(elementsGone[e]);
					}
					this.topLine = l;
				}
			}
			this.top = top;
			if (bottom > this.bottom) {
				for (let l = this.bottomLine; l < horizontalLines.length; l++) {
					const { position, elementHashes } = horizontalLines[l];
					const elementsNew = elementHashes[AFTER];
					for (let e in elementsNew) {
						this.checkElement(elementsNew[e], left, right, top, bottom);
					}
					this.bottomLine = l;
					if (position > bottom) {
						break;
					}
				}
			} else if (bottom < this.bottom) {
				for (let l = this.bottomLine; l >= 0; l--) {
					const { position, elementHashes } = horizontalLines[l];
					if (position < bottom) {
						break;
					}
					const elementsGone = elementHashes[AFTER];
					for (let e in elementsGone) {
						this.removeElement(elementsGone[e]);
					}
					this.bottomLine = l;
				}
			}
			this.bottom = bottom;
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
		}

		add(element) {
			const { range } = element; 
			const { left, right, top, bottom } = range ? range : INFINITY_RANGE;
			this.findLineOrCreate(left, VERTICAL).addElement(element, 0, 1);
			this.findLineOrCreate(right, VERTICAL).addElement(element, 1, 0);
			this.findLineOrCreate(top, HORIZONTAL).addElement(element, 0, 1);
			this.findLineOrCreate(bottom, HORIZONTAL).addElement(element, 1, 0);
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

		static incrementElementCount(element, inc, elementsCount) {
			if (!elementsCount[element.id]) {
				elementsCount[element.id] = { element, count: 0, };
			}
			elementsCount[element.id].count += inc;
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
				area.checkElement(element, left, right, top, bottom);
			});
			const [ topLine, bottomLine ] = WorldMap.iterate(this.lineGroups[HORIZONTAL], top, bottom, element => {
				//	no need to check. Previous iterate does that.
			});

			area.setLines(leftLine, rightLine, topLine, bottomLine);
			return area;
		}
	}
	WorldMap.HORIZONTAL = HORIZONTAL;
	WorldMap.VERTICAL = VERTICAL;

	injector.register("worldmap", [identity(WorldMap)]);
	return WorldMap;
})();
