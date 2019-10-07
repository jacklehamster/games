gameConfig.scenes.push(
	{
		name: "jail-cell",
		arrowGrid: [
			[null, null,  MENU, null, null ],
			[],
			[ null, null, s(0), null, null  ],
			[ LEFT, null, s(0), null, RIGHT ],
			[ LEFT, null, BAG , null, RIGHT ],
		],
		onSceneForward: game => {
			game.waitCursor = true;
			game.hideArrows = true;
			game.fadeToScene("maze", {door:1}, 2000);
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
			if (game.data.shot.lamp && !game.situation.lighterOn && item === "lighter") {
				game.playSound(SOUNDS.HIT);
				game.situation.lighterOn = game.now + 500;
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
				game.playTheme(null);
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
									"WHO am I?",
								], game => {
							game.sceneIntro = false;
							game.sceneData.beginTime = game.now;
							game.hideCursor = false;
							game.playTheme(SOUNDS.JAIL_CELL_THEME);
						});
					}, 3000);
				}
			} else if (game.data.seen.badguards && !game.data.seen.badguards_intro) {
				game.playTheme(null);
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
						game.gameOver("  “That was too\n       noticeable”");
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
				index: ({data, now, sceneData}) => {
					if (data.shot["right guard"]) {
						const frame = 1 + Math.max(0, Math.min(3, Math.floor((now - data.shot["right guard"]) / 150)));
						return frame;
					}
					if (game.sceneData.guardAlert) {
						const frame = 5 + Math.max(0, Math.min(2, Math.floor((now - sceneData.guardAlert) / 200)));
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
				index: game => (game.situation.lighterOn ? 3 : 0) + (game.situation.explode ? Math.min(2, Math.floor((game.now - game.situation.explode) / 100)) : 0),
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
				tip: game => game.sceneData.leftShot && game.sceneData.rightShot ? "There must be a way to bust this lock..." : "There must be a way to bust this lock, when noone's watching...",
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
				hidden: ({rotation, data, sceneData, now}) => {
					if (rotation !== 0 || data.shot["left guard"]) {
						return true;
					}				
					if (!sceneData.guardAlert) {
						return true;
					}
					const frame = 1 + Math.max(0, Math.min(2, Math.floor((now - sceneData.guardAlert) / 150)));
					return frame < 3;
				}
			},
			{
				src: ASSETS.JAIL360, col:3, row:3,
				index: game => (game.rotation + 8) % 8,
				hidden: game => game.rotation === 0,
			},
			{
				src: ASSETS.WOOD, col:3, row:3,
				index: game => (game.rotation + 8) % 8,
				hidden: game => game.rotation === 0,
				combine: (item, game) => {
					if (item === "empty bottle" && game.data.pickedUp["empty bottle"]) {
						delete game.data.pickedUp["empty bottle"];
						game.removeFromInventory("empty bottle");
					}
					return true;
				},
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
					if (game.situation.lighterOn) {
						const progress = Math.max(0, Math.min(1, (game.now - game.situation.lighterOn) / 10000));
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
					const progress = Math.max(0, Math.min(1, (game.now - game.situation.lighterOn) / 5000));
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
					return !game.situation.lighterOn || game.gunFiredWithin(150);
				}
			},
			{
				fade: .9,
				fadeColor: "#ffffff",
				hidden: ({data, now}) => !data.shot.lamp || now - data.shot.lamp >= 100,
			},
			{
				src: ASSETS.DIMMING_LIGHT, col:2, row:2,
				index: 2,
				hidden: ({data, now, rotation}) => !data.shot.lamp || now - data.shot.lamp >= 100 || rotation !== 0,
			},
			...standardMenu(),
			...standardBag(),
		],
	},
);