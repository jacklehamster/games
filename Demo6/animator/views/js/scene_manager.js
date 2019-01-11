const SceneManager = (function() {
	const CLEAN_FREQUENCY = 1;
	const DEFAULT = 'default';

	function generateUID(scene) {
		return scene.nextID++;
	}

	function Scene() {
		this.clear();
	}

	function Cell() {}
	Recycler.wrap(Cell);

	function Sprite() {}
	Recycler.wrap(Sprite);

	function Wall() {}
	Recycler.wrap(Wall);

	function Coverage(condition, action) {		
		this.condition = condition;
		this.action = action;
	}

	Cell.prototype.init = function(x, z, scene) {
		this.x = x;
		this.z = z;
		this.scene = scene;
		this.constraint = {};
		this.wallX = {};
		this.wallZ = {};
		this.tag = x + "," + z;
		this.recycled = false;
		return this;
	}

	Cell.prototype.addSprite = function(name, label, id, offsetX, offsetY, offsetZ, scale) {
		return Sprite.create(name, label,
			this.x + (offsetX || 0) + .5,
			(offsetY || 0),
			this.z + (offsetZ || 0) + .5,
			this, id, scale);
	}

	Sprite.prototype.init = function(name, label, x, y, z, cell, id, scale, passedScene) {
		const scene = passedScene || cell.scene;
		this.id = id || generateUID(scene);
		scene.sprites[this.id] = this;
		this.name = name;
		this.label = label || DEFAULT;
		this.type = 'sprite';
		this.order = 1;
		this.x = x;
		this.y = y;
		this.z = z;
		this.cell = cell || null;
		this.scale = scale || 1;
		return this;
	}

	Cell.prototype.addWall = function(name, label, type, id, offsetX, offsetY, offsetZ, scale) {
		return Wall.create(name, label,
			this.x + (offsetX || 0),
			(offsetY || 0),
			this.z + (offsetZ || 0),
			this, id, scale,
			type);
	};

	Wall.prototype.init = function(name, label, x, y, z, cell, id, scale, type) {
		const scene = cell.scene;
		this.id = id || generateUID(scene);
		scene.sprites[this.id] = this;
		this.name = name;
		this.label = label || DEFAULT;
		this.type = type;
		this.order = 0;
		this.x = x;
		this.y = y;
		this.z = z;
		this.cell = cell || null;
		this.scale = scale || 1;
		checkWall(type, this.cell, x, z);
		return this;
	};

	Scene.prototype.clear = function() {
		this.nextID = 0;
		this.sprites = {};
		this.revealMap = {};
		this.cellCoverage = [];
		this.cachedPosition = {};
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
				cell.wallZ[z-1] = true;
				break;
			case "backwall":
				cell.wallZ[z+1] = true;
				break;
		}
	}

	Scene.prototype.canGo = function(xFrom, zFrom, xTo, zTo) {
		const cellFrom = this.cell(xFrom, zFrom);
		const cellTo = this.cell(xTo, zTo);
		if (cellFrom === cellTo) return true;

		if(Math.abs(cellFrom.x - cellTo.x) > 1 || Math.abs(cellFrom.z - cellTo.z) > 1) {
			const xMid = (xFrom + xTo) / 2;
			const zMid = (zFrom + zTo) / 2;
			return this.canGo(xFrom, zFrom, xMid, zMid) && this.canGo(xMid, zMid, xTo, zTo);
		}
		if(cellFrom.wallX[cellTo.x] || cellFrom.wallZ[cellTo.z]) {
			return false;
		}
		return true;
	} 

	Scene.prototype.addSprite = function(name, label, x, y, z, id, scale) {
		return Sprite.create(name, label,
			x,
			y,
			z,
			null, id, scale, this);
	};

	Scene.prototype.remove = function(id) {
		delete this.sprites[id];
	}

	Scene.prototype.onReveal = function(condition, action) {
		this.cellCoverage.push(new Coverage(condition === true ? ()=>true : condition, action));
	};

	function cleanReveal(revealMap, now) {
		for(let z in revealMap) {
			for(let x in revealMap[z]) {
				const cell = revealMap[z][x];
				if(cell.time !== now) {
					cell.recycled = true;
					Cell.recycle(cell);
					delete revealMap[z][x];
				}
			}
		}
	}

	function cleanSprites(sprites) {
		for(let s in sprites) {
			if (sprites[s].cell && sprites[s].cell.recycled) {
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

    Scene.prototype.cell = function(x, z) {
    	const xx = Math.floor(x);
    	const zz = Math.floor(z);
		const { revealMap, cellCoverage } = this;
		if(!revealMap[zz]) {
			revealMap[zz] = {};
		}
		let cell = revealMap[zz][xx];
		if(!cell) {
			cell = revealMap[zz][xx] = Cell.create(xx, zz, this);
			for(let c = 0; c < cellCoverage.length; c++) {
				if(cellCoverage[c].condition(xx, zz)) {
					cellCoverage[c].action(cell);
				}
			}
		}
		return cell;
	} 

	const tempSprites = [];
	Scene.prototype.getSprites = function() {
		tempSprites.length = 0;
		for(let s in this.sprites) {
			tempSprites.push(this.sprites[s]);
		}
		tempSprites.sort(spriteCompare);
		return tempSprites;
	};

	Scene.prototype.refresh = function(viewPosition, now) {
		const { revealMap, sprites, cellCoverage, cachedPosition } = this;
		const roundZ = Math.floor(viewPosition.z);
		const roundX = Math.floor(viewPosition.x);
		if(cachedPosition.x !== roundX || cachedPosition.z !== roundZ) {
			cachedPosition.x = roundX;
			cachedPosition.z = roundZ;
			for(let z = -35; z <= 5; z++) {
				const zz = z + roundZ;
				const limit = Math.max(1, Math.min(5 - z, 8));
				for(let x = -limit; x <= limit; x++) {
					scene.cell(x + roundX, zz).time = now;
				}
			}
			if(Math.random() < CLEAN_FREQUENCY) {
				cleanReveal(revealMap, now);
				cleanSprites(sprites);
			}
		}
    };

	return {
		Scene,
	};
})();
