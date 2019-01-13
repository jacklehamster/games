const SceneManager = (function() {
	const CLEAN_FREQUENCY = 1;
	const DISTANCE_TO_WALL = .12;
	const LEFT = -1;
	const RIGHT = 1;
	const FAR = -1;
	const CLOSE = 1;
	const OFF_WALL = 1;

	function generateUID(scene) {
		return scene.nextID++;
	}

	function Scene() {
		this.clear();
	}

	function Cell() {}
	Recycler.wrap(Cell, function(x, z, scene) {
		this.x = x;
		this.z = z;
		this.scene = scene;
		this.wallX = [false, false, false];
		this.wallZ = [false, false, false];
		this.tag = x + "," + z;
		this.barriers = {};
		this.revealed = false;
	});

	function Sprite() {}
	Recycler.wrap(Sprite, function(id, name, label, x, y, z, cell, scale, scene) {
		this.id = id;
		this.name = name;
		this.label = label || null;
		this.type = 'sprite';
		this.order = 1;
		this.x = x;
		this.y = y;
		this.z = z;
		this.cell = cell || null;
		this.scale = scale || 1;
		scene.sprites[this.id] = this;
		scene.spritesUpdated = true;
	});

	function Wall() {}
	Recycler.wrap(Wall, function(id, name, label, x, y, z, cell, scale, type) {
		const scene = cell.scene;
		this.id = id;
		this.name = name;
		this.label = label || null;
		this.type = type;
		this.order = 0;
		this.x = x;
		this.y = y;
		this.z = z;
		this.cell = cell || null;
		this.scale = scale || 1;
		checkWall(type, this.cell, x, z);
		scene.sprites[this.id] = this;
		scene.spritesUpdated = true;
	});

	function Barrier() {}
	Recycler.wrap(Barrier, function(x0, z0, x1, z1) {
		this.x0 = Math.min(x0, x1);
		this.x1 = Math.max(x0, x1);
		this.z0 = Math.min(z0, z1);
		this.z1 = Math.max(z0, z1);
	});

	function Surface() {}
	Recycler.wrap(Surface, function(name, label, id, points, cell) {
		const scene = cell.scene;
		this.id = id;
		this.name = name;
		this.label = label || null;
		this.type = 'surface';
		this.points = points;
		this.cell = cell || null;
		this.order = 0;
		scene.sprites[this.id] = this;
		scene.spritesUpdated = true;
	});

	// Barrier.prototype.init = function(x0, z0, x1, z1) {
	// 	this.x0 = Math.min(x0, x1);
	// 	this.x1 = Math.max(x0, x1);
	// 	this.z0 = Math.min(z0, z1);
	// 	this.z1 = Math.max(z0, z1);
	// };

	Barrier.prototype.blocks = function(x, z) {
		return this.x0 <= x && x <= this.x1 && this.z0 <= z && z <= this.z1;
	};

	// Surface.prototype.init = function(name, label, id, points, cell) {
	// 	const scene = cell.scene;
	// 	this.id = id;
	// 	this.name = name;
	// 	this.label = label || null;
	// 	this.type = 'surface';
	// 	this.points = points;
	// 	this.cell = cell || null;
	// 	this.order = 0;
	// 	scene.sprites[this.id] = this;
	// 	scene.spritesUpdated = true;
	// };

	function Coverage(condition, action) {		
		this.condition = condition;
		this.action = action;
	}

	// Cell.prototype.init = function(x, z, scene) {
	// 	this.x = x;
	// 	this.z = z;
	// 	this.scene = scene;
	// 	this.wallX = [false, false, false];
	// 	this.wallZ = [false, false, false];
	// 	this.tag = x + "," + z;
	// 	this.recycled = false;
	// 	this.barriers = {};
	// 	this.revealed = false;
	// 	return this;
	// };

	Cell.prototype.setSprite = function(name, label, id, offsetX, offsetY, offsetZ, scale, blockSize) {
		if (!id) {
			id = this.tag + name;
		}
		return this.scene.setSprite(name, label, id,
			this.x + (offsetX || 0) + .5,
			(offsetY || 0),
			this.z + (offsetZ || 0) + .5, scale, this, blockSize);
	};

	Cell.prototype.setBarrier = function(id,x0,z0,x1,z1) {
		if (this.barriers[id]) {
			this.barriers[id].recycle();
		}
		this.barriers[id] = Barrier.create(this.x + x0, this.z + z0, this.x + x1, this.z + z1);
	};

	// Sprite.prototype.init = function(id, name, label, x, y, z, cell, scale, scene) {
	// 	this.id = id;
	// 	this.name = name;
	// 	this.label = label || null;
	// 	this.type = 'sprite';
	// 	this.order = 1;
	// 	this.x = x;
	// 	this.y = y;
	// 	this.z = z;
	// 	this.cell = cell || null;
	// 	this.scale = scale || 1;
	// 	scene.sprites[this.id] = this;
	// 	scene.spritesUpdated = true;
	// 	return this;
	// }

	Utils.createAccessors(Sprite, ['name', 'label', 'x', 'y', 'z', 'cell', 'scale']);

	Cell.prototype.setWall = function(type, name, label, id, offsetX, offsetY, offsetZ, scale) {
		if (!id) {
			id = this.tag + type;
		}
		return Wall.create(id, name, label,
			this.x + (offsetX || 0),
			(offsetY || 0),
			this.z + (offsetZ || 0),
			this, scale, type);
	};

	Cell.prototype.setSurface = function(name, label, id, botleft, botright, topright, topleft) {
		if(!id) {
			id = this.tag + 'surface';
		}
		const points = [botleft, botright, topright, topleft];
		for(let p=0; p < points.length; p++) {
			points[p].x += this.x;
			points[p].z += this.z;
		}
		return Surface.create(name, label, id, points, this);
	};

	Cell.prototype.blocks = function(x,z) {
		for(let b in this.barriers) {
			if(this.barriers[b].blocks(x,z)) {
				return true;
			}
		}
		return false;
	};

	Cell.prototype.getNeighbor = function(offsetX, offsetZ) {
		return this.scene.cell(this.x + offsetX, this.z + offsetZ);
	};

	// Wall.prototype.init = function(id, name, label, x, y, z, cell, scale, type) {
	// 	const scene = cell.scene;
	// 	this.id = id;
	// 	this.name = name;
	// 	this.label = label || null;
	// 	this.type = type;
	// 	this.order = 0;
	// 	this.x = x;
	// 	this.y = y;
	// 	this.z = z;
	// 	this.cell = cell || null;
	// 	this.scale = scale || 1;
	// 	checkWall(type, this.cell, x, z);
	// 	scene.sprites[this.id] = this;
	// 	scene.spritesUpdated = true;
	// 	return this;
	// };

	Scene.prototype.clear = function() {
		this.nextID = 0;
		this.sprites = {};
		this.revealMap = {};
		this.cellCoverage = [];
		this.cachedPosition = {};
		this.cachedSpriteList = [];
		this.spritesUpdated = true;
	}

	function checkWall(type, cell, x, z) {
		if (cell) {
			switch(type) {
				case "leftwall":
					cell.setBarrier('leftbarrier', 0, 0, DISTANCE_TO_WALL, 1);
					cell.wallX[OFF_WALL + LEFT] = true;
					break;
				case "rightwall":
					cell.setBarrier('rightbarrier', 1-DISTANCE_TO_WALL, 0, 1, 1);
					cell.wallX[OFF_WALL + RIGHT] = true;
					break;
				case "wall":
					cell.setBarrier('frontbarrier', 0, 0, 1, DISTANCE_TO_WALL);
					cell.wallZ[OFF_WALL + FAR] = true;
					break;
				case "backwall":
					cell.setBarrier('backbarrier', 0, 1-DISTANCE_TO_WALL, 1, 1);
					cell.wallZ[OFF_WALL + CLOSE] = true;
					break;
			}
		}
	}

	Scene.prototype.canGo = function(xFrom, zFrom, xTo, zTo) {
		const cellFrom = getCell(this, xFrom, zFrom);
		const cellTo = getCell(this, xTo, zTo);
		if(Math.abs(cellFrom.x - cellTo.x) > 1 || Math.abs(cellFrom.z - cellTo.z) > 1) {
			const xMid = (xFrom + xTo) / 2;
			const zMid = (zFrom + zTo) / 2;
			return this.canGo(xFrom, zFrom, xMid, zMid) && this.canGo(xMid, zMid, xTo, zTo);
		}
		if(cellTo.blocks(xTo, zTo)) {
			return false;
		}
		if (cellFrom !== cellTo) {
			if(cellFrom.wallX[OFF_WALL + cellTo.x - cellFrom.x] || cellFrom.wallZ[OFF_WALL + cellTo.z - cellFrom.z]) {
				return false;
			}
		}
		return true;
	};

	Scene.prototype.setSprite = function(name, label, id, x, y, z, scale, cell, blockSize) {
		if (!id) {
			id = name;
		}
		let sprite = this.sprites[id];
		if(!sprite) {
			sprite = Sprite.create(id, name, label, x, y, z, cell, scale, this);
		} else {
			sprite.name = name;
			sprite.label = label;
			const newCell = cell || null;
			if (sprite.x !== x || sprite.y !== y || sprite.z !== z || sprite.cell !== cell) {
				sprite.x = x;
				sprite.y = y;
				sprite.z = z;
				sprite.cell = cell || null;
				this.spritesUpdated = true;
			}
			sprite.scale = scale || 1;
		}
		if (sprite.cell && blockSize) {
			sprite.cell.setBarrier(id + 'barrier',.5 - blockSize/2,.5 - blockSize/2,.5 + blockSize/2,.5 + blockSize/2);
		}
		return sprite;
	};

	Scene.prototype.remove = function(id) {
		this.sprites[id].recycle();
		delete this.sprites[id];
		this.spritesUpdated = true;
	}

	Scene.prototype.onReveal = function(condition, action) {
		this.cellCoverage.push(new Coverage(condition === true ? ()=>true : condition, action));
	};

	function cleanReveal(revealMap, now) {
		for(let z in revealMap) {
			for(let x in revealMap[z]) {
				const cell = revealMap[z][x];
				if(cell.time !== now) {
					for(let b in cell.barriers) {
						cell.barriers[b].recycle();
					}
					cell.barriers = {};
					cell.recycle();
					delete revealMap[z][x];
				}
			}
		}
	}

	function cleanSprites(scene) {
		const sprites = scene.sprites;
		for(let id in sprites) {
			if (sprites[id].cell && sprites[id].cell.recycled) {
				scene.remove(id);
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
    	const xx = Math.floor(x);
    	const zz = Math.floor(z);
		const revealMap = scene.revealMap;
		if(!revealMap[zz]) {
			revealMap[zz] = {};
		}
		let cell = revealMap[zz][xx];
		if(!cell) {
			cell = revealMap[zz][xx] = Cell.create(xx, zz, scene);
		}
		return cell;
	};

	Scene.prototype.getSprites = function() {
		const spriteList = this.cachedSpriteList;
		if (this.spritesUpdated) {
			spriteList.length = 0;
			for(let s in this.sprites) {
				spriteList.push(this.sprites[s]);
			}
			spriteList.sort(spriteCompare);
			this.spritesUpdated = false;
		}
		return spriteList;
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
					const xx = x + roundX;
					const cell = getCell(this, xx, zz);
					cell.time = now;
					if (!cell.revealed) {
						cell.revealed = true;
						const cellCoverage = this.cellCoverage;
						for(let c = 0; c < cellCoverage.length; c++) {
							if(cellCoverage[c].condition(xx, zz)) {
								cellCoverage[c].action(cell);
							}
						}
					}
				}
			}
			if(Math.random() < CLEAN_FREQUENCY) {
				cleanReveal(revealMap, now);
				cleanSprites(scene);
			}
		}
    };

	return {
		Scene,
	};
})();
