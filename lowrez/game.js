const Game = (() => {
	this.title = "Where in Space is Baby Hitler?";

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

	let TEXTSPEEDER = 1;
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
		if (!map) {
			console.error("You need a map!");
		}
		if (y < 0 || y >= map.length || !map[y] || x < 0 || x >= map[y].length) {
			return 'X';
		}
		return map[y][x];
	}

	const imageStock = {};
	const soundStock = {};
	let gameInstance;

	const gameSettings = {};

	// ['N','NW','W','SW','S','SE','E','NE'];
	const ROTATION_FRAMES = [
		[1, 0, 7],
		[2, 4, 6],
		[3, 4, 5],
	];

	class Game {
		static setTextSpeeder(value) {
			TEXTSPEEDER = value;
			console.log("TextSpeeder", TEXTSPEEDER);
		}

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
				this.inventory[obj.item].count = this.countItem(obj.item) + (count||1);
			} else {
				this.inventory[obj.item] = obj;
			}
		}

		removeFromInventory(item, count) {
			if (this.inventory[item]) {
				if (this.inventory[item].count) {
					this.inventory[item].count-= (count||1);
				}
				if (!this.inventory[item].count) {
					delete this.inventory[item];
				}
			}
		}

		countItem(item) {
			return this.inventory[item] ? this.inventory[item].count || 1 : 0;
		}

		// set sceneIndex(index) {
		// 	if (index !== this.sceneIndex) {
		// 		this.data.scene = {
		// 			index,
		// 		};
		// 		console.log("SCENE", this.data.scene);
		// 	}
		// }

		// get sceneIndex() {
		// 	return this.data.scene ? this.data.scene.index || 0 : 0;
		// }

		set sceneName(name) {
			if (name !== this.sceneName) {
				this.data.scene = {
					name,
				};
				console.log("SCENE", this.data.scene.name);
			}
		}

		get sceneName() {
			return (this.data.scene ? this.data.scene.name : null) || this.config.scenes.filter(scene => scene.startScene)[0].name;
		}

		unlock(cell) {
			if (!this.situation.unlocked) {
				this.situation.unlocked = {};
			}
			if (!this.situation.unlocked[cell]) {
				this.situation.unlocked[cell] = this.now;
				return true;
			}
			return false;
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
				if (this.now - this.lastMouseCheck < 100) {
					this.lastMouseCheck = 0;
				}
				const { offsetWidth, offsetHeight } = currentTarget;
				if (!this.mouse) {
					this.mouse = {};
				}
				this.mouse.x = offsetX / offsetWidth * canvas.width;
				this.mouse.y = offsetY / offsetHeight * canvas.height;

				if (this.pendingTip && (this.pendingTip.progress < 1 || this.pendingTip.moreText) && !this.pendingTip.removeLock || this.waitCursor || this.hideCursor) {
					return;
				}
				if (this.pickedUp && this.pickedUp.tip && this.pickedUp.tip.progress < 1) {
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
				this.lastMouseCheck = 0;
				e.preventDefault();
				const {currentTarget, offsetX, offsetY} = e;
				if (this.battle && !this.bagOpening) {
					if (!this.blocking() && !this.battle.playerHit && !this.battle.playerBlock && this.arrow !== BAG  && !(this.battle.dummyBattle && (this.arrow===LEFT || this.arrow===RIGHT)) && !this.battle.playerLeftAttack && !this.battle.playerRightAttack) {
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
				if (this.pendingTip && (this.pendingTip.progress < 1 || this.pendingTip.moreText) && !this.pendingTip.removeLock || this.waitCursor || this.hideCursor) {
					return;
				}
				if (this.useItem === "gun" && (!this.hoverSprite || !this.hoverSprite.bag && !this.hoverSprite.menu)) {
					if (this.countItem('bullet') > 0) {
						const { bullet } = this.inventory;
						this.removeFromInventory('bullet');
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
					const { image, item, message, col, row } = this.inventory[this.useItem];
					if (game.isMouseHover({ src: image, index: 3, col, row }, 0, this.mouse)) {
						this.pickUp({item, image, message:message||"", justLooking: true});
						return;
					}
				}				
				if (this.dialog && this.dialog.hovered) {
					if (this.dialog.hovered.onSelect) {
						this.dialog.hovered.onSelect(this, this.dialog, this.dialog.conversation[this.dialog.index], this.dialog.hovered);
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
					if (this.arrowGrid && !this.useItem && !this.bagOpening && !game.sceneData.showStats) {
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
									const cell = this.frontCell();
									const door = this.frontDoor();
									if (!door) {
										console.error("You need doors!");
									} else if (door.lock && (!this.situation.unlocked || !this.situation.unlocked[cell])) {
										this.showTip("It's locked.", null, null, {removeLock:true});
										this.playErrorSound();
									} else {
										if (!this.doorOpening) {
											this.performAction(this.now);
										} else if (this.doors[cell].exit) {
											if (this.doors[cell].wayUp || this.doors[cell].wayDown) {
												this.playSteps();
											}
											this.doors[cell].exit(this, this.doors[cell]);
										} else {
											this.actionDown = this.arrow;
										}
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
											if (this.doors[cell].wayUp || this.doors[cell].wayDown) {
												this.playSteps();
											}
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

		fadeToScene(index, entrance, fadeDuration, afterScene) {
			if (!fadeDuration) {
				fadeDuration = 1000;
			}
			this.waitCursor = true;
			this.fadeOut(this.now, {duration:fadeDuration * 1.5, fadeDuration, color:"#000000", onDone: game => {
				game.waitCursor = false;
				game.gotoScene(index, entrance);
				if (afterScene) {
					afterScene(game);
				}
			}});
		}

		gotoScene(index, entrance, restoreMapInfo) {
			const {door} = entrance || {};
			if (typeof(index) === "string") {
				const sceneToGoTo = index;
				index = this.config.scenes.map(({name}, idx) => name === index ? idx : -1).filter(index => index >= 0)[0];
				if (typeof(index) === 'undefined') {
					console.error(`${sceneToGoTo}: unknown scene.`);
				}
			}
			this.sceneName = this.config.scenes[index].name;
			this.door = door || 1;
			this.loadScene(this.config.scenes[index], restoreMapInfo);
		}

		get currentScene() {
			if (typeof (this.sceneByName[this.sceneName]) != 'undefined') {
				return this.sceneByName[this.sceneName];
			}
			return this.sceneByName[this.sceneName] = this.config.scenes.filter(({name}) => name === this.sceneName)[0];
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
			const { data, sceneName } = this;
			if (!data.situation[sceneName]) {
				data.situation[sceneName] = {};
			}
			return data.situation[sceneName];
		}

		get mute() {
			return gameSettings.mute || false;
		}

		set mute(value) {
			if (this.mute !== value) {
				gameSettings.mute = value;
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
			if (!data.situation[sceneName]) {
				data.situation[sceneName] = {};
			}			
			return data.situation[sceneName];
		}

		hasVisited(sceneName) {
			const { data, config } = this;
			const index = config.scenes.map(({name}, idx) => name === sceneName ? idx : -1).filter(index => index >= 0)[0];
			return data.situation[index];
		}

		pause() {
			this.paused = this.now;
			this.resumed = 0;
			for (let s in SOUNDS) {
				this.stopSound(SOUNDS[s]);
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
				name: null,
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
				joined: null,
			};
			this.setupStats();
			this.config = null;
			this.mouse = null;
			this.timeOffset = 0;
			this.paused = false;
			this.loadCount = 0;
			this.pos = null;
			this.rotation = 0;
			this.lastMouseCheck = 0;
			this.sceneByName = {};

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
			this.useItemTime = 0;
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
			this.moving = 0;
		}

		markPickedUp(item) {
			if (!this.data.pickedUp[item]) {
				this.data.pickedUp[item] = this.now;
			}
		}

		pickUp({item, image, message, inventoryMessage, count, col, row, index, onPicked, onTipDone, justLooking}) {
			if (!item) {
				console.error(`Your item (${image}) needs a name.`);
			}
			const time = this.now;
			if (!justLooking) {
				this.markPickedUp(item);
				this.addToInventory({
					item,
					image,
					col: col||2,
					row: row||2,
					count: count || 1,
					message: inventoryMessage,
				});
				this.playSound(SOUNDS.PICKUP);
			}

			this.pickedUp = {
				item,
				image,
				time,
				onPicked,
				col: col||2,
				row: row||2,
				index: index||0,
				tip: {
					text: message||"",
					time,
					speed: 100 * TEXTSPEEDER,
					fade: 0,
					end: 0,
					onDone: onTipDone,
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
			if (this.battle) {
				if (this.battle.dummyBattle) {
					this.setVisited(false);
					this.battle = null;
				}
			}
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
			const { removeLock, x, y, talker, maxLines } = options || {};
			if (Array.isArray(message)) {
				let index = 0;

				message = message.filter(a => a);
				if (message.length) {
					const tip = this.pendingTip = {
						maxLines,
						index,
						text: message[index],
						time: this.now + 200,
						speed: (speed || 80) * TEXTSPEEDER,
						end: 0,
						x, y,
						talker,
						moreText: message.length > 1,
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
				}
			} else {
				this.pendingTip = {
					maxLines,
					text: message,
					time: this.now + 200,
					speed: (speed || 90) * TEXTSPEEDER,
					end: 0,
					x, y,
					talker,
					onDone,
					removeLock,
				};
			}
		}

		startDialog(dialog) {
			this.dialog = dialog;
			dialog.time = game.now;
			dialog.index = dialog.index || 0;
		}

		checkMouseHover() {
			if (this.now - this.lastMouseCheck < 300) {
				return;
			}
			this.lastMouseCheck = this.now;

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
									if (this.useItem === "gun" && this.gunFired) {
										this.data.shot[name] = this.now;
										let handled = false;
										if (onShot) {
											handled = onShot(this, sprite);
										}
										if (!handled) {
											this.onSceneShot(this, name);
										}
									} else if (!combine || !combine(this.useItem, this, sprite)) {
										if (this.useItem !== "gun") {
											this.showTip(combineMessage && combineMessage(this.useItem, this) ||
												(name ? `You can't use the ${this.useItem} on the ${name}.` : `You can't use ${this.useItem} like that.`),
												() => {}, 70, {removeLock: true});
											this.useItem = null;
										}
									}
								} else if (sprite.onClick) {
									sprite.onClick(this, sprite);
								} else if (sprite.tip) {
									const hoveredTip = this.evaluate(sprite.tip);
									if (hoveredTip) {
										const tip = this.tips[hoveredTip];
										if (tip) {
											tip.time = Math.min(this.now, tip.time);
										}
									}									
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
			if (this.dialog) {
				return false;
			}
			return !this.battle || this.battle.dummyBattle;
		}

		canMove({x, y}, direction) {
			if (!this.map) {
				return false;
			}
			if (this.fade > 0 || this.battle || this.dialog) {
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

		behindEvent() {
			const { events } = this;
			if (!events) {
				return null;
			}
			const { pos, orientation } = this;
			const { x, y } = pos;
			const mapPosition = Game.getPosition(x,y,0,-1,orientation);
			const cell = getCell(this.map, ... mapPosition);
			return events[cell];			
		}

		currentEvent() {
			const { events } = this;
			if (!events) {
				return null;
			}
			const { pos, orientation } = this;
			const { x, y } = pos;
			const mapPosition = Game.getPosition(x,y,0,0,orientation);
			const cell = getCell(this.map, ... mapPosition);
			return events[cell];			
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

		furtherEvent() {
			const { events } = this;
			if (!events) {
				return null;
			}
			const { pos, orientation } = this;
			const { x, y } = pos;
			const mapPosition = Game.getPosition(x,y,0,2,orientation);
			const cell = getCell(this.map, ... mapPosition);
			return events[cell];			
		}

		setVisited(value) {
			const mapPosition = this.facingPosition();
			const visitTag = mapPosition.join("_");
			this.sceneData.visited[visitTag] = value;
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
						if (onEvent && onEvent(this, events[cell])) {
							this.setVisited(true);
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
					game.doorOpening = 0;
					game.doorOpened = 0;
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
			const { yupa } = game.data;
			if (yupa) {
				yupa.rotation = direction === "forward" ? (this.rotation + 4) % 8 : this.rotation;
				if (direction==="forward") {
					yupa.position = Math.random()<.5 ? -9 : 9;
				}
			}
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
			if (!this.pos) {
				return false;
			}
			const { x, y } = this.pos;
			switch(this.granular_orientation) {
				case 'NW':
					return this.onDoor() 
						? this.matchCell(this.map,x,y,-1,0,'N','.',"")
						: this.matchCell(this.map,x,y,-1,0,'N','XM12345',"");
				case 'SW':
					return this.onDoor() 
						? this.matchCell(this.map,x,y,0,-1,'N','.',"")
						: this.matchCell(this.map,x,y,0,-1,'N','XM12345',"");
				case 'SE':
					return this.onDoor() 
						? this.matchCell(this.map,x,y,1,0,'N','.',"")
						: this.matchCell(this.map,x,y,1,0,'N','XM12345',"");
				case 'NE':
					return this.onDoor() 
						? this.matchCell(this.map,x,y,0,1,'N','.',"")
						: this.matchCell(this.map,x,y,0,1,'N','XM12345',"");
			}
		}

		hasRightWallWhenRotating() {
			if (!this.pos) {
				return false;
			}
			const { x, y } = this.pos;
			switch(this.granular_orientation) {
				case 'NW':
					return this.onDoor() 
						? this.matchCell(this.map,x,y,0,1,'N','.',"")
						: this.matchCell(this.map,x,y,0,1,'N','XM12345',"");
				case 'SW':
					return this.onDoor() 
						? this.matchCell(this.map,x,y,-1,0,'N','.',"")
						: this.matchCell(this.map,x,y,-1,0,'N','XM12345',"");
				case 'SE':
					return this.onDoor() 
						? this.matchCell(this.map,x,y,0,-1,'N','.',"")
						: this.matchCell(this.map,x,y,0,-1,'N','XM12345',"");
				case 'NE':
					return this.onDoor() 
						? this.matchCell(this.map,x,y,1,0,'N','.',"")
						: this.matchCell(this.map,x,y,1,0,'N','XM12345',"");
			}
		}

		matchCell(map, x, y, dx, dy, orientation, types, nottypes) {
			const cell = getCell(map, ... Game.getPosition(x,y,dx,dy,orientation));
			return (types.length === 0 || types.indexOf(cell) >= 0) && (!nottypes.length || nottypes.indexOf(cell) < 0);
		}

		mazeHole({direction, distance}) {
			if (!this.pos) {
				return false;
			}
			const { x, y } = this.pos;
			const dx = direction === LEFT ? -1 : direction === RIGHT ? 1 : 0;
			const dy = distance === FURTHER ? 2 : distance === FAR ? 1 : distance === CLOSE ? 0 : 0;
			if (this.onDoor() && this.matchCell(this.map, x, y, dx, dy, this.orientation,".", "")) {
				return false;
			}

			return this.matchCell(this.map,x,y,dx,dy,this.orientation,[], 'XM12345');			
		}

		closeWall() {
			if (!this.pos) {
				return false;
			}
			const { x, y } = this.pos;
			if (this.facingEvent() && this.facingEvent().wall) {
				return true;
			}
			return this.matchCell(this.map,x,y,0,+1,this.orientation,'XM12345',[]) || this.matchCell(this.map,x,y,0,0,this.orientation,'12345',[]) && this.frontCell()==='.';
		}

		closeDoor() {
			if (!this.pos) {
				return false;
			}
			const { x, y } = this.pos;
			return this.matchCell(this.map,x,y,0,+1,this.orientation,'12345',[])
				|| this.matchCell(this.map,x,y,0,0,this.orientation,'12345',[]) && this.frontCell() === '.';			
		}

		onDoor() {
			if (!this.pos) {
				return false;
			}
			const { x, y } = this.pos;
			return this.matchCell(this.map,x,y,0,0,this.orientation,'12345',[]);			
		}

		frontDoor() {
			if (!this.doors) {
				return null;
			}
			return this.doors[this.frontCell()];
		}

		frontCell() {
			if (!this.pos) {
				return false;
			}
			const { x, y } = this.pos;
			return getCell(this.map, ... Game.getPosition(x,y,0,1,this.orientation));			
		}

		closeMap() {
			if (!this.pos) {
				return false;
			}
			const { x, y } = this.pos;
			return this.matchCell(this.map,x,y,0,+1,this.orientation,'M',[]);			
		}

		farMap() {
			if (!this.pos) {
				return false;
			}
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
			if (!this.pos) {
				return false;
			}
			const { x, y } = this.pos;
			if (this.furtherEvent() && this.furtherEvent().wall) {
				return true;
			}
			return this.matchCell(this.map,x,y,0,+2,this.orientation,'XM12345',[]);
		}

		furtherWall() {
			if (!this.pos) {
				return false;
			}
			const { x, y } = this.pos;
			return this.matchCell(this.map,x,y,0,+3,this.orientation,'XM12345',[]);
		}

		farDoor() {
			if (!this.pos) {
				return false;
			}
			const { x, y } = this.pos;
			return this.matchCell(this.map,x,y,0,+2,this.orientation,'12345',[]);
		}

		displayArrows() {
			const { useItem, bagOpening, hideArrows, pickedUp, hideCursor } = this;
			if (useItem || bagOpening || hideArrows || pickedUp || hideCursor) {
				return;
			}
			if (this.data.gameOver || this.battle && this.arrow !== BAG && !this.battle.dummyBattle || game.sceneData.showStats) {
				return;
			}

			const sprites = [];
			const { arrow, pos } = this;
			if (arrow) {
				if (arrow === FORWARD && pos && !this.canMove(pos, 1)) {
				} else if (arrow === BACKWARD && pos && !this.canMove(pos, -1)) {
				} else if (arrow === LEFT && !this.canTurn("left") || arrow === RIGHT && !this.canTurn("right")) {
				} else if (ARROWS[arrow]) {
					const index = this.actionDown ? 1 + Math.floor(this.now / 100) % 3 : 0;
					const { src, side } = ARROWS[arrow];
					sprites.push({ src, side, index });
				}
			}
			sprites.forEach(sprite => this.displayImage(ctx, sprite));
		}

		displayTips() {
			// if (this.bagOpening || this.pickedUp) {
			// 	return;
			// }
			if (this.pendingTip) {
				const tip = this.pendingTip;
				tip.fade = Math.min(1, (this.now - (tip.end || tip.time + (tip.text.length + 10) * tip.speed)) / 350);
				
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
				let tipItem = null;
				for (let i in this.inventory) {
					if (i !== this.useItem && (!this.pickedUp || i !== this.pickedUp.item)) {
						const { item, image, count, col, row } = this.inventory[i];	
						if (this.isMouseHover({ src: image, index: this.frameIndex-1, col, row }, 0, this.mouse)) {
							tipItem = i;
						}
					}
				}
				if (tipItem) {
					const { item, count } = this.inventory[tipItem];	
					const msg = item==="gun" ? `gun with ${this.countItem('bullet')} bullet${this.countItem('bullet')>1?'s':''}` : (count||1) > 1 ? `${item} x${count}` : `${item}`;
					ctx.fillStyle = "#000000aa";
					const showAbove = this.mouse.y >= 55;
					ctx.fillRect(1, showAbove ? 40 : 57, 62, 7);
					this.displayTextLine(ctx, {msg,  x:3, y: showAbove ? 40 : 58 });
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

				if (this.pendingTip && (this.pendingTip.progress < 1 || this.pendingTip.moreText) && !this.pendingTip.removeLock || this.pickedUp && this.pickedUp.tip && this.pickedUp.tip.progress < 1 || this.waitCursor || customCursor==="wait") {
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
					const noHighlight = this.hoverSprite && this.evaluate(this.hoverSprite.noHighlight);
					const canCombine = this.hoverSprite && this.useItem && (this.hoverSprite.name || this.hoverSprite.combine || this.hoverSprite.combineMessage);
					const canOpen = this.map && this.arrow === DOOR && this.matchCell(this.map,this.pos.x,this.pos.y,0,1,this.orientation,"12345",[]) && !this.doorOpening;

					const highLight = !this.data.gameOver && (!this.arrow || this.arrow === DOOR || this.chest) && (tipReady || canClick || canCombine || canOpen) && !this.bagOpening && !noHighlight;
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

					ctx.fillStyle = highLight ? (this.arrow && !this.battle ? "#aaFFaa" : "#FFFFaa") : "#FFFFFF";
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
			const lines = fullWrappedText.substr(0, Math.min(text.length, frame)).split("\n").slice(-(tip.maxLines || 3));

			tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
			lines.forEach((msg, row) => {
				this.displayTextLine(tempCtx, {msg, x: (tip.x || 2), y: (row - lines.length) * 7 + (tip.y || 60)});
			});
			if (fade > 0) {
				ctx.globalAlpha = 1 - fade;
			}
			this.displayOutlinedImage(tempCanvas, "black", 20);

			if (fade > 0) {
				ctx.globalAlpha = 1;
			}
		}

		countAssets(loaded) {
			let count = 0;
			for (let a in ASSETS) {
				if (!loaded || imageStock[ASSETS[a]] && imageStock[ASSETS[a]].loaded) {
					count++;
				}
			}
			for (let a in SOUNDS) {
				if (!loaded || soundStock[SOUNDS[a]] && soundStock[SOUNDS[a]].loaded) {
					count++;
				}
			}
			return count;
		}

		prepareAssets() {
			for (let a in ASSETS) {
				const src = ASSETS[a];
				if (!imageStock[src]) {
					this.prepareImage(src, stock => {
						stock.org = stock.img;
					});
				}
			}
		}

		prepareSounds() {
			for (let a in SOUNDS) {
				const src = SOUNDS[a];
				if (!soundStock[src]) {
					this.prepareSound(src, () => {
					});
				}
			}
		}

		playTheme(song, options) {
			console.log(song);
			const {volume} = options || {};
			if(this.data.theme && this.data.theme.song !== song) {
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
				const { audio, playing } = soundStock[src];
				if (loop) {
					audio.volume = volume || 1;
					audio.loop = true;
					if (!this.mute) {
						audio.play();
					}
				} else {
					if (!playing) {
						soundStock[src].playing = true;
					}
					const soundBite = playing ? audio.cloneNode(true) : audio;
					soundBite.volume = volume || .5;
					soundBite.loop = false;
					if (!this.mute) {
						soundBite.play();
					}
				}
			} else {
				this.prepareSound(src, ({audio}) => {
					soundStock[src] = audio;
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

		prepareSound(src, callback) {
			if (!src) {
				console.error("Invalid sound.");
			}
			const soundData = soundStock[src];
			if (!soundData) {
				const stock = {}
				const audio = new Audio(src);
				audio.addEventListener("ended", () => {
					stock.playing = false;
				});
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
							callback(spriteData);
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

			if (src.split("|").pop() === "chroma-key-pink") {
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
							if (data[i + 0] === 0xFF && data[i + 1] === 0 && data[i + 2] === 0xFF) {
								data[i + 0] = 0;
								data[i + 1] = 0;
								data[i + 2] = 0;
								data[i + 3] = 0;
							}
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

			if (src.split("|").pop() === "shaved") {
				this.prepareImage(src.split("|").slice(0,-1).join("|"), stock => {
					const tempCanvas = document.createElement("canvas");
					tempCanvas.width = stock.img.naturalWidth || stock.img.width;
					tempCanvas.height = stock.img.naturalHeight || stock.img.height;
					const tempCtx = tempCanvas.getContext("2d");
					tempCtx.drawImage(stock.img, 0, 0);

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

		set now(value) {
			this.data.time = value;
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

				this.sprites.forEach((sprite, index) => {
					if (sprite.onScene) {
						sprite.onScene(this, sprite);
					}
					if (sprite.init) {
						if (!this.sceneData.inited) {
							this.sceneData.inited = {};
						}
						if (!this.sceneData.inited[index]) {
							this.sceneData.inited[index] = this.now;
							sprite.init(this, sprite);
						}
					}
				});

				if (this.facingEvent() && !this.facingEvent().foe) {
					this.checkEvents();
				}

				const { yupa } = game.data;
				if (yupa) {
					yupa.rotation = (this.rotation + 4) % 8;
				}
			}
			this.onSceneRefresh(this);
			if(this.battle && !this.data.gameOver) {
				this.onSceneBattle(this, this.battle);
			}
		}

		refreshSprites() {			
			this.sprites.forEach(sprite => {
				if (sprite.onRefresh && this.sceneTime) {
					if (this.evaluate(sprite.hidden, sprite)) {
						return;
					}
					sprite.onRefresh(this, sprite);
				}
			});
		}

		displaySprites() {
			this.sprites.forEach(sprite => {
				const { src, hidden } = sprite;			
				if (this.evaluate(hidden, sprite)) {
					return;
				}
				const processedSrc = this.evaluate(src, sprite);

				if (processedSrc) {
					this.prepareImage(processedSrc);
				}
				this.displayImage(ctx, sprite);
			});
		}

		refresh(dt) {
			if (this.paused && this.gameLoaded) {
				return;
			}
			this.data.time += dt;
			this.handleSceneEvents();
			if (this.sceneTime) {
				this.refreshMove();
				this.refreshActions();
			}
			if (this.sceneTime) {
				this.checkMouseHover();
				this.checkUseItem();				
			}

			if (this.sceneTime) {
				this.refreshSprites();
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
				if (this.sceneData.gameOverMessage) {
					const lines = this.sceneData.gameOverMessage.split("\n");
					lines.forEach((msg, index) => {
						this.displayTextLine(tempCtx, {msg, x: 1, y: 15 + index * 7})
					});
				} else {
					this.displayTextLine(tempCtx, {msg: "GAME OVER",  x:11, y:20 });					
				}
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

		displayTextLine(ctx, {msg, x, y, spacing, alpha}) {
			const letterTemplate = {
				src: ASSETS.ALPHABET, col:10, row:10, size:[5,6],
				offsetX: 20, offsetY: 20,
				index: game => Math.floor(game.now / 100) % 62,
				isText: true,
				alpha,
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
			return spaceX - x;
		}

		displayDialog() {
			if (!this.dialog) {
				return;
			}
			const { pendingTip} = this;
			if (pendingTip && !pendingTip.talker) {
				return;
			}
			const { index, conversation, time } = this.dialog;
			const frame = Math.min(3, Math.floor((this.now - time) / 80));
			if (this.bagOpening || this.useItem || this.pendingTip && !this.pendingTip.removeLock || this.dialog.paused) {
				this.dialog.hovered = null;
				return;
			}

			const dialogTime = this.now - this.dialog.time;
			const dialogShift = Math.round((dialogTime < 50 ? (50 - dialogTime) / 50 : 0) * 4);

			if (!conversation[index]) {
				throw new Error(`Dialog index ${index} out of bound.`);
			}

			const {options} = conversation[index];
			const filteredOptions = options.filter(option => !option.hidden || !this.evaluate(option.hidden, option));
			const y = this.mouse ? Math.floor((this.mouse.y - 43) / 7) : -1;
			ctx.fillStyle = this.dialog.highlightColor || "#009988aa";
			if (y >= 0 && y < filteredOptions.length) {
				const { msg, cantSelect } = filteredOptions[y];
				if (this.evaluate(msg) && !this.evaluate(cantSelect)) {
					this.dialog.hovered = filteredOptions[y];
					ctx.fillRect(0, dialogShift + y * 7 + 42, 64, 7);
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
					this.displayTextLine(tempCtx, {msg, x: 2, y: dialogShift + row * 7 + 43});
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
						const { item, image, col, row } = this.inventory[i];
						this.displayImage(ctx, { src: image, col, row, index: this.frameIndex-1 });
					}
				}
			}
			if (this.useItem) {
				if (!this.inventory[this.useItem]) {
					// fix bug
					this.useItem = null;
				} else {
					const { image, col, row } = this.inventory[this.useItem];
					this.displayImage(ctx, { src: image, col, row, index: 3 });
				}
			}
		}

		displayPickedUp() {
			if (!this.pickedUp) {
				return;
			}
			const {item, time, image, tip, col, row, index } = this.pickedUp;
			this.displayFade({
				fade: Math.min(.8, (this.now - time) / 500),
				fadeColor:"#333333",
			});
			this.displayImage(ctx, {src:image, col, row, index});
			tip.fade = Math.min(1, (this.now - (tip.time + (tip.text.length + 15) * tip.speed)) / 350);
			this.displayText(tip, true);
			if (tip.fade >= 1 && !tip.done) {
				tip.done = true;
				if (tip.onDone) {
					tip.onDone(this);
				}
			}			
		}

		displayImage(ctx, sprite) {
			const {src, scale, index, side, col, row, size, hidden, offsetX, offsetY, alpha, custom, ending, isText, globalCompositeOperation } = sprite;			
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
			const processedSrc = this.evaluate(src, sprite);

			if (!processedSrc) {
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
			const spriteData = imageStock[processedSrc];
			if (!spriteData) {
				return;
			}

			const [ imgWidth, imgHeight ] = size || [64,64];
			const spriteScale = this.evaluate(scale, sprite) || 1;
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
			dstW *= spriteScale;
			dstH *= spriteScale;

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
			if (this.sceneData.shakeTime && !isText) {
				const hitTime = Math.max(10, this.now - this.sceneData.shakeTime);
				if (hitTime < 500) {
					const intensity = 1;
					shiftY += Math.round((Math.random()-.5) * intensity * (200 / hitTime));
				}
			}
			if (globalCompositeOperation) {
				ctx.globalCompositeOperation = this.evaluate(globalCompositeOperation, sprite);
			}

			ctx.drawImage(spriteData.img, srcX, srcY, srcW, srcH, dstX + shiftX, dstY + shiftY, dstW, dstH);
			if (alphaColor) {
				ctx.globalAlpha = 1.0;
			}
			if (globalCompositeOperation) {
				ctx.globalCompositeOperation = "source-over";
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
						const { item, image, col, row } = this.inventory[i];
						if (this.isMouseHover({src:image, index:this.frameIndex-1, col, row}, 1, this.mouse)) {
							this.useItem = item;
							this.useItemTime = this.now;
						}
					}
				}
			}
			this.openBag(this.now, game => {
				this.onSceneHoldItem(game, this.useItem);
			});
		}

		clickMenu() {
			this.sceneData.showStats = 0;
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
			const triedAgain = this.data.gameOver;
			const saves = JSON.parse(localStorage.getItem(SAVES_LOCATION) || "{}");
			this.data = saves[name];
			this.setupStats();
			if (triedAgain) {
				this.data.stats.life = Math.max(this.data.stats.maxLife / 2, this.data.stats.life)
				this.data.stats.state.drank = 0;
				this.data.stats.state.ate = 0;
			}
			this.gotoScene(this.sceneName, this.door, true);
			if (this.data.theme) {
				this.playTheme(this.data.theme.song, {volume:this.data.theme.volume});
			}
			for (let id in this.imageStock) {
				if (this.imageStock[id].org) {
					this.imageStock[id].img = this.imageStock[id].org;
				}
			}
			if (this.data.images) {
				for (let src in this.data.images) {
					this.replaceImage(src, this.data.images[src]);
				}
			}
			if (!this.data.name) {
				this.data.name = "Hitman";
			}
		}

		replaceImage(id, src) {
			const img = new Image();
			img.addEventListener("load", e => {
				const canvas = document.createElement("canvas");
				canvas.width = img.naturalWidth;
				canvas.height = img.naturalHeight;
				canvas.getContext("2d").drawImage(img, 0, 0);

				const stock = this.imageStock[id] = {
					img: canvas,
					loaded: true,
				};
			});
			img.src = this.data.images[id];
		}

		setupStats() {
			if (!this.data.stats) {
				this.data.stats = {
					life: 80,
					maxLife: 120,
					damage: 10,
					defense: 10,
					xp: 0,
					bonus: 0,
				};
			}
			if (!this.data.stats.state) {
				this.data.stats.state = {
					drank: 0,
					ate: 0,
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

		gameOver(message) {
			if (!this.data.gameOver) {
				this.waitCursor = true;
				this.data.gameOver = this.now;
				this.sceneData.gameOverMessage = message;
				this.hideCursor = false;
				this.delayAction(game => {
					this.waitCursor = false;
				}, 1000);
				this.useItem = null;
				this.playTheme(null);
			}
		}

		clear() {
			ctx.clearRect(0, 0, canvas.width, canvas.height);			
		}

		blocking() {
			return this.battle && (this.arrow === BLOCK || this.arrow === BAG);
		}

		damagePlayer(damage, options) {
			const {shot, blocked} = options ? options : {};
			const { stats } = this.data;
			const calcDamage = damage * damage / Math.max(1, this.data.stats.defense);
			stats.life = Math.max(stats.life - calcDamage, blocked ? 1 : 0);
		}

		damageFoe(damage, options) {
			const {shot, blocked} = options ? options : {};
			const calcDamage = shot ? damage : damage * damage / Math.max(1, this.battle.foeDefense);
			this.battle.foeLife = Math.max(blocked ? 1 : 0, this.battle.foeLife - calcDamage);
			if (!this.battle.foeLife) {
				this.battle.foeDefeated = this.now;
				this.useItem = null;
				this.playSound(SOUNDS.FOE_DEFEAT);
				this.playTheme(this.battle.theme || SOUNDS.CHIN_TOK_THEME, {volume:.2});
				if (this.battle.onWin) {
					this.data.stats.state = {
						ate: 0,
						drank: 0,
					};
					if (!shot && this.battle.xp) {
						this.battle.gainedXP = this.battle.xp;
						const currentLevel = this.getLevel(this.data.stats.xp);
						this.gainXP(this.battle.xp);
						if (currentLevel < this.getLevel(this.data.stats.xp)) {
							this.battle.gainedLevel = this.now;
							this.delayAction(game => {
								game.openMenu(game.now);
								game.data.stats.bonus = (game.data.stats.bonus||0) + 3;
								game.playSound(SOUNDS.JINGLE);
							}, 2000);
						}
					}
					this.battle.onWin(this, this.battle);
				}
			}
		}

		gainXP(xp) {
			this.data.stats.xp = (this.data.stats.xp || 0) + (xp || 0);
			console.log("LEVEL: ", this.getLevel(this.data.stats.xp));
		}

		getLevel(xp) {
			return Math.max(2, Math.ceil(Math.log(xp))) - 1;
		}

		findChest(found, { item, image, cleared, message }) {
			this.chest = {
				found,
				opened: 0,
				checked: 0,
				item,
				image,
				cleared,
				message,
			};			
		}

		playSteps() {
			this.playSound(SOUNDS.HIT, {volume: .5});
			this.delayAction(game => {
				game.playSound(SOUNDS.HIT, {volume:.3});
			}, 300);
			this.delayAction(game => {
				game.playSound(SOUNDS.HIT, {volume:.2});
			}, 600);
			this.delayAction(game => {
				game.playSound(SOUNDS.HIT, {volume:.12});
			}, 900);
		}

		playErrorSound() {
			game.playSound(SOUNDS.ERROR);
			game.delayAction(game => game.playSound(SOUNDS.ERROR), 100);
		}

		toAlienDigits(s, size) {
			const ALIEN_DIGIT_0 = 1000;

			let str = "";
			while (s > 0 || str.length < size) {
				const num = s % 10;
				str = ALPHAS[ALIEN_DIGIT_0 + s % 10].char + str;
				s = Math.floor(s / 10);
			}
			return str;			
		}

		addToLife(value, color) {
			const { stats } = this.data;
			this.sceneData.lifeIncrease = {
				value: Math.min(value, stats.maxLife - stats.life), time: this.now,
				color,
			};
			stats.life = Math.min(stats.life + value, stats.maxLife);			
			if (!game.battle || game.battle.foeDefeated) {
				this.openMenu(this.now);
			}
		}

		dumdum() {
			const CHEATCODDE = "yupayupa";
		}

		getAnimation(dx, dy) {
			dx = dx < 0 ? -1 : dx > 0 ? 1 : 0;
			dy = dy < 0 ? -1 : dy > 0 ? 1 : 0;
			return ROTATION_FRAMES[dy + 1][dx + 1];
		}

		getSceneCount() {
			const srcs = {};
			let count = 0;
			const scripts = document.querySelectorAll("script");
			for (let i = 0; i < scripts.length; i++) {
				if (scripts[i].src.indexOf("config/") >= 0) {
					count++;
				}
			}
			return count;
		}
	}

	return Game;
}) ();
