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

	const letterCanvas = document.createElement("canvas");
	letterCanvas.width = canvas.width;
	letterCanvas.height = canvas.height;
	letterCtx = letterCanvas.getContext("2d");

	const TEXTSPEEDER = 1;
	const SAVES_LOCATION = "saves";
	const LAST_CONTINUE = "last";

	function nop() {}

	function toMap(string) {
		if (!string) {
			return null;
		}
		const lines = string.split("\n").map(line => line.trim()).filter(line => line != "");
		lines.reverse();		
		return lines;
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

	class Game {
		static start(gameConfig) {
			gameInstance = new Game();
			gameInstance.play(gameConfig);

			if (location.hash.split("#")[1]) {
				gameInstance.gotoScene(location.hash.split("#")[1]);
			}

			return gameInstance;
		}

		getMapInfo(map, door) {
			if (!map) {
				return null;
			}
			for (let row = 0; row < map.length; row++) {
				for(let col = 0; col < map[row].length; col++) {
					if (map[row][col] == door) {
						for (let rotation = 0; rotation < ORIENTATIONS.length; rotation+=2) {
							if (this.matchCell(map,col,row,0,1,ORIENTATIONS[rotation],'','X12345')) {
								const [ x, y ] = Game.getPosition(col, row, 0, 1, ORIENTATIONS[rotation]);
								return {
									pos: {
										x, y,
									},
									rotation,
								};
							}
						}

						return this.matchCell(this.map,col,row,0,+1,this.orientation,'12345',[]);

						return {
							x: col, y: row + 1,
						};
					}
				}
			}
			throw new Error(`Invalid map. Missing door ${door}`);
		}

		emptyBag() {
			for (let i in this.inventory) {
				return false;
			}
			return true;
		}

		addToInventory(obj) {
			if (this.inventory[obj.item]) {
				const { count } = obj;
				this.inventory[obj.item].count = (this.inventory[obj.item].count||1) + (count||1);
			} else {
				this.inventory[obj.item] = obj;
			}
		}

		removeFromInventory(item) {
			if (this.inventory[item]) {
				if (this.inventory[item].count) {
					this.inventory[item].count--;
				}
				if (!this.inventory[item].count) {
					delete this.inventory[item];
				}
			}
		}

		set sceneIndex(index) {
			if (index !== this.sceneIndex) {
				this.data.scene = {
					index,
				};
				console.log("SCENE", this.data.scene);
			}
		}

		get sceneIndex() {
			return this.data.scene ? this.data.scene.index || 0 : 0;
		}

		constructor() {
			this.imageStock = imageStock;
			this.soundStock = soundStock;
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

				if (this.pendingTip && this.pendingTip.progress < 1 && !this.pendingTip.removeLock || this.waitCursor || this.hideCursor) {
					return;
				}
				if (this.pickedUp && this.pickedUp.tip && this.pickedUp.tip.progress < 1) {
					return;
				}
				if (this.blocked) {
					return;
				}

				if (this.arrowGrid) {
					this.arrow = this.getArrow(offsetX, offsetY, offsetWidth, offsetHeight);
					if (this.mouseDown) {
						this.actionDown = this.arrow;
					}
				}
			});

			canvas.addEventListener("mousedown", e => {
				e.preventDefault();
				const {currentTarget, offsetX, offsetY} = e;
				if (this.battle) {
					if (!this.blocking() && !this.battle.playerHit && !this.battle.playerBlock && this.arrow !== BAG && !this.battle.playerLeftAttack && !this.battle.playerRightAttack) {
						if (this.onScenePunch(this, this.battle)) {
							if (this.battle.fist === LEFT && !this.battle.playerLeftAttack) {
								this.battle.playerLeftAttack = this.now;
								this.battle.playerAttackLanded = 0;
								this.battle.foeBlock = 0;
							} else if (this.battle.fist === RIGHT && !this.battle.playerRightAttack) {
								this.battle.playerRightAttack = this.now;
								this.battle.playerAttackLanded = 0;
								this.battle.foeBlock = 0;
							}
						}
					}
				}
				if (this.pendingTip && this.pendingTip.progress < 1 && !this.pendingTip.removeLock || this.waitCursor || this.hideCursor) {
					return;
				}
				if (this.useItem === "gun" && (!this.hoverSprite || !this.hoverSprite.bag && !this.hoverSprite.menu)) {
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
				if (this.useItem) {
					const { image, item, message } = this.inventory[this.useItem];
					if (game.isMouseHover({ src: image, index: 3 }, 0, this.mouse)) {
						this.pickUp({item, image, message:message||""});
						return;
					}
				}				
				if (this.dialog && this.dialog.hovered) {
					if (this.dialog.hovered.onSelect) {
						this.dialog.hovered.onSelect(this, this.dialog);
					}
					return;
				}
				if (this.data.gameOver) {
					const selection = Math.floor(this.mouse.y / 10) - 4;
					if (selection >= 0 && selection <= 1) {
						if (selection == 0) {
							this.load();
						} else {
							this.restart();
						}
						return;
					}
				}

				this.mouseDown = this.now;

				if (!this.hoverSprite || this.hoverSprite.bag || this.hoverSprite.menu) {
					const { offsetWidth, offsetHeight } = currentTarget;
					if (this.arrowGrid && !this.useItem && !this.bagOpening) {
						this.arrow = this.getArrow(offsetX, offsetY, offsetWidth, offsetHeight);
						switch(this.arrow) {
							case LEFT: {
								this.turnLeft(this.now);
								this.actionDown = this.arrow;
								break;
							}
							case RIGHT: {
								this.turnRight(this.now);
								this.actionDown = this.arrow;
								break;
							}
							case DOOR: {
								const { x, y } = this.pos;
								if (this.matchCell(this.map,x,y,0,1,this.orientation,"12345",[])) {
									if (!this.doorOpening) {
										this.performAction(this.now);
									} else if (this.doors) {
										const cell = getCell(this.map, ... Game.getPosition(x,y,0,1,this.orientation));
										if (this.doors[cell].exit) {
											this.doors[cell].exit(this, this.doors[cell]);
										} else {
											this.actionDown = this.arrow;
										}
									} else {
										console.error("You need doors!");
									}
								} else {
									this.actionDown = this.arrow;
								}
								break;
							}
							case FORWARD: {
								if (this.onSceneForward(this)) {
									return;
								}
								if (!this.pos) {
									this.actionDown = this.arrow;
									return;
								}
								const { x, y } = this.pos;
								if (this.matchCell(this.map,x,y,0,1,this.orientation,"12345",[])) {
									if (!this.doorOpening) {
										this.performAction(this.now);
									} else if (this.doors) {
										const cell = getCell(this.map, ... Game.getPosition(x,y,0,1,this.orientation));
										if (this.doors[cell].exit) {
											this.doors[cell].exit(this, this.doors[cell]);
										} else {
											this.actionDown = this.arrow;
										}
									} else {
										console.error("You need doors!");
									}
								} else {
									this.actionDown = this.arrow;
								}
								break;
							}
							case BACKWARD: {
								if (this.onSceneBackward(this)) {
									return;
								}
								this.actionDown = this.arrow;
								break;
							}
						}
					}
				}
			});

			canvas.addEventListener("mouseleave", () => {
				this.arrow = 0;
				this.mouse = null;
				this.mouseDown = 0;
				this.actionDown = 0;
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

			this.createLoop(this.refresh.bind(this));
		}

		fadeToScene(index, entrance, fadeDuration) {
			if (!fadeDuration) {
				fadeDuration = 1000;
			}
			this.waitCursor = true;
			this.fadeOut(this.now, {duration:fadeDuration * 1.5, fadeDuration, color:"#000000", onDone: game => {
				game.waitCursor = false;
				game.gotoScene(index, entrance);
			}});
		}

		gotoScene(index, entrance, restoreMapInfo) {
			const {door} = entrance || {};
			if (typeof(index) === "string") {
				index = this.config.scenes.map(({name}, idx) => name === index ? idx : -1).filter(index => index >= 0)[0];
				if (typeof(index) === 'undefined') {
					console.error(`${index}: unknown scene.`);
				}
			}
			this.sceneIndex = index;
			this.door = door || 1;
			this.loadScene(this.config.scenes[this.sceneIndex], restoreMapInfo);
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
			const { data, sceneIndex } = this;
			if (!data.situation[sceneIndex]) {
				data.situation[sceneIndex] = {};
			}
			return data.situation[sceneIndex];
		}

		get mute() {
			return this.data.mute || false;
		}

		set mute(value) {
			if (this.mute !== value) {
				this.data.mute = value;
				const { theme } = this.data;
				if (theme) {
					if (this.mute) {
						this.stopSound(theme.song);
					} else {
						this.playTheme(theme.song, theme);					
					}
				}
			}
		}

		getSituation(sceneName) {
			const { data, config } = this;
			const index = config.scenes.map(({name}, idx) => name === sceneName ? idx : -1).filter(index => index >= 0)[0];
			if (!data.situation[index]) {
				data.situation[index] = {};
			}			
			return data.situation[index];
		}

		hasVisited(sceneName) {
			const { data, config } = this;
			const index = config.scenes.map(({name}, idx) => name === sceneName ? idx : -1).filter(index => index >= 0)[0];
			return data.situation[index];
		}

		pause() {
			this.paused = this.now;
			this.resumed = 0;
			if (this.data.theme && this.data.theme.song) {
				this.stopSound(this.data.theme.song);
			}
		}

		resume() {
			this.paused = 0;
			this.resumed = this.now;
			if (this.data.theme && this.data.theme.song) {
				this.playTheme(this.data.theme.song, this.data.theme);
			}
		}

		initGame() {
			this.data = {
				time: 0,
				scene: {},
				pickedUp: {},
				seen: {},
				shot: {},
				inventory: {},
				situation: {},
				pos: { x:0, y:0 },
				rotation: 0,
				gameOver: 0,
				battle: null,
				mute: false,
				stats: null,
			};
			this.setupStats();
			this.config = null;
			this.mouse = null;
			this.timeOffset = 0;
			this.paused = false;
			this.loadCount = 0;
			this.loadTotal = 0;
			this.pos = null;
			this.rotation = 0;

			this.prepareAssets();
			this.prepareSounds();
		}

		get orientation() {
			return ORIENTATIONS[Math.floor(this.rotation / 2) * 2];
		}

		get granular_orientation() {
			return ORIENTATIONS[Math.floor(this.rotation)];
		}

		initScene() {
			this.actions = [];
			this.keyboard = [];
			this.frameIndex = 0;
			this.doorOpening = 0;
			this.bagOpening = 0;
			this.menuOpening = 0;
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
			this.sceneData = {
				visited: {},
			};
			this.sceneIntro = false;
			this.mouseHand = null;
			this.gunFired = 0;

			this.map = null;
			this.sprites = null;
			this.doors = null;
			this.events = null;
			this.arrowGrid = null;
			this.sceneTime = 0;
			this.dialog = null;
			this.onScene = null;
			this.onSceneRefresh = null;
			this.onSceneShot = null;
			this.onSceneHoldItem = null;
			this.onSceneUseItem = null;
			this.onSceneForward = null;
			this.onSceneBackward = null;
			this.onSceneBattle = null;
			this.onScenePunch = null;
			this.customCursor = null;
			this.chest = null;
			this.blocked = 0;
			this.moving = 0;
		}

		markPickedUp(item) {
			if (!this.data.pickedUp[item]) {
				this.data.pickedUp[item] = this.now;
			}
		}

		pickUp({item, image, message, count, onPicked}) {
			if (!item) {
				console.error(`Your item (${image}) needs a name.`);
			}
			this.markPickedUp(item);
			const time = this.now;
			this.addToInventory({
				item,
				image,
				count: count || 1,
			});
			this.playSound(SOUNDS.PICKUP);

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
			const { map } = this;
			this.turn(now, "left", callback);
		}

		turnRight(now, callback) {
			const { map } = this;
			this.turn(now, "right", callback);
		}

		turn(now, direction, callback) {
			if (this.rotation % 2 === 0 && this.canTurn(direction)) {
				this.actions.push({
					time: now,
					frame: 0,
					command: "turn",
					direction,
					rotation: this.rotation,
					active: true,
					started: false,
					repeat: 0,
					onDone: (game, action) => {
						if (game.checkEvents()) {
							action.active = false;
						}
						if (callback) {
							callback(game, action);
						}
					},
				});
				this.tips = {};
			}
		}

		performAction(now) {
			if (this.map) {
				const {x, y} = this.pos;
				const closeDoor = this.matchCell(this.map,x,y,0,1,this.orientation,'12345','');;
				if (closeDoor) {
					this.playSound(SOUNDS.DOOR);
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

		openMenu(now, onClose) {
			this.actions.push({
				time: now,
				command: "openmenu",
				onStart: () => this.menuOpening = !this.menuOpening ? 1 : -this.menuOpening,
				onDone: game => {
					if(game.menuOpening < 0) {
						game.menuOpening = 0;
						if (onClose) {
							onClose(game);
						}
					}
				},
				active: true,
				started: false,
			});
		}

		fadeOut(now, {duration, fadeDuration, color, onDone, max}) {
			this.actions.push({
				time: now,
				command: "fadeOut",
				color: color || "#000000",
				onDone,
				duration,
				fadeDuration,
				active: true,
				started: false,
				max: max || 1,
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
			if (dy < 0) {
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
						action.frame = Math.floor((this.now - time) / 120);
						if (action.frame < 4) {
							this.frameIndex = direction === "forward" ? 3 - action.frame : direction === "backward" ? action.frame : 0;
						} else {
							this.frameIndex = 0;
							if (onDone) {
								onDone(this, action);
							}
							const dy = direction === "forward" ? 1 : -1;
							if (action.repeat && action.active && this.canMove(this.pos, dy)) {
								action.repeat--;
								const {x, y} = this.pos;
								if (this.matchCell(this.map,x,y,0,dy,this.orientation,'X12345',"")) {
									action.active = false;
								} else {
									action.started = false;
									action.time = this.now;
									this.doorOpening = 0;
									this.doorOpened = 0;
									this.moving = this.now;
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
					case "openmenu": {
						const frame = Math.floor((this.now - time) / 50);
						if (frame < 4) {
							this.frameIndex = Math.min(3, this.menuOpening > 0 ? frame : 3 - frame);
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
						if (frame < cycle) {
							const dr = direction === "left" ? 1 : direction === "right" ? -1 : 0;
							if (!dr) {
								throw new Error("invalid direction");
							}
							this.rotation = (action.rotation + dr * (frame + 1) + 8) % 8;
						} else {
							if (onDone) {
								onDone(this, action);
							}
							action.active = false;
						}
						console.log("ROTATION", this.rotation);			
						break;
					}
					case "fadeOut": {
						const { duration, fadeDuration, color, max } = action;
						this.fadeColor = color;
						this.fade = Math.min(max, (this.now - time) / fadeDuration);
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

		showTip(message, onDone, speed, options) {
			const { removeLock } = options || {};
			if (Array.isArray(message)) {
				let index = 0;

				message = message.filter(a => a);
				const tip = this.pendingTip = {
					index,
					text: message[index],
					time: this.now + 200,
					speed: speed || 100 * TEXTSPEEDER,
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
					removeLock,
				};
			} else {
				this.pendingTip = {
					text: message,
					time: this.now + 200,
					speed: speed || 110 * TEXTSPEEDER,
					end: 0,
					onDone,
					removeLock,
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
					if ((sprite.onClick || sprite.onHover || sprite.onShot || this.evaluate(sprite.tip) || this.useItem && sprite.name || this.useItem && sprite.combine) && !this.actionDown) {
						if (this.isMouseHover(sprite, 0, this.mouse)) {
							if (this.mouseDown && !this.clicking) {
								this.clicking = true;
								if (this.useItem && !sprite.bag && !sprite.menu) {
									const { combine, combineMessage, name, onShot } = sprite;
									if (this.useItem == "gun" && this.gunFired) {
										this.data.shot[name] = this.now;
										let handled = false;
										if (onShot) {
											handled = onShot(this, sprite);
										}
										if (!handled) {
											this.onSceneShot(this, name);
										}
									} else if (!combine || !combine(this.useItem, this)) {
										if (this.useItem !== "gun") {
											this.showTip(combineMessage && combineMessage(this.useItem, this) ||
												(name ? `You can't use the ${this.useItem} on the ${name}.` : `You can't use ${this.useItem} like that.`),
												() => {}, 70);
											this.useItem = null;
										}
									}
								} else if (sprite.onClick) {
									sprite.onClick(this, sprite);
								}
								return;
							}
							hovered = sprite;
							if (!hovered.bag && !hovered.menu && !this.battle) {
								this.arrow = 0;
							}
							break;
						}
					}
				}
				if (this.hoverSprite !== hovered) {
					if (this.hoverSprite !== null) {
						if (this.hoverSprite.onHoverOut) {
							this.hoverSprite.onHoverOut(this, this.hoverSprite, hovered);
						}
						this.hoverSprite.hoverTime = 0;
					}
					this.hoverSprite = hovered;
					if (hovered) {
						hovered.hoverTime = game.now;
						if (this.hoverSprite.onHover) {
							this.hoverSprite.onHover(this, this.hoverSprite);
						}
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

		canTurn(direction) {
			return !this.battle && !this.blocked;
		}

		canMove({x, y}, direction) {
			if (!this.map) {
				return false;
			}
			if (this.fade > 0 || this.battle || this.blocked) {
				return false;
			}
			const closeWallWithDirection = this.matchCell(this.map,x,y,0,direction,this.orientation,"MXO",'');;
			if (closeWallWithDirection) {
				return false;
			}
			const closeDoorWithDirection = this.matchCell(this.map,x,y,0,direction,this.orientation,'12345','');;
			if (closeDoorWithDirection && (!this.doorOpened || direction === -1)) {
				return false;
			}

			const mapPosition = Game.getPosition(x,y,0,direction,this.orientation);
			const cell = getCell(this.map, ... mapPosition);
			if (this.events && this.events[cell] && this.events[cell].blocking) {
				return false;
			}

			return true;
		}

		canOpen({x, y}, direction) {
			const closeDoor = this.matchCell(this.map,x,y,0,direction,this.orientation,'12345','');;
			return closeDoor && !this.doorOpened;			
		}

		facingPosition() {
			const { pos, orientation } = this;
			const { x, y } = pos;
			return Game.getPosition(x,y,0,1,orientation);
		}

		facingEvent() {
			const { events } = this;
			if (!events) {
				return null;
			}
			const mapPosition = this.facingPosition();
			const cell = getCell(this.map, ... mapPosition);
			return events[cell];
		}

		checkEvents() {
			const { events } = this;
			if (events) {
				const mapPosition = this.facingPosition();
				const cell = getCell(this.map, ... mapPosition);
				if (events[cell]) {
					const visitTag = mapPosition.join("_");
					if (!this.sceneData.visited[visitTag]) {
						const { onEvent } = events[cell];
						if (onEvent(this, events[cell])) {
							this.sceneData.visited[visitTag] = true;
							return true;
						}
					}
				}
			}
			return false;
		}

		move(now, direction) {
			const dy = direction === "forward" ? 1 : -1;
			if (!this.canMove(this.pos, dy)) {
				return;
			}
			const onStart = direction === "forward" ? game => game.applyMove(direction, game.orientation) : nop;
			const onDone = direction === "backward" 
				? (game, action) => {
					game.applyMove(direction, game.orientation);
					const { x, y } = game.pos;
					const closeDoor = game.matchCell(game.map,x,y,0,direction,game.orientation,'12345','');;
					game.doorOpening = 1;
					game.doorOpened = 1;
					game.frameIndex = 0;
					if (this.checkEvents()) {
						action.active = false;
					}
				}
				: (game, action) => {
					if (this.checkEvents()) {
						action.active = false;
					}
				};

			const [ action ] = this.actions.filter(action => {
				const {command, active} = action;
				return active && command === "move" && action.direction === direction;
			});
			if (action) {
				if (action.frame === 3 && action.repeat === 0) {
					action.repeat++;
				}
				return;
			}

			this.doorOpening = 0;
			this.doorOpened = 0;
			this.moving = now;
			this.actions.push({
				time: now,
				frame: 0,
				command: "move",
				direction,
				onStart,
				onDone: (game, action) => {
					this.moving = 0;
					onDone(game, action);
				},
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
			switch(orientation) {
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

		hasLeftWallWhenRotating() {
			const { x, y } = this.pos;
			switch(this.granular_orientation) {
				case 'NW':
					return this.matchCell(this.map,x,y,-1,0,'N','XM12345',"");
				case 'SW':
					return this.matchCell(this.map,x,y,0,-1,'N','XM12345',"");
				case 'SE':
					return this.matchCell(this.map,x,y,1,0,'N','XM12345',"");
				case 'NE':
					return this.matchCell(this.map,x,y,0,1,'N','XM12345',"");
			}
		}

		hasRightWallWhenRotating() {
			const { x, y } = this.pos;
			switch(this.granular_orientation) {
				case 'NW':
					return this.matchCell(this.map,x,y,0,1,'N','XM12345',"");
				case 'SW':
					return this.matchCell(this.map,x,y,-1,0,'N','XM12345',"");
				case 'SE':
					return this.matchCell(this.map,x,y,0,-1,'N','XM12345',"");
				case 'NE':
					return this.matchCell(this.map,x,y,1,0,'N','XM12345',"");
			}
		}

		matchCell(map, x, y, dx, dy, orientation, types, nottypes) {
			const cell = getCell(map, ... Game.getPosition(x,y,dx,dy,orientation));
			return (types.length === 0 || types.indexOf(cell) >= 0) && (!nottypes.length || nottypes.indexOf(cell) < 0);
		}

		mazeHole({direction, distance}) {
			const { x, y } = this.pos;
			const dx = direction === LEFT ? -1 : direction === RIGHT ? 1 : 0;
			const dy = distance === FURTHER ? 2 : distance === FAR ? 1 : distance === CLOSE ? 0 : 0;
			return this.matchCell(this.map,x,y,dx,dy,this.orientation,[], 'XM12345');			
		}

		closeWall() {
			const { x, y } = this.pos;
			return this.matchCell(this.map,x,y,0,+1,this.orientation,'XM12345',[]) || this.matchCell(this.map,x,y,0,0,this.orientation,'12345',[])			
		}

		closeDoor() {
			const { x, y } = this.pos;
			return this.matchCell(this.map,x,y,0,+1,this.orientation,'12345',[])
				|| this.matchCell(this.map,x,y,0,0,this.orientation,'12345',[])
					&& this.matchCell(this.map,x,y,0,+1,this.orientation,[],'XM12345');			
		}

		closeMap() {
			const { x, y } = this.pos;
			return this.matchCell(this.map,x,y,0,+1,this.orientation,'M',[]);			
		}

		farMap() {
			const { x, y } = this.pos;
			return this.matchCell(this.map,x,y,0,+2,this.orientation,'M',[]);
		}

		mazeMap({direction, distance}) {
			const { x, y } = this.pos;
			const dx = direction === LEFT ? -1 : direction === RIGHT ? 1 : 0;
			const dy = distance === FURTHER ? 2 : distance === FAR ? 1 : distance === CLOSE ? 0 : 0;
			return this.matchCell(this.map,x,y,dx,dy,this.orientation,"M",[]);			
		}

		farWall() {
			const { x, y } = this.pos;
			return this.matchCell(this.map,x,y,0,+2,this.orientation,'XM12345',[]);
		}

		furtherWall() {
			const { x, y } = this.pos;
			return this.matchCell(this.map,x,y,0,+3,this.orientation,'XM12345',[]);
		}

		farDoor() {
			const { x, y } = this.pos;
			return this.matchCell(this.map,x,y,0,+2,this.orientation,'12345',[]);
		}

		displayArrows() {
			const { useItem, bagOpening, hideArrows, pickedUp, hideCursor } = this;
			if (useItem || bagOpening || hideArrows || pickedUp || hideCursor) {
				return;
			}
			if (this.data.gameOver || this.battle && this.arrow !== BAG) {
				return;
			}

			const sprites = [];
			const { arrow, pos } = this;
			if (arrow) {
				if (arrow === FORWARD && pos && !this.canMove(pos, 1)) {
				} else if (arrow === BACKWARD && pos && !this.canMove(pos, -1)) {
				} else if (ARROWS[arrow]) {
					const index = this.actionDown ? 1 + Math.floor(this.now / 100) % 3 : 0;
					const { src, side } = ARROWS[arrow];
					sprites.push({ src, side, index });
				}
			}			
			this.sprites.forEach(({src}) => { if(src)this.prepareImage(src); });
			sprites.forEach(sprite => this.displayImage(ctx, sprite));
		}

		displayTips() {
			if (this.bagOpening || this.pickedUp) {
				return;
			}
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

		displayInventoryTips() {
			if (this.hoverSprite && this.mouse && this.hoverSprite.bag && this.bagOpening&& (this.frameIndex === 2 || this.frameIndex === 3) && !this.pickedUp) {
				for (let i in this.inventory) {
					if (i !== this.useItem && (!this.pickedUp || i !== this.pickedUp.item)) {
						const { item, image, count } = this.inventory[i];	
						if (this.isMouseHover({ src: image, index: this.frameIndex-1 }, 0, this.mouse)) {
							const msg = item==="gun" ? `gun with ${this.inventory.bullet.count} bullet${this.inventory.bullet.count>1?'s':''}` : (count||1) > 1 ? `${item} x${count}` : `${item}`;
							this.displayTextLine(ctx, {msg,  x:3, y: this.mouse.y >= 58 ? 40 : 58 });
						}
					}
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

				const customCursor = this.customCursor ? this.customCursor(this, ctx) : null;
				if (customCursor==="none") {
					return;
				}

				if (this.pendingTip && this.pendingTip.progress < 1 && !this.pendingTip.removeLock || this.pickedUp && this.pickedUp.tip && this.pickedUp.tip.progress < 1 || this.waitCursor || customCursor==="wait") {
					const angle = this.now / 200;
					const radius = 2;
					ctx.strokeStyle = "#FFFFFF";
					ctx.lineWidth = 1;
					ctx.beginPath();
					ctx.moveTo(x - Math.cos(angle) * radius, y - Math.sin(angle) * radius);
					ctx.lineTo(x + Math.cos(angle) * radius, y + Math.sin(angle) * radius);
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
					const canOpen = this.map && this.arrow === DOOR && this.matchCell(this.map,this.pos.x,this.pos.y,0,1,this.orientation,"12345",[]) && !this.doorOpening;

					const highLight = !this.data.gameOver && (!this.arrow || this.arrow === DOOR || this.chest) && (tipReady || canClick || canCombine || canOpen) && !this.bagOpening;
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

			this.prepareImage(ASSETS.ALPHABET);
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
				src: ASSETS.ALPHABET, col:10, row:9, size:[5,6],
				offsetX: 20, offsetY: 20,
				index: game => Math.floor(game.now / 100) % 62,
			};

			tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
			lines.forEach((msg, row) => {
				this.displayTextLine(tempCtx, {msg, x: 2, y: (row - lines.length) * 7 + 60});
			});
			if (fade > 0) {
				ctx.globalAlpha = 1 - fade;
			}
			this.displayOutlinedImage(tempCanvas, "black", 20);

			if (fade > 0) {
				ctx.globalAlpha = 1;
			}
		}

		prepareAssets() {
			for (let a in ASSETS) {
				const src = ASSETS[a];
				if (!imageStock[src]) {
					this.loadTotal++;
					this.prepareImage(src, () => {
						this.loadCount++;
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
					this.loadTotal++;
					this.prepareSound(src, () => {
						this.loadCount++;
						this.prepareSounds();
					});
					return;
				}
			}
		}

		prepareSound(src, callback) {
			if (!src) {
				console.error("Invalid sound.");
			}
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

		playTheme(song, options) {
			const {volume} = options || {};
			if(this.data.theme) {
				this.stopSound(this.data.theme.song);
			}
			if (song) {
				this.playSound(song, {loop: true, volume});
			}
			this.data.theme = {
				song,
				volume,
			}
		}

		playSound(src, options) {
			const {loop, volume} = options || {};
			if (soundStock[src]) {
				const { audio } = soundStock[src];
				if (loop) {
					audio.volume = volume || 1;
					audio.loop = true;
					if (!this.mute) {
						audio.play();
					}
				} else {
					const soundBite = audio.cloneNode(true);
					soundBite.volume = volume || .5;
					if (!this.mute) {
						soundBite.play();
					}
				}
			} else {
				this.prepareSound(src, ({audio}) => {
					audio.volume = volume || 1;
					if (!this.mute) {
						audio.play();
					}
				})
			}
		}

		stopSound(src) {
			if (src && soundStock[src]) {
				const { audio } = soundStock[src];
				audio.pause();
			}
		}

		prepareImage(src, callback) {
			const spriteData = imageStock[src];
			if (spriteData) {
				if (spriteData.loaded) {
					if (callback) {
						callback(spriteData);
					}
				} else {
					if (callback) {
						spriteData.img.addEventListener("load", () => {
							callback(stock);
						});
					};
				}
				return;
			}

			if (src.split("|").pop() === "invert-colors") {
				this.prepareImage(src.split("|").slice(0,-1).join("|"), stock => {
					const tempCanvas = document.createElement("canvas");
					tempCanvas.width = stock.img.naturalWidth || stock.img.width;
					tempCanvas.height = stock.img.naturalHeight || stock.img.height;
					const tempCtx = tempCanvas.getContext("2d");
					tempCtx.drawImage(stock.img, 0, 0);
					const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
					const { data } = imageData;
					for (let i = 0; i < data.length; i+=4) {
						if (data[i + 3]) {
							data[i + 0] = 255 - data[i + 0];
							data[i + 1] = 255 - data[i + 1];
							data[i + 2] = 255 - data[i + 2];
						}
					}
					tempCtx.putImageData(imageData, 0, 0);
					imageStock[src] = {
						loaded: true,
						img: tempCanvas,
					};
					if (callback) {
						callback(imageStock[src]);
					}
				});
				return;
			}

			if (src.split("|").pop() === "darken") {
				this.prepareImage(src.split("|").slice(0,-1).join("|"), stock => {
					const tempCanvas = document.createElement("canvas");
					tempCanvas.width = stock.img.naturalWidth || stock.img.width;
					tempCanvas.height = stock.img.naturalHeight || stock.img.height;
					const tempCtx = tempCanvas.getContext("2d");
					tempCtx.drawImage(stock.img, 0, 0);
					const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
					const { data } = imageData;
					for (let i = 0; i < data.length; i+=4) {
						if (data[i + 3]) {
							data[i + 0] = Math.max(0, Math.floor(data[i + 0]/2));
							data[i + 1] = Math.max(0, Math.floor(data[i + 1]/2));
							data[i + 2] = Math.max(0, Math.floor(data[i + 2]/2));
						}
					}
					tempCtx.putImageData(imageData, 0, 0);
					imageStock[src] = {
						loaded: true,
						img: tempCanvas,
					};
					if (callback) {
						callback(imageStock[src]);
					}
				});
				return;
			}

			if (src.split("|").pop() === "rotate-colors") {
				this.prepareImage(src.split("|").slice(0,-1).join("|"), stock => {
					const tempCanvas = document.createElement("canvas");
					tempCanvas.width = stock.img.naturalWidth || stock.img.width;
					tempCanvas.height = stock.img.naturalHeight || stock.img.height;
					const tempCtx = tempCanvas.getContext("2d");
					tempCtx.drawImage(stock.img, 0, 0);
					const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
					const { data } = imageData;
					for (let i = 0; i < data.length; i+=4) {
						if (data[i + 3]) {
							const temp = data[i + 0];
							data[i + 0] = data[i + 2];
							data[i + 2] = data[i + 1];
							data[i + 1] = temp;
						}
					}
					tempCtx.putImageData(imageData, 0, 0);
					imageStock[src] = {
						loaded: true,
						img: tempCanvas,
					};
					if (callback) {
						callback(imageStock[src]);
					}
				});
				return;
			}

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
			} else if (callback) {
				callback(spriteData);
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
			this.initGame();
			this.config = config;
			const firstScene = this.config.scenes.filter(({startScene})=>startScene)[0];
			this.loadScene(firstScene);
		}

		loadScene(scene, restoreMapInfo) {
			this.initScene();
			const { map, sprites, doors, arrowGrid, events, customCursor,
				onScene, onSceneRefresh, onSceneShot, onSceneHoldItem, onSceneUseItem, onSceneForward, onSceneBackward, onSceneBattle, onScenePunch } = scene;
			this.map = toMap(map);
			if (!restoreMapInfo && this.map) {
				const mapInfo = this.getMapInfo(this.map, this.door);
				if (mapInfo) {
					const { pos, rotation } = mapInfo;
					this.pos = pos;
					this.rotation = rotation;
				}
			}
			this.sprites = sprites || [];
			this.doors = doors;
			this.events = events;
			this.arrowGrid = arrowGrid || null;
			this.onSceneRefresh = onSceneRefresh || nop;
			this.onScene = onScene || nop;
			this.onSceneShot = onSceneShot || nop;
			this.onSceneHoldItem = onSceneHoldItem || nop;
			this.onSceneUseItem = onSceneUseItem || nop;
			this.onSceneForward = onSceneForward || nop;
			this.onSceneBackward = onSceneBackward || nop;
			this.onSceneBattle = onSceneBattle || nop;
			this.onScenePunch = onScenePunch || nop;
			this.customCursor = customCursor;
		}

		get now() {
			return this.data.time;
		}

		get pos() {
			return this.data.pos;
		}

		set pos(value) {
			this.data.pos = value;
		}

		get rotation() {
			return this.data.rotation;
		}

		set rotation(value) {
			this.data.rotation = value;
		}

		get battle() {
			return this.data.battle;
		}

		set battle(value) {
			this.data.battle = value;
		}

		handleSceneEvents() {
			if (!this.sceneTime) {
				this.sceneTime = this.data.time;
				this.onScene(this);
			}
			this.onSceneRefresh(this);
			if(this.battle && !this.data.gameOver) {
				this.onSceneBattle(this, this.battle);
			}
		}

		refreshSprites() {			
			this.sprites.forEach(sprite => {
				if (sprite.onRefresh) {
					if (this.evaluate(sprite.hidden, sprite)) {
						return;
					}
					sprite.onRefresh(game, sprite);
				}
			});
		}

		displaySprites() {
			this.sprites.forEach(({src}) => { if(src)this.prepareImage(src); });
			this.sprites.forEach(sprite => this.displayImage(ctx, sprite));
		}

		refresh(dt) {
			if (this.paused) {
				return;
			}
			this.data.time += dt;
			this.handleSceneEvents();
			this.refreshMove();
			this.refreshActions();
			this.checkMouseHover();
			this.checkUseItem();
			this.refreshSprites();

			if (this.sceneTime) {
				this.displaySprites();
				this.displayFade(this);

				this.displayDialog();
				this.displayInventory();
				this.displayPickedUp();

				this.displayGameOver();
				this.displayArrows();
				this.displayCursor();
				this.displayTips();
				this.displayInventoryTips();
				this.cleanupData();
			}
			if (this.refreshCallback) {
				this.refreshCallback();
			}
		}

		displayGameOver() {
			if (this.data.gameOver) {
				ctx.fillStyle = "#998800";
				if (this.mouse) {
					const { y } = this.mouse;
					const selection = Math.floor(y / 10) - 4;
					if (selection >= 0 && selection <= 1) {
						ctx.fillRect(0, 40 + selection * 10, 64, 6);
					}
				}

				tempCtx.globalAlpha = Math.min(1, (this.now - this.data.gameOver) / 3000);
				tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
				tempCtx.globalAlpha = 1;
				this.displayTextLine(tempCtx, {msg: "GAME OVER",  x:11, y:20 });
				this.displayTextLine(tempCtx, {msg: "try again",  x:16, y:40 });
				this.displayTextLine(tempCtx, {msg: "start over", x:14, y:50 });
				this.displayOutlinedImage(tempCtx.canvas, "black", 4, 2);
			}
		}

		displayEnding() {
			if (this.data.theEnd) {
				tempCtx.globalAlpha = Math.min(1, (this.now - this.data.theEnd) / 3000);
				tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
				tempCtx.globalAlpha = 1;
				const progress = Math.min(1, Math.max(0, (this.now - this.data.theEnd) / 10000));
				const antiProgress = 1 - progress;
				const letter = 5;
				const y = Math.round(antiProgress * 20 + progress * 25);

				if (this.now - this.data.theEnd < 1000) {
					this.displayTextLine(tempCtx, {
						msg: "ESCAPE FROM",
						x: 10, y:10,
					});
				} else if (this.now - this.data.theEnd > 10000) {					
					this.displayTextLine(tempCtx, {
						msg: "upcoming:",
						x: 10, y:10,
					});
					this.displayTextLine(tempCtx, {
						msg: "the saga",
						x: 10, y:40,
					});
					this.displayTextLine(tempCtx, {
						msg: "continues",
						x: 15, y:46,
					});
				}


				this.displayTextLine(tempCtx, {
					msg: "L",
					x: 5 + Math.round((antiProgress * 0 + progress * 8) * letter), y,
				});
				this.displayTextLine(tempCtx, {
					msg: "A",
					x: 5 + Math.round((antiProgress * 1 + progress * 1) * letter), y,
				});
				this.displayTextLine(tempCtx, {
					msg: "B",
					x: 5 + Math.round((antiProgress * 2 + progress * 0) * letter), y
				});
				this.displayTextLine(tempCtx, {
					msg: "B",
					x: 5 + Math.round((antiProgress * 3 + progress * 2) * letter), y
				});
				this.displayTextLine(tempCtx, {
					msg: "Y",
					x: 5 + Math.round((antiProgress * 4 + progress * 3) * letter), y
				});
				this.displayTextLine(tempCtx, {
					msg: "R",
					x: 5 + Math.round((antiProgress * 5 + progress * 10) * letter), y
				});
				this.displayTextLine(tempCtx, {
					msg: "I",
					x: 5 + Math.round((antiProgress * 6 + progress * 6) * letter), y
				});
				this.displayTextLine(tempCtx, {
					msg: "T",
					x: 5 + Math.round((antiProgress * 7 + progress * 7) * letter), y
				});
				this.displayTextLine(tempCtx, {
					msg: "H",
					x: 5 + Math.round((antiProgress * 8 + progress * 5) * letter), y
				});
				this.displayTextLine(tempCtx, {
					msg: "E",
					x: 5 + Math.round((antiProgress * 9 + progress * 9) * letter), y
				});


				this.displayOutlinedImage(tempCtx.canvas, "#660000", 4, 2);
			}
		}

		displayTextLine(ctx, {msg, x, y, spacing}) {
			const letterTemplate = {
				src: ASSETS.ALPHABET, col:10, row:9, size:[5,6],
				offsetX: 20, offsetY: 20,
				index: game => Math.floor(game.now / 100) % 62,
				isText: true,
			};				
			letterTemplate.offsetY = y;
			let spaceX = x;
			for (let c = 0; c < msg.length; c++) {
				const code = msg.charCodeAt(c);
				const ALPHA = ALPHAS[code] || ALPHAS[' '.charCodeAt(0)];
				const { index } = ALPHA;
				letterTemplate.offsetX = spaceX;
				letterTemplate.index = index;
				this.displayImage(ctx, letterTemplate);
				if (!ALPHA.width) {
					maskCtx.clearRect(0, 0, maskCanvas.width, maskCanvas.height);
					this.displayImage(maskCtx, letterTemplate);

					const { offsetX, offsetY } = letterTemplate;
					const { data } = maskCtx.getImageData(offsetX, offsetY, 5, 6);

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
					ALPHA.width = foundW + 1;
				}
				spaceX += ALPHA.width + (spacing || 1);
			}
		}

		displayDialog() {
			if (!this.dialog) {
				return;
			}
			const { index, conversation, time } = this.dialog;
			const frame = Math.min(3, Math.floor((this.now - time) / 80));
			if (frame < 3 || this.bagOpening || this.useItem || this.pendingTip && !this.pendingTip.removeLock) {
				this.dialog.hovered = null;
				return;
			}

			const {options} = conversation[index];
			const filteredOptions = options.filter(({hidden}) => !hidden || !this.evaluate(hidden));
			const y = this.mouse ? Math.floor((this.mouse.y - 43) / 7) : -1;
			ctx.fillStyle = this.dialog.highlightColor || "#009988";
			if (y >= 0 && y < filteredOptions.length) {
				const { msg, cantSelect } = filteredOptions[y];
				if (this.evaluate(msg) && !this.evaluate(cantSelect)) {
					this.dialog.hovered = filteredOptions[y];
					ctx.fillRect(0, y * 7 + 42, 64, 7);
				} else {
					this.dialog.hovered = null;
				}
			} else {
				this.dialog.hovered = null;
			}

			tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
			filteredOptions.forEach((option, row) => {
				const msg = this.evaluate(option.msg);
				if (msg) {
					this.displayTextLine(tempCtx, {msg, x: 2, y: row * 7 + 43});
				}
			});
			this.displayOutlinedImage(tempCtx.canvas, "black", 16);
		}

		displayOutlinedImage(image, color, intensity, size) {
			ctx.shadowColor = color;
			ctx.shadowBlur = size || 1;
			for (let i = 0; i < intensity; i++) {
				ctx.drawImage(image, 0, 0);
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
				if (!this.inventory[this.useItem]) {
					// fix bug
					this.useItem = null;
				} else {
					const { image } = this.inventory[this.useItem];
					this.displayImage(ctx, { src: image, index: 3 });
				}
			}
		}

		displayPickedUp() {
			if (!this.pickedUp) {
				return;
			}
			const {item, time, image, tip} = this.pickedUp;
			this.displayFade({
				fade: Math.min(.8, (this.now - time) / 500),
				fadeColor:"#333333",
			});
			this.displayImage(ctx, {src:image});
			tip.fade = Math.min(1, (this.now - (tip.time + (tip.text.length + 15) * tip.speed)) / 350);
			this.displayText(tip, true);
		}

		displayImage(ctx, sprite) {
			const {src, index, side, col, row, size, hidden, offsetX, offsetY, alpha, custom, ending, isText } = sprite;			
			if (this.evaluate(hidden, sprite)) {
				return;
			}
			if (ending) {
				this.displayEnding();
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
			if (!imageStock[src]) {
				return;
			}

			const spriteData = imageStock[src];
			const [ imgWidth, imgHeight ] = size || [64,64];
			let frameIndex = this.evaluate(index, sprite) || 0;
			let dstX = this.evaluate(offsetX, sprite)||0;
			let dstY = this.evaluate(offsetY, sprite)||0;
			let srcX = (frameIndex % (col||2)) * imgWidth;
			let srcY = Math.floor(frameIndex / (col||2)) * imgHeight;
			let srcW = imgWidth;
			let srcH = imgHeight;
			let dstW = imgWidth;
			let dstH = imgHeight;

			switch(this.evaluate(side, sprite)) {
				case LEFT:
					srcW /= 2;
					dstW /= 2;
					break;
				case RIGHT:
					srcW /= 2;
					dstW /= 2;
					srcX += srcW;
					dstX += dstW;
					break;
			}

			const alphaColor = this.evaluate(alpha, sprite);
			if (alphaColor) {
				ctx.globalAlpha = alphaColor;
			}
			let shiftX = 0, shiftY = 0;
			if (this.battle && this.battle.playerHit && !isText) {
				const hitTime = Math.max(10, this.now - this.battle.playerHit);
				if (hitTime < 500) {
					const intensity = 2;
					shiftX = Math.round((Math.random() - .5) * intensity * (200 / hitTime));
					shiftY = Math.round((Math.random() - .5) * intensity * (200 / hitTime));
				}
			}
			ctx.drawImage(imageStock[src].img, srcX, srcY, srcW, srcH, dstX + shiftX, dstY + shiftY, dstW, dstH);
			if (alphaColor) {
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

		clickMenu() {
			this.openMenu(this.now);
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

		screenshot() {
			tempCtx.canvas.width = 28;
			tempCtx.canvas.height = 28;
			tempCtx.imageSmoothingEnabled = true;

			tempCtx.drawImage(ctx.canvas,
				0, 0, ctx.canvas.width, ctx.canvas.height,
				0, 0, tempCtx.canvas.width, tempCtx.canvas.height);
			const uri = tempCtx.canvas.toDataURL();
			tempCtx.canvas.width = canvas.width;
			tempCtx.canvas.height = canvas.height;
			return uri;
		}

		save(name, image) {
			if (typeof(name)==='undefined') {
				name = LAST_CONTINUE;
			}
			const saves = JSON.parse(localStorage.getItem(SAVES_LOCATION) || "{}");
			saves[name] = JSON.parse(JSON.stringify(this.data));
			saves[name].image = image || this.screenshot();
			localStorage.setItem("saves", JSON.stringify(saves));
		}

		deleteSave(name) {
			if (typeof(name)!=='undefined') {
				const saves = JSON.parse(localStorage.getItem(SAVES_LOCATION) || "{}");
				delete saves[name];
				localStorage.setItem("saves", JSON.stringify(saves));
			}
		}

		load(name) {
			if (typeof(name)==='undefined') {
				name = LAST_CONTINUE;
			}
			this.playTheme(null);
			const saves = JSON.parse(localStorage.getItem(SAVES_LOCATION) || "{}");
			this.data = saves[name];
			this.setupStats();
			this.gotoScene(this.sceneIndex, this.door, true);
			if (this.data.theme) {
				this.playTheme(this.data.theme.song, {volume:this.data.theme.volume});
			}
		}

		setupStats() {
			if (!this.data.stats) {
				this.data.stats = {
					life: 100,
					maxLife: 100,
					damage: 10,
				};
			}
		}

		getSaveList() {
			return JSON.parse(localStorage.getItem(SAVES_LOCATION) || "{}");
		}

		restart() {
			this.gotoScene("start-screen");
			this.data.gameOver = false;
		}

		gameOver() {
			if (!this.data.gameOver) {
				this.data.gameOver = this.now;
				this.hideCursor = false;
				this.waitCursor = false;
				this.playTheme(null);
			}
		}

		clear() {
			ctx.clearRect(0, 0, canvas.width, canvas.height);			
		}

		blocking() {
			return this.battle && (this.arrow === BLOCK || this.arrow === BAG);
		}

		damagePlayer(damage) {
			const { stats } = this.data;
			stats.life = Math.max(stats.life - damage, 0);
		}

		damageFoe(damage) {
			this.battle.foeLife = Math.max(0, this.battle.foeLife - damage);
			if (!this.battle.foeLife) {
				this.battle.foeDefeated = this.now;
				this.useItem = null;
				this.playSound(SOUNDS.FOE_DEFEAT);
				this.playTheme(SOUNDS.CHIN_TOK_THEME, {volume: .2});
				if (this.battle.onWin) {
					this.battle.onWin(this, this.battle);
				}
			}
		}

		findChest(found, { item, image, cleared }) {
			this.blocked = this.now;
			this.chest = {
				found,
				opened: 0,
				checked: 0,
				item,
				image,
				cleared,
			};			
		}
	}

	return Game;
}) ();
