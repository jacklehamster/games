const SceneManager = (function() {
	let nextID = 0;
	function generateUID() {
		return nextID++;
	}

	function Scene() {
		this.sprites = {};
		this.callback = function() {};
		this.cachedSprites = [];
	}

	Scene.prototype.clear = function() {
		this.sprites = {};
	}

	Scene.prototype.add = function(nameAndLabel, type, x, y, z, id, now) {
		let sprite = this.sprites[id];
		if (!sprite) {
			const [ name, label ] = nameAndLabel.split('.');
			sprite = {
				name, label: label || "default", type, x, y, z, id: id || generateUID(),
				order: type==='sprite' ? 1 : 0,
			};
			this.sprites[sprite.id] = sprite;
		}
		if (now) {
			sprite.time = now;
		}
	};

	Scene.prototype.setRule = function(callback) {
		this.callback = callback;
	};

	function spriteCompare(a, b) {
		if(a.order !== b.order) {
			return a.order - b.order;
		}
		return a.z - b.z;
	}

	Scene.prototype.getSprites = function(now) {
		this.cachedSprites.length = 0;
		for (let s in this.sprites) {
			const sprite = this.sprites[s];
			if (!sprite.time || sprite.time === now) {
				this.cachedSprites.push(sprite);
			}
		}
		this.cachedSprites.sort(spriteCompare);
		return this.cachedSprites;
	};

	Scene.prototype.applyRule = function(viewPosition, now) {
		const roundX = viewPosition.x;
		const roundZ = viewPosition.z;
		for(let z=Math.max(-4+Math.round(viewPosition.z), -35); z<=4; z++) {
			const limit = Math.max(0, Math.min(5-z, 8));
			const zz = z - Math.round(viewPosition.z);
			for(let x=-limit; x<=limit; x++) {
				const xx = x - Math.round(viewPosition.x);
				this.callback(this, xx, 0, zz, now);
			}
		}
    };

	return {
		Scene,
	};
})();