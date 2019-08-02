injector.register("pool", () => {
	class Pool {
		constructor(createCall) {
			this.createCall = createCall;
			this.pool = [];
			this.index = 0;
		}

		get() {
			if (this.index >= this.pool.length) {
				this.pool.push(this.createCall());
			}
			return this.pool[this.index++]; 
		}

		reset() {
			this.index = 0;
		}
	}

	return Pool;
});