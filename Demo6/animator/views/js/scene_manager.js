const SceneManager = (function() {
	const CLEAN_FREQUENCY = .1;
	const DEFAULT = 'default';
	function generateUID(scene) {
		return scene.nextID++;
	}

	function Scene() {
		this.nextID = 0;
		this.sprites = {};
		this.revealMap = {};
		this.callbacks = {
			onReveal: function() {},
		};
	}

	function Cell() {
		this.wallX = {};
		this.wallZ = {};
	}

	Cell.create = function() {
		return new Cell();
	}

	Scene.prototype.clear = function() {
		this.sprites = {};
		this.revealMap = {};
		this.setOnReveal(null);
	}

	function checkWall(type, cell, x, z) {
		switch(type) {
			case "leftwall":
				cell.wallX[x-1] = true;
				break;
			case "rightwall":
				cell.wallX[x+1] = true;
				break;
			case "wall":
				cell.wallZ[z+1] = true;
				break;
			case "backwall":
				cell.wallZ[z-1] = true;
				break;
		}
	}

	function addSprite(scene, nameAndLabel, type, x, y, z, cell, id, scale) {
		if(type !== 'backwall') {
			let sprite = scene.sprites[id];
			if (!sprite) {
				sprite = {
					id: id || generateUID(scene),
				};
				scene.sprites[sprite.id] = sprite;
			}
			const [ name, label ] = nameAndLabel.split('.');
			sprite.name = name;
			sprite.label = label || DEFAULT;
			sprite.type = type;
			sprite.order = type==='sprite' ? 1 : 0;
			sprite.x = x;
			sprite.y = y;
			sprite.z = z;
			sprite.cell = cell || null;
			sprite.scale = scale || 1;
		}
	}

	Scene.prototype.canGo = function(x0, z0, x1, z1) {
		const roundX0 = Math.round(x0);
		const roundX1 = Math.round(X1);
		const roundZ0 = Math.round(z0);
		const roundZ1 = Math.round(z1);

		if(Math.abs(x0 - x1) > 1 || Math.abs(z0 - z1) > 1) {
			return false;
		}
		const cell = getCell(this, x0, z0);
		if(cell.wallX[x1] || cell.wallZ[z1]) {
			return false;
		}
		return true;
	} 

	Scene.prototype.add = function(nameAndLabel, type, x, y, z, cell, id, scale) {
		checkWall(type, cell, x, z);
		addSprite(this, nameAndLabel, type, x, y, z, cell, id, scale);
	};

	Scene.prototype.remove = function(id) {
		delete this.sprites[id];
	}

	Scene.prototype.setOnReveal = function(callback) {
		this.callbacks.onReveal = callback || function() {};
	};

	function cleanReveal(revealMap, now, sprites) {
		for(let z in revealMap) {
			for(let x in revealMap[z]) {
				const cell = revealMap[z][x];
				if(cell.time !== now) {
					cleanSprites(sprites, cell);
					delete revealMap[z][x];
				}
			}
		}
	}

	function cleanSprites(sprites, cell) {
		for(let s in sprites) {
			if (sprites[s].cell === cell) {
				delete sprites[s];
			}
		}
	}

	function spriteCompare(a, b) {
		if(a.order !== b.order) {
			return a.order - b.order;
		}
		return a.z - b.z;
	}

	function getCell(scene, x, z) {
		const { revealMap, callbacks } = scene;
		if(!revealMap[z]) {
			revealMap[z] = {};
		}
		let cell = revealMap[z][x];
		if(!cell) {
			cell = revealMap[z][x] = Cell.create();
			callbacks.onReveal(scene, x, z, cell);
		}
		return cell;
	} 

	Scene.prototype.getSprites = function() {
		const spriteArray = Object.values(this.sprites);
		spriteArray.sort(spriteCompare);
		return spriteArray;
	};

	Scene.prototype.refresh = function(viewPosition, now) {
		const { revealMap, callbacks, sprites } = this;
		const roundZ = Math.round(viewPosition.z);
		const roundX = Math.round(viewPosition.x);
		for(let z = -35; z <= 5; z++) {
			const zz = z + roundZ;
			const limit = Math.max(1, Math.min(5 - z, 8));
			for(let x = -limit; x <= limit; x++) {
				const xx = x + roundX;
				getCell(scene, xx, zz).time = now;
			}
		}
		if(Math.random() < CLEAN_FREQUENCY) {
			cleanReveal(revealMap, now, sprites);
		}
    };

	return {
		Scene,
	};
})();