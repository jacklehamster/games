gameConfig.scenes.push(
	{
		name: "maze-3",
		onScene: game => {
			game.save();
		},
		arrowGrid: [
			[null, null,  MENU, null, null ],
			[],
			[ LEFT, null, s(2), null, RIGHT ],
			[ LEFT, s(7), s(8), s(7), RIGHT ],
			[ LEFT, s(7), s(3), s(7), RIGHT ],
		],
		map: `
			XXXXXXXXXXXXX
			X.........XXX
			X.XXXXXXX.XXX
			X.XX3.....XXX
			X.XXXXXXX.XMX
			XsX.........X
			X.X.XX.XX.XXX
			X.X1XX.XX.XXX
			X.XXXX.XX.XXX
			X......XX2XXX
			XXXXXXXXXXXXX
		`,
		sprites: [
			{
				custom: (game, sprite, ctx) => ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height),
			},
			...getCommonMaze("_1"),
			makeFoe('slime', ASSETS.SLIME),
			...standardBattle(),
			...standardBag(),
			...standardMenu(),
		],
		... makeOnSceneBattle(),
		doors: {
			1: {
				scene: "maze-2",
				exit: (game, {scene}) =>  game.fadeToScene(scene, {door:5}, 1000),
			},
			2: {
				scene: "maze-4",
				exit: (game, {scene}) =>  game.fadeToScene(scene, {door:1}, 1000),
			},
			3: {
				scene: "locker-room",
				exit: (game, {scene}) =>  game.fadeToScene(scene, null, 1000),
			},
		},
		events: {
			's': {
				foe: "slime",
				foeLife: 60,
				foeDefense: .7,
				attackSpeed: 2500,
				riposteChance: .7,
				attackPeriod: 100,
				foeDamage: 5,
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