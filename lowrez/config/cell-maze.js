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
			X3.......XX
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
				src: ASSETS.YUPA_SHAKE, col: 3, row: 4,
				hidden: game => !game.situation.wokeYupa || !game.facingEvent() || !game.facingEvent().yupa || game.rotation % 2 !== 0 || game.moving,
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
					sprite.onDialog(game, sprite);
					return true;
				},				
				onClick: (game, sprite) => {
					sprite.onDialog(game, sprite);
				},
				onDialog: (game, sprite) => {
					game.sceneData.zoomYupa = game.now;						
					game.startDialog({
						time: game.now,
						index: 0,
						conversation: [
							{
								options: [
									{
										msg: "Say Hello",
										onSelect: (game, dialog) => {
											game.playSound(SOUNDS.YUPA);
											dialog.speaking = true;
											game.waitCursor = true;
											game.showTip("Who art yoouu?", () => {
												dialog.speaking = false;
												game.waitCursor = false;
											}, null, { x: 1, y: 15, speed: 60, talker:"yupa" });
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
			},
			{
				src: ASSETS.YUPA_ZOOM, col: 3, row: 3,
				hidden: game => !game.sceneData.zoomYupa || !game.situation.wokeYupa,
			},
			{
				src: ASSETS.YUPA_DRY,
				hidden: game => game.situation.wokeYupa || !game.facingEvent() || !game.facingEvent().yupa || game.rotation % 2 !== 0 || game.moving,
				tip: game => game.situation.gateOpened[game.frontCell()] ? "Oh no! It's.. it's my friend Yupa!" : "What's behind the bars? It looks like an alien corpse.",
				onClick: game => {
					if (game.situation.waterYupa) {
						game.showTip("I must water Yupa! Quick!");
						return;
					}
					game.sceneData.zoomYupa = game.now;
					game.waitCursor = true;
					if (!game.situation.seenYupa) {
						game.situation.seenYupa = game.now;
						game.showTip([
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
			},
			{
				src: ASSETS.YUPA_ZOOM, col: 3, row: 3,
				hidden: game => !game.sceneData.zoomYupa || !game.situation.wokeYupa,
				index: game => {
					if (game.dialog.speaking) {
						return Math.floor(Math.random() * 4) + 3;
					}
					return Math.min(3, Math.floor((game.now - game.sceneData.zoomYupa)/50));
				},
			},
			...standardBattle(),
			...standardMenu(),
			...standardBag(),
		],
		... makeOnSceneBattle(),
		doors: {
			1: {
			},
			2: {
				wayDown: true,
				scene: "maze-4", door: 2,
				exit: (game, {scene, door}) =>  game.fadeToScene(scene, {door}, 1000),
			},
			3: {
				lock: true,
			},
			5: {
				lock: true,
				wayUp: true,
//				scene: "cell-maze-2", door: 5,
				scene: "in-progress", door: 1,
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
					game.canPunch = false;
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
					item:"key", image:ASSETS.GRAB_KEY, 
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
					game.canPunch = false;
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
					item:"key", image:ASSETS.GRAB_KEY, 
				}),
			},			
		},
	},
);