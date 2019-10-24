gameConfig.scenes.push(
	{
		name: "maze-3",
		onScene: game => {
			game.save();
			game.data.slimePresent = game.now;
		},
		arrowGrid: [
			[null, null,  MENU, null, null ],
			[],
			[ LEFT, null, s(2), null, RIGHT ],
			[ LEFT, s(7), s(8), s(7), RIGHT ],
			[ LEFT, s(7), s(3), s(7), RIGHT ],
		],
		map: `
			XXXXXXXXXXXXXXX
			XXX.........XXX
			XXX.XXXXXXX.XXX
			XMX.XX3.....XXX
			X.X.XXXXXXX.XMX
			X..sX.........X
			X.X.X.XX.XX.XXX
			X!X.X1XX.XX.XXX
			XXX.XXXX.XX.XXX
			XXX......XX2XXX
			XXXXXXXXXXXXXXX
		`,
		sprites: [
			{
				custom: (game, sprite, ctx) => ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height),
			},
			...getCommonMaze("_BLUE_1"),
			makeFoe('slimar', ASSETS.SLIMAR),
			makeYupa(),
			...standardBattle(),
			...standardMenu(),
			...standardBag(),
		],
		doors: {
			1: {
				scene: "maze-2",
				wayDown: true,
				exit: (game, {scene}) => {
					game.fadeToScene(scene, {door:5}, 1000);
				},
			},
			2: {
				scene: "maze-4",
				wayUp: true,
				exit: (game, {scene}) =>  game.fadeToScene(scene, {door:1}, 1000),
			},
			3: {
				scene: "locker-room",
				exit: (game, {scene}) =>  game.fadeToScene(scene, null, 1000),
			},
		},
		... makeOnSceneBattle(),
		events: {
			'!': {
				chest: true,
				blocking: true,
				onEvent: (game, event) => {
					const {data, now} = game;
					game.findChest(now, {
						item:"key", image:ASSETS.GRAB_KEY,
						cleared: game.situation.chestCleared,
					});
				},
			},
			's': {
				foe: "slimar",
				foeLife: 90,
				foeBlockChance: .6,
				attackSpeed: 2200,
				riposteChance: .7,
				attackPeriod: 100,
				foeDamage: 10,
				foeDefense: 12,
				xp: 7,
				belowTheBelt: true,				
				onEvent: (game, {foe, foeLife, foeBlockChance, foeDefense, attackSpeed, riposteChance, attackPeriod, foeDamage, onWin, xp, belowTheBelt}) => {
					if (!game.data.slimePresent) {
						return;
					}
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
				onWin: game => {
					game.data.slimePresent = 0;
					game.findChest(game.now + 2000, {
						item:"coin", image:ASSETS.GRAB_COIN,
					});
				},
			},
		},
	},
);