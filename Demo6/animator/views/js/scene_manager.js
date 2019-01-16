const SceneManager = (function() {
	const CLEAN_FREQUENCY = .1;
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

	Scene.prototype.clear = function() {
		this.nextID = 0;
		this.sprites = {};
		this.revealMap = {};
		this.cellCoverage = [];
		this.cachedPosition = {};
		this.spriteList = [];
		this.spritesUpdated = true;
		this.lastTurn = {
			angle: 0,
			sin: Math.sin(0),
			cos: Math.cos(0),
		};
		this.spriteCompare = spriteCompare.bind(this);
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
		this.position = vec3.fromValues(x, y, z);
		this.cell = cell || null;
		this.scale = scale || 1;
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
		const array = [];
		let x = 0, y = 0, z = 0;
		for(let p=0; p<points.length; p++) {
			const point = points[p];
			for(let i=0; i<point.length; i++) {
				array.push(point[i]);
			}
			x += point[0];
			y += point[1];
			z += point[2];
		}
		this.points = new Float32Array(array);
		this.position = vec3.fromValues(x / points.length, y / points.length, z / points.length);
		this.cell = cell || null;
		this.order = 0;
		scene.sprites[this.id] = this;
		scene.spritesUpdated = true;
	});

	Barrier.prototype.blocks = function(x, z) {
		return this.x0 <= x && x <= this.x1 && this.z0 <= z && z <= this.z1;
	};

	function Coverage(condition, action) {		
		this.condition = condition;
		this.action = action;
	}

	Cell.prototype.setSprite = function(name, label, id, offsetX, offsetY, offsetZ, scale, blockSize) {
		if (!id) {
			id = this.tag + name;
		}
		return this.scene.setSprite(name, label, id,
			this.x + (offsetX || 0) + .5,
			(offsetY || 0),
			this.z + (offsetZ || 0) + .5, scale, blockSize, this);
	};

	Cell.prototype.setBarrier = function(id,x0,z0,x1,z1) {
		if (this.barriers[id]) {
			this.barriers[id].recycle();
		}
		this.barriers[id] = Barrier.create(this.x + x0, this.z + z0, this.x + x1, this.z + z1);
	};

	Utils.createAccessors(Sprite, ['name', 'label', 'x', 'y', 'z', 'cell', 'scale']);

	Cell.prototype.setWall = function(type, name, label, id, offsetX, offsetY, offsetZ, scale) {
		if (!id) {
			id = this.tag + type;
		}

		const x = (offsetX || 0), y = (offsetY || 0), z = (offsetZ || 0);
		let surface = null;
		if (type === 'floor') {
			surface = this.setSurface(name, label, id,
				[ x,   y, z+1 ],
				[ x+1, y, z+1 ],
				[ x+1, y, z   ],
				[ x,   y, z   ]
			);
		} else if(type === 'ceiling') {
			surface = this.setSurface(name, label, id,
				[ x,   y+1, z],
				[ x+1, y+1, z],
				[ x+1, y+1, z+1],
				[ x,   y+1, z+1]
			);
		} else if(type === 'leftwall') {
			checkWall(type, this, x, z);
			surface = this.setSurface(name, label, id,
				[ x, y,   z+1],
				[ x, y,   z],
				[ x, y+1, z],
				[ x, y+1, z+1]
			);			
		} else if(type === 'rightwall') {
			checkWall(type, this, x, z);
			surface = this.setSurface(name, label, id,
				[ x+1, y,   z],
				[ x+1, y,   z+1],
				[ x+1, y+1, z+1],
				[ x+1, y+1, z]
			);			
		} else if(type === 'wall') {
			checkWall(type, this, x, z);
			surface = this.setSurface(name, label, id,
				[ x,   y,   z],
				[ x+1, y,   z],
				[ x+1, y+1, z],
				[ x,   y+1, z]
			);			
		} else if(type === 'backwall') {
			checkWall(type, this, x, z);
			surface = this.setSurface(name, label, id,
				[ x+1, y,   z],
				[ x,   y,   z],
				[ x,   y+1, z],
				[ x+1, y+1, z]
			);			
		}
		return surface;
	};

	Cell.prototype.setSurface = function(name, label, id, botleft, botright, topright, topleft) {
		if(!id) {
			id = this.tag + 'surface';
		}
		const points = [botleft, botright, topright, topleft];
		for(let p=0; p < points.length; p++) {
			points[p][0] += this.x;
			points[p][1] = (points[p][1] || 0);
			points[p][2] += this.z;
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

	Scene.prototype.setSprite = function(name, label, id, x, y, z, scale, blockSize, cell) {
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
			if (sprite.position[0] !== x || sprite.position[1] !== y || sprite.position[2] !== z || sprite.cell !== newCell) {
				vec3.set(sprite.position, x, y, z);
				sprite.cell = newCell;
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

	Scene.prototype.onReveal = function(callback) {
		this.cellCoverage.push(callback);
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
		return this.spriteList;
	};

 	const VIEW_RANGE = 15;
	Scene.prototype.refreshView = function(camera, now) {
		const { revealMap, sprites, cellCoverage, cachedPosition } = this;

		const forwardPos = camera.getRelativePosition(0, -VIEW_RANGE);
		const roundX = Math.floor(forwardPos.x);
		const roundZ = Math.floor(forwardPos.z);

		const viewRadius = VIEW_RANGE + 2;
		const viewLimit = viewRadius * viewRadius;

		if(cachedPosition.x !== roundX || cachedPosition.z !== roundZ || this.lastTurn.angle !== camera.turn) {
			cachedPosition.x = roundX;
			cachedPosition.z = roundZ;

			for(let z = -viewRadius; z <= viewRadius; z++) {
				const zz = z*z;
				const rZ = z + roundZ;
				for(let x = -viewRadius; x <= viewRadius; x++) {
					const xx = x*x;
					if (xx + zz < viewLimit) {
						const rX = x + roundX;
						const cell = getCell(this, rX, rZ);
						cell.time = now;
						if (!cell.revealed) {
							cell.revealed = true;
							const cellCoverage = this.cellCoverage;
							for(let c = 0; c < cellCoverage.length; c++) {
								cellCoverage[c](cell);
							}
						}						
					}
				}
			}

			if(Math.random() < CLEAN_FREQUENCY) {
				cleanReveal(revealMap, now);
				cleanSprites(scene);
			}
			if(this.lastTurn.angle !== camera.turn) {
				this.lastTurn.angle = camera.turn;
				this.lastTurn.sin = Math.sin(-this.lastTurn.angle);
				this.lastTurn.cos = Math.cos(-this.lastTurn.angle);
				this.spritesUpdated = true;
			}
		}

		if (this.spritesUpdated) {
			this.spriteList.length = 0;
			for(let s in this.sprites) {
				this.spriteList.push(this.sprites[s]);
			}
			const sin = Math.sin(-this.lastTurn.angle);
			const cos = Math.cos(-this.lastTurn.angle);
			this.spriteList.sort(this.spriteCompare);
			this.spritesUpdated = false;
		}
    };

    function spriteCompare(a, b) {
		if(a.order !== b.order) {
			return a.order - b.order;
		}
		if(a.order === 1) {
			const { sin, cos } = this.lastTurn;
			const ardz = (sin * a.position[0] + cos * a.position[2]);
			const brdz = (sin * b.position[0] + cos * b.position[2]);
			return ardz - brdz;
		}
		return 0;
	}

	return {
		Scene,
	};
})();
