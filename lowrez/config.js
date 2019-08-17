const shortcut = {
	0: game => game.situation.explode && game.data.shot["left guard"] && game.data.shot["right guard"] ? FORWARD : null,
	1: game => game.matchCell(game.map,game.pos.x,game.pos.y,0,1,game.orientation,"12345",[]) && !game.doorOpening ? DOOR : FORWARD,
	2: game => game.matchCell(game.map,game.pos.x,game.pos.y,0,1,game.orientation,"12345",[]) ? (!game.doorOpening ? DOOR : FORWARD) : null,
	3: game => game.battle ? BAG : BACKWARD,
};

function s(index) {
	return shortcut[index];
}

const gameConfig = {
	scenes: [
		{
			name: "jail-cell",
			arrowGrid: [
				[],
				[],
				[ null, null, null,  null, null  ],
				[ LEFT, null, s(0),  null, RIGHT ],
				[ LEFT, null, BAG , null, RIGHT ],
			],
			onSceneForward: game => {
				game.waitCursor = true;
				game.hideArrows = true;
				game.fadeOut(game.now, {duration:3000, fadeDuration:2000, color:"#000000", onDone:() => {
					game.gotoScene("maze", {door:1});
				}});
				return true;
			},
			onSceneUseItem: (game, item) => {
				if (item === "gun" && !game.data.shot.lamp) {
					if (game.rotation === 0 && !game.sceneData.guardAlert) {
						game.sceneData.guardAlert = game.now + 1000;
					}
				}
			},
			onSceneHoldItem: (game, item) => {
				if (game.data.shot.lamp && !game.data.scene.lighterOn && item === "lighter") {
					game.playSound(SOUNDS.HIT);
					game.data.scene.lighterOn = game.now + 500;
					game.useItem = null;
				}
			},
			onSceneShot: (game, item) => {
				if (!game.data.shot.lamp) {
					if (game.rotation === 0) {
						if (!game.sceneData.guardAlert || game.now < game.sceneData.guardAlert) {
							game.sceneData.guardAlert = game.now;
						}
					} else {
						game.waitCursor = true;
						game.showTip("Uh oh, that was a bit loud.", game => {
							game.hideCursor = true;
							if (game.rotation === 4 || game.rotation === 6) {
								game.turnLeft(game.now, game => {
									if (game.rotation !== 0) {
										game.turnLeft(game.now, game => {
											game.sceneData.guardAlert = game.now;
										});
									} else {
										game.sceneData.guardAlert = game.now;
									}
								});
							} else if (game.rotation === 2) {
								game.turnRight(game.now, game => {
									game.sceneData.guardAlert = game.now;
								});
							}
						});
					}
				} else {
					if (item == "lamp") {
						game.playTheme(null);
					}
					if (!game.sceneData.guardAlert) {
						game.sceneData.guardAlert = game.now + 2000;
					}
				}
			},
			onScene: game => {
				if (location.search.indexOf("bad-guards") >= 0) {
					game.see("badguards");
				}

				if (!game.data.seen.intro) {
					game.see("intro");
					if (location.search.indexOf("skip-intro") < 0) {
						game.fade = 1;
						game.sceneIntro = true;
						game.hideCursor = true;
						game.hideArrows = true;
						game.delayAction(game => {
							game.showTip([
								"My brain... it hurts...",
								"And my body is filled with bruises...",
								"Where am I? I don't\nremember\nanything.",
								"WHO am I?"
								], game => {
								game.sceneIntro = false;
								game.sceneData.beginTime = game.now;
								game.hideCursor = false;
								game.playTheme(SOUNDS.JAIL_CELL_THEME);
							});
						}, 3000);
					}
				} else if (game.data.seen.badguards && !game.data.seen.badguards_intro) {
					game.see("badguards_intro");
					if (location.search.indexOf("skip-intro") < 0) {
						game.fade = 1;
						game.sceneIntro = true;
						game.hideCursor = true;
						game.hideArrows = true;
						game.delayAction(game => {
							game.showTip([
								"Ohh my brain... it hurts...",
								"And my body is filled with bruises...",
								"... now at least, I know how I got those.",
								"I must find a way out of here.",
								], game => {
								game.sceneIntro = false;
								game.sceneData.beginTime = game.now;
								game.hideCursor = false;
								game.playTheme(SOUNDS.JAIL_CELL_THEME);
							});
						}, 2000);
					}						
				}
				game.save();
			},
			onSceneRefresh: game => {
				if (game.sceneData.cakebomb && !game.situation.explode) {
					const frame = Math.floor((game.now - game.sceneData.cakebomb)/100);
					if (frame >= 11 && !game.situation.explode) {
						game.situation.explode = game.now;
						game.playSound(SOUNDS.GUN_SHOT);
						game.delayAction(game => game.playSound(SOUNDS.GUN_SHOT), 50);
						game.delayAction(game => game.playSound(SOUNDS.GUN_SHOT), 50);
						game.sceneData.pieces = new Array(10).fill(null).map(a => {
							const byte = Math.max(0x50, Math.floor(Math.random() * 0xaa)).toString(16);
							const color = `#cc${byte}00`;
							const size = Math.random() < .5 ? 1 : 2;

							const p = {
								x: [37 + 10 * (Math.random()-.5)],
								y: [35 + Math.random()*2],
								dx: (Math.random() - .5) * 2,
								dy: -Math.random() * 2,
								size,
								color,
								appear: game.now,
							};
							return p;
						});	
						if (!game.data.shot.lamp) {
							game.sceneData.guardAlert = game.now + 1000;
						}											
					}
				}
				if (!game.sceneIntro && !game.sceneData.showedIntro) {
					game.fade = Math.max(0, 1 - (game.now - game.sceneData.beginTime) / 3000);
					if (game.hideArrows && game.fade === 0) {
						game.hideArrows = false;
					} 
					if (game.fade === 0) {
						game.sceneData.showedIntro = true;
					}
				}
				if (game.sceneData.guardAlert) {
					if (!game.data.shot["right guard"]) {
						const frame = 5 + Math.max(0, Math.min(2, Math.floor((game.now - game.sceneData.guardAlert) / 200)));
						if (frame === 7) {
							if (!game.sceneData.rightShot || game.now - game.sceneData.rightShot > 500) {
								if (!game.sceneData.rightShotCount || game.sceneData.rightShotCount < 6) {
									game.playSound(SOUNDS.GUN_SHOT);
									game.sceneData.rightShot = game.now;
									game.sceneData.rightShotCount = (game.sceneData.rightShotCount||0) + 1;
									if (!game.sceneData.firstShot) {
										game.sceneData.firstShot = game.now;
										game.frameIndex = 0;
										game.useItem = null;
										game.hideCursor = true;
									}
								}
							}
						}
					}
					if (!game.data.shot["left guard"]) {
						const frame = 1 + Math.max(0, Math.min(2, Math.floor((game.now - game.sceneData.guardAlert) / 150)));
						if (frame === 3) {
							if (!game.sceneData.leftShot || game.now - game.sceneData.leftShot > 300) {
								if (!game.sceneData.leftShotCount || game.sceneData.leftShotCount < 6) {
									game.playSound(SOUNDS.GUN_SHOT);
									game.sceneData.leftShot = game.now;
									game.sceneData.leftShotCount = (game.sceneData.leftShotCount||0) + 1;
									if (!game.sceneData.firstShot) {
										game.sceneData.firstShot = game.now;
										game.frameIndex = 0;
										game.useItem = null;
										game.hideCursor = true;
									}
								}
							}
						}
					}
					if (game.sceneData.firstShot) {
						const progress = Math.min(1, (game.now - game.sceneData.firstShot) / 3000);
						game.fade = game.sceneData.firstShot ? .9 * progress : 0;
						game.fadeColor = "#990000";
						if (progress >= 1 && !game.data.gameOver) {
							game.gameOver();
						}
					}
				}
			},
			sprites: [
				{
					src: ASSETS.EXIT_DOOR,
					hidden: game => game.rotation !== 0,
				},
				{
					src: ASSETS.JAIL, col:3, row:3,
					index: () => Math.random() < .1 ? 1 : 0,
					hidden: game => game.rotation !== 0,
				},
				{
					src: ASSETS.DIMMING_LIGHT, col:2, row:2,
					index: () => game.data.shot.lamp ? 3 : Math.random() < .1 ? 1 : 0,
					hidden: game => game.rotation !== 0,
				},
				{
					name: "lamp",
					src: ASSETS.LAMP,
					hidden: game => game.rotation !== 0 || game.data.shot.lamp,
				},
				{
					name: "right guard",
					src: ASSETS.RIGHT_GUARD, col:3, row:3,
					index: game => {
						if (game.data.shot["right guard"]) {
							const frame = 1 + Math.max(0, Math.min(3, Math.floor((game.now - game.data.shot["right guard"]) / 150)));
							return frame;
						}
						if (game.sceneData.guardAlert) {
							const frame = 5 + Math.max(0, Math.min(2, Math.floor((game.now - game.sceneData.guardAlert) / 200)));
							return frame;
						}
						return 0;
					},
					hidden: game => game.rotation !== 0,
					onClick: game => { if (!game.data.shot.lamp && !game.sceneData.guardAlert) game.gotoScene("zoom-guards"); },
					tip: game => game.data.seen.badguards ? null : "He looks bored.",
					combine: (item, game) => {
						if (item !== "gun" && !game.data.shot.lamp && !game.sceneData.guardAlert) {
							game.gotoScene("zoom-guards");
							game.useItem = item;
						}
						return true;
					}
				},
				{
					name: "left guard",
					src: ASSETS.LEFT_GUARD, col:3, row:3,
					index: game => {
						if (game.data.shot["left guard"]) {
							const frame = 4 + Math.max(0, Math.min(3, Math.floor((game.now - game.data.shot["left guard"]) / 150)));
							return frame;
						}
						if (game.sceneData.guardAlert) {
							const frame = 1 + Math.max(0, Math.min(2, Math.floor((game.now - game.sceneData.guardAlert) / 150)));
							return frame;
						}
						return 0;
					},
					hidden: game => game.rotation !== 0,
					onClick: game => { if (!game.data.shot.lamp && !game.sceneData.guardAlert) game.gotoScene("zoom-guards");},
					tip: game => game.data.seen.badguards ? null : "He's reading a book.",
					combine: (item, game) => {
						if (item !== "gun" && !game.data.shot.lamp && !game.sceneData.guardAlert) {
							game.gotoScene("zoom-guards");
							game.useItem = item;
						}
						return true;
					}
				},
				{
					name: "tilehole",
					src: ASSETS.TILE, col:3, row:3,
					index: game => (game.rotation + 8) % 8,
					hidden: game => game.rotation === 0 || !game.data.pickedUp.tile,
					onClick: game => game.gotoScene("tile-hole"),
					combineMessage: (item, game) => "I don't need to put anything in there.",
				},					
				{
					src: ASSETS.CAGE, col:2, row:3,
					index: game => (game.data.scene.lighterOn ? 3 : 0) + (game.situation.explode ? Math.min(2, Math.floor((game.now - game.situation.explode) / 100)) : 0),
					hidden: game => game.rotation !== 0,
				},
				{
					name: "lock",
					src: ASSETS.LOCK,
					hidden: game => game.rotation !== 0 || game.data.cakelock,
					combineMessage: (item, game) => `I can't pick the lock with a ${item}`,
					combine: (item, game) => {
						if (item === "cake") {
							delete game.inventory[game.useItem];
							game.useItem = null;						
							game.data.cakelock = game.now;
							if (!game.data.shot.lamp) {
								game.showTip("The guards look at me\nsuspiciously.");
							}
							return true;
						}
					},
				},
				{
					name: "cakelock",
					src: ASSETS.CAKE_BOOM,
					index: game => game.sceneData.cakebomb ? Math.min(11, Math.floor((game.now - game.sceneData.cakebomb)/100)) : 0,
					hidden: game => game.rotation !== 0 || !game.data.cakelock || game.situation.explode,
					combine: (item, game) => {
						if (item === "lighter") {
							game.useItem = null;						
							game.sceneData.cakebomb = game.now;
							return true;
						}
					},
				},
				{
					custom: (game, sprite, ctx) => {
						if (game.situation.explode) {
							const pieces = game.sceneData.pieces || [];
							pieces.forEach(piece => {
								const { x, y, preX, preY, dx, dy, size, color, appear } = piece;
								if (appear < game.now) {
									ctx.fillStyle = color;
									for (let i = 0; i < x.length; i++) {
										ctx.fillRect(x[i], y[i], size - i*.1, size - i*.1);
									}
									if (x.length < 2) {
										x.push(x[x.length-1]);
										y.push(y[y.length-1]);
									}
									for (let i = x.length-1; i>=1; i--) {
										x[i] = x[i-1];
										y[i] = y[i-1];
									}
									piece.x[0] += dx;
									piece.y[0] += dy;
									piece.dy+= .15;
								}
							});
						}
					},
				},				
				{
					src: ASSETS.SHOOTS,
					index: 0,
					hidden: game => game.rotation !== 0 || !game.sceneData.leftShot || game.now - game.sceneData.leftShot > 100,				
				},
				{
					src: ASSETS.SHOOTS,
					index: 1,
					hidden: game => game.rotation !== 0 || !game.sceneData.rightShot || game.now - game.sceneData.rightShot > 100,				
				},
				{
					src: ASSETS.SHOOTS,
					index: 2,
					hidden: game => {
						if (game.rotation !== 0 || game.data.shot["left guard"]) {
							return true;
						}				
						if (!game.sceneData.guardAlert) {
							return true;
						}
						const frame = 1 + Math.max(0, Math.min(2, Math.floor((game.now - game.sceneData.guardAlert) / 150)));
						return frame < 3;
					}
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
					preventClick: game => game.rotation !== 6,
					onClick: game => game.gotoScene("birthday"),
					tip: ({rotation, data}) => rotation === 4 || data.seen["writing"] ? null : "How long was I in this cell?",
				},
				{
					name: "photo",
					src: ASSETS.PHOTO, col:3, row:3,
					index: game => (game.rotation + 8) % 8,
					hidden: (game,{name}) => game.rotation === 0 || game.data.pickedUp[name],
					onClick: (game, {name}) => game.pickUp({item:name, image:game.data.shot.photo ? ASSETS.GRAB_PHOTO_SHOT : ASSETS.GRAB_PHOTO, message:"It's ...\nBABY HITLER!" + (game.data.shot.photo ? "\n...\nHuh... did I make that hole?" : "")}),
					tip: () => "This photo looks familiar",
				},
				{
					name: "tile",
					src: ASSETS.TILE, col:3, row:3,
					index: game => (game.rotation + 8) % 8,
					hidden: game => game.rotation === 0 || game.data.pickedUp.tile,
					onClick: game => game.showTip("I can't lift it with my fingers. I need some kind of lever."),
					tip: "The tile seems loose.",
					combineMessage: (item, game) => "That doesn't work as a lever.",
					combine: (item, game) => {
						if (item !== "cake fork") {
							return false;
						}
						game.playSound(SOUNDS.HIT);
						game.markPickedUp("tile");
						delete game.inventory[game.useItem];
						game.useItem = null;
						return true;
					},
				},
				{
					src: ASSETS.CAKE_TRASH, col:3, row:3,
					index: game => (game.rotation + 8) % 8,
					hidden: (game,{name}) => !game.data.seen.badguards || game.rotation === 0,
				},
				{
					name: "cake",
					src: ASSETS.CAKE_PIECE, col:3, row:3,
					index: game => (game.rotation + 8) % 8,
					hidden: (game,{name}) => !game.data.seen.badguards || game.rotation === 0 || game.data.pickedUp[name],
					tip: "I don't think the cake was edible. That thing burned my eyes.",
					onClick: (game, {name}) => game.pickUp({item:name, image:ASSETS.GRAB_CAKE, message:"The most\npathetic part in all of this ... I still want a bite of that cake."}),
				},
				{
					name: "cake fork",
					src: ASSETS.CAKE_FORK, col:3, row:3,
					index: game => (game.rotation + 8) % 8,
					hidden: (game,{name}) => !game.data.seen.badguards || game.rotation === 0 || game.data.pickedUp[name],
					tip: "That looks like a fork.",
					onClick: (game, {name}) => game.pickUp({item:name, image:ASSETS.GRAB_FORK, message:"Hum... they took the time to bring me a cake fork..."}),
				},
				{
					name: "lighter",
					src: ASSETS.LIGHTER, col:3, row:3,
					index: game => (game.rotation + 8) % 8,
					hidden: (game,{name}) => !game.data.seen.badguards || game.rotation === 0 || game.data.pickedUp[name],
					tip: "Turns out they left a bunch of stuff behind.",
					onClick: (game, {name}) => game.pickUp({item:name, image:ASSETS.GRAB_LIGHTER, message:"For the candle on my cake, they actually used a lighter."}),
				},
				{
					name: "empty bottle",
					src: ASSETS.BOTTLE, col:3, row:3,
					index: game => (game.rotation + 8) % 8,
					hidden: (game,{name}) => game.rotation === 0 || game.data.pickedUp[name] || game.data.shot[name],
					onClick: (game, {name}) => game.pickUp({item:name, image:ASSETS.GRAB_BOTTLE, message:"It's empty."}),
				},
				{
					src: ASSETS.BOTTLE_SHARDS, col:3, row:3,
					index: game => (game.rotation + 8) % 8,
					hidden: (game,{name}) => game.rotation === 0 || !game.data.shot["empty bottle"],
				},
				{
					fade: game => {
						if (game.data.scene.lighterOn) {
							const progress = Math.max(0, Math.min(1, (game.now - game.data.scene.lighterOn) / 10000));
							return .9 * (1 - progress) + 0 * progress;
						}
						return .9
					},
					fadeColor: "#000000",
					hidden: game => {
						if (game.sceneData.rightShot && game.now - game.sceneData.rightShot < 150) {
							return true;
						}
						if (game.sceneData.leftShot && game.now - game.sceneData.leftShot < 150) {
							return true;
						}
						return !game.data.shot.lamp || game.gunFiredWithin(150);
					}
				},
				{
					fade: game => {
						const progress = Math.max(0, Math.min(1, (game.now - game.data.scene.lighterOn) / 5000));
						return progress * .75 + Math.cos(game.now / 15)*.01;
					},
					fadeColor: "#331100",
					hidden: game => {
						if (game.sceneData.rightShot && game.now - game.sceneData.rightShot < 150) {
							return true;
						}
						if (game.sceneData.leftShot && game.now - game.sceneData.leftShot < 150) {
							return true;
						}
						return !game.data.scene.lighterOn || game.gunFiredWithin(150);
					}
				},
				{
					fade: .9,
					fadeColor: "#ffffff",
					hidden: game => !game.data.shot.lamp || game.now - game.data.shot.lamp >= 100,
				},
				{
					src: ASSETS.DIMMING_LIGHT, col:2, row:2,
					index: 2,
					hidden: game => !game.data.shot.lamp || game.now - game.data.shot.lamp >= 100 || game.rotation !== 0,
				},
				{
					name: "self",
					src: ASSETS.EATER, col:2, row:2,
					index: (game, sprite) => game.hoverSprite === sprite ? Math.min(2, Math.floor((game.now - sprite.hoverTime) / 100)) : 0,
					hidden: game => game.useItem !== 'cake',
					combine: (item, game) => {
						if (item === 'cake') {
							game.gotoScene("alien");
						}
						return true;
					},
				},
				{
					bag: true,
					src: ASSETS.BAG_OUT,
					index: game => game.frameIndex,
					hidden: game => game.arrow !== BAG && !game.bagOpening || game.sceneData.firstShot,
					alpha: game => game.emptyBag() && game.frameIndex === 0 ? .2 : 1,
					onClick: game => game.clickBag(),
				},
			],
		},
		{
			name: "maze",
			onScene: game => {
				game.playTheme(SOUNDS.CHIN_TOK_THEME, {volume: .2});
				game.save();
			},
			arrowGrid: [
				[],
				[],
				[ null, null, s(2),     null, null  ],
				[ LEFT, null, s(1),     null, RIGHT ],
				[ LEFT, null, BACKWARD, null, RIGHT ],
			],
			map: `
				XXXXXXXX
				X.....XX
				XX.XX.XX
				XX1XX.XX
				XXXXX2XX
				XXXXXXXX
			`,
			sprites: [
				{
					custom: (game, sprite, ctx) => ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height),
				},
				{
					src: ASSETS.MAZE_ROTATION_BACKGROUND,
					hidden: game => game.rotation % 2 === 0,
				},
				{
					src: ASSETS.MAZE_ROTATION_WALLS,
					side: LEFT,
					hidden: game => game.rotation % 2 === 0 || !game.hasLeftWallWhenRotating(),
				},
				{
					src: ASSETS.MAZE_ROTATION_WALLS,
					side: RIGHT,
					hidden: game => game.rotation % 2 === 0 || !game.hasRightWallWhenRotating(),
				},
				{
					src: ASSETS.MAZE_ROTATION_CORNER,
					hidden: game => !game.hasLeftWallWhenRotating() || !game.hasRightWallWhenRotating(),
				},
				{
					src: ASSETS.DUNGEON_MOVE,
					index: game => game.doorOpening ? 0 : game.frameIndex,
					hidden: game => game.rotation % 2 === 1,
				},
				{
					src: ASSETS.FAR_SIDE,
					side: LEFT,
					index: game => game.doorOpening ? 0 : game.frameIndex,
					hidden: game => game.rotation % 2 === 1 || !game.mazeHole({direction:LEFT, distance: FAR}),
				},
				{ 
					src: ASSETS.FAR_SIDE_CORNER,
					side: LEFT,
					index: game => game.doorOpening ? 0 : game.frameIndex,
					hidden: game => game.rotation % 2 === 1 || !game.mazeHole({direction:LEFT, distance: FAR}) || game.farWall(),
				},
				{
					src: ASSETS.FAR_SIDE,
					side: RIGHT,
					index: game => game.doorOpening ? 0 : game.frameIndex,
					hidden: game => game.rotation % 2 === 1 || !game.mazeHole({direction:RIGHT, distance: FAR}),
				},
				{
					src: ASSETS.FAR_SIDE_CORNER,
					side: RIGHT,
					index: game => game.doorOpening ? 0 : game.frameIndex,
					hidden: game => game.rotation % 2 === 1 || !game.mazeHole({direction:RIGHT, distance: FAR}) || game.farWall(),
				},
				{
					src: ASSETS.FAR_WALL,
					index: game => game.doorOpening ? 0 : game.frameIndex,
					hidden: game => game.rotation % 2 === 1 || !game.farWall(),					
				},
				{
					src: ASSETS.FAR_SIDE_CORNER,
					side: LEFT,
					index: game => game.doorOpening ? 0 : game.frameIndex,
					hidden: game => game.rotation % 2 === 1 || !game.farWall() || game.mazeHole({direction:LEFT, distance: FAR}),
				},
				{
					src: ASSETS.FAR_SIDE_CORNER,
					side: RIGHT,
					index: game => game.doorOpening ? 0 : game.frameIndex,
					hidden: game => game.rotation % 2 === 1 || !game.farWall() || game.mazeHole({direction:RIGHT, distance: FAR}),
				},
				{
					src: ASSETS.FAR_DOOR,
					index: game => game.doorOpening ? 0 : game.frameIndex,
					hidden: game => game.rotation % 2 === 1 || !game.farDoor(),
				},
				{
					src: ASSETS.CLOSE_SIDE,
					side: LEFT,
					index: game => game.doorOpening ? 0 : game.frameIndex,
					hidden: game => game.rotation % 2 === 1 || !game.mazeHole({direction: LEFT, distance: CLOSE}),
				},
				{
					src: ASSETS.CLOSE_SIDE_CORNER,
					side: LEFT,
					index: game => game.doorOpening ? 0 : game.frameIndex,
					hidden: game => game.rotation % 2 === 1 || !game.mazeHole({direction: LEFT, distance: CLOSE}) || game.closeWall(),
				},
				{
					src: ASSETS.CLOSE_SIDE,
					side: RIGHT,
					index: game => game.doorOpening ? 0 : game.frameIndex,
					hidden: game => game.rotation % 2 === 1 || !game.mazeHole({direction: RIGHT, distance: CLOSE}),
				},
				{
					src: ASSETS.CLOSE_SIDE_CORNER,
					side: RIGHT,
					index: game => game.doorOpening ? 0 : game.frameIndex,
					hidden: game => game.rotation % 2 === 1 || !game.mazeHole({direction: RIGHT, distance: CLOSE}) || game.closeWall(),
				},
				{
					src: ASSETS.CLOSE_WALL,
					index: game => game.doorOpening ? 0 : game.frameIndex,
					hidden: game => game.rotation % 2 === 1 || !game.closeWall(),
				},
				{
					src: ASSETS.CLOSE_SIDE_CORNER,
					side: LEFT,
					index: game => game.doorOpening ? 0 : game.frameIndex,
					hidden: game => game.rotation % 2 === 1 || !game.closeWall() || game.mazeHole({direction: LEFT, distance: CLOSE}),
				},
				{
					src: ASSETS.CLOSE_SIDE_CORNER,
					side: RIGHT,
					index: game => game.doorOpening ? 0 : game.frameIndex,
					hidden: game => game.rotation % 2 === 1 || !game.closeWall() || game.mazeHole({direction: RIGHT, distance: CLOSE}),
				},
				{
					src: ASSETS.DOOR_OPEN,
					index: game => game.frameIndex,
					hidden: game => game.rotation % 2 === 1 || !game.closeDoor() || !game.doorOpening,
				},
				{
					src: ASSETS.CLOSE_DOOR,
					index: game => game.doorOpening ? 0 : game.frameIndex,
					hidden: game => game.rotation % 2 === 1 || !game.closeDoor() || game.doorOpening,					
				},
			],
			doors: {
				1: {
					scene: "jail-cell",
					exit: (game, {scene}) => {
						const fadeDuration = game.hasVisited(scene) ? 1000 : 3000;
						game.fadeOut(game.now, {duration:fadeDuration * 1.5, fadeDuration, color:"#000000", onDone: game => {
							game.gotoScene(scene);
						}});
					},
				},
				2: {
					scene: "maze-2",
					exit: (game, {scene}) => {
						const fadeDuration = 1000;
						game.fadeOut(game.now, {duration:fadeDuration * 1.5, fadeDuration, color:"#000000", onDone: game => {
							game.gotoScene(scene, {door:1});
						}});
					},
				},
			},
		},
		{
			name: "maze-2",
			onScene: game => {
				game.save();
			},
			arrowGrid: [
				[],
				[],
				[ null, null, s(2), null, null  ],
				[ LEFT, null, s(1), null, RIGHT ],
				[ LEFT, null, s(3), null, RIGHT ],
			],
			map: `
				XXXXXXXXXXXXXXXX
				X.........5XXXXX
				X.XXXXXXXXXXXXXX
				X.............2X
				XX.XXXXXXX.XXXXX
				XX...3XXXX.XXXXX
				XX.XXXXXXX.XXXXX
				XX...4XXXX1XXXXX
				XXXXXXXXXXXXXXXX
			`,
			sprites: [
				{
					custom: (game, sprite, ctx) => ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height),
				},
				{
					src: ASSETS.MAZE_ROTATION_BACKGROUND,
					hidden: game => game.rotation % 2 === 0,
				},
				{
					src: ASSETS.MAZE_ROTATION_WALLS,
					side: LEFT,
					hidden: game => game.rotation % 2 === 0 || !game.hasLeftWallWhenRotating(),
				},
				{
					src: ASSETS.MAZE_ROTATION_WALLS,
					side: RIGHT,
					hidden: game => game.rotation % 2 === 0 || !game.hasRightWallWhenRotating(),
				},
				{
					src: ASSETS.MAZE_ROTATION_CORNER,
					hidden: game => !game.hasLeftWallWhenRotating() || !game.hasRightWallWhenRotating(),
				},
				{
					src: ASSETS.DUNGEON_MOVE,
					index: game => game.doorOpening ? 0 : game.frameIndex,
					hidden: game => game.rotation % 2 === 1,
				},
				{
					src: ASSETS.FAR_SIDE,
					side: LEFT,
					index: game => game.doorOpening ? 0 : game.frameIndex,
					hidden: game => game.rotation % 2 === 1 || !game.mazeHole({direction:LEFT, distance: FAR}),
				},
				{ 
					src: ASSETS.FAR_SIDE_CORNER,
					side: LEFT,
					index: game => game.doorOpening ? 0 : game.frameIndex,
					hidden: game => game.rotation % 2 === 1 || !game.mazeHole({direction:LEFT, distance: FAR}) || game.farWall(),
				},
				{
					src: ASSETS.FAR_SIDE,
					side: RIGHT,
					index: game => game.doorOpening ? 0 : game.frameIndex,
					hidden: game => game.rotation % 2 === 1 || !game.mazeHole({direction:RIGHT, distance: FAR}),
				},
				{
					src: ASSETS.FAR_SIDE_CORNER,
					side: RIGHT,
					index: game => game.doorOpening ? 0 : game.frameIndex,
					hidden: game => game.rotation % 2 === 1 || !game.mazeHole({direction:RIGHT, distance: FAR}) || game.farWall(),
				},
				{
					src: ASSETS.FAR_WALL,
					index: game => game.doorOpening ? 0 : game.frameIndex,
					hidden: game => game.rotation % 2 === 1 || !game.farWall(),					
				},
				{
					src: ASSETS.FAR_SIDE_CORNER,
					side: LEFT,
					index: game => game.doorOpening ? 0 : game.frameIndex,
					hidden: game => game.rotation % 2 === 1 || !game.farWall() || game.mazeHole({direction:LEFT, distance: FAR}),
				},
				{
					src: ASSETS.FAR_SIDE_CORNER,
					side: RIGHT,
					index: game => game.doorOpening ? 0 : game.frameIndex,
					hidden: game => game.rotation % 2 === 1 || !game.farWall() || game.mazeHole({direction:RIGHT, distance: FAR}),
				},
				{
					src: ASSETS.FAR_DOOR,
					index: game => game.doorOpening ? 0 : game.frameIndex,
					hidden: game => game.rotation % 2 === 1 || !game.farDoor(),
				},
				{
					src: ASSETS.CLOSE_SIDE,
					side: LEFT,
					index: game => game.doorOpening ? 0 : game.frameIndex,
					hidden: game => game.rotation % 2 === 1 || !game.mazeHole({direction: LEFT, distance: CLOSE}),
				},
				{
					src: ASSETS.CLOSE_SIDE_CORNER,
					side: LEFT,
					index: game => game.doorOpening ? 0 : game.frameIndex,
					hidden: game => game.rotation % 2 === 1 || !game.mazeHole({direction: LEFT, distance: CLOSE}) || game.closeWall(),
				},
				{
					src: ASSETS.CLOSE_SIDE,
					side: RIGHT,
					index: game => game.doorOpening ? 0 : game.frameIndex,
					hidden: game => game.rotation % 2 === 1 || !game.mazeHole({direction: RIGHT, distance: CLOSE}),
				},
				{
					src: ASSETS.CLOSE_SIDE_CORNER,
					side: RIGHT,
					index: game => game.doorOpening ? 0 : game.frameIndex,
					hidden: game => game.rotation % 2 === 1 || !game.mazeHole({direction: RIGHT, distance: CLOSE}) || game.closeWall(),
				},
				{
					src: ASSETS.CLOSE_WALL,
					index: game => game.doorOpening ? 0 : game.frameIndex,
					hidden: game => game.rotation % 2 === 1 || !game.closeWall(),
				},
				{
					src: ASSETS.CLOSE_SIDE_CORNER,
					side: LEFT,
					index: game => game.doorOpening ? 0 : game.frameIndex,
					hidden: game => game.rotation % 2 === 1 || !game.closeWall() || game.mazeHole({direction: LEFT, distance: CLOSE}),
				},
				{
					src: ASSETS.CLOSE_SIDE_CORNER,
					side: RIGHT,
					index: game => game.doorOpening ? 0 : game.frameIndex,
					hidden: game => game.rotation % 2 === 1 || !game.closeWall() || game.mazeHole({direction: RIGHT, distance: CLOSE}),
				},
				{
					src: ASSETS.DOOR_OPEN,
					index: game => game.frameIndex,
					hidden: game => game.rotation % 2 === 1 || !game.closeDoor() || !game.doorOpening,
				},
				{
					src: ASSETS.CLOSE_DOOR,
					index: game => game.doorOpening ? 0 : game.frameIndex,
					hidden: game => game.rotation % 2 === 1 || !game.closeDoor() || game.doorOpening,					
				},
				{
					src: ASSETS.GUARD, col: 4, row: 4,
					index: ({now, battle}) => {
						if (!battle) {
							return 0;
						}
						if (now > battle.nextAttack) {
							return 4 + Math.floor((now - battle.nextAttack)/60) % 4;
						}
						return Math.floor(now/200) % 4;
					},
					hidden: ({battle}) => !battle || battle.foe != 'guard',
				},
				{
					src: ASSETS.PUNCH, col: 4, row: 4,
					index: ({battle, now}) => !battle ? 0 : Math.min(Math.floor((now - battle.playerRightAttack) / 50), 4),
					hidden: ({battle, now}) => {
						if (!battle || battle.fist !== RIGHT) {
							return true;
						}
						const frame = Math.floor(now - battle.playerRightAttack) / 50;
						return frame > 4;
					},
				},
				{
					src: ASSETS.PUNCH, col: 4, row: 4,
					index: ({battle, now}) => !battle ? 0 : 5 + Math.min(Math.floor((now - battle.playerLeftAttack) / 50), 4),
					hidden: ({battle, now}) => {
						if (!battle || battle.fist !== LEFT) {
							return true;
						}
						const frame = Math.floor(now - battle.playerLeftAttack) / 50;
						return frame > 4;
					},
				},
			],
			doors: {
				1: {
					scene: "maze",
					exit: (game, {scene}) => {
						const fadeDuration = 1000;
						game.fadeOut(game.now, {duration:fadeDuration * 1.5, fadeDuration, color:"#000000", onDone: game => {
							game.gotoScene(scene, {door:2});
						}});
					},
				},
				2: {
					scene: "toilets",
					exit: (game, {scene}) => {
						const fadeDuration = 1000;
						game.fadeOut(game.now, {duration:fadeDuration * 1.5, fadeDuration, color:"#000000", onDone: game => {
							game.gotoScene(scene);
						}});
					},
				},
				3: {
					scene: "vending-machine",
					exit: (game, {scene}) => {
						const fadeDuration = 1000;
						game.fadeOut(game.now, {duration:fadeDuration * 1.5, fadeDuration, color:"#000000", onDone: game => {
							game.gotoScene(scene);
						}});
					},
				},
				4: {
					scene: "arcade-room",
					exit: (game, {scene}) => {
						const fadeDuration = 1000;
						game.fadeOut(game.now, {duration:fadeDuration * 1.5, fadeDuration, color:"#000000", onDone: game => {
							game.gotoScene(scene);
						}});
					},
				},
				5: {
					scene: "maze-3",
					exit: (game, {scene}) => {
						const fadeDuration = 1000;
						game.fadeOut(game.now, {duration:fadeDuration * 1.5, fadeDuration, color:"#000000", onDone: game => {
							game.gotoScene(scene, {door:1, rotation:0});
						}});
					},
				},
			},
			onSceneBattle: ({now}, battle) => {
				if (!battle.nextAttack) {
					battle.nextAttack = Math.random() * 5000 + now;
				} else {
					const frame = 4 + Math.floor((now - battle.nextAttack)/50);
					if (frame >= 8) {
						game.playSound(SOUNDS.HIT);
						battle.playerHit = now;
						battle.nextAttack = null;
					}
				}
				if (battle.playerLeftAttack) {
					const frame = Math.floor((now - battle.playerLeftAttack) / 50);
					if (frame === 1 && !battle.playerLeftAttackLanded) {
						game.playSound(SOUNDS.HIT);
						battle.playerLeftAttackLanded = now;
					}
					if (frame > 4) {
						battle.playerLeftAttack = 0;
						battle.playerLeftAttackLanded = 0;						
						battle.fist = battle.fist === LEFT ? RIGHT: LEFT;
					}
				}
				if (battle.playerRightAttack) {
					const frame = Math.floor((now - battle.playerRightAttack) / 50);
					if (frame === 1 && !battle.playerRightAttackLanded) {
						game.playSound(SOUNDS.HIT);
						battle.playerRightAttackLanded = now;
					}
					if (frame > 4) {
						battle.playerRightAttack = 0;
						battle.playerRightAttackLanded = 0;						
						battle.fist = battle.fist === LEFT ? RIGHT: LEFT;
					}
				}
			},
			events: {
				o: {
					foe: "guard",
					onEvent: ({data, now}, {foe}) => {
						if (!data.battle) {
							data.battle = {
								time: now,
								foe,
								fist: LEFT,
								playerHit: 0,
								playerLeftAttack: 0,
								playerLeftAttackLanded: 0,
								playerRightAttack: 0,
								playerRightAttackLanded: 0,
							};
						}
					},
				},
			},
		},
		{
			name: "zoom-guards",
			arrowGrid: [
				[],
				[],
				[ null, null, null,  null, null  ],
				[ null, null, null,  null, null ],
				[ null, null, BAG ,  null, null ],
			],
			onSceneHoldItem: (game, item) => {
				if (item === "gun") {
					game.waitCursor = true;
					game.showTip("...", () => {
						game.waitCursor = false;
						game.gotoScene("jail-cell");
						game.hideCursor = true;
						game.sceneData.guardAlert = game.now;
					});
				}
			},
			onScene: game => {
				game.startDialog({
					time: game.now,
					index: 0,
					conversation: [
						{
							message: "",
							options: [
								{
									msg: "Say Hello",
									onSelect: (game, dialog) => {
										game.playSound(SOUNDS.HELLO);
										dialog.guardSpeaking = true;
										game.waitCursor = true;
										game.showTip("...", () => {
											dialog.guardSpeaking = false;
											game.waitCursor = false;
										});
										dialog.index = 1;
									}
								},
								{ msg: "LEAVE", onSelect: game => game.gotoScene("jail-cell")},
							],
						},
						{
							message: "",
							options: [
								{
									msg: "Let me out?", 
									onSelect: (game, dialog) => {
										game.playSound(SOUNDS.HAHAHA);
										dialog.guardSpeaking = true;
										game.waitCursor = true;
										game.showTip("... seems like he's laughing at me ...", () => {
											dialog.guardSpeaking = false;
											game.waitCursor = false;
										});
									}
								},
								{
									hidden: game => !game.data.seen.writing,
									msg: "It's my birthday", 
									onSelect: (game, dialog) => {
										if (game.data.seen.badguards) {
											game.showTip("Let's just keep that to myself");
										} else if (DEMO) {
											game.gotoScene("temp-end");
										} else {
											game.playSound(SOUNDS.BIRTHDAY);
											dialog.guardSpeaking = true;
											game.waitCursor = true;
											game.showTip("... did he\nunderstand? ...", game => {
												game.gotoScene("bring-cake");
											});
										}
									}
								},
								{ msg: "LEAVE", onSelect: game => game.gotoScene("jail-cell")},
							],
						},
					],
				});
			},
			sprites: [
				{
					src: ASSETS.ZOOM_GUARDS,
					index: game => {
						if (game.dialog && game.dialog.guardSpeaking) {
							return Math.floor((game.now - game.sceneTime) / 100) % 4;
						}
						const frame = Math.floor((game.now - game.sceneTime) / 200);
						return frame % 31 === 1 ? 1 : 0;
					},
					combineMessage: (item, game) => `The guard shrugs at my ${item}.`,
				},
				{
					src: ASSETS.ZOOM_GUARD_ALERT,
					hidden: game => game.useItem !== "gun",
				},
				{
					src: ASSETS.SPEECH_OUT,
					hidden: game => game.bagOpening || game.useItem || game.pendingTip,
					index: game => Math.min(3, Math.floor((game.now - game.sceneTime) / 80)),
				},
				{
					bag: true,
					src: ASSETS.BAG_OUT,
					index: game => game.frameIndex,
					hidden: ({arrow, bagOpening, dialog}) => arrow !== BAG && !bagOpening || dialog && dialog.conversation[dialog.index].options.length > 2,
					alpha: game => game.emptyBag() ? .2 : 1,
					onClick: game => game.clickBag(),
				}
			],
		},
		{
			name: "birthday",
			onScene: game => {
				game.waitCursor = true;
				if (!game.data.seen["writing"]) {
					game.data.seen["writing"] = game.now;
					game.showTip(["Hey, it looks like I carved a birthday cake on the wall.", "I can't remember but could it be... it's my BIRTHDAY?!"],
						game => {
							game.gotoScene("jail-cell");
							game.rotation = 6;
						}
					);
				} else {
					game.showTip("♪♪ Happy\nbirthday\nto me ♪♪", game => {
						game.gotoScene("jail-cell");
						game.rotation = 6;
					});
				}
			},
			sprites: [
				{
					src: ASSETS.BIRTHDAY,
				},
			],
		},
		{
			name: "bring-cake",
			onScene: game => {
				game.waitCursor = true;
				game.sceneData.scenario = 0;
			},
			onSceneRefresh: game => {
				if (game.sceneData.scenario === 0) {
					const frame = Math.floor((game.now - game.sceneTime) / 300);
					if (frame >= 10) {
						game.showTip([
							"...",
							"Wait... did he just leave?",
							"That's odd.",
							"Maybe he went to get me a birthday cake.",
							"Wouldn't that be funny?!?",
						], game => {
							game.sceneData.scenario = 2;
							game.sceneData.scenarioTime = game.now;
						});
						game.sceneData.scenario = 1;
					}
				} else if (game.sceneData.scenario === 2) {
					const frame = Math.floor((game.now - game.sceneData.scenarioTime) / 500);
					if (frame >= 5) {
						game.sceneData.scenario = 3;
						game.showTip("OMG!", game => {
							game.gotoScene("poor-hitman");
						});
					}
				}
			},
			sprites: [
				{
					src: ASSETS.JAIL, col:3, row:3,
					index: () => Math.random() < .1 ? 1 : 0,
				},
				{
					src: ASSETS.DIMMING_LIGHT,
					index: () => Math.random() < .1 ? 1 : 0,
				},
				{
					src: ASSETS.RIGHT_GUARD, col:3, row:3,
					index: 0,
				},
				{
					src: ASSETS.BRING_CAKE, col:3, row:3,
					index: game => {
						if (game.sceneData.scenario === 0) {
							const frame = Math.floor((game.now - game.sceneTime) / 300);
							return Math.min(frame, 3);
						} else if (game.sceneData.scenario === 1) {
							return 3;
						} else if (game.sceneData.scenario === 2) {
							const frame = Math.floor((game.now - game.sceneData.scenarioTime) / 500);
							return Math.min(6, frame + 4);
						}
						const frame = Math.floor((game.now - game.sceneTime) / 300);
						return 5 + frame % 2;
					},
				},
				{
					src: ASSETS.CAGE, col:2, row:3,
					index: 0,
				},
			],
		},
		{
			name: "poor-hitman",
			onScene: game => {
				game.hideCursor = true;
				game.showTip(["What a surprise, how thoughtful of you!", "You really do care about me after all.."],
					game => {
						game.gotoScene("guards-laughing");
					}
				);					
			},
			sprites: [
				{
					src: ASSETS.POOR_HITMAN_BACK,
				},
				{
					src: ASSETS.POOR_HITMAN,
					index: ({ pendingTip, now }) => pendingTip && pendingTip.progress < 1 ? Math.floor(now / 150) % 4 : 0,
				},
				{
					src: ASSETS.POOR_HITMAN_GUARD,
					index: game => Math.floor((game.now - game.sceneTime) / 200) % 4, 
				},
			],
		},
		{
			name: "guards-laughing",
			onScene: game => {
				game.hideCursor = true;
			},
			onSceneRefresh: game => {
				const frame = Math.floor((game.now - game.sceneTime) / 150);					
				if (frame > 50) {
					game.gotoScene("what-so-funny");
				} else if (!game.sceneData.laughing && frame > 30) {
					game.sceneData.laughing = true;
					game.playSound(SOUNDS.HAHAHA);
				}
			},
			sprites: [
				{
					src: ASSETS.GUARDS_LAUGHING,
					index: game => {
						const frame = Math.floor((game.now - game.sceneTime) / 150);
						if (frame < 15) {
							return 0;
						} else if (frame < 30) {
							return 1;
						} else {
							return frame % 2 + 2;
						}
					},
				},
			],
		},
		{
			name: "what-so-funny",
			onScene: game => {
				game.hideCursor = true;
				game.showTip(["Hahaha...", "Even in this situation, I'm glad I can laugh with you guys.", "By the way, what's so funny?"],
					game => {
						game.gotoScene("cake-face");
					}
				);					
			},
			sprites: [
				{
					src: ASSETS.POOR_HITMAN_BACK,
				},
				{
					src: ASSETS.POOR_HITMAN,
					hidden: ({ pendingTip }) => pendingTip && pendingTip.index < 2,
					index: ({ pendingTip, now }) => pendingTip && pendingTip.progress < 1 ? Math.floor(now / 150) % 4 : 0,
				},
				{
					src: ASSETS.HITMAN_LAUGH,
					hidden: ({ pendingTip }) => !pendingTip || pendingTip.index >= 2,
					index: ({ pendingTip, now }) => pendingTip && pendingTip.progress < 1 && pendingTip.index !== 0 ? Math.floor(now / 150) % 4 : Math.floor(now / 150) % 2,
				},
				{
					src: ASSETS.POOR_HITMAN_GUARD,
					index: game => Math.floor((game.now - game.sceneTime) / 200) % 4, 
				},
			],
		},
		{
			name: "cake-face",
			onScene: game => {
				game.hideCursor = true;
			},
			onSceneRefresh: game => {
				const frame = Math.floor((game.now - game.sceneTime) / 200);					
				if (frame > 1 && !game.sceneData.caked) {
					game.sceneData.caked = game.now;
					game.playSound(SOUNDS.EAT);
					game.playTheme(null);
				}
				if (frame > 10) {
					game.gotoScene("guards-laughing-2");
				}
			},
			sprites: [
				{
					src: ASSETS.POOR_HITMAN_BACK,
				},
				{
					src: ASSETS.HITMAN_CAKE_FACE,
					index: ({ now, sceneTime }) => Math.min(4, Math.floor((now - sceneTime) / 200)),
				},
			],
		},
		{
			name: "guards-laughing-2",
			onScene: game => {
				game.hideCursor = true;
				game.playSound(SOUNDS.HAHAHA);
			},
			onSceneRefresh: game => {
				const frame = Math.floor((game.now - game.sceneTime) / 150);					
				if (frame > 50) {
					game.gotoScene("guards-attack");
				}	
			},
			sprites: [
				{
					src: ASSETS.GUARDS_LAUGHING,
					index: game => {
						const frame = Math.floor((game.now - game.sceneTime) / 150);
						return frame < 20 ? frame % 2 + 2 : frame < 32 ? 0 : 4;
					},
				},
			],
		},
		{
			name: "toilets",
			arrowGrid: [
				[],
				[],
				[ null, null, null,  null, null ],
				[ null, null, null,  null, null ],
				[ null, null, BAG ,  null, null ],
			],
			onScene: game => {
				game.save();
				game.startDialog({
					time: game.now,
					index: 0,
					conversation: [
						{
							message: "",
							options: [
								{ },
								{ msg: "LEAVE", onSelect: game => {
									const fadeDuration = 1000;
									game.fadeOut(game.now, {duration:fadeDuration * 1.5, fadeDuration, color:"#000000", onDone: game => {
										game.gotoScene("maze-2", {door:2})
									}});
								}},
							],
						},
					],
				});
			},
			sprites: [
				{
					src: ASSETS.BATHROOM,
				},
				{
					src: ASSETS.TOILETS,
					side: LEFT,
					combineMessage: (item, game) => {
						if (item === "bottle") {
							return "Why get the water from the toilet when there's a water fountain next to it?";
						}
						return `The ${item} has no effect on the toilet.`;
					},
					onClick: game => {
						game.sceneData.checkingToilet = game.now;
						game.startDialog({
							time: game.now,
							index: 0,
							conversation: [
								{
									message: "",
									options: [
										{},
										{ msg: "Sit on toilet", onSelect: game => {
											game.gotoScene("toilet-monster");
										}},
										{ msg: "CANCEL", onSelect: game => {
											game.sceneData.checkingToilet = 0;
											game.onScene(game);
										}},
									],
								},
							],
						});
					},
				},
				{
					src: ASSETS.TOILETS,
					side: RIGHT,
					tip: () => "I wonder if the water is drinkable.",
					combine: (item, game) => {
						if (item === "empty bottle") {
							delete game.inventory[item];
							game.useItem = null;
							game.pickUp({item:"water bottle", image:ASSETS.GRAB_WATER_BOTTLE, message:"It does look like water... so far."});
							return true;
						}
					},
				},
				{
					src: ASSETS.SPEECH_OUT,
					offsetY: 9,
					hidden: game => game.bagOpening || game.useItem || game.pendingTip,
					index: game => Math.min(3, Math.floor((game.now - game.sceneTime) / 80)),
				},
				{
					name: "self",
					src: ASSETS.EATER, col:2, row:2,
					index: (game, sprite) => game.hoverSprite === sprite ? Math.min(2, Math.floor((game.now - sprite.hoverTime) / 100)) : 0,
					hidden: game => game.useItem !== 'water bottle',
					combine: (item, game) => {
						if (item === 'water bottle') {
							game.removeFromInventory(item);
							game.useItem = null;
							game.playSound(SOUNDS.DRINK);
							game.addToInventory({item:"empty bottle", image:ASSETS.GRAB_BOTTLE},)
							game.showTip("Refreshing!");
						}
						return true;
					},
				},
				{
					bag: true,
					src: ASSETS.BAG_OUT,
					index: game => game.frameIndex,
					hidden: ({arrow, bagOpening, dialog}) => arrow !== BAG && !bagOpening || dialog && dialog.conversation[dialog.index].options.length > 2,
					alpha: game => game.emptyBag() ? .2 : 1,
					onClick: game => game.clickBag(),
				}
			],
		},
		{
			name: "guards-attack",
			onScene: game => {
				game.hideCursor = true;
				game.fadeColor = "#000000";
				game.see("badguards");
			},
			onSceneRefresh: game => {
				const frame = Math.floor((game.now - game.sceneTime) / 100);
				game.fade = Math.max(0, Math.min(1, (frame - 50) / 10));

				if (frame > 70) {
					if (!game.sceneData.beatsound) {
						game.sceneData.beatsound = game.now;
						game.playSound(SOUNDS.HIT);
						game.delayAction(game => game.playSound(SOUNDS.PLAYER_HURT), 300);
						game.delayAction(game => game.playSound(SOUNDS.HIT), 500);
					}
				}
				if (frame > 80) {
					game.gotoScene("jail-cell");
					game.see("intro");
				}
			},
			sprites: [
				{
					src: ASSETS.GUARDS_ATTACK,
					index: 2,
				},
				{
					src: ASSETS.GUARDS_ATTACK,
					index: 1,
					hidden: game => {
						const frame = Math.floor((game.now - game.sceneTime) / 100);
						return frame >= 40;
					},
					alpha: game => {
						const frame = Math.floor((game.now - game.sceneTime) / 100);
						return Math.max(0, Math.min(1, (40 - frame) / 10));
					}					
				},
				{
					src: ASSETS.GUARDS_ATTACK,
					index: 0,
					hidden: game => {
						const frame = Math.floor((game.now - game.sceneTime) / 100);
						return frame >= 20;
					},
					alpha: game => {
						const frame = Math.floor((game.now - game.sceneTime) / 100);
						return Math.max(0, Math.min(1, (20 - frame) / 10));
					}					
				},
			],
		},
		{
			name: "tile-hole",
			sprites: [
				{
					src: ASSETS.TILE_HOLE,
					preventClick: game => !game.data.pickedUp.gun,
					onClick: game => {
						game.gotoScene("jail-cell");
						game.rotation = 4;
					},
				},
				{
					name: "gun",
					src: ASSETS.GUN,
					hidden: (game, {name}) => game.data.pickedUp[name],
					onClick: (game, {name}) => {
						game.addToInventory({
							item: "bullet",
							count: 6,
						});
						game.pickUp({item:name, image:ASSETS.GRAB_GUN, message:"A loaded gun! Did I hide this in here?",
							onPicked: game => {
								game.gotoScene("jail-cell");
								game.rotation = 4;
							}
						});
					},
				},
				{
					bag: true,
					src: ASSETS.BAG_OUT,
					index: game => game.frameIndex,
					hidden: game => !game.bagOpening,
				},
			],
		},
		{
			name: "leo-end",
			onScene: game => game.showTip("Congrats Leo, you reached the end so far. I didn't program the rest yet."),
			sprites: [
				{ fade: 1, fadeColor: "#cc5588" }
			],
		},
		{
			name: "temp-end",
			onScene: game => {
				game.showTip("Thanks for playing so far. I will unlock the rest of the game once I've completed it.", game => {
					game.gameOver();
				});
			},
			sprites: [
				{ fade: 1, fadeColor: "#5588cc" }
			],
		},
		{
			name: "alien",
			onScene: game => {
				game.hideCursor = true;
			},
			onSceneRefresh: game => {
				const frame = Math.floor((game.now - game.sceneTime) / 100) - 10;
				if (frame < 15) {
					game.sceneData.frame = 0;
				} else if (frame < 25) {
					game.sceneData.frame = 1;					
				} else if (frame < 33) {
					game.sceneData.frame = 0;
				} else if (frame < 35) {
					game.sceneData.frame = 2;
				} else if (frame < 70) {
					game.sceneData.frame = 3 + frame % 3;
				} else if (frame < 75) {
					game.sceneData.frame = 3;
				} else if (frame < 90) {
					game.sceneData.frame = 6;
				} else if (frame < 120) {
					game.sceneData.frame = 6 + Math.min(4, Math.floor((frame - 90)));
				} else if (frame < 150) {
					game.sceneData.frame = 10 + Math.floor((game.now - game.sceneTime) / 10) % 4;
				} else if (frame < 200) {
					if (!game.sceneData.explode) {
						game.playSound(SOUNDS.GUN_SHOT);
						game.delayAction(game => game.playSound(SOUNDS.GUN_SHOT), 50);
						game.delayAction(game => game.playSound(SOUNDS.GUN_SHOT), 50);
						game.sceneData.explode = game.now;
						game.sceneData.pieces = new Array(500).fill(null).map(a => {
							const byte = Math.max(0x10, Math.floor(Math.random() * 0xaa)).toString(16);
							const color = `#cc${byte}${byte}`;
							const size = Math.random() < .5 ? 1 : 2;

							const p = {
								x: [26 + 10 * (Math.random()-.5)],
								y: [30 + Math.random()*2],
								dx: Math.random() - .5,
								dy: -Math.random() * 3,
								size,
								color,
								appear: game.now + 4000 * Math.random(),
							};
							return p;
						});
					}
					game.sceneData.frame = 14;
				} else if (frame < 240) {
					game.sceneData.frame = Math.min(24, frame - 200 + 17);
					if (!game.sceneData.alienSound) {
						game.sceneData.alienSound = true;
						game.playSound(SOUNDS.ALIEN);					
					}
				} else {
					if (!game.data.gameOver) {
						game.gameOver();
					}
				}
			},
			sprites: [
				{
					src: ASSETS.ALIEN_EATER, col: 5, row: 5,
					index: game => game.sceneData.frame || 0,
				},
				{
					custom: (game, sprite, ctx) => {
						if (game.sceneData.explode) {
							const pieces = game.sceneData.pieces || [];
							pieces.forEach(piece => {
								const { x, y, preX, preY, dx, dy, size, color, appear } = piece;
								if (appear < game.now) {
									ctx.fillStyle = color;
									for (let i = 0; i < x.length; i++) {
										ctx.fillRect(x[i], y[i], size - i*.1, size - i*.1);
									}
									if (x.length < 5) {
										x.push(x[x.length-1]);
										y.push(y[y.length-1]);
									}
									for (let i = x.length-1; i>=1; i--) {
										x[i] = x[i-1];
										y[i] = y[i-1];
									}
									piece.x[0] += dx;
									piece.y[0] += dy;
									piece.dy+= .15;
								}
							});
						}
					},
				},
			],
		},
		{
			name: "toilet-monster",
			onScene: game => {
				game.hideCursor = true;
				game.playTheme(null);
			},
			onSceneRefresh: game => {
				const frame = Math.floor((game.now - game.sceneTime) / 100) - 50;
				if (frame < 50) {
					if (Math.floor(frame / 2) < 5) {
						game.sceneData.frame = Math.max(0, Math.floor(frame / 4));
					} else {
						game.sceneData.frame = Math.min(13, 5 + (frame - 10));
						if (frame > 13 && !game.sceneData.eat) {
							game.sceneData.eat = game.now;
							game.playSound(SOUNDS.EAT);
						}
					}
				} else {
					if (!game.data.gameOver) {
						game.gameOver();
					}
				}
			},
			sprites: [
				{
					src: ASSETS.TOILET_MONSTER, col: 4, row: 4,
					index: game => game.sceneData.frame || 0,
				},
			],
		},
		{
			name: "zoom-vending-machine",
			onScene: ({sceneData}) => {
				sceneData.putCoin = 0;
				game.startDialog({
					time: game.now,
					index: 0,
					conversation: [
						{
							message: "",
							options: [
								{ },
								{ msg: "LEAVE", onSelect: game => {
									game.gotoScene("vending-machine")
								}},
							],
						},
					],
				});
			},
			arrowGrid: [
				[],
				[],
				[ null, null, null,  null, null ],
				[ null, null, null,  null, null ],
				[ null, null, BAG ,  null, null ],
			],
			onSceneRefresh: game => {
				if (game.situation.gotBottle && !game.situation.grabbedBottle) {
					const frame = Math.floor((game.now - game.situation.gotBottle)) / 100;
					if (frame > 4) {
						game.pickUp({item:"water bottle", image:ASSETS.GRAB_WATER_BOTTLE, message:"Looks like water."});
						game.situation.grabbedBottle = game.now;
					}
				}

			},
			sprites: [
				{ src: ASSETS.VENDING_MACHINE_CLOSEUP },
				{
					src: ASSETS.VENDING_MACHINE_BOTTLE,
					index: game => !game.situation.gotBottle ? 0 : Math.min(3, Math.floor((game.now - game.situation.gotBottle) / 100)),
					onClick: game => {
						if (!game.situation.coin || game.situation.gotBottle) {
							game.playSound(SOUNDS.ERROR);
							game.delayAction(game => game.playSound(SOUNDS.ERROR), 100);
						} else {
							game.situation.coin--;
							if (!game.situation.coin) {
								delete game.situation.coin;
							}
							delete game.data.pickedUp["coin 1"];
							game.situation.gotBottle = game.now;
						}
					},
					tip: "Looks like a bottle. Is that water?",
					hidden: game => game.situation.grabbedBottle,
				},
				{
					src: ASSETS.VENDING_MACHINE_APPLE,
					onClick: game => {
						game.playSound(SOUNDS.ERROR);
						game.delayAction(game => game.playSound(SOUNDS.ERROR), 100);
					},
				},
				{
					name: "coin-slot",
					src: ASSETS.VENDING_MACHINE_COIN_SLOT,
					index: ({now, sceneData}) => Math.min(3, Math.floor((now - sceneData.putCoin) / 100)),
					combine: (item, game) => {
						if (item === "coin") {
							game.useItem = null;
							game.playSound(SOUNDS.PICKUP);
							game.sceneData.putCoin = game.now;
							game.situation.coin = (game.situation.coin||0) + 1;
							game.removeFromInventory("coin");
							return true;
						}
					}
				},
				{
					src: ASSETS.SPEECH_OUT,
					offsetY: 9,
					hidden: game => game.bagOpening || game.useItem || game.pendingTip,
					index: game => Math.min(3, Math.floor((game.now - game.sceneTime) / 80)),
				},
				{
					name: "self",
					src: ASSETS.EATER, col:2, row:2,
					index: (game, sprite) => game.hoverSprite === sprite ? Math.min(2, Math.floor((game.now - sprite.hoverTime) / 100)) : 0,
					hidden: game => game.useItem !== 'water bottle',
					combine: (item, game) => {
						if (item === 'water bottle') {
							delete game.inventory[item];
							game.useItem = null;
							game.playSound(SOUNDS.DRINK);
							game.addToInventory({item:"empty bottle", image:ASSETS.GRAB_BOTTLE},)
							game.showTip("Refreshing!");
						}
						return true;
					},
				},
				{
					bag: true,
					src: ASSETS.BAG_OUT,
					index: game => game.frameIndex,
					hidden: ({arrow, bagOpening, dialog}) => arrow !== BAG && !bagOpening || dialog && dialog.conversation[dialog.index].options.length > 2,
					alpha: game => game.emptyBag() ? .2 : 1,
					onClick: game => game.clickBag(),
				}
			],
		},
		{
			name: "vending-machine",
			onScene: game => {
				game.save();
				game.startDialog({
					time: game.now,
					index: 0,
					conversation: [
						{
							message: "",
							options: [
								{ },
								{ },
								{ msg: "LEAVE", onSelect: game => {
									const fadeDuration = 1000;
									game.fadeOut(game.now, {duration:fadeDuration * 1.5, fadeDuration, color:"#000000", onDone: game => {
										game.gotoScene("maze-2", {door:3})
									}});
								}},
							],
						},
					],
				});
			},
			sprites: [
				{
					src: ASSETS.VENDING_MACHINE,
				},
				{
					src: ASSETS.MACHINE,
					tip: "Looks like a vending machine. There's a big hole in it.",
					onClick: game => game.gotoScene("zoom-vending-machine"),
				},
				{
					name: "coin 1",
					src: ASSETS.COIN_1,
					hidden: (game,{name}) => game.data.pickedUp[name],
					onClick: (game, {name}) => {
						game.data.pickedUp[name] = game.now;
						game.pickUp({item:"coin", image:ASSETS.GRAB_COIN, message:""});
					},
				},
				{
					src: ASSETS.SPEECH_OUT,
					offsetY: 15,
					hidden: game => game.bagOpening || game.useItem || game.pendingTip,
					index: game => Math.min(3, Math.floor((game.now - game.sceneTime) / 80)),
				},
			],
		},
		{
			name: "arcade-room",
			onScene: game => {
				game.save();
				game.startDialog({
					time: game.now,
					index: 0,
					conversation: [
						{
							message: "",
							options: [
								{ },
								{ },
								{ msg: "LEAVE", onSelect: game => {
									const fadeDuration = 1000;
									game.fadeOut(game.now, {duration:fadeDuration * 1.5, fadeDuration, color:"#000000", onDone: game => {
										game.gotoScene("maze-2", {door:4})
									}});
								}},
							],
						},
					],
				});
			},
			sprites: [
				{
					src: ASSETS.ARCADE_ROOM,
				},
				{
					src: ASSETS.ARCADE,
					onClick: game => game.gotoScene("zoom-arcade"),
				},
				{
					src: ASSETS.SPEECH_OUT,
					offsetY: 15,
					hidden: game => game.bagOpening || game.useItem || game.pendingTip,
					index: game => Math.min(3, Math.floor((game.now - game.sceneTime) / 80)),
				},
			],
		},
		{
			name: "zoom-arcade",
			onScene: ({sceneData}) => {
				sceneData.putCoin = 0;
				game.startDialog({
					time: game.now,
					index: 0,
					conversation: [
						{
							message: "",
							options: [
								{ },
								{ },
								{ msg: "LEAVE", onSelect: game => {
									game.gotoScene("arcade-room")
								}},
							],
						},
					],
				});
			},
			arrowGrid: [
				[],
				[],
				[ null, null, null,  null, null ],
				[ null, null, null,  null, null ],
				[ null, null, BAG ,  null, null ],
			],
			onSceneRefresh: game => {
			},
			sprites: [
				{ src: ASSETS.ZOOM_ARCADE },
				{
					src: ASSETS.SPEECH_OUT,
					offsetY: 15,
					hidden: game => game.bagOpening || game.useItem || game.pendingTip,
					index: game => Math.min(3, Math.floor((game.now - game.sceneTime) / 80)),
				},
				{
					name: "self",
					src: ASSETS.EATER, col:2, row:2,
					index: (game, sprite) => game.hoverSprite === sprite ? Math.min(2, Math.floor((game.now - sprite.hoverTime) / 100)) : 0,
					hidden: game => game.useItem !== 'water bottle',
					combine: (item, game) => {
						if (item === 'water bottle') {
							delete game.inventory[item];
							game.useItem = null;
							game.playSound(SOUNDS.DRINK);
							game.addToInventory({item:"empty bottle", image:ASSETS.GRAB_BOTTLE},)
							game.showTip("Refreshing!");
						}
						return true;
					},
				},
				{
					bag: true,
					src: ASSETS.BAG_OUT,
					index: game => game.frameIndex,
					hidden: ({arrow, bagOpening, dialog}) => arrow !== BAG && !bagOpening || dialog && dialog.conversation[dialog.index].options.length > 2,
					alpha: game => game.emptyBag() ? .2 : 1,
					onClick: game => game.clickBag(),
				}
			],
		},
		{
			name: "maze-3",
			onScene: game => {
				game.save();
			},
			arrowGrid: [
				[],
				[],
				[ null, null, s(2),     null, null  ],
				[ LEFT, null, s(1),     null, RIGHT ],
				[ LEFT, null, BACKWARD, null, RIGHT ],
			],
			map: `
				XXXXXXXXXXX
				X.........X
				X.XXXXXXX.X
				X.XX3.....X
				X.XXXXXXX.X
				X.X.......X
				X.X1XX.XX.X
				X.XXXX.XX.X
				X......XX2X
				XXXXXXXXXXX
			`,
			sprites: [
				{
					custom: (game, sprite, ctx) => ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height),
				},
				{
					src: ASSETS.MAZE_ROTATION_BACKGROUND_2,
					hidden: game => game.rotation % 2 === 0,
				},
				{
					src: ASSETS.MAZE_ROTATION_WALLS_2,
					side: LEFT,
					hidden: game => game.rotation % 2 === 0 || !game.hasLeftWallWhenRotating(),
				},
				{
					src: ASSETS.MAZE_ROTATION_WALLS_2,
					side: RIGHT,
					hidden: game => game.rotation % 2 === 0 || !game.hasRightWallWhenRotating(),
				},
				{
					src: ASSETS.MAZE_ROTATION_CORNER_2,
					hidden: game => !game.hasLeftWallWhenRotating() || !game.hasRightWallWhenRotating(),
				},
				{
					src: ASSETS.DUNGEON_MOVE_2,
					index: game => game.doorOpening ? 0 : game.frameIndex,
					hidden: game => game.rotation % 2 === 1,
				},
				{
					src: ASSETS.FAR_SIDE_2,
					side: LEFT,
					index: game => game.doorOpening ? 0 : game.frameIndex,
					hidden: game => game.rotation % 2 === 1 || !game.mazeHole({direction:LEFT, distance: FAR}),
				},
				{ 
					src: ASSETS.FAR_SIDE_CORNER_2,
					side: LEFT,
					index: game => game.doorOpening ? 0 : game.frameIndex,
					hidden: game => game.rotation % 2 === 1 || !game.mazeHole({direction:LEFT, distance: FAR}) || game.farWall(),
				},
				{
					src: ASSETS.FAR_SIDE_2,
					side: RIGHT,
					index: game => game.doorOpening ? 0 : game.frameIndex,
					hidden: game => game.rotation % 2 === 1 || !game.mazeHole({direction:RIGHT, distance: FAR}),
				},
				{
					src: ASSETS.FAR_SIDE_CORNER_2,
					side: RIGHT,
					index: game => game.doorOpening ? 0 : game.frameIndex,
					hidden: game => game.rotation % 2 === 1 || !game.mazeHole({direction:RIGHT, distance: FAR}) || game.farWall(),
				},
				{
					src: ASSETS.FAR_WALL_2,
					index: game => game.doorOpening ? 0 : game.frameIndex,
					hidden: game => game.rotation % 2 === 1 || !game.farWall(),					
				},
				{
					src: ASSETS.FAR_SIDE_CORNER_2,
					side: LEFT,
					index: game => game.doorOpening ? 0 : game.frameIndex,
					hidden: game => game.rotation % 2 === 1 || !game.farWall() || game.mazeHole({direction:LEFT, distance: FAR}),
				},
				{
					src: ASSETS.FAR_SIDE_CORNER_2,
					side: RIGHT,
					index: game => game.doorOpening ? 0 : game.frameIndex,
					hidden: game => game.rotation % 2 === 1 || !game.farWall() || game.mazeHole({direction:RIGHT, distance: FAR}),
				},
				{
					src: ASSETS.FAR_DOOR_2,
					index: game => game.doorOpening ? 0 : game.frameIndex,
					hidden: game => game.rotation % 2 === 1 || !game.farDoor(),
				},
				{
					src: ASSETS.CLOSE_SIDE_2,
					side: LEFT,
					index: game => game.doorOpening ? 0 : game.frameIndex,
					hidden: game => game.rotation % 2 === 1 || !game.mazeHole({direction: LEFT, distance: CLOSE}),
				},
				{
					src: ASSETS.CLOSE_SIDE_CORNER_2,
					side: LEFT,
					index: game => game.doorOpening ? 0 : game.frameIndex,
					hidden: game => game.rotation % 2 === 1 || !game.mazeHole({direction: LEFT, distance: CLOSE}) || game.closeWall(),
				},
				{
					src: ASSETS.CLOSE_SIDE_2,
					side: RIGHT,
					index: game => game.doorOpening ? 0 : game.frameIndex,
					hidden: game => game.rotation % 2 === 1 || !game.mazeHole({direction: RIGHT, distance: CLOSE}),
				},
				{
					src: ASSETS.CLOSE_SIDE_CORNER_2,
					side: RIGHT,
					index: game => game.doorOpening ? 0 : game.frameIndex,
					hidden: game => game.rotation % 2 === 1 || !game.mazeHole({direction: RIGHT, distance: CLOSE}) || game.closeWall(),
				},
				{
					src: ASSETS.CLOSE_WALL_2,
					index: game => game.doorOpening ? 0 : game.frameIndex,
					hidden: game => game.rotation % 2 === 1 || !game.closeWall(),
				},
				{
					src: ASSETS.CLOSE_SIDE_CORNER_2,
					side: LEFT,
					index: game => game.doorOpening ? 0 : game.frameIndex,
					hidden: game => game.rotation % 2 === 1 || !game.closeWall() || game.mazeHole({direction: LEFT, distance: CLOSE}),
				},
				{
					src: ASSETS.CLOSE_SIDE_CORNER_2,
					side: RIGHT,
					index: game => game.doorOpening ? 0 : game.frameIndex,
					hidden: game => game.rotation % 2 === 1 || !game.closeWall() || game.mazeHole({direction: RIGHT, distance: CLOSE}),
				},
				{
					src: ASSETS.DOOR_OPEN_2,
					index: game => game.frameIndex,
					hidden: game => game.rotation % 2 === 1 || !game.closeDoor() || !game.doorOpening,
				},
				{
					src: ASSETS.CLOSE_DOOR_2,
					index: game => game.doorOpening ? 0 : game.frameIndex,
					hidden: game => game.rotation % 2 === 1 || !game.closeDoor() || game.doorOpening,					
				},
			],
			doors: {
				1: {
					scene: "maze-2",
					exit: (game, {scene}) => {
						const fadeDuration = 1000;
						game.fadeOut(game.now, {duration:fadeDuration * 1.5, fadeDuration, color:"#000000", onDone: game => {
							game.gotoScene(scene, {door:5});
						}});
					},
				},
				2: {
					scene: "maze-4",
					exit: (game, {scene}) => {
						const fadeDuration = 1000;
						game.fadeOut(game.now, {duration:fadeDuration * 1.5, fadeDuration, color:"#000000", onDone: game => {
							game.gotoScene(scene, {door:1});
						}});
					},
				},
				3: {
					scene: "locker-room",
					exit: (game, {scene}) => {
						const fadeDuration = 1000;
						game.fadeOut(game.now, {duration:fadeDuration * 1.5, fadeDuration, color:"#000000", onDone: game => {
							game.gotoScene(scene);
						}});
					},
				},
			},
		},
		{
			name: "locker-room",
			onScene: game => {
				game.save();
				game.startDialog({
					time: game.now,
					index: 0,
					conversation: [
						{
							message: "",
							options: [
								{ },
								{ },
								{ msg: "LEAVE", onSelect: game => {
									const fadeDuration = 1000;
									game.fadeOut(game.now, {duration:fadeDuration * 1.5, fadeDuration, color:"#000000", onDone: game => {
										game.gotoScene("maze-3", {door:3})
									}});
								}},
							],
						},
					],
				});
			},
			sprites: [
				{
					src: ASSETS.LOCKER_ROOM,
				},
				{
					src: ASSETS.LOCKER_DOOR,
					index: ({situation}) => situation.rightLockerOpen ? 1 : 0,
					onClick: ({situation}) => situation.rightLockerOpen = !situation.rightLockerOpen,
				},
				{
					src: ASSETS.LOCKER_DOOR,
					index: ({situation}) => situation.midLockerOpen ? 3 : 2,
					onClick: (game) => {
						const {situation} = game;
						if (situation.midLockerUnlocked) {
							situation.midLockerOpen = !situation.midLockerOpen;
						} else {
							game.gotoScene("lock-zoom");
						}
					}
				},
				{
					src: ASSETS.LOCK_BLOCK,
				},
				{
					src: ASSETS.SPEECH_OUT,
					offsetY: 15,
					hidden: game => game.bagOpening || game.useItem || game.pendingTip,
					index: game => Math.min(3, Math.floor((game.now - game.sceneTime) / 80)),
				},
			],
		},
		{
			name: "lock-zoom",
			onScene: game => {
				game.save();
				game.startDialog({
					time: game.now,
					index: 0,
					conversation: [
						{
							message: "",
							options: [
								{ },
								{ },
								{ msg: "LEAVE", onSelect: game => {
									game.gotoScene("locker-room");
								}},
							],
						},
					],
				});
			},
			sprites: [
				{
					src: ASSETS.LOCK_BACK,
				},
				{
					src: ASSETS.LOCK_DIGIT,
				},
				{
					src: ASSETS.LOCK_DIGIT,
					offsetX: 11,
				},
				{
					src: ASSETS.LOCK_DIGIT,
					offsetX: 22,
				},
				{
					src: ASSETS.LOCK_DIGIT,
					offsetX: 33,
				},
				{
					src: ASSETS.SPEECH_OUT,
					offsetY: 15,
					hidden: game => game.bagOpening || game.useItem || game.pendingTip,
					index: game => Math.min(3, Math.floor((game.now - game.sceneTime) / 80)),
				},
			],
		},
		{
			name: "maze-4",
			onScene: game => {
				game.save();
			},
			arrowGrid: [
				[],
				[],
				[ null, null, s(2),     null, null  ],
				[ LEFT, null, s(1),     null, RIGHT ],
				[ LEFT, null, BACKWARD, null, RIGHT ],
			],
			map: `
				XXXXXXXXXXX
				X1........X
				XXXXXXXXXXX
			`,
			sprites: [
				{
					custom: (game, sprite, ctx) => ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height),
				},
				{
					src: ASSETS.MAZE_ROTATION_BACKGROUND_2,
					hidden: game => game.rotation % 2 === 0,
				},
				{
					src: ASSETS.MAZE_ROTATION_WALLS_2,
					side: LEFT,
					hidden: game => game.rotation % 2 === 0 || !game.hasLeftWallWhenRotating(),
				},
				{
					src: ASSETS.MAZE_ROTATION_WALLS_2,
					side: RIGHT,
					hidden: game => game.rotation % 2 === 0 || !game.hasRightWallWhenRotating(),
				},
				{
					src: ASSETS.MAZE_ROTATION_CORNER_2,
					hidden: game => !game.hasLeftWallWhenRotating() || !game.hasRightWallWhenRotating(),
				},
				{
					src: ASSETS.DUNGEON_MOVE_2,
					index: game => game.doorOpening ? 0 : game.frameIndex,
					hidden: game => game.rotation % 2 === 1,
				},
				{
					src: ASSETS.FAR_SIDE_2,
					side: LEFT,
					index: game => game.doorOpening ? 0 : game.frameIndex,
					hidden: game => game.rotation % 2 === 1 || !game.mazeHole({direction:LEFT, distance: FAR}),
				},
				{ 
					src: ASSETS.FAR_SIDE_CORNER_2,
					side: LEFT,
					index: game => game.doorOpening ? 0 : game.frameIndex,
					hidden: game => game.rotation % 2 === 1 || !game.mazeHole({direction:LEFT, distance: FAR}) || game.farWall(),
				},
				{
					src: ASSETS.FAR_SIDE_2,
					side: RIGHT,
					index: game => game.doorOpening ? 0 : game.frameIndex,
					hidden: game => game.rotation % 2 === 1 || !game.mazeHole({direction:RIGHT, distance: FAR}),
				},
				{
					src: ASSETS.FAR_SIDE_CORNER_2,
					side: RIGHT,
					index: game => game.doorOpening ? 0 : game.frameIndex,
					hidden: game => game.rotation % 2 === 1 || !game.mazeHole({direction:RIGHT, distance: FAR}) || game.farWall(),
				},
				{
					src: ASSETS.FAR_WALL_2,
					index: game => game.doorOpening ? 0 : game.frameIndex,
					hidden: game => game.rotation % 2 === 1 || !game.farWall(),					
				},
				{
					src: ASSETS.FAR_SIDE_CORNER_2,
					side: LEFT,
					index: game => game.doorOpening ? 0 : game.frameIndex,
					hidden: game => game.rotation % 2 === 1 || !game.farWall() || game.mazeHole({direction:LEFT, distance: FAR}),
				},
				{
					src: ASSETS.FAR_SIDE_CORNER_2,
					side: RIGHT,
					index: game => game.doorOpening ? 0 : game.frameIndex,
					hidden: game => game.rotation % 2 === 1 || !game.farWall() || game.mazeHole({direction:RIGHT, distance: FAR}),
				},
				{
					src: ASSETS.FAR_DOOR_2,
					index: game => game.doorOpening ? 0 : game.frameIndex,
					hidden: game => game.rotation % 2 === 1 || !game.farDoor(),
				},
				{
					src: ASSETS.CLOSE_SIDE_2,
					side: LEFT,
					index: game => game.doorOpening ? 0 : game.frameIndex,
					hidden: game => game.rotation % 2 === 1 || !game.mazeHole({direction: LEFT, distance: CLOSE}),
				},
				{
					src: ASSETS.CLOSE_SIDE_CORNER_2,
					side: LEFT,
					index: game => game.doorOpening ? 0 : game.frameIndex,
					hidden: game => game.rotation % 2 === 1 || !game.mazeHole({direction: LEFT, distance: CLOSE}) || game.closeWall(),
				},
				{
					src: ASSETS.CLOSE_SIDE_2,
					side: RIGHT,
					index: game => game.doorOpening ? 0 : game.frameIndex,
					hidden: game => game.rotation % 2 === 1 || !game.mazeHole({direction: RIGHT, distance: CLOSE}),
				},
				{
					src: ASSETS.CLOSE_SIDE_CORNER_2,
					side: RIGHT,
					index: game => game.doorOpening ? 0 : game.frameIndex,
					hidden: game => game.rotation % 2 === 1 || !game.mazeHole({direction: RIGHT, distance: CLOSE}) || game.closeWall(),
				},
				{
					src: ASSETS.CLOSE_WALL_2,
					index: game => game.doorOpening ? 0 : game.frameIndex,
					hidden: game => game.rotation % 2 === 1 || !game.closeWall(),
				},
				{
					src: ASSETS.CLOSE_SIDE_CORNER_2,
					side: LEFT,
					index: game => game.doorOpening ? 0 : game.frameIndex,
					hidden: game => game.rotation % 2 === 1 || !game.closeWall() || game.mazeHole({direction: LEFT, distance: CLOSE}),
				},
				{
					src: ASSETS.CLOSE_SIDE_CORNER_2,
					side: RIGHT,
					index: game => game.doorOpening ? 0 : game.frameIndex,
					hidden: game => game.rotation % 2 === 1 || !game.closeWall() || game.mazeHole({direction: RIGHT, distance: CLOSE}),
				},
				{
					src: ASSETS.DOOR_OPEN_2,
					index: game => game.frameIndex,
					hidden: game => game.rotation % 2 === 1 || !game.closeDoor() || !game.doorOpening,
				},
				{
					src: ASSETS.CLOSE_DOOR_2,
					index: game => game.doorOpening ? 0 : game.frameIndex,
					hidden: game => game.rotation % 2 === 1 || !game.closeDoor() || game.doorOpening,					
				},
			],
			doors: {
				1: {
					scene: "maze-3",
					exit: (game, {scene}) => {
						const fadeDuration = 1000;
						game.fadeOut(game.now, {duration:fadeDuration * 1.5, fadeDuration, color:"#000000", onDone: game => {
							game.gotoScene(scene, {door:2});
						}});
					},
				},
			},
		},
	],
};