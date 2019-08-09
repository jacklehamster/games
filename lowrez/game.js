const Game = (() => {

	const ASSETS = {
		ARROW_SIDE:'assets/arrow-side.png',
		ARROW_FORWARD:'assets/arrow-forward.png',
		ARROW_BACKWARD:'assets/arrow-backward.png',
		JAIL:'assets/jail.png',
		JAIL360:'assets/jail-360.png',
		WRITING:'assets/writing.png',
		PHOTO:'assets/photo.png',
		TILE:'assets/tile.png',
		BOTTLE:'assets/bottle.png',
		FAR_SIDE:'assets/far-side.png',
		FAR_SIDE_CORNER:'assets/far-side-corner.png',
		FAR_WALL:'assets/far-wall.png',
		FAR_DOOR:'assets/far-door.png',
		CLOSE_SIDE:'assets/close-side.png',
		CLOSE_SIDE_CORNER:'assets/close-side-corner.png',
		CLOSE_WALL:'assets/close-wall.png',
		DOOR_OPEN:'assets/door-open.png',
		CLOSE_DOOR:'assets/close-door.png',
		BAG_OUT:'assets/bag-out.png',
	};


	const canvas = document.getElementById("canvas");
	const ctx = canvas.getContext("2d");
	const maskCanvas = document.createElement("canvas");
	maskCanvas.width = canvas.width;
	maskCanvas.height = canvas.height;
	const maskCtx = maskCanvas.getContext("2d");

	const LEFT = 1, RIGHT = 2, FORWARD = 3, BACKWARD = 4;

	function nop() {}

	function toMap(string) {
		if (!string) {
			return null;
		}
		const lines = string.split("\n").map(line => line.trim()).filter(line => line != "");
		lines.reverse();		
		return lines;
	}

	function getMapInfo(map) {
		if (!map) {
			return null;
		}
		for (let row = 0; row < map.length; row++) {
			for(let col = 0; col < map[row].length; col++) {
				if (map[row][col] === '8') {
					return {
						x: col, y: row,
					};
				}
			}
		}
		throw new Error("Invalid map. Missing O");
	}

	function getCell(map, x, y) {
		if (y < 0 || y >= map.length || !map[y] || x < 0 || x >= map[y].length) {
			return 'X';
		}
		return map[y][x];
	}


	const ORIENTATIONS = ['W','N','E','S'];
	const ARROW_GRID = [
		[],
		[],
		[ null, null, null,     null, null  ],
		[ LEFT, null, FORWARD,  null, RIGHT ],
		[ LEFT, null, BACKWARD, null, RIGHT ],
	];
	const ARROWS = [
		null, 
		{ src:ASSETS.ARROW_SIDE, side:LEFT },
		{ src:ASSETS.ARROW_SIDE, side:RIGHT},
		{ src:ASSETS.ARROW_FORWARD},
		{ src:ASSETS.ARROW_BACKWARD},
	];

	const config = {
		scenes: [
			{
				mode: "point-click",
				enableArrows: [LEFT, RIGHT],
				canOpenBag: true,
				sprites: [
					{
						src: ASSETS.JAIL, col:4, row:5,
						index: () => Math.random() < .1 ? 1 : 0,
						hidden: game => game.rotation !== 0,
					},
					{
						src: ASSETS.JAIL360, col:3, row:3,
						index: game => (game.rotation + 8) % 8,
						hidden: game => game.rotation === 0,
					},
					{
						src: ASSETS.WRITING, col:3, row:3,
						index: game => (game.rotation + 8) % 8,
						hidden: game => game.rotation === 0,
						onClick: game => {
							if (game.rotation === 4) {
								game.turnLeft(game.now);
							} else {
								console.log("writing");
							}
						},
					},
					{
						src: ASSETS.PHOTO, col:3, row:3,
						index: game => (game.rotation + 8) % 8,
						hidden: game => game.rotation === 0 || game.pickedUp.photo,
						onClick: game => {
							if (game.rotation === 4) {
								game.turnRight(game.now);
							} else {
								console.log("photo");
							}
						},
					},
					{
						src: ASSETS.TILE, col:3, row:3,
						index: game => (game.rotation + 8) % 8,
						hidden: game => game.rotation === 0,
						onClick: game => {
							console.log("tile");
						},
					},
					{
						src: ASSETS.BOTTLE, col:3, row:3,
						index: game => (game.rotation + 8) % 8,
						hidden: game => game.rotation === 0 || game.pickedUp.bottle,
						onClick: game => {
							console.log("bottle");
						},
					},
				],
			},
			{
				mode: "maze",
				enableArrows: [LEFT, RIGHT, FORWARD, BACKWARD],
				map: `
					XXXXXXXX
					X.....XX
					XX.XX.XX
					XX8XX.XX
					XXXXX1XX
					XXXXXXXX
				`,
				doors: {
					1: {
						exit: game => {
							game.fadeOut(game.now, {duration:3000, fadeDuration:2000, color:"#000000", onDone:() => {
								game.gotoScene(0);
							}});
						},
					},
				},
			},
		],
	};

	const imageStock = {};
	let gameInstance;

	class Game {
		static start() {
			gameInstance = new Game();
			gameInstance.play(config);
		}

		constructor() {
			this.sceneIndex = location.hash.split("#")[1] || 0;
			this.initGame();

			document.addEventListener("keydown", ({keyCode}) => {
				this.keyboard[keyCode] = true;
			});

			document.addEventListener("keyup", ({keyCode}) => {
				this.keyboard[keyCode] = false;
			});

			canvas.addEventListener("mousemove", ({currentTarget, offsetX, offsetY}) => {
				const { offsetWidth, offsetHeight } = currentTarget;
				if (this.enableArrows) {
					const arrow = this.getArrow(offsetX, offsetY, offsetWidth, offsetHeight);
					this.arrow = this.enableArrows.indexOf(arrow) >= 0 ? arrow : 0;
				}
				if (!this.mouse) {
					this.mouse = {};
				}
				this.mouse.x = offsetX / offsetWidth * canvas.width;
				this.mouse.y = offsetY / offsetHeight * canvas.height;
			});

			canvas.addEventListener("mousedown", ({currentTarget, offsetX, offsetY}) => {
				const { offsetWidth, offsetHeight } = currentTarget;
				if (this.enableArrows) {
					const arrow = this.getArrow(offsetX, offsetY, offsetWidth, offsetHeight);
					this.arrow = this.enableArrows.indexOf(arrow) >= 0 ? arrow : 0;
					switch(this.arrow) {
						case LEFT: {
							this.turnLeft(this.now);
							this.actionDown = arrow;
						}
						break;
						case RIGHT: {
							this.turnRight(this.now);
							this.actionDown = arrow;
						}
						break;
						case FORWARD: {
							const { x, y } = this.pos;
							if (this.matchCell(this.map,x,y,0,1,this.orientation,"12345",[])) {
								if (!this.doorOpening) {
									this.performAction(this.now);
								} else if (this.doors) {
									const cell = getCell(this.map, ... Game.getPosition(x,y,0,1,this.orientation));
									if (this.doors[cell].exit) {
										this.doors[cell].exit(this);
									} else {
										this.actionDown = arrow;
									}
								} else {
									console.error("You need doors!");
								}
							} else {
								this.actionDown = arrow;
							}
						}
						break;
						case BACKWARD: {
							this.actionDown = arrow;
							if (this.canOpenBag) {
								this.openBag(this.now);
							}
						}
						break;
					}
				}
				this.mouseDown = true;
			});

			canvas.addEventListener("mouseleave", () => {
				this.arrow = 0;
				this.mouse = null;
				this.mouseDown = false;
			});

			document.addEventListener("mouseup", e => {
				this.actionDown = 0;
				this.mouseDown = false;
				this.clicking = false;
			});

			document.addEventListener("keydown", ({keyCode}) => {
				switch(keyCode) {
					case 65: case 81:
						this.turnLeft(this.now);
						break;
					case 68: case 69:
						this.turnRight(this.now);
						break;
					case 32:
						this.performAction(this.now);
						break;
					default:
				}
			});
		}

		gotoScene(index) {
			this.sceneIndex = index;
			this.loadScene(config.scenes[this.sceneIndex]);
		}

		initGame() {
			this.pickedUp = {};
			this.inventory = {};
			this.initScene();
			this.prepareAssets();
		}

		initScene() {
			this.actions = [];
			this.orientation = 'N';
			this.keyboard = [];
			this.frameIndex = 0;
			this.doorOpening = 0;
			this.bagOpening = 0;
			this.doorOpened = 0;
			this.rotation = 0;
			this.arrow = 0;
			this.actionDown = 0;
			this.mouse = null;
			this.fade = 0;
			this.fadeColor = "#000000";
			this.mouseDown = false;
			this.clicking = false;

			this.mode = null;
			this.map = null;
			this.pos = null;
			this.sprites = null;
			this.doors = null;
			this.enableArrows = null;
		}

		getArrow(x, y, width, height) {
			const quadrantX = Math.min(4, Math.max(0, Math.floor(x / width * 5)));
			const quadrantY = Math.min(4, Math.max(0, Math.floor(y / height * 5)));
			return ARROW_GRID[quadrantY][quadrantX];
		}

		evaluate(value) {
			if (value && value.constructor === Function) {
				return this.evaluate(value(this));
			}
			return value;
		}

		turnLeft(now) {
			const { mode } = this;
			if (mode === "maze") {
				const index = ORIENTATIONS.indexOf(this.orientation);
				this.orientation = ORIENTATIONS[(index - 1 + 4) % 4];
			}
			if (mode === "point-click") {
				this.turn(now, "left");
			}
		}

		turnRight(now) {
			const { mode } = this;
			if (mode === "maze") {
				const index = ORIENTATIONS.indexOf(this.orientation);
				this.orientation = ORIENTATIONS[(index + 1) % 4];
			}
			if (mode === "point-click") {
				this.turn(now, "right");
			}
		}

		turn(now, direction) {
			if (this.rotation % 2 === 0) {
				this.actions.push({
					time: now,
					frame: 0,
					command: "turn",
					direction,
					rotation: this.rotation,
					active: true,
					started: false,
					repeat: 0,
				});
			}
		}

		performAction(now) {
			if (this.mode === "maze") {
				const {x, y} = this.pos;
				const closeDoor = this.matchCell(this.map,x,y,0,1,this.orientation,'12345','');;
				if (closeDoor) {
					this.actions.push({
						time: now,
						frame: 0,
						command: "open",
						onStart: () => this.doorOpening = !this.doorOpening ? 1 : -this.doorOpening,
						onDone: () => this.doorOpened = this.doorOpening > 0 ? 1 : 0,
						active: true,
						started: false,
					});
				}
			}
		}

		openBag(now) {
			this.actions.push({
				time: now,
				frame: 0,
				command: "openbag",
				onStart: () => this.bagOpening = !this.bagOpening ? 1 : -this.bagOpening,
				active: true,
				started: false,
			});
		}

		fadeOut(now, {duration, fadeDuration, color, onDone}) {
			this.actions.push({
				time: now,
				command: "fadeOut",
				color: color || "#000000",
				onDone,
				duration,
				fadeDuration,
				active: true,
				started: false,
			});
		}

		refreshMove() {
			if (!this.map) {
				return;
			}
			let dy = 0;
			if (this.keyboard[87]) {
				dy++;
			}
			if (this.keyboard[83]) {
				dy--;
			}
			if (this.actionDown) {
				dy = this.actionDown === FORWARD ? 1 : this.actionDown === BACKWARD ? -1 : 0;
			}
			if (dy<0) {
				this.moveBack(this.now);
			} else if (dy > 0) {
				this.moveForward(this.now);
			}
		}

		refreshActions() {
			this.actions.forEach(action => {
				const {time, command, direction, active, onDone, onStart, started} = action;
				if (!active) {
					return;
				}
				if (!started) {
					action.started = true;
					if (onStart) {
						onStart();
					}
				}

				switch (command) {
					case "move": {
						const frame = Math.floor((this.now - time) / 120);
						action.frame = frame;
						if (frame < 4) {
							this.frameIndex = direction === "forward" ? 3 - frame : direction === "backward" ? frame : 0;
						} else {
							this.frameIndex = 0;
							if (onDone) {
								onDone();
							}
							if (action.repeat) {
								action.repeat--;
								const {x, y} = this.pos;
								const dy = direction === "forward" ? 1 : -1;
								if (this.matchCell(this.map,x,y,0,dy,this.orientation,'X12345',"")) {
									action.active = false;
								} else {
									action.started = false;
									action.time = this.now;
									this.doorOpening = 0;
									this.doorOpened = 0;
								}
							} else {
								action.active = false;
							}
						}
						break;
					}
					case "open": {
						const frame = Math.floor((this.now - time) / 150);
						if (frame < 4) {
							this.frameIndex = Math.min(3, this.doorOpening > 0 ? frame : 3 - frame);
						} else {
							if (onDone) {
								onDone();
							}
							action.active = false;
						}
						break;
					}
					case "openbag": {
						const frame = Math.floor((this.now - time) / 150);
						if (frame < 4) {
							this.frameIndex = Math.min(3, this.bagOpening > 0 ? frame : 3 - frame);
						} else {
							if (onDone) {
								onDone();
							}
							action.active = false;
						}
						break;
					}
					case "turn": {
						const frame = Math.floor((this.now - time) / 150);

						const cycle = 2;
						if (frame < 2) {
							const dr = direction === "left" ? 1 : -1;
							this.rotation = (action.rotation + dr * (frame + 1) + 8) % 8;
						} else {
							if (onDone) {
								onDone();
							}
							action.active = false;
						}						
						break;
					}
					case "fadeOut": {
						const { duration, fadeDuration } = action;
						this.fade = Math.min(1, (this.now - time) / fadeDuration);
						if (this.now - time > duration) {
							if(onDone) {
								onDone();
							}
						}
						break;
					}
				}
			});
		}

		checkClicks() {
			if (this.mouse && this.mouseDown && !this.clicking) {
				const { x, y } = this.mouse;
				this.sprites.forEach(sprite => {
					if (sprite.onClick && !this.actionDown && !this.clicking) {
						maskCtx.clearRect(0,0,maskCanvas.width, maskCanvas.height);
						this.displayImage(maskCtx, sprite);
						const pixel = maskCtx.getImageData(Math.floor(x), Math.floor(y), 1, 1).data;
						if (pixel[3] > 0) {
							this.clicking = true;
							sprite.onClick(this);
						}
					}
				});
			}
		}

		canMove({x, y}, direction) {
			if (this.fade > 0) {
				return false;
			}
			const closeWall = this.matchCell(this.map,x,y,0,direction,this.orientation,"X",'');;
			if (closeWall) {
				return false;
			}
			const closeDoor = this.matchCell(this.map,x,y,0,direction,this.orientation,'12345','');;
			if (closeDoor && !this.doorOpened) {
				return false;
			}
			return true;
		}

		move(now, direction) {
			const dy = direction === "forward" ? 1 : -1;
			if (!this.canMove(this.pos, dy)) {
				return;
			}
			const onStart = direction === "forward" ? () => this.applyMove(direction, this.orientation) : nop;
			const onDone = direction === "backward" ? () => {
				this.applyMove(direction, this.orientation);
				const { x, y } = this.pos;
				const closeDoor = this.matchCell(this.map,x,y,0,direction,this.orientation,'12345','');;
				this.doorOpening = 1;
				this.doorOpened = 1;
				this.frameIndex = 3;
			}: nop;

			const [ action ] = this.actions.filter(({command, direction, active}) => {
				return active && command === "move" && direction === direction;
			});
			if (action) {
				if (action.frame === 3 && action.repeat === 0) {
					action.repeat++;
				}
				return;
			}

			this.doorOpening = 0;
			this.doorOpened = 0;
			this.actions.push({
				time: now,
				frame: 0,
				command: "move",
				direction,
				onStart,
				onDone,
				active: true,
				started: false,
				repeat: 0,
			});
		}

		moveForward(now) {
			this.move(now, "forward");
		}

		moveBack(now) {
			this.move(now, "backward");
		}
		
		applyMove(direction, orientation) {
			const dir = direction === "forward" ? 1 : direction === "backward" ? -1 : 0;
			switch(this.orientation) {
				case 'N':
					this.pos.y += dir;
					break;
				case 'S':
					this.pos.y -= dir;
					break;
				case 'E':
					this.pos.x += dir;
					break;
				case 'W':
					this.pos.x -= dir;
					break;
			}
		}

		cleanupCommands() {
			this.actions = this.actions.filter(({active}) => active);
		}

		static getPosition(x, y, dx, dy, orientation) {
			switch(orientation) {
				case 'N':
					return [ x + dx, y + dy ];
				case 'S':
					return [ x - dx, y - dy ];
				case 'E':
					return [ x + dy, y - dx ];
				case 'W':
					return [ x - dy, y + dx ];
			}
		}

		matchCell(map,x, y, dx, dy, orientation, types, nottypes) {
			const cell = getCell(map, ... Game.getPosition(x,y,dx,dy,orientation));
			return (types.length === 0 || types.indexOf(cell) >= 0) && (!nottypes.length || nottypes.indexOf(cell) < 0);
		}

		displayMap(map, {x, y}) {
			const sprites = [];
			const index = this.doorOpening ? 0 : this.frameIndex;
			sprites.push({ src:'assets/dungeon-move.png', index });
			const closeLeftHole 	= this.matchCell(map,x,y,-1,0,this.orientation,[], 'X12345');
			const closeRightHole 	= this.matchCell(map,x,y,+1,0,this.orientation,[], 'X12345');
			const closeWall 		= this.matchCell(map,x,y,0,+1,this.orientation,'X12345',[])
				|| this.matchCell(map,x,y,0,0,this.orientation,'12345',[]);
			const closeDoor         = this.matchCell(map,x,y,0,+1,this.orientation,'12345',[])
				|| this.matchCell(map,x,y,0,0,this.orientation,'12345',[])
				&& this.matchCell(map,x,y,0,+1,this.orientation,[],'X12345');

			const farLeftHole		= this.matchCell(map,x,y,-1,+1,this.orientation,[],'X');
			const farRightHole		= this.matchCell(map,x,y,+1,+1,this.orientation,[],'X');
			const farWall 			= this.matchCell(map,x,y,0,+2,this.orientation,'X12345',[]);
			const farDoor 			= this.matchCell(map,x,y,0,+2,this.orientation,'12345',[]);


			if (farLeftHole) {
				sprites.push({ src:ASSETS.FAR_SIDE, side: LEFT, index });
				if (!farWall) {
					sprites.push({ src:ASSETS.FAR_SIDE_CORNER, side: LEFT, index });
				}
			}
			if(farRightHole) {
				sprites.push({ src:ASSETS.FAR_SIDE, side: RIGHT, index });
				if (!farWall) {
					sprites.push({ src:ASSETS.FAR_SIDE_CORNER, side: RIGHT, index });
				}
			}
			if (farWall) {
				sprites.push({ src: ASSETS.FAR_WALL, index });
				if (!farLeftHole) {
					sprites.push({ src:ASSETS.FAR_SIDE_CORNER, side: LEFT, index });
				}
				if (!farRightHole) {
					sprites.push({ src:ASSETS.FAR_SIDE_CORNER, side: RIGHT, index });
				}
			}			
			if (farDoor) {
				sprites.push({ src: ASSETS.FAR_DOOR, index });
			}

			if (closeLeftHole) {
				sprites.push({ src:ASSETS.CLOSE_SIDE, side: LEFT, index });
				if (!closeWall) {
					sprites.push({ src:ASSETS.CLOSE_SIDE_CORNER, side: LEFT, index });
				}
			}
			if (closeRightHole) {
				sprites.push({ src:ASSETS.CLOSE_SIDE, side: RIGHT, index });
				if (!closeWall) {
					sprites.push({ src:ASSETS.CLOSE_SIDE_CORNER, side: RIGHT, index });
				}
			}

			if (closeWall) {
				sprites.push({ src: ASSETS.CLOSE_WALL, index });
				if (!closeLeftHole) {
					sprites.push({ src:ASSETS.CLOSE_SIDE_CORNER, side: LEFT, index });
				}
				if (!closeRightHole) {
					sprites.push({ src:ASSETS.CLOSE_SIDE_CORNER, side: RIGHT, index });				
				}
			}
			if (closeDoor) {
				if (this.doorOpening) {
					sprites.push({ src: ASSETS.DOOR_OPEN, index: this.frameIndex });
				} else {
					sprites.push({ src: ASSETS.CLOSE_DOOR, index });
				}
			}

			sprites.forEach(sprite => this.prepareImage(sprite.src));
			sprites.forEach(sprite => this.displayImage(ctx, sprite));
		}

		displayArrows() {
			const sprites = [];
			const { arrow } = this;
			if (arrow) {
				if (arrow === FORWARD && this.pos && !this.canMove(this.pos, 1)) {
				} else if (arrow === BACKWARD && this.pos && !this.canMove(this.pos, -1)) {
				} else {
					const index = this.actionDown ? 1 + Math.floor(this.now / 100) % 3 : 0;
					const { src, side } = ARROWS[arrow];
					sprites.push({ src, side, index });
				}
			}			
			sprites.forEach(sprite => this.prepareImage(sprite.src));
			sprites.forEach(sprite => this.displayImage(ctx, sprite));
		}

		displayFade() {
			if (this.fade > 0) {
				ctx.globalAlpha = this.fade;
				ctx.fillStyle = this.fadeColor;
				ctx.fillRect(0, 0, canvas.width, canvas.height);
				ctx.globalAlpha = 1.0;
			}
		}

		displayCursor() {
			if (this.mouse) {
				const { x, y } = this.mouse;
				ctx.beginPath();
				const periodFF = Math.floor(0x100 + 0xff * (Math.cos(this.now/500) + 1) / 2).toString(16).substr(1);
				ctx.strokeStyle = "#" + periodFF + periodFF + periodFF;
				ctx.lineWidth = .5;
				const px = Math.floor(x)+.5, py = Math.floor(y)+.5;
				ctx.moveTo(px-3, py);
				ctx.lineTo(px+3, py);
				ctx.moveTo(px, py-3);
				ctx.lineTo(px, py+3);
				ctx.stroke();
			}
		}

		displayText() {

		}

		prepareAssets() {
			for (let a in ASSETS) {
				const src = ASSETS[a];
				if (!imageStock[src]) {
					this.prepareImage(src, () => {
						this.prepareAssets();
					});
					return;
				}
			}
		}

		prepareImage(src, callback) {
			const spriteData = imageStock[src];
			if (!spriteData) {
				const stock = {}
				const img = new Image();
				img.src = src;
				this.loadPending = true;
				img.addEventListener("load", () => {
					stock.loaded = true;
					this.loadPending = false;
					if (callback) {
						callback();
					}
				});
				img.addEventListener("error", () => {
					delete imageStock[src];
				});
				stock.img = img;
				imageStock[src] = stock;
			}	
		}

		createLoop(callback) {
			const self = this;
			function step(timestamp) {
				callback(timestamp);
			    self.requestId = requestAnimationFrame(step);
			}
			self.requestId = requestAnimationFrame(step);
		}

		play(config) {
			this.loadScene(config.scenes[this.sceneIndex]);
			this.createLoop(this.refresh.bind(this));
		}

		loadScene(scene) {
			this.initScene();

			const { map, mode, sprites, doors, enableArrows, canOpenBag } = scene;
			this.mode = mode;
			this.map = toMap(map);
			this.pos = getMapInfo(this.map);
			this.sprites = sprites || [];
			this.doors = doors;
			this.enableArrows = enableArrows || [];
			this.canOpenBag = canOpenBag;
		}

		refresh(now) {
			this.now = now;
			this.refreshMove();
			this.refreshActions();
			this.checkClicks();
			if (this.map) {
				this.displayMap(this.map, this.pos);
			}
			this.sprites.forEach(sprite => this.prepareImage(sprite.src));
			this.sprites.forEach(sprite => this.displayImage(ctx, sprite));

			if (this.enableArrows) {
				this.displayArrows();
			}
			this.displayFade();
			this.displayText();
			this.displayCursor();
			this.cleanupCommands();
		}

		displayImage(ctx, {src, index, side, col, row, hidden}) {
			const spriteData = imageStock[src];
			if (!spriteData || !spriteData.loaded || this.loadPending) {
				return;
			}
			if (this.evaluate(hidden)) {
				return;
			}

			let frameIndex = this.evaluate(index) || 0;
			let dstX = 0;
			let dstY = 0;
			let srcX = (frameIndex % (col||2)) * 64;
			let srcY = Math.floor(frameIndex / (col||2)) * 64;
			let srcW = 64;
			let srcH = 64;
			let dstW = 64;
			let dstH = 64;

			if (side === LEFT) {
				srcW /= 2;
				dstW /= 2;
			} else if (side === RIGHT) {
				srcW /= 2;
				dstW /= 2;
				srcX += 32;
				dstX += 32;
			}

			ctx.drawImage(imageStock[src].img, srcX, srcY, srcW, srcH, dstX, dstY, dstW, dstH);
		}
	}

	return Game;
}) ();
