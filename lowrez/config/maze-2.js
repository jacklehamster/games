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
			makeFoe('monster', ASSETS.MONSTER),
			makeFoe('slime', ASSETS.SLIME),
			...standardBattle(),
			...standardBag(),
			...standardMenu(),
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
				exit: (game, {scene}) =>  game.fadeToScene(scene, {door:1}, 1000),
			},
		},
		... makeOnSceneBattle(),
		events: {
			':': {
				foe: "guard",
				foeLife: 80,
				foeDefense: .5,
				attackSpeed: 3000,
				riposteChance: .5,
				attackPeriod: 100,
				foeDamage: 10,
				onEvent: (game, {foe, foeLife, foeDefense, attackSpeed, riposteChance, attackPeriod, foeDamage, onWin}) => {
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
							foeBlock: 0,
							playerLeftAttack: 0,
							playerRightAttack: 0,
							playerAttackLanded: 0,
							playerAttackPeriod: 50,
							foeLife,
							foeMaxLife: foeLife,
							foeDefense,
							foeDefeated: 0,
							attackPeriod,
							riposteChance,
							foeDamage,
							onWin,
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