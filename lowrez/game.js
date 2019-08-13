const Game = (() => {

	const canvas = document.getElementById("canvas");
	const ctx = canvas.getContext("2d");
	const maskCanvas = document.createElement("canvas");
	maskCanvas.width = canvas.width;
	maskCanvas.height = canvas.height;
	const maskCtx = maskCanvas.getContext("2d");

	const tempCanvas = document.createElement("canvas");
	tempCanvas.width = canvas.width;
	tempCanvas.height = canvas.height;
	tempCtx = tempCanvas.getContext("2d");

	const TEXTSPEEDER = 1;

	function nop() {}

	function toMap(string) {
		if (!string) {
			return null;
		}
		const lines = string.split("\n").map(line => line.trim()).filter(line => line != "");
		lines.reverse();		
		return lines;
	}

	function getMapInfo(map, door) {
		if (!map) {
			return null;
		}
		for (let row = 0; row < map.length; row++) {
			for(let col = 0; col < map[row].length; col++) {
				if (map[row][col] == door) {
					return {
						x: col, y: row + 1,
					};
				}
			}
		}
		throw new Error(`Invalid map. Missing door ${door}`);
	}

	function getCell(map, x, y) {
		if (y < 0 || y >= map.length || !map[y] || x < 0 || x >= map[y].length) {
			return 'X';
		}
		return map[y][x];
	}

	const imageStock = {};
	const soundStock = {};
	let gameInstance;
	window.o = { imageStock, soundStock };

	class Game {
		static start(gameConfig) {
			gameInstance = new Game();
			gameInstance.play(gameConfig);

			if (location.hash.split("#")[1]) {
				gameInstance.gotoScene(location.hash.split("#")[1]);
			}

			return gameInstance;
		}

		emptyBag() {
			for (let i in this.inventory) {
				return false;
			}
			return true;
		}

		addToInventory(obj) {
			this.inventory[obj.item] = obj;			
		}

		set sceneIndex(index) {
			if (index !== this.sceneIndex) {
				this.data.scene = {
					index,
				};
				console.log(this.data.scene);
			}
		}

		get sceneIndex() {
			return this.data.scene ? this.data.scene.index || 0 : 0;
		}

		constructor() {
			this.initGame();
			this.sceneIndex = 0;

			document.addEventListener("keydown", ({keyCode}) => {
				this.keyboard[keyCode] = true;
			});

			document.addEventListener("keyup", ({keyCode}) => {
				this.keyboard[keyCode] = false;
			});

			canvas.addEventListener("mousemove", ({currentTarget, offsetX, offsetY}) => {
				const { offsetWidth, offsetHeight } = currentTarget;
				if (!this.mouse) {
					this.mouse = {};
				}
				this.mouse.x = offsetX / offsetWidth * canvas.width;
				this.mouse.y = offsetY / offsetHeight * canvas.height;

				if (this.pendingTip && this.pendingTip.progress < 1) {
					return;
				}
				if (this.pickedUp && this.pickedUp.tip && this.pickedUp.tip.progress < 1) {
					return;
				}

				if (this.arrowGrid) {
					this.arrow = this.getArrow(offsetX, offsetY, offsetWidth, offsetHeight);
				}
			});

			canvas.addEventListener("mousedown", ({currentTarget, offsetX, offsetY}) => {
				if (this.pendingTip && this.pendingTip.progress < 1 || this.waitCursor || this.hideCursor) {
					return;
				}
				if (this.useItem === "gun" && (!this.hoverSprite || !this.hoverSprite.bag)) {
					const { bullet, gun } = this.inventory;
					if (bullet && bullet.count) {
						bullet.count--;
						this.gunFired = this.now;
						game.playSound(SOUNDS.GUN_SHOT);
					} else {
						this.gunFired = 0;
						game.playSound(SOUNDS.DUD)
					}
					this.mouseDown = this.now;
					return;
				}
				if (this.pickedUp) {
					const { item, onPicked, tip, image } = this.pickedUp;
					if (tip.progress >= 1) {
						this.pickedUp = null;
						this.tips = {};
						this.openBag(this.now, onPicked);
					}
					return;
				}
				if (this.dialog && this.dialog.hovered) {
					if (this.dialog.hovered.onSelect) {
						this.dialog.hovered.onSelect(this, this.dialog);
					}
					return;
				}
				this.mouseDown = this.now;
				if (!this.hoverSprite || this.hoverSprite.bag) {
					const { offsetWidth, offsetHeight } = currentTarget;
					if (this.arrowGrid && !this.useItem && !this.bagOpening) {
						const arrow = this.getArrow(offsetX, offsetY, offsetWidth, offsetHeight);
						this.arrow = arrow;
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
								if (this.onSceneForward(this)) {
									return;
								}
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
							}
							break;
						}
					}
				}
			});

			canvas.addEventListener("mouseleave", () => {
				this.arrow = 0;
				this.mouse = null;
				this.mouseDown = 0;
			});

			document.addEventListener("mouseup", e => {
				this.actionDown = 0;
				this.mouseDown = 0;
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

		gotoScene(index, door) {
			if (typeof(index) === "string") {
				index = this.config.scenes.map(({name}, idx) => name === index ? idx : -1).filter(index => index >= 0)[0];
				if (typeof(index) === 'undefined') {
					console.error(`${index}: unknown scene.`);
				}
			}
			this.sceneIndex = index;
			this.door = door;
			this.loadScene(this.config.scenes[this.sceneIndex]);
		}

		set door (value) {
			this.data.scene.door = value;
		}

		get door () {
			return this.data.scene ? this.data.scene.door || 0 : 0;
		}

		get inventory() {
			return this.data.inventory;
		}

		get situation() {
			if (!this.data.situation) {
				this.data.situation = {};
			}
			if (!this.data.situation[this.sceneIndex]) {
				this.data.situation[this.sceneIndex] = {};
			}
			return this.data.situation[this.sceneIndex];
		}

		initGame() {
			this.data = {
				time: 0,
				scene: {},
				pickedUp: {},
				seen: {},
				shot: {},
				inventory: {},
			};
			this.config = null;
			this.mouse = null;
			this.timeOffset = 0;

			this.initScene();
			this.prepareAssets();
			this.prepareSounds();
		}

		initScene() {
			this.actions = [];
			this.orientation = 'N';
			this.keyboard = [];
			this.frameIndex = 0;
			this.doorOpening = 0;
			this.bagOpening = 0;
			this.doorOpened = 0;
			this.arrow = 0;
			this.actionDown = 0;
			this.fade = 0;
			this.fadeColor = "#000000";
			this.mouseDown = 0;
			this.clicking = false;
			this.hoverSprite = null;
			this.tips = {};
			this.pickedUp = null;
			this.useItem = null;
			this.pendingTip = null;
			this.hideCursor = false;
			this.waitCursor = false;
			this.hideArrows = false;
			this.sceneData = {};
			this.sceneIntro = false;
			this.mouseHand = null;
			this.rotation = 0;
			this.gunFired = 0;

			this.mode = null;
			this.map = null;
			this.pos = null;
			this.sprites = null;
			this.doors = null;
			this.arrowGrid = null;
			this.sceneTime = 0;
			this.dialog = null;
			this.onScene = null;
			this.onSceneRefresh = null;
			this.onSceneShot = null;
			this.onSceneHoldItem = null;
			this.onSceneUseItem = null;
			this.onSceneForward = null;
		}

		markPickedUp(item) {
			if (!this.data.pickedUp[item]) {
				this.data.pickedUp[item] = this.now;
			}
		}

		pickUp(item, image, message, onPicked) {
			if (!item) {
				console.error(`Your item (${image}) needs a name.`);
			}
			this.markPickedUp(item);
			const time = this.now;
			this.addToInventory({
				item,
				image,
			});

			this.pickedUp = {
				item,
				image,
				time,
				onPicked,
				tip: {
					text: message,
					time,
					speed: 100,
					fade: 0,
					end: 0,
				},
			};
			if (!this.bagOpening) {
				this.openBag(this.now)
			}
		}

		getArrow(x, y, width, height) {
			if (this.hideArrows) {
				return 0;
			}
			const quadrantX = Math.min(4, Math.max(0, Math.floor(x / width * 5)));
			const quadrantY = Math.min(4, Math.max(0, Math.floor(y / height * 5)));
			return this.evaluate(this.arrowGrid[quadrantY][quadrantX]);
		}

		evaluate(value, extra) {
			if (value && value.constructor === Function) {
				return this.evaluate(value(this, extra));
			}
			return value;
		}

		turnLeft(now, callback) {
			const { mode, map } = this;
			if (map) {
				const index = ORIENTATIONS.indexOf(this.orientation);
				this.orientation = ORIENTATIONS[(index - 1 + 4) % 4];
			} else {
				this.turn(now, "left", callback);
			}
		}

		turnRight(now, callback) {
			const { mode, map } = this;
			if (map) {
				const index = ORIENTATIONS.indexOf(this.orientation);
				this.orientation = ORIENTATIONS[(index + 1) % 4];
			} else {
				this.turn(now, "right", callback);
			}
		}

		turn(now, direction, callback) {
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
					onDone: callback || nop,
				});
				this.tips = {};
			}
		}

		performAction(now) {
			if (this.map) {
				const {x, y} = this.pos;
				const closeDoor = this.matchCell(this.map,x,y,0,1,this.orientation,'12345','');;
				if (closeDoor) {
					this.actions.push({
						time: now,
						frame: 0,
						command: "open",
						onStart: () => this.doorOpening = !this.doorOpening ? 1 : -this.doorOpening,
						onDone: game => game.doorOpened = game.doorOpening > 0 ? 1 : 0,
						active: true,
						started: false,
					});
				}
			}
		}

		openBag(now, onClose) {
			this.actions.push({
				time: now,
				command: "openbag",
				onStart: () => this.bagOpening = !this.bagOpening ? 1 : -this.bagOpening,
				onDone: game => {
					if(game.bagOpening < 0) {
						game.bagOpening = 0;
						if (onClose) {
							onClose(game);
						}
					} else if (game.bagOpening > 0 && game.useItem) {
						game.useItem = null;
					}
				},
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
						onStart(this, action);
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
								onDone(this, action);
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
								onDone(this, action);
							}
							action.active = false;
						}
						break;
					}
					case "openbag": {
						const frame = Math.floor((this.now - time) / 80);
						if (frame < 4) {
							this.frameIndex = Math.min(3, this.bagOpening > 0 ? frame : 3 - frame);
						} else {
							if (onDone) {
								onDone(this, action);
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
								onDone(this, action);
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
								onDone(this, action);
							}
							action.active = false;
						}
						break;
					}
					case "delay": {
						const { delay } = action;
						if (this.now - time > delay) {
							if(onDone) {
								onDone(this, action);
							}
							action.active = false;
						}
					}
					break;
				}
			});
		}

		showTip(message, onDone) {
			if (Array.isArray(message)) {
				let index = 0;

				message = message.filter(a => a);
				const tip = this.pendingTip = {
					index,
					text: message[index],
					time: this.now + 200,
					speed: 100 * TEXTSPEEDER,
					end: 0,
					onDone: message.length === 1 ? onDone : game => {
						index++;
						tip.index = index;
						tip.text = message[index];
						tip.time = game.now + 200;
						if (index === message.length-1) {
							tip.onDone = onDone;
						}
						this.pendingTip = tip;
					},
				};
			} else {
				this.pendingTip = {
					text: message,
					time: this.now + 200,
					speed: 110 * TEXTSPEEDER,
					end: 0,
					onDone,
				};
			}
		}

		startDialog(dialog) {
			this.dialog = dialog;
		}

		checkMouseHover() {
			if (this.mouse) {
				let hovered = null;
				for (let i = this.sprites.length - 1; i >= 0; i--) {
					const sprite = this.sprites[i];
					if ((sprite.onClick || this.evaluate(sprite.tip) || this.useItem && sprite.name) && !this.actionDown && !this.clicking) {
						if (this.isMouseHover(sprite, 0, this.mouse)) {
							if (this.mouseDown) {
								this.clicking = true;
								if (this.useItem && !sprite.bag) {
									const { combine, combineMessage, name, onShot } = sprite;
									if (this.useItem == "gun" && this.gunFired) {
										this.data.shot[name] = this.now;
										let handled = false;
										if (onShot) {
											handled = onShot(this);
										}
										if (!handled) {
											this.onSceneShot(this, name);
										}
									} else if (!combine || !combine(this.useItem, this)) {
										if (this.useItem !== "gun") {
											this.showTip(combineMessage && combineMessage(this.useItem, this) ||
												(name ? `You can't use the ${this.useItem} on the ${name}.`
													: `You can't use ${this.useItem} like that.`
												)
											);
											this.useItem = null;
										}
									}

								} else {
									sprite.onClick(this, sprite);
								}
								return;
							}
							hovered = sprite;
							if (!hovered.bag) {
								this.arrow = 0;
							}
							break;
						}
					}
				}
				if (this.hoverSprite !== hovered) {
					this.hoverSprite = hovered;
					if (hovered) {
						hovered.hoverTime = game.now;
					}
				}
			}
		}

		checkUseItem() {
			if (this.mouseDown && !this.actionDown && !this.clicking) {
				this.clicking = true;
				if (this.useItem === "gun" && this.gunFiredWithin(100)) {
					this.onSceneShot(this, this.useItem);
				} else if (this.useItem) {
					this.onSceneUseItem(this, this.useItem);
				}
			}
		}

		isMouseHover(sprite, outline, mouse) {
			const { x, y } = mouse;
			maskCtx.clearRect(0,0,maskCanvas.width, maskCanvas.height);

			if (outline) {
				maskCtx.shadowBlur = outline;
			}
			this.displayImage(maskCtx, sprite);
			if (outline) {
				maskCtx.shadowBlur = 0;
			}
			const pixel = maskCtx.getImageData(Math.floor(x), Math.floor(y), 1, 1).data;
			return pixel[3] > 0;
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

		cleanupData() {
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
			sprites.push({ src:ASSETS.DUNGEON_MOVE, index });
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

			this.sprites.forEach(({src}) => { if(src)this.prepareImage(src); });
			sprites.forEach(sprite => this.displayImage(ctx, sprite));
		}

		displayArrows() {
			const sprites = [];
			const { arrow } = this;
			if (arrow) {
				if (arrow === FORWARD && this.pos && !this.canMove(this.pos, 1)) {
				} else if (arrow === BACKWARD && this.pos && !this.canMove(this.pos, -1)) {
				} else if (arrow === BAG) {
				} else {
					const index = this.actionDown ? 1 + Math.floor(this.now / 100) % 3 : 0;
					const { src, side } = ARROWS[arrow];
					sprites.push({ src, side, index });
				}
			}			
			this.sprites.forEach(({src}) => { if(src)this.prepareImage(src); });
			sprites.forEach(sprite => this.displayImage(ctx, sprite));
		}

		displayTips() {
			if (this.pendingTip) {
				const tip = this.pendingTip;
				tip.fade = Math.min(1, (this.now - (tip.time + (tip.text.length + 10) * tip.speed)) / 350);
				this.displayText(tip);
				if (tip.fade >= 1) {
					this.pendingTip = null;
					this.tips = {};
					if (tip.onDone) {
						tip.onDone(this);
					}
				}
				return;
			}
			if (this.hideCursor || this.waitCursor || this.sceneIntro || this.useItem) {
				return;
			}
			let hoveredTip = null;
			if (this.hoverSprite) {
				hoveredTip = this.evaluate(this.hoverSprite.tip);
				if (hoveredTip) {
					const tip = this.tips[hoveredTip];
					if (!tip) {
						this.tips[hoveredTip] = {
							text: hoveredTip,
							time: this.now + 1000,
							speed: 80 * TEXTSPEEDER,
							end: 0,
						};
					} else {
						tip.end = 0;
					}
				}
			}

			for(let t in this.tips) {
				const tip = this.tips[t];
				if (!tip.end && (!this.hoverSprite || hoveredTip != tip.text)) {
					tip.end = this.now + 200;
				}

				tip.fade = Math.min(1, tip.end ? (this.now - tip.end) / 100 : (this.now - (tip.time + (tip.text.length + 15) * tip.speed)) / 350);
				this.displayText(tip);
				if (tip.fade >= 1) {
					delete this.tips[t];
				}
			}
		}

		displayFade({fade, fadeColor}) {
			if (fade > 0) {
				ctx.globalAlpha = fade;
				ctx.fillStyle = fadeColor;
				ctx.fillRect(0, 0, canvas.width, canvas.height);
				ctx.globalAlpha = 1.0;
			}
		}

		displayCursor() {
			if (this.hideCursor) {
				return;
			}
			if (this.mouse) {
				const { x, y } = this.mouse;
				const px = Math.floor(x)+.5, py = Math.floor(y)+.5;

				if (this.pendingTip && this.pendingTip.progress < 1 || this.pickedUp && this.pickedUp.tip && this.pickedUp.tip.progress < 1 || this.waitCursor) {
					const angle = this.now / 200;
					const radius = 2;
					ctx.strokeStyle = "#FFFFFF";
					ctx.lineWidth = .5;
					ctx.beginPath();
					ctx.moveTo(px - Math.cos(angle) * radius, py - Math.sin(angle) * radius);
					ctx.lineTo(px + Math.cos(angle) * radius, py + Math.sin(angle) * radius);
					ctx.stroke();
				} else if (this.useItem && this.useItem === "gun" && this.arrow !== BAG) {
					ctx.strokeStyle = Math.random() < .5 ? "#FFFFFF" : "#000000";
					ctx.lineWidth = .5;
					ctx.beginPath();
					ctx.moveTo(px, 0);
					ctx.lineTo(px, 64);
					ctx.moveTo(0, py);
					ctx.lineTo(64, py);
					ctx.stroke();
				} else {
					const tipReady = this.hoverSprite && this.evaluate(this.hoverSprite.tip);
					const canClick = this.hoverSprite && this.hoverSprite.onClick && !this.evaluate(this.hoverSprite.preventClick);
					const canCombine = this.hoverSprite && this.useItem && (this.hoverSprite.name || this.hoverSprite.combine || this.hoverSprite.combineMessage);
					const highLight = !this.arrow && (tipReady || canClick || canCombine) && !this.bagOpening;
					ctx.strokeStyle = "#00000055";
					ctx.lineWidth = 1;

					if (!highLight) {
						// shadow
						ctx.fillStyle = "#00000099";
						ctx.beginPath();
						ctx.moveTo(px, 2 + py);
						ctx.lineTo(px - (x / 16), 2 + py + 8 - (x / 32));
						ctx.lineTo(px + 4 - (x / 16), 2 + py + 6 + (x / 32));
						ctx.lineTo(px, 2 + py);
						ctx.fill();
					}

					const ydown = this.mouseDown ? 1 : 0;
					const x0 = px - x / 16, y0 = py + 8 - (x / 32);
					const x1 = px + 4 - x / 16, y1 = py + 6 - (x / 32);

					ctx.fillStyle = highLight ? (this.arrow ? "#aaFFaa" : "#FFFFaa") : "#FFFFFF";
					ctx.beginPath();
					ctx.moveTo(px, py + ydown * 2);
					ctx.lineTo(px - (x / 16), py + 8 - (x / 32));
					ctx.lineTo(px + 4 - (x / 16), py + 6 + (x / 32));
					ctx.lineTo(px, ydown * 2 + py);
					ctx.stroke();
					ctx.fill();

					if (!this.mouseDown && !highLight) {
						ctx.strokeStyle = "#aaccFF";
						const mid = (x % 8) / 8;
						ctx.beginPath();
						ctx.moveTo(px, py + ydown * 2);
						ctx.lineTo(x0 * mid + x1 * (1-mid), y0 * mid + y1 * (1-mid));
						ctx.stroke();
					}
				}

				if (this.useItem && this.useItem === "gun") {
					if (!this.mouseHand) {
						this.mouseHand = { x:32, y:32 };
					}
					this.mouseHand.x += (x - this.mouseHand.x) * .15;
					this.mouseHand.y += (y - this.mouseHand.y) * .5;

					ctx.transform(1,0,-(this.mouseHand.x - 32) / 128,1,(this.mouseHand.x - 32) * 1.25, Math.max(0, this.mouseHand.y - 41));
					const { gunFired } = this;
					this.displayImage(ctx, { src: ASSETS.HOLD_GUN, col: 1, row: 2, index: gunFired && this.now - gunFired < 100 ? 1 : 0 });
					ctx.resetTransform();					
				}
			}
		}

		wordwrap(text, col) {
			return text.split("\n").map(text => {
				const split = text.split(" ");
				const array = [];
				let w = 0;
				for(let i = 0; i < split.length; i++) {
					const char = split[i];
					array.push(split[i]);
					if (i < split.length-1) {
						w += split[i].length + 1;
						if (w >= col) {
							w = 0;
							array.push("\n");
						} else {
							array.push(" ");
						}
					}
				}
				return array.join("");
			}).join("\n");
		}

		displayText(tip) {
			const {text, time, fade, speed} = tip;
			if (this.now < time) {
				return;
			}
			const spriteData = imageStock[ASSETS.ALPHABET];
			if (!spriteData || !spriteData.loaded || this.loadPending) {
				return;
			}
			if (fade >= 1) {
				return;
			}

			const frame = Math.floor((this.now - (time||0)) / speed);
			const fullWrappedText = this.wordwrap(text, 12);
			tip.progress = Math.min(1, frame / fullWrappedText.length);
			const lines = fullWrappedText.substr(0, Math.min(text.length, frame)).split("\n").slice(-3);
			const letterTemplate = {
				src: ASSETS.ALPHABET, col:9, row:8, size:[5,6],
				offsetX: 20, offsetY: 20,
				index: game => Math.floor(game.now / 100) % 62,
			};

			tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
			lines.forEach((line, row) => {
				letterTemplate.offsetY = (row - lines.length) * 7 + 60;
				let spaceX = 2;
				for (let c = 0; c < line.length; c++) {
					const code = line.charCodeAt(c);
					const ALPHA = ALPHAS[code] || ALPHAS[' '.charCodeAt(0)];
					const { index } = ALPHA;
					letterTemplate.offsetX = spaceX;//3 + c * 5;
					letterTemplate.index = index;
					this.displayImage(tempCtx, letterTemplate);
					if (!ALPHA.width) {
						const { offsetX, offsetY } = letterTemplate;
						const { data } = tempCtx.getImageData(offsetX, offsetY, 5, 6);

						let foundW = 0;
						for (let w = 4; w >= 0; w--) {
							for (let h = 5; h >= 0; h--) {
								const offset = (h*5 + w)*4;
								if (data[offset + 3] !== 0) {
									foundW = w;
									break;
								}
							}
							if (foundW) {
								break;
							}
						}
						ALPHA.width = foundW;
					}
					spaceX += ALPHA.width + 2;
				}
			});
			if (fade > 0) {
				ctx.globalAlpha = 1 - fade;
			}
			ctx.shadowColor = "white";
			ctx.shadowBlur = 1;			
			for (let i = 0; i < 20; i++) {
				ctx.drawImage(tempCanvas, 0, 0);
			}
			ctx.shadowBlur = 0;
			if (fade > 0) {
				ctx.globalAlpha = 1;
			}
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

		prepareSounds() {
			for (let a in SOUNDS) {
				const src = SOUNDS[a];
				if (!soundStock[src]) {
					this.prepareSound(src, () => {
						this.prepareSounds();
					});
					return;
				}
			}
		}

		prepareSound(src, callback) {
			const soundData = soundStock[src];
			if (!soundData) {
				const stock = {}
				const audio = new Audio(src);
				this.loadPending = true;
				audio.addEventListener("loadeddata", () => {
					stock.loaded = true;
					this.loadPending = false;
					if (callback) {
						callback(stock);
					}
				});
				audio.addEventListener("error", () => {
					delete soundStock[src];
					this.loadPending = false;
				});
				stock.audio = audio;
				soundStock[src] = stock;
			}
		}

		playSound(src) {
			if (soundStock[src]) {
				const { audio } = soundStock[src];
				audio.cloneNode(true).play();
			} else {
				this.prepareSound(src, ({audio}) => {
					audio.play();
				})
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
						callback(stock);
					}
				});
				img.addEventListener("error", () => {
					delete imageStock[src];
					this.loadPending = false;
				});
				stock.img = img;
				imageStock[src] = stock;
			}	
		}

		createLoop(callback) {
			const self = this;
			let previousTime = 0;
			function step(timestamp) {
				callback(timestamp - previousTime);
				previousTime = timestamp;
			    self.requestId = requestAnimationFrame(step);
			}
			self.requestId = requestAnimationFrame(step);
		}

		play(config) {
			this.config = config;
			this.loadScene(this.config.scenes[this.sceneIndex]);
			this.createLoop(this.refresh.bind(this));
		}

		loadScene(scene) {
			this.initScene();
			const { map, mode, sprites, doors, arrowGrid,
				onScene, onSceneRefresh, onSceneShot, onSceneHoldItem, onSceneUseItem, onSceneForward } = scene;
			this.mode = mode;
			this.map = toMap(map);
			this.pos = getMapInfo(this.map, this.door);
			this.sprites = sprites || [];
			this.doors = doors;
			this.arrowGrid = arrowGrid || null;
			this.onSceneRefresh = onSceneRefresh || nop;
			this.onScene = onScene || nop;
			this.onSceneShot = onSceneShot || nop;
			this.onSceneHoldItem = onSceneHoldItem || nop;
			this.onSceneUseItem = onSceneUseItem || nop;
			this.onSceneForward = onSceneForward || nop;
		}

		get now() {
			return this.data.time;
		}

		refresh(dt) {
			this.data.time += dt;
			if (!this.sceneTime) {
				this.sceneTime = this.data.time;
				this.onScene(this);
			}
			this.onSceneRefresh(game);
			this.refreshMove();
			this.refreshActions();
			this.checkMouseHover();
			this.checkUseItem();
			if (this.map) {
				this.displayMap(this.map, this.pos);
			}
			this.sprites.forEach(({src}) => { if(src)this.prepareImage(src); });
			this.sprites.forEach(sprite => this.displayImage(ctx, sprite));
			this.displayFade(this);

			if (this.dialog) {
				this.displayDialog(this.dialog);
			}
			this.displayInventory();
			if (this.pickedUp) {
				this.displayPickedUp(this.pickedUp);
			} 

			if (!this.useItem && !this.bagOpening && !this.hideArrows && !this.pickedUp && !this.hideCursor) {
				this.displayArrows();
			}
			this.displayCursor();
			if (!this.bagOpening && !this.pickedUp) {
				this.displayTips();
			}
			this.cleanupData();
		}

		displayDialog(dialog) {
			const { index, conversation, time } = dialog;
			const frame = Math.min(3, Math.floor((this.now - time) / 80));
			if (frame < 3 || this.bagOpening || this.useItem || this.pendingTip) {
				dialog.hovered = null;
				return;
			}

			const letterTemplate = {
				src: ASSETS.ALPHABET, col:9, row:8, size:[5,6],
				offsetX: 20, offsetY: 20,
				index: game => Math.floor(game.now / 100) % 62,
			};

			tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);


			const {message, options} = conversation[index];
			const filteredOptions = options.filter(({hidden}) => !hidden || !this.evaluate(hidden));
			const y = this.mouse ? Math.floor((this.mouse.y - 43) / 7) : -1;
			ctx.fillStyle = "#009988";
			if (y >= 0 && y < filteredOptions.length) {
				dialog.hovered = filteredOptions[y];
				ctx.fillRect(0, y * 7 + 42, 64, 7);
			} else {
				dialog.hovered = null;
			}

			filteredOptions.forEach(({msg}, row) => {
				letterTemplate.offsetY = row * 7 + 43;
				let spaceX = 2;
				for (let c = 0; c < msg.length; c++) {
					const code = msg.charCodeAt(c);
					const ALPHA = ALPHAS[code] || ALPHAS[' '.charCodeAt(0)];
					const { index } = ALPHA;
					letterTemplate.offsetX = spaceX;
					letterTemplate.index = index;
					this.displayImage(tempCtx, letterTemplate);
					if (!ALPHA.width) {
						const { offsetX, offsetY } = letterTemplate;
						const { data } = tempCtx.getImageData(offsetX, offsetY, 5, 6);

						let foundW = 0;
						for (let w = 4; w >= 0; w--) {
							for (let h = 5; h >= 0; h--) {
								const offset = (h*5 + w)*4;
								if (data[offset + 3] !== 0) {
									foundW = w;
									break;
								}
							}
							if (foundW) {
								break;
							}
						}
						ALPHA.width = foundW;
					}
					spaceX += ALPHA.width + 2;
				}
			});
			ctx.shadowColor = "white";
			ctx.shadowBlur = 1;			
			for (let i = 0; i < 16; i++) {
				ctx.drawImage(tempCanvas, 0, 0);
			}
			ctx.shadowBlur = 0;
		}

		displayInventory() {
			if (this.bagOpening && (this.frameIndex === 2 || this.frameIndex === 3)) {
				for (let i in this.inventory) {
					if (i !== this.useItem && (!this.pickedUp || i !== this.pickedUp.item)) {
						const { item, image } = this.inventory[i];
						this.displayImage(ctx, { src: image, index: this.frameIndex-1 });
					}
				}
			}
			if (this.useItem) {
				const { image } = this.inventory[this.useItem];
				this.displayImage(ctx, { src: image, index: 3 });
			}
		}

		displayPickedUp({item, time, image, tip}) {
			this.displayFade({
				fade: Math.min(.8, (this.now - time) / 500),
				fadeColor:"#333333",
			});
			this.displayImage(ctx, {src:image});
			tip.fade = Math.min(1, (this.now - (tip.time + (tip.text.length + 15) * tip.speed)) / 350);
			this.displayText(tip, true);
		}

		displayImage(ctx, sprite) {
			const {src, index, side, col, row, size, hidden, offsetX, offsetY, alpha, custom } = sprite;			
			if (this.evaluate(hidden, sprite)) {
				return;
			}
			if (custom) {
				custom(game, sprite, ctx);
				return;
			}
			if (!src) {
				const fade = this.evaluate(sprite.fade);
				const fadeColor = this.evaluate(sprite.fadeColor);
				if (fade > 0 && fadeColor) {
					ctx.globalAlpha = fade;
					ctx.fillStyle = fadeColor;
					ctx.fillRect(0, 0, canvas.width, canvas.height);
					ctx.globalAlpha = 1.0;
				}
				return;
			}

			const spriteData = imageStock[src];
			if (!spriteData || !spriteData.loaded || this.loadPending) {
				return;
			}
			if (this.evaluate(hidden, sprite)) {
				return;
			}

			const [ imgWidth, imgHeight ] = size || [64,64];
			let frameIndex = this.evaluate(index, sprite) || 0;
			let dstX = offsetX||0;
			let dstY = offsetY||0;
			let srcX = (frameIndex % (col||2)) * imgWidth;
			let srcY = Math.floor(frameIndex / (col||2)) * imgHeight;
			let srcW = imgWidth;
			let srcH = imgHeight;
			let dstW = imgWidth;
			let dstH = imgHeight;

			if (side === LEFT) {
				srcW /= 2;
				dstW /= 2;
			} else if (side === RIGHT) {
				srcW /= 2;
				dstW /= 2;
				srcX += srcW;
				dstX += dstW;
			}
			if (alpha) {
				ctx.globalAlpha = this.evaluate(alpha);
			}
			ctx.drawImage(imageStock[src].img, srcX, srcY, srcW, srcH, dstX, dstY, dstW, dstH);
			if (alpha) {
				ctx.globalAlpha = 1.0;
			}
		}

		clickBag() {
			if (this.emptyBag()) {
				return;
			}
			if (this.frameIndex === 3) {
				if (this.useItem) {
					this.useItem = null;
				} else {
					for (let i in this.inventory) {
						const { item, image } = this.inventory[i];
						if (this.isMouseHover({src:image, index:this.frameIndex-1}, 1, this.mouse)) {
							this.useItem = item;
						}
					}
				}
			}
			this.openBag(this.now, game => {
				if (this.useItem) {
					this.onSceneHoldItem(game, this.useItem);
				}
			});
		}

		see(name) {
			if (!this.data.seen[name]) {
				this.data.seen[name] = this.now;
			}
		}

		gunFiredWithin(millis) {
			return this.gunFired && this.now - this.gunFired < millis;
		}

		delayAction(callback, delay) {
			this.actions.push({
				time: this.now,
				command: "delay",
				onDone: callback,
				delay,
				active: true,
				started: false,
			});
		}

		save() {
			localStorage.setItem("lastContinue", JSON.stringify(this.data));
		}
	}

	return Game;
}) ();
