gameConfig.scenes.push(
	{
		name: "maze-2",
		onScene: game => {
			game.save();
		},
		arrowGrid: [
			[null, null,  MENU, null, null ],
			[],
			[ null, null, s(2), null, null  ],
			[ LEFT, null, s(1), null, RIGHT ],
			[ LEFT, null, s(3), null, RIGHT ],
		],
		map: `
			XXXXXXXXXXXXXXXXX
			X..........5XXXXX
			X.XXXXXXXXXXXXXXX
			X.XMXXXXXXXXXXXXX
			X..............2X
			XXX.XXXXXXX.XXXXX
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
				index: ({now, battle}) => {
					if (!battle) {
						return 0;
					}
					if (now > battle.nextAttack) {
						return 4 + Math.floor((now - battle.nextAttack)/60) % 4;
					}
					return Math.floor(now/200) % 4;
				},
				hidden: ({battle}) => !battle || battle.foe != 'guard',
			},
			{
				src: ASSETS.PUNCH, col: 4, row: 4,
				index: ({battle, now}) => !battle ? 0 : Math.min(Math.floor((now - battle.playerRightAttack) / 50), 4),
				hidden: ({battle, now}) => {
					if (!battle || battle.fist !== RIGHT) {
						return true;
					}
					const frame = Math.floor(now - battle.playerRightAttack) / 50;
					return frame > 4;
				},
			},
			{
				src: ASSETS.PUNCH, col: 4, row: 4,
				index: ({battle, now}) => !battle ? 0 : 5 + Math.min(Math.floor((now - battle.playerLeftAttack) / 50), 4),
				hidden: ({battle, now}) => {
					if (!battle || battle.fist !== LEFT) {
						return true;
					}
					const frame = Math.floor(now - battle.playerLeftAttack) / 50;
					return frame > 4;
				},
			},
			...standardMenu(),
		],
		doors: {
			1: {
				scene: "maze",
				exit: (game, {scene}) => {
					const fadeDuration = 1000;
					game.fadeOut(game.now, {duration:fadeDuration * 1.5, fadeDuration, color:"#000000", onDone: game => {
						game.gotoScene(scene, {door:2});
					}});
				},
			},
			2: {
				scene: "toilets",
				exit: (game, {scene}) => {
					const fadeDuration = 1000;
					game.fadeOut(game.now, {duration:fadeDuration * 1.5, fadeDuration, color:"#000000", onDone: game => {
						game.gotoScene(scene);
					}});
				},
			},
			3: {
				scene: "vending-machine",
				exit: (game, {scene}) => {
					const fadeDuration = 1000;
					game.fadeOut(game.now, {duration:fadeDuration * 1.5, fadeDuration, color:"#000000", onDone: game => {
						game.gotoScene(scene);
					}});
				},
			},
			4: {
				scene: "arcade-room",
				exit: (game, {scene}) => {
					const fadeDuration = 1000;
					game.fadeOut(game.now, {duration:fadeDuration * 1.5, fadeDuration, color:"#000000", onDone: game => {
						game.gotoScene(scene);
					}});
				},
			},
			5: {
				scene: "maze-3",
				exit: (game, {scene}) => {
					const fadeDuration = 1000;
					game.fadeOut(game.now, {duration:fadeDuration * 1.5, fadeDuration, color:"#000000", onDone: game => {
						game.gotoScene(scene, {door:1, rotation:0});
					}});
				},
			},
		},
		onSceneBattle: ({now}, battle) => {
			if (!battle.nextAttack) {
				battle.nextAttack = Math.random() * 5000 + now;
			} else {
				const frame = 4 + Math.floor((now - battle.nextAttack)/50);
				if (frame >= 8) {
					game.playSound(SOUNDS.HIT);
					battle.playerHit = now;
					battle.nextAttack = null;
				}
			}
			if (battle.playerLeftAttack) {
				const frame = Math.floor((now - battle.playerLeftAttack) / 50);
				if (frame === 1 && !battle.playerLeftAttackLanded) {
					game.playSound(SOUNDS.HIT);
					battle.playerLeftAttackLanded = now;
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
				}
				if (frame > 4) {
					battle.playerRightAttack = 0;
					battle.playerRightAttackLanded = 0;						
					battle.fist = battle.fist === LEFT ? RIGHT: LEFT;
				}
			}
		},
		events: {
			o: {
				foe: "guard",
				onEvent: ({data, now}, {foe}) => {
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
						};
					}
				},
			},
		},
	},	
);