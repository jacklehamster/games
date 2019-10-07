gameConfig.scenes.push(
	{
		name: "maze-2",
		onScene: game => {
			game.save();
		},
		arrowGrid: [
			[null, null,  MENU, null, null  ],
			[],
			[ LEFT, null, s(2), null, RIGHT ],
			[ LEFT, s(7), s(8), s(7), RIGHT ],
			[ LEFT, s(7), s(3), s(7), RIGHT ],
		],
		map: `
			XXXXXXXXXXXXXXXXX
			X...TXXXXXXXXXXXX
			X.XXXXXXXXXXXXXXX
			X.........:5XXXXX
			X.XXXXXXXXXXXXXXX
			X.XMXXXXXXXXXXXXX
			X..............2X
			XXX.XXXXXXX:XXXXX
			XXX...3XXXX.XXXXX
			XXX.XXXXXXX.XMXXX
			XXX...4XX1....XXX
			XXXXXXXXXXXXXXXXX
		`,
		sprites: [
			{
				custom: (game, sprite, ctx) => ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height),
			},
			...getCommonMaze("_BLUE_1"),
			makeFoe('guard', ASSETS.GUARD),
			makeYupa(),
			...standardBattle(),
			...standardMenu(),
			...standardBag(),
		],
		doors: {
			1: {
				scene: "maze",
				exit: (game, {scene}) =>  game.fadeToScene(scene, {door:2}, 1000),
			},
			2: {
				scene: "toilets",
				exit: (game, {scene}) =>  game.fadeToScene(scene, null, 1000),
			},
			3: {
				scene: "vending-machine",
				exit: (game, {scene}) =>  game.fadeToScene(scene, null, 1000),
			},
			4: {
				scene: "arcade-room",
				exit: (game, {scene}) =>  game.fadeToScene(scene, null, 1000),
			},
			5: {
				scene: "maze-3",
				wayUp: true,
				// lock: true,
				exit: (game, {scene}) => {
					game.fadeToScene(scene, {door:1}, 1000);
				},
			},
		},
		... makeOnSceneBattle(),
		events: {
			T: {
				chest: true,
				blocking: true,
				onEvent: (game, event) => {
					const {data, now} = game;
					game.findChest(now, {
						item:"coin", image:ASSETS.GRAB_COIN,
						cleared: game.situation.chestCleared,
					});
				},
			},
			':': {
				foe: "guard",
				foeLife: 80,
				foeBlockChance: .5,
				attackSpeed: 3000,
				riposteChance: .5,
				attackPeriod: 100,
				foeDamage: 9,
				foeDefense: 10,
				xp: 5,
				belowTheBelt: false,
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
					item:"coin", image:ASSETS.GRAB_COIN, 
				}),
			},
		},
	},	
);