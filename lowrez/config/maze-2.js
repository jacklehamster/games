gameConfig.scenes.push(
	{
		name: "maze-2",
		onScene: game => {
			game.save();
		},
		arrowGrid: [
			[null, null,  MENU, null, null  ],
			[],
			[ null, null, s(2), null, null  ],
			[ LEFT, null, s(1), null, RIGHT ],
			[ LEFT, null, s(6), null, RIGHT ],
		],
		map: `
			XXXXXXXXXXXXXXXXX
			X..........5XXXXX
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
			{
				src: ASSETS.GUARD, col: 4, row: 4,
				offsetX: ({now, battle}) => {
					const hitTime = Math.max(1, now - Math.max(battle.playerLeftAttackLanded, battle.playerRightAttack));
					return hitTime < 500 ? Math.round((Math.random() - .5) * 200 / hitTime) : 0;
				},
				offsetY: ({now, battle}) => {
					const hitTime = Math.max(1, now - Math.max(battle.playerLeftAttackLanded, battle.playerRightAttack));
					return hitTime < 500 ? Math.round((Math.random() - .5) * 200 / hitTime) : 0;
				},
				index: ({now, battle}) => {
					if (!battle) {
						return 0;
					}
					if (Math.max(battle.playerLeftAttackLanded, battle.playerRightAttack)) {
						const hitTime = Math.max(1, now - Math.max(battle.playerLeftAttackLanded, battle.playerRightAttack));
						if (hitTime < 400) {
							return 8;
						}
					}
					if (now > battle.nextAttack) {
						return 4 + Math.floor((now - battle.nextAttack)/100) % 4;
					}
					return Math.floor(now/200) % 4;
				},
				hidden: ({battle}) => !battle || battle.foe != 'guard',
			},
			{
				src: ASSETS.PUNCH, col: 4, row: 4,
				side: ({battle}) => !battle.playerRightAttack ? RIGHT : 0,
				offsetX: ({now, battle}) => Math.cos((now-Math.PI) / 100) + 1,
				offsetY: ({now, battle}) => Math.sin((now-Math.PI) / 100) + 1 + (battle.playerLeftAttack?10:0),
				index: ({battle, now}) => {
					const frame = Math.floor(now - battle.playerRightAttack) / 50;
					if (frame > 4) {
						return 10;
					}
					return !battle ? 0 : Math.min(Math.floor((now - battle.playerRightAttack) / 50), 4);
				},
				hidden: ({battle, arrow}) => {
					return !battle || arrow === BLOCK;
				},
			},
			{
				src: ASSETS.PUNCH, col: 4, row: 4,
				side: ({battle}) => !battle.playerLeftAttack ? LEFT : 0,
				offsetX: ({now, battle}) => Math.sin(now / 100) - 1,
				offsetY: ({now, battle}) => Math.cos(now / 100) + 1 + (battle.playerRightAttack?10:0),
				index: ({battle, now}) => {
					const frame = Math.floor(now - battle.playerLeftAttack) / 50;
					if (frame > 4) {
						return 10;
					}
					return !battle ? 0 : 5 + Math.min(Math.floor((now - battle.playerLeftAttack) / 50), 4);
				},
				hidden: ({battle, arrow}) => {
					return !battle || arrow === BLOCK;
				},
			},
			{
				src: ASSETS.PUNCH, col: 4, row: 4,
				index: 11,
				hidden: ({battle, arrow}) => !battle || arrow !== BLOCK,
			},
			{
				custom: (game, sprite, ctx) => {
					const { battle, now } = game;
					const { playerCharge, foeCharge } = battle;
					const foeChargePercent = Math.min(1, (now - foeCharge) / 10000);
					const playerChargePercent = Math.min(1, (now - playerCharge) / 10000);

					ctx.fillStyle = "black";
					ctx.fillRect(5, 3, 54, 3);
					ctx.fillRect(5, 59, 54, 3);

					ctx.fillStyle = foeChargePercent === 1 && Math.random() > .5 ? "#cc44aa" : "#770066";
					ctx.fillRect(6, 4, 52 * foeChargePercent, 1);
					if (foeChargePercent > 1/4 && foeChargePercent < 1) {
						ctx.fillStyle = "#cc44aa";
						ctx.fillRect(6, 4, Math.round(52 * Math.floor(foeChargePercent * 4)/4), 1);
					}

					ctx.fillStyle = playerChargePercent === 1 && Math.random() > .5 ? "#44ccaa" : "#338877";
					ctx.fillRect(6, 60, 52 * playerChargePercent, 1);
					if (playerChargePercent > 1/4 && playerChargePercent < 1) {
						ctx.fillStyle = "#44ccaa";
						ctx.fillRect(6, 60, Math.round(52 * Math.floor(playerChargePercent * 4)/4), 1);
					}

					ctx.fillStyle = "#999999";
					ctx.fillRect(6 + (52/4), 3, 1, 3);
					ctx.fillRect(6 + (52/4), 59, 1, 3);
					ctx.fillRect(6 + (52/2), 3, 1, 3);
					ctx.fillRect(6 + (52/2), 59, 1, 3);
					ctx.fillRect(6 + (52*3/4), 3, 1, 3);
					ctx.fillRect(6 + (52*3/4), 59, 1, 3);
				},
				hidden: ({battle}) => !battle,
			},
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
		onSceneBattle: ({now, arrow}, battle) => {
			if (!battle.nextAttack) {
				battle.nextAttack = Math.random() * 5000 + now;
			} else {
				const frame = 4 + Math.floor((now - battle.nextAttack) / 100);
				if (frame >= 7) {
					if (arrow === BLOCK) {
						game.playSound(SOUNDS.DUD);
					} else {
						battle.playerCharge = now;
						game.playSound(SOUNDS.HIT);
						battle.playerHit = now;
					}
					battle.nextAttack = null;
				}
			}
			if (battle.playerLeftAttack) {
				const frame = Math.floor((now - battle.playerLeftAttack) / 50);
				if (frame === 1 && !battle.playerLeftAttackLanded) {
					game.playSound(SOUNDS.HIT);
					battle.playerLeftAttackLanded = now;
					battle.foeCharge = now;
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
					battle.foeCharge = now;
				}
				if (frame > 4) {
					battle.playerRightAttack = 0;
					battle.playerRightAttackLanded = 0;						
					battle.fist = battle.fist === LEFT ? RIGHT: LEFT;
				}
			}
		},
		onScenePunch: (game, battle) => {
			const { now } = game;
			const { playerCharge } = battle;
			const playerChargePercent = Math.min(1, (now - playerCharge) / 10000);
			if(playerChargePercent >= 1/4) {
				battle.playerCharge = now - (playerChargePercent - (playerChargePercent >= 1 ? 1/2 : 1/4)) * 10000;
				return true;
			} else {
				game.playSound(SOUNDS.ERROR);
				game.delayAction(game => game.playSound(SOUNDS.ERROR), 100);
				return false;
			}
		},
		events: {
			':': {
				foe: "guard",
				foeLife: 80,
				onEvent: (game, {foe, foeLife}) => {
					const {data, now} = game;
					game.canPunch = false;
					game.playTheme(SOUNDS.BATTLE_THEME, {volume:.7});
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
							playerCharge: now,
							foeCharge: now,
							foeLife,
						};
					}
				},
			},
		},
	},	
);