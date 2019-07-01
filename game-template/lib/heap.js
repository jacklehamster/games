class Heap {

	constructor(compareFunction) {
		this.compareFunction = compareFunction || ((a, b) => a - b);
		this.array = [ null ];
	}

	add(...elements) {
		elements.forEach(element => {
			this.array.push(element);
			Heap.bubbleUp(this.array, this.array.length - 1, this.compareFunction);
		});
		return this;
	}

	peek(index) {
		return this.array[index];
	}

	pop(index) {
		if (!this.array.length) {
			return null;
		}
		if (typeof(index) === 'undefined') {
			index = 1;
		}

		const element = this.array[index];
		this.array[index] = this.array[this.array.length-1];
		this.array.pop();
		Heap.bubbleDown(this.array, index, this.compareFunction);
		return element;
	}

	size() {
		return array.length;
	}

	static bubbleUp(array, index, compareFunction) {
		if ((index >> 1) === 0) {
			return;
		}
		if (compareFunction(array[index], array[index >> 1]) < 0) {
			const tmp = array[index];
			array[index] = array[index >> 1];
			array[index >> 1] = tmp;
			Heap.bubbleUp(array, index >> 1, compareFunction);
		}
	}

	static childIndices(index) {
		return [index << 1, (index << 1) + 1];
	}

	static bubbleDown(array, index, compareFunction) {
		let [ leftIndex, rightIndex ] = Heap.childIndices(index);
		if (leftIndex >= array.length) {
			return;
		}
		const left = array[leftIndex];
		if (rightIndex >= array.length) {
			rightIndex = index;
		}
		const right = array[rightIndex];
		const childIndex = compareFunction(left, right) < 0 ? leftIndex : rightIndex;

		if (compareFunction(array[index], array[childIndex]) > 0) {
			const tmp = array[index];
			array[index] = array[childIndex];
			array[childIndex] = tmp;
			Heap.bubbleDown(array, childIndex, compareFunction);			
		}
	}

	static test() {
		const h = new Heap();
		h.add(3, 4, 5, 12, .5, 123);
		console.assert(h.pop() === .5, "unexpected output");
		console.assert(h.pop() === 3, "unexpected output");
		console.assert(h.pop() === 4, "unexpected output");
		console.assert(h.pop() === 5, "unexpected output");
		console.assert(h.pop() === 12, "unexpected output");
		console.assert(h.pop() === 123, "unexpected output");
	}
}