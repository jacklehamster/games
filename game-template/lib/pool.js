injector.register("pool", () => {
	const pools = [];

	class Pool {
		constructor(createCall) {
			this.createCall = createCall;
			this.pool = [];
			this.index = 0;
			pools.pop(this);
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

		static resetAll() {
			pools.forEach(pool => pool.reset());
		}
	}

	return Pool;
});
