class GridSlot {
	constructor(width, height) {
		if (!width || !height) {
			throw new Error(`Invalid GridSlot sizes: ${width}x${height}`);
		}
		this.gridSlots = [
			{ index: 0, x: 0, y: 0, width, height, last: true, },
		];
	}

	static splitSlot(slot, splitSquareHorizontally) {
		const { index, x, y, width, height } = slot;
		if (width > height || width === height && !splitSquareHorizontally) {
			return [
				{ index, x, y, width: width/2, height },
				{ index, x: x + width/2, y, width: width/2, height },
			];
		} else if(width < height || width === height && splitSquareHorizontally) {
			return [
				{ index, x, y, width, height: height/2 },
				{ index, x, y: y + height/2, width, height: height/2 },
			];
		}
	}

	static fit(w, h, {width, height}) {
		return w<=width && h<=height;
	}

	static compareSlot(slot1, slot2) {
		const area1 = slot1.width * slot1.height;
		const area2 = slot2.width * slot2.height;
		return area1 - area2;
	}

	getSlot(w, h) {
		const { gridSlots } = this;
		gridSlots.sort(GridSlot.compareSlot);
		for (let i = 0; i < gridSlots.length; i++) {
			let slot = gridSlots[i];
			if (GridSlot.fit(w, h, slot)) {
				if (slot.last) {
					gridSlots.push({
						index: slot.index+1,
						x: slot.x, y: slot.y,
						width: slot.width, height: slot.height,
						last: true,
					});
				}

				gridSlots[i] = gridSlots[gridSlots.length-1];
				gridSlots.pop();
				while(true) {
					const [ slot1, slot2 ] = GridSlot.splitSlot(slot, w > h);

					if (!GridSlot.fit(w, h, slot1)) {
						return slot;
					} else {
						gridSlots.push(slot2);
						slot = slot1;
					}
				}
				break;
			}
		}
		return null;
	}

	putBackSlot(cell) {
		this.gridSlots.push(cell);
	}
}