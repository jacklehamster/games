gameConfig.scenes.push(
	{
		name: "cell-maze",
		onScene: game => {
			game.save();
			if (!game.situation.gateOpened) {
				game.situation.gateOpened = {};
			}
			if (!game.situation.chestCleared) {
				game.situation.chestCleared = {};
			}
		},
		arrowGrid: [
			[ null, null, MENU,  null, null ],
			[],
			[ LEFT, null, s(2), null, RIGHT ],
			[ LEFT, s(7), s(8), s(7), RIGHT ],
			[ LEFT, s(7), s(9), s(7), RIGHT ],
		],
		map: `
			XXXXXXXXXXX
			XXXXXXXX5XX
			XYXXMXXX.XX
			X4.......XX
			XQXX.XXXXXX
			XXXX.XXXXXX
			X^1....1öXX
			XXXX.XXXXXX
			XXXX.XXX8XX
			X3......1XX
			XCXX.XXXXXX
			XXXX.XXXXXX
			X2...XXXXXX
			XXXXXXXXXXX
		`,
		onDialog: game => {
			game.sceneData.zoomYupa = game.now;						
			game.startDialog({
				time: game.now,
				index: 0,
				conversation: [
					{
						options: [
							{
								msg: "Hello Yupa!",
								onSelect: (game, dialog) => {
									game.playSound(SOUNDS.YUPA);
									game.waitCursor = true;
									game.showTip("Who ar yoouu?", () => {
										game.waitCursor = false;
									}, null, { x: 1, y: 15, speed: 80, talker:"yupa" });
									dialog.index = 1;
								},
							},
							{
								msg: "LEAVE", onSelect: game => {
									game.sceneData.zoomYupa = 0;
									game.dialog = null;
								},
							},
						],
					},
					{
						options: [
							{
								msg: game => game.data.name ? `It's me ${game.data.name}` : "It's me...",
								onSelect: (game, dialog) => {
									if (game.data.name) {
										game.showTip(`It's me, your friend ${game.data.name}!`, game => {
											game.playSound(SOUNDS.YUPA);
											game.showTip("A still don know youu", () => {
												game.waitCursor = false;
											}, null, { x: 1, y: 15, speed: 80, talker:"yupa" });
										});
									} else {
										game.dialog = null;
										const currentSceneName = game.sceneName;
										game.gotoScene("name-screen");
										game.sceneData.returnScene = currentSceneName;
									}
								},
							},
							{
								msg: "You're alive!",
								onSelect: (game, dialog) => {
									game.playSound(SOUNDS.YUPA);
									game.waitCursor = true;
									game.showTip([
											"Yes, Aa waz travel round, til you soak me!",
										], () => {
										game.waitCursor = false;
									}, null, { x: 1, y: 15, speed: 80, talker:"yupa" });
									dialog.index ++;
								},
							},
							{
								msg: "LEAVE", onSelect: game => {
									game.sceneData.zoomYupa = 0;
									game.dialog = null;
								},
							},
						],
					},
					{
						options: [
							{
								msg: "Travel? Where?",
								onSelect: (game, dialog) => {
									game.playSound(SOUNDS.YUPA);
									game.waitCursor = true;
									game.showTip([
										"Aa was travellin in parrlel uverse.",
										"Life here so boring in cage. Just had to get out.",
										"Oh that's right, yo can't do that coz you a human.",
									], () => {
										game.waitCursor = false;
									}, null, { x: 1, y: 15, speed: 80, talker:"yupa" });
									dialog.index ++;
								},
							},
							{
								msg: "Travel? How?",
								onSelect: (game, dialog) => {
									game.showTip("How can you travel? You were locked up?", () => {
										game.playSound(SOUNDS.YUPA);
										game.waitCursor = true;
										game.showTip([
											"Oh yah, yo a human. You cant do that...",
											"Us Yupa, we can travel to parallel uverses.",
											"Haha, only one life. Must be so boring!",
										], () => {
											game.waitCursor = false;
										}, null, { x: 1, y: 15, speed: 80, talker:"yupa" });
									});
									dialog.index ++;
								},
							},
							{
								msg: "LEAVE", onSelect: game => {
									game.sceneData.zoomYupa = 0;
									game.dialog = null;
								},
							},
						],
					},
					{
						options: [
							{
								msg: "How long...",
								onSelect: (game, dialog) => {
									game.showTip("How long have you been in here?", () => {
										game.playSound(SOUNDS.YUPA);
										game.waitCursor = true;
										game.showTip("Fiew monts? Fiew years. Dunt know.", () => {
											game.showTip("A few years?!!!", () => {
												game.waitCursor = false;
											});
										}, null, { x: 1, y: 15, speed: 80, talker:"yupa" });
									});
									dialog.index = 1;
								},
							},
							{
								msg: "LEAVE", onSelect: game => {
									game.sceneData.zoomYupa = 0;
									game.dialog = null;
								},
							},
						],
					},
					{
						options: [
							{},
							{},
							{
								msg: "LEAVE", onSelect: game => {
									game.sceneData.zoomYupa = 0;
									game.dialog = null;
								},
							},
						],
					},
				],
			});
		},
		onSceneHoldItem: (game, item) => {
			if (item === "gun" && game.facingEvent() && game.facingEvent().yupa) {
				game.showTip("I don't want to use my gun now!");
				game.useItem = null;
			}
		},
		sprites: [
			{
				custom: (game, sprite, ctx) => ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height),
			},
			...getCommonMaze("_1"),
			makeFoe('guard', ASSETS.GUARD_2),
			makeFoe('monster', ASSETS.MONSTER),
			makeFoe('slime', ASSETS.SLIME),
			{
				src: ASSETS.SKELETON,
				hidden: game => !game.facingEvent() || !game.facingEvent().skeleton || game.rotation % 2 !== 0 || game.moving,
			},
			{
				src: ASSETS.SKELETON_ROPE, col: 1, row: 2,
				hidden: game => !game.facingEvent() || !game.facingEvent().skeletonRope || game.rotation % 2 !== 0 || game.moving,
				index: game => game.situation.skeletonRopeFound ? 1 : 0,
				onClick: game => {
					if (!game.situation.gateOpened[game.frontCell()]) {
						return;
					}
					game.situation.skeletonRopeFound = game.now;
					game.pickUp({item:"rope", image:ASSETS.GRAB_ROPE, message:"This rope might be handy."});					
				},
			},
			{
				src: ASSETS.YUPA_SHAKE, col: 3, row: 4,
				hidden: game => game.data.yupa || !game.situation.wokeYupa || !game.facingEvent() || !game.facingEvent().yupa || game.rotation % 2 !== 0 || game.moving,
				index: game => {
					const time = game.now - game.situation.wokeYupa;
					if (time < 5000) {
						return Math.floor(time / 100) % 4;
					} else if (time < 7000) {
						return 4 + Math.floor(time / 20) % 8;
					} else {
						return 0;
					}
				},
				combine: (item, game, sprite) => {
					game.useItem = item;
					game.currentScene.onDialog(game);
					return true;
				},				
				onClick: (game, sprite) => {
					if (game.now - game.situation.wokeYupa < 7000) {
						game.showTip("He looks a bit shaken.", null, null, {removeLock:true});
					} else {
						game.currentScene.onDialog(game);
					}
				},
			},
			{
				src: ASSETS.YUPA_ZOOM, col: 3, row: 3,
				hidden: game => !game.sceneData.zoomYupa || !game.situation.wokeYupa,
			},
			{
				src: ASSETS.YUPA_DRY,
				hidden: game => game.situation.wokeYupa || !game.facingEvent() || !game.facingEvent().yupa || game.rotation % 2 !== 0 || game.moving,
				tip: game => game.situation.waterYupa ? "I must water Yupa! Quick!" : game.situation.gateOpened[game.frontCell()] ? "Oh no! It's.. it's my friend Yupa!" : "What's behind the bars? It looks like an alien corpse.",
				onClick: game => {
					if (!game.situation.gateOpened[game.frontCell()]) {
						return;
					}
					if (game.situation.waterYupa) {
						game.showTip("I must water Yupa! Quick!", null, null, {removeLock:true});
						return;
					}
					game.sceneData.zoomYupa = game.now;
					game.waitCursor = true;
					if (!game.situation.seenYupa) {
						game.situation.seenYupa = game.now;
						game.showTip([
								"Oh no!!!",
								"This.. this was my alien friend.. Yupa!",
								"He took me on his spaceship, and we travelled the stars together...",
								"I recognize him. Oh Yupa, what have they done to you...",
								"His body is all dried up. He must have been dead for a long time...",
								"I swear Yupa. I will avenge you."
							], game => {
								game.sceneData.zoomYupa = 0;
								game.waitCursor = false;
							});
					} else {
						game.waitCursor = true;
						game.showTip([
								"I swear Yupa. I will avenge you."
							], game => {
								game.sceneData.zoomYupa = 0;
								game.waitCursor = false;
							})
					}
				},
				combine: (item, game) => {
					if (item === "water bottle") {
						game.useItem = null;
						game.removeFromInventory("water bottle");
						if (game.situation.waterYupa) {
							game.playSound(SOUNDS.DRINK);
							game.addToInventory({item:"empty bottle", image:ASSETS.GRAB_BOTTLE});
							game.showTip("I hope this helps!", onDone => {
								game.playSound(SOUNDS.YUPA);
								game.situation.wokeYupa = game.now;
							});
						} else {
							game.waitCursor = true;
							game.showTip(["With this water", "I shall bless you in the after life,", "my dear friend Yupa."], game => {
								game.situation.waterYupa = game.now;
								game.playSound(SOUNDS.DRINK);
								game.addToInventory({item:"empty bottle", image:ASSETS.GRAB_BOTTLE});
								game.delayAction(game => {
									game.showTip([
										"Well that's odd. He's kinda moving... It's like he is...",
										"Wait a minute! Is he still alive?!!",
										"I must pour more water on him. Quick!",
									], game => {
										game.waitCursor = false;
									});
								}, 2000);
							});
						}
						return true;
					} else if (item === "fruit?") {
						game.showTip("I don't think he can eat in his state.");
					}
				},
				index: game => {
					if (!game.situation.waterYupa) {
						return 0;
					}
					return Math.floor(((Math.sin(game.now / 100) + 1) / 2) * 4);
				},
			},
			{
				src: ASSETS.CAGE_OPENED, col: 2, row: 2,
				index: game => game.situation.gateOpened[game.frontCell()] ? Math.min(3, Math.floor((game.now - game.situation.gateOpened[game.frontCell()]) / 100)) : 0,
				hidden: game => !game.facingEvent() || !game.facingEvent().cage || game.rotation % 2 !== 0 || game.moving,
			},			
			{
				name: "scanner",
				src: ASSETS.SCAN_CARD, col: 1, row: 2,
				index: game => game.situation.gateOpened[game.frontCell()] ? 1 : 0,
				combine: (item, game) => {
					if (item === "access card") {
						game.useItem = null;
						game.playSound(SOUNDS.DRINK);
						game.situation.gateOpened[game.frontCell()] = game.now;
						game.dialog = null;
						return true;
					}
				},
				hidden: game => !game.facingEvent() || !game.facingEvent().cage || game.rotation % 2 !== 0 || game.moving,
			},
			{
				src: ASSETS.YUPA_DRY_CLOSE,
				hidden: game => !game.sceneData.zoomYupa || game.situation.wokeYupa,
				onClick: () => {
				},
			},
			{
				src: ASSETS.YUPA_ZOOM, col: 3, row: 3,
				hidden: game => !game.sceneData.zoomYupa || !game.situation.wokeYupa,
				index: game => {
					const { pendingTip, now, sceneData } = game;
					if (pendingTip && pendingTip.talker === "yupa") {
						return 4 + Math.floor(now / 50) % 4;
					}
					return game.useItem ? 4 : Math.min(3, Math.floor((now - sceneData.zoomYupa)/50));
				},
				combine: (item, game) => {
					game.useItem = null;
					if (!game.data.name) {
						game.showTip("I should introduce myself before giving him anything.");
						game.currentScene.onDialog(game);
					} else {
						switch (item) {
							case "water bottle":
								game.playSound(SOUNDS.YUPA);
								game.showTip("I'm good now. Thanks.", null, null, { x: 1, y: 15, speed: 80, talker:"yupa"});
								break;
							case "photo":
								game.sceneData.yupa_photo = game.now;
								game.waitCursor = true;
								game.dialog = null;						
								break;
							default:
								game.playSound(SOUNDS.YUPA);
								game.showTip("I don't need that.", null, null, { x: 1, y: 15, speed: 80, talker:"yupa"});
								break;
						}
					}
					return true;
				},
				onClick: () => {
				},
			},
			{
				src: ASSETS.YUPA_GRAB_PHOTO, col: 2, row: 3,
				hidden: game => !game.sceneData.yupa_photo,
				index: game => {
					const frame = Math.floor((game.now - game.sceneData.yupa_photo) / 80);
					if (frame < 30) {
						return Math.min(frame, 3);
					} else if (frame < 60) {
						return frame % 2 + 4;
					} else if (frame < 85) {
						return 3;
					} else {
						return Math.max(0, 3 + 85 - frame);
					}
				},
				onRefresh: game => {
					const frame = Math.floor((game.now - game.sceneData.yupa_photo) / 80);
					if (frame > 30 && !game.sceneData.yupalaugh) {
						game.sceneData.yupalaugh = game.now;
						game.playSound(SOUNDS.YUPA_HAHA);
					} 
					if (frame > 100) {
						game.useItem = null;
						game.sceneData.yupa_photo = 0;
						game.currentScene.onDialog(game);
						game.playSound(SOUNDS.YUPA);
						game.showTip([
							"Hey yeeh! I rememba you now!",
							"You da time travlar from da future!",
							"You diden know wat to do, so I save yo ass by taking you on my saucer.",
							"And we kidnap baby hitler. Hahaha! So funney!",
						], game => {
							game.showTip([
								"So you rememba me! That's great!",
								"Do you know what happened to the baby?",
							], game => {
								game.playSound(SOUNDS.YUPA);
								game.showTip([
									`I dun remembah which planet we left him on.`,
								], game => {
									game.showTip([
										"I need to look for him.",
										"Will you come with me? Let's escape from this prison together",
										"and look for Baby Hitler.",
									], game => {
										game.playSound(SOUNDS.YUPA);
										game.showTip([
											`Sure my man ${game.data.name}!`,
											`I be rite behind ya.`,
										], game => {
											game.dialog = null;
											game.waitCursor = false;
											game.sceneData.zoomYupa = 0;
											game.data.yupa = {
												rotation: game.rotation,
												joined: game.now,
												position: -12,
											};
											game.showTip("Yupa has joined me! Now I don't feel lonely anymore.", null, null, {removeLock:true});
										}, null, { x: 1, y: 15, speed: 80, talker:"yupa"});
									});
								}, null, { x: 1, y: 15, speed: 80, talker:"yupa"});
							});
						}, null, { x: 1, y: 15, speed: 80, talker:"yupa"});	
					}			
				},
			},
			makeYupa(),
			...standardBattle(),
			...standardMenu(),
			...standardBag(),
		],
		... makeOnSceneBattle(),
		doors: {
			1: {},
			2: {
				scene: "maze-4", door: 2,
				exit: (game, {scene, door}) =>  game.fadeToScene(scene, {door}, 1000),
			},
			3: {
				lock: true,
			},
			4: {
				lock: true,
			},
			5: {
				lock: true,
				wayUp: true,
//				scene: "cell-maze-2", door: 5,
				scene: "ceiling-maze", door: 5,
				exit: (game, {scene, door}) =>  game.fadeToScene(scene, {door}, 1000),
			},
		},
		events: {
			'^': {
				chest: true,
				blocking: true,
				blockMap: true,
				onEvent: (game, event) => {
					const {data, now} = game;
					game.findChest(now, {
						item:"fruit?", image:ASSETS.GRAB_APPLE, 
						cleared: game.situation.chestCleared[game.frontCell()],
					});
				},
			},
			'C': {
				blocking: true,
				cage: true,
				showBag: true,
				blockMap: true,
				skeletonRope: true,
				onEvent: (game, event) => {

				},
			},
			'Y': {
				blocking: true,
				cage: true,
				showBag: true,
				blockMap: true,
				yupa: true,
				onEvent: (game, event) => {

				},
			},
			'Q': {
				skeleton: true,
				blocking: true,
				cage: true,
				showBag: true,
				blockMap: true,
				onEvent: (game, event) => {

				},
			},
			'8': {
				foe: "guard",
				foeLife: 150,
				foeBlockChance: .7,
				attackSpeed: 5000,
				riposteChance: .6,
				attackPeriod: 100,
				foeDamage: 9,
				foeDefense: 10,
				xp: 10,
				belowTheBelt: false,
				blocking: true,
				chest: true,
				blockMap: true,
				onEvent: (game, {foe, foeLife, foeBlockChance, foeDefense, attackSpeed, riposteChance, attackPeriod, foeDamage, onWin, xp, belowTheBelt}) => {
					const {data, now} = game;
					game.chest = null;
					game.playTheme(SOUNDS.BATTLE_THEME, {volume:.8});
					if (!data.battle) {
						data.battle = {
							time: now,
							foe,
							fist: LEFT,
							attackSpeed,
							playerHit: 0,
							playerBlock: 0,
							foeBlockChance,
							playerLeftAttack: 0,
							playerRightAttack: 0,
							playerAttackLanded: 0,
							playerAttackPeriod: 50,
							foeLife,
							foeMaxLife: foeLife,
							foeBlock: 0,
							foeDefense,
							foeDefeated: 0,
							attackPeriod,
							riposteChance,
							foeDamage,
							onWin,
							xp,
							belowTheBelt,
						};
					}
					return true;
				},
				onWin: game => game.findChest(game.now + 2000, {
					item:"water bottle", image:ASSETS.GRAB_WATER_BOTTLE, 
				}),
			},		
			'ö': {
				foe: "monster",
				foeLife: 150,
				foeBlockChance: .8,
				attackSpeed: 1500,
				riposteChance: .6,
				attackPeriod: 100,
				foeDamage: 7,
				foeDefense: 12,
				xp: 12,
				belowTheBelt: false,
				blocking: true,
				blockMap: true,
				chest: true,
				onEvent: (game, {foe, foeLife, foeBlockChance, foeDefense, attackSpeed, riposteChance, attackPeriod, foeDamage, onWin, xp, belowTheBelt}) => {
					const {data, now} = game;
					game.chest = null;
					game.playTheme(SOUNDS.BATTLE_THEME, {volume:.8});
					if (!data.battle) {
						data.battle = {
							time: now,
							foe,
							fist: LEFT,
							attackSpeed,
							playerHit: 0,
							playerBlock: 0,
							foeBlockChance,
							playerLeftAttack: 0,
							playerRightAttack: 0,
							playerAttackLanded: 0,
							playerAttackPeriod: 50,
							foeLife,
							foeMaxLife: foeLife,
							foeBlock: 0,
							foeDefense,
							foeDefeated: 0,
							attackPeriod,
							riposteChance,
							foeDamage,
							onWin,
							xp,
							belowTheBelt,
						};
					}
					return true;
				},
				onWin: game => game.findChest(game.now + 2000, {
					item:"fruit?", image:ASSETS.GRAB_APPLE, 
				}),
			},			
		},
	},
);