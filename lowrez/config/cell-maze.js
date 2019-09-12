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
			XKXXMXXX.XX
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
				scene: "cell-maze-2", door: 5,
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
			'K': {
				blocking: true,
				cage: true,
				showBag: true,
				blockMap: true,
				onEvent: (game, event) => {

				},
			},
			'Q': {
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