gameConfig.scenes.push(
	{
		name: "training-room",
		onScene: game => {
			game.save();
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
			XXXXX|XXXXX
			X1......2mX
			XXXXXXXXXXX
		`,
		sprites: [
			{
				custom: (game, sprite, ctx) => ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height),
			},
			...getCommonMaze("_BLUE_1"),
			makeFoe('battle-dummy', ASSETS.DUMMY),
			makeFoe('slimo', ASSETS.SLIMO),
			...standardBattle(),
			...standardMenu(),
			...standardBag(),
		],
		... makeOnSceneBattle(),
		doors: {
			1: {
				scene: "maze", door: 3,
				exit: (game, {scene, door}) =>  game.fadeToScene(scene, {door}, 1000),
			},
			2: {},
		},
		... makeOnSceneBattle(),
		events: {
			'|': {
				foe: "battle-dummy",
				foeLife: 800000000,
				foeBlockChance: 1,
				attackSpeed: 10000000,
				riposteChance: 1,
				attackPeriod: 100,
				foeDamage: 0,
				foeDefense: 10000,
				xp: 0,
				belowTheBelt: false,
				dummyBattle: true,
				blocking: true,
				onEvent: (game, {foe, foeLife, foeBlockChance, foeDefense, attackSpeed, riposteChance, attackPeriod, foeDamage, onWin, xp, belowTheBelt, dummyBattle}) => {
					const {data, now} = game;
					game.chest = null;
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
							dummyBattle,
						};
					}
					return true;
				},
			},
			'm': {
				foe: "slimo",
				foeLife: 60,
				foeBlockChance: .6,
				attackSpeed: 2500,
				riposteChance: .7,
				attackPeriod: 100,
				foeDamage: 6,
				foeDefense: 12,
				xp: 3,
				belowTheBelt: true,
				blocking: true,
				chest: true,
				onEvent: (game, {foe, foeLife, foeBlockChance, foeDefense, attackSpeed, riposteChance, attackPeriod, foeDamage, onWin, xp, belowTheBelt}) => {
					const {data, now} = game;
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
					item: "fruit?", image: ASSETS.GRAB_APPLE, 
				}),
			},
		},
	},
);