const MIN_GRID_SIZE = 16;

class GridSlot {
	constructor(width, height) {
		if (!width || !height) {
			throw new Error(`Invalid GridSlot sizes: ${width}x${height}`);
		}
		this.gridSlots = [
			{ index: 0, x: 0, y: 0, width, height },
		];
		this.maxIndex = 0;
		this.textureWidth = width;
		this.textureHeight = height;
	}

	splitSlot(slot, splitSquareHorizontally) {
		const { index, x, y, width, height } = slot;
		if (!splitSquareHorizontally) {
			//	split width
			let widthSplit;
			for (widthSplit = this.textureWidth; widthSplit >= width && widthSplit > MIN_GRID_SIZE; widthSplit >>= 1) {}
			const bigWidth = width - widthSplit;

			return [
				{ index, x, y, width: bigWidth, height },
				{ index, x: x + bigWidth, y, width: widthSplit, height },
			];
		} else if(splitSquareHorizontally) {
			// split height
			let heightSplit;
			for (heightSplit = this.textureHeight; heightSplit >= height && heightSplit > MIN_GRID_SIZE; heightSplit >>= 1) {}
			const bigHeight = height - heightSplit;

			return [
				{ index, x, y, width, height: bigHeight },
				{ index, x, y: y + bigHeight, width, height: heightSplit },
			];
		}
	}

	static fit(w, h, {width, height}) {
		return w<=width && h<=height && width >= MIN_GRID_SIZE && height >= MIN_GRID_SIZE;
	}

	static compareSlot(slot1, slot2) {
		const area1 = slot1.width * slot1.height;
		const area2 = slot2.width * slot2.height;
		if (area1 !== area2) {
			return area1 - area2;
		}
		const minSize1 = Math.min(slot1.width, slot1.height);
		const minSize2 = Math.min(slot2.width, slot2.height);
		if (minSize1 !== minSize2) {
			return minSize1 - minSize2;
		}

		return 0;
	}

	getSlot(w, h) {
		const { gridSlots } = this;
		gridSlots.sort(GridSlot.compareSlot);
		for (let i = 0; i < gridSlots.length; i++) {
			let slot = gridSlots[i];
			if (GridSlot.fit(w, h, slot)) {
				gridSlots[i] = gridSlots[gridSlots.length-1];
				gridSlots.pop();

				while(true) {
					const [ smallSlot, bigSlot ] = this.splitSlot(slot, w < h);
					if (GridSlot.fit(w, h, smallSlot)) {
						slot = smallSlot;
						gridSlots.push(bigSlot);
					} else if (GridSlot.fit(w, h, bigSlot)) {
						slot = bigSlot;
						gridSlots.push(smallSlot);
					} else {
						const [ smallSlot, bigSlot ] = this.splitSlot(slot, w >= h);
						if (GridSlot.fit(w, h, smallSlot)) {
							slot = smallSlot;
							gridSlots.push(bigSlot);
						} else if (GridSlot.fit(w, h, bigSlot)) {
							slot = bigSlot;
							gridSlots.push(smallSlot);
						} else {
							return slot;
						}
					}
				}
				break;
			}
		}
		this.maxIndex++;
		gridSlots.push({ index: this.maxIndex, x: 0, y: 0, width: this.textureWidth, height: this.textureHeight });
		return this.getSlot(w, h);
	}

	tryMerge(cell1, cell2) {
		if (cell1.index === cell2.index && (cell1.width === cell2.width || cell1.height === cell2.height)) {
			if (cell1.x === cell2.x && cell1.width === cell2.width
					&& (cell1.y + cell1.height === cell2.y || cell2.y + cell2.height === cell1.y)) {
				// stacked
				const index = cell1.index;
				const x = cell1.x;
				const y = Math.min(cell1.y, cell2.y);
				const width = cell1.width;
				const height = cell1.height + cell2.height;
				return { index, x, y, width, height };
			} else if(cell1.y === cell2.y && cell1.height === cell2.height
					&& (cell1.x + cell1.width === cell2.x || cell2.x + cell2.width === cell1.x)) {
				const index = cell1.index;
				const x = Math.min(cell1.x, cell2.x);
				const y = cell1.y;
				const width = cell1.width + cell2.width;
				const height = cell1.height;
				return { index, x, y, width, height };				
			}
		}
		return null;
	}

	putBackSlot(cell) {
		for (let i = 0; i < this.gridSlots.length; i++) {
			const mergeResult = this.tryMerge(cell, this.gridSlots[i]);
			if (mergeResult !== null) {
				this.gridSlots[i] = this.gridSlots[this.gridSlots.length-1];
				this.gridSlots.pop();
				this.putBackSlot(mergeResult);
				return;
			}
		}
		this.gridSlots.push(cell);
	}
}

injector.register("grid-slot", ["texture-size", "texture-size", GridSlot]);
