gameConfig.scenes.push(
	{
		name: "lab",
		arrowGrid: [
			[null, null,  MENU, null, null ],
			[],
			[ LEFT, null, s(2), null, RIGHT ],
			[ LEFT, null, s(1), null, RIGHT ],
			[ LEFT, null, s(10), null, RIGHT ],
		],
		map: `
			XXX
			XOX
			X.X
			XEX
			XXX
		`,
		onScene: game => {
			game.playTheme(SOUNDS.JAIL_CELL_THEME);
		},
		sprites: [
			...getRoomMaze("_BLUE"),
			{
				src: ASSETS.LAB, col: 2, row: 3,
				hidden: game => game.situation.shotTank || game.rotation !== 0,
				index: 1,
				tip: "There's a scary looking creature in the tank, and it seems alive.",
				onShot: game => {
					game.situation.shotTank = game.now;
				},
				onClick: game => {
					game.showTip("I don't know how to open the tank, not that I'd want to.");
				},
				combineMessage: (item, game) => `The ${item} has no effect on the water tank.`,
			},
			{
				src: ASSETS.LAB, col: 2, row: 3,
				hidden: game => game.situation.shotTank || game.rotation !== 0,
				index: 2,
				tip: "Looks like some lab tubes on the shelf.",
			},
			{
				src: ASSETS.LAB, col: 2, row: 3,
				hidden: game => game.situation.shotTank || game.rotation !== 0,
				index: 3,
				tip: "I wonder what's in those flasks.",
			},
			{
				src: ASSETS.LAB, col: 2, row: 3,
				hidden: game => game.situation.shotTank || game.rotation !== 0,
				index: 4,
				tip: "Looks like a sign with lab instructions.",
			},
			{
				src: ASSETS.LAB, col: 2, row: 3,
				hidden: game => game.situation.shotTank || game.rotation !== 0,
				index: 0,
			},
			{
				src: ASSETS.LAB_MONSTER,
				hidden: game => game.situation.shotTank || game.rotation !== 0,
				offsetY: game => Math.sin(game.now / 500) * 1.5 - 2,				
			},
			{
				hidden: game => game.situation.shotTank || game.rotation !== 0,
				custom: (game, sprite, ctx) => {
					if (game.sceneData.bubbles) {
						ctx.strokeStyle = "#ccccff";
						ctx.lineWidth = ".2";
						const [rectX, rectY, rectW, rectH] = game.sceneData.rect;
						game.sceneData.bubbles.forEach(({x, y}) => {
							ctx.beginPath();
							ctx.arc(x*rectW+rectX, y*rectH+rectY, 1, 0, 2 * Math.PI);
							ctx.stroke();
						});
					}
				},
				onRefresh: game => {
					if (game.sceneData.bubbles) {
						game.sceneData.bubbles.forEach(bubble => {
							bubble.x += (Math.random()-.5) * game.sceneData.bubbleSpeed * 5;
							bubble.y -= game.sceneData.bubbleSpeed;
							if (bubble.x < 0 || bubble.x > 1 || bubble.y < 0) {
								bubble.x = Math.random();
								bubble.y = 1;
							}
						});
					}
				},
				onScene: game => {
					game.sceneData.rect = [25, 18, 18, 30];
					game.sceneData.bubbleSpeed = .005;
					game.sceneData.bubbles = new Array(10).fill(null).map(a => {
						return {
							x: Math.random(),
							y: Math.random(),
						};
					});
				},
			},
			{
				src: ASSETS.LAB_EXIT,
				hidden: game => game.rotation !== 4,
				onClick: game => {
					game.gotoScene("final-corridor", {door:"L"});
					game.data.yupa.rotation = (game.rotation + 4) % 8;
				},
			},
			{
				src: ASSETS.LAB_MONSTER_WAKE, col: 4, row: 4,
				hidden: game => !game.situation.shotTank || game.rotation !== 0,
				index: game => {
					const frame = Math.floor((game.now - game.situation.shotTank) / 100);
					if (frame < 9) {
						return frame;
					}
					if (frame < 80) {
						return 10 + Math.round(Math.sin(game.now / 100));
					}
					if (frame < 90) {
						return 12;
					}
					return 13;
				},
				combine: (item, game) => {
					game.useItem = null;
					return true;
				},
			},
			{
				src: ASSETS.LAB_MONSTER_BATTLE, col: 3, row: 3,
				offsetX: ({now, battle}) => {
					const hitTime = Math.max(1, now - battle.playerAttackLanded);
					return hitTime < 500 ? Math.round((Math.random() - .5) * Math.min(10, 200 / hitTime)) : 0;
				},
				offsetY: ({now, battle}) => {
					const hitTime = Math.max(1, now - battle.playerAttackLanded);
					return hitTime < 500 ? Math.round((Math.random() - 1) * Math.min(10, 200 / hitTime)) : 0;
				},
				index: ({now, battle, data}) => {
					if (!battle || data.gameOver) {
						return 0;
					}
					const hitTime = Math.max(1, now - battle.playerAttackLanded);
					if (hitTime < 400) {
						return 9;
					}
					if (battle.foeBlock && now - battle.foeBlock < 200) {
						return 8;
					}
					if (now > battle.nextAttack) {
						return 4 + Math.floor((now - battle.nextAttack)/100) % 4;
					}
					return Math.floor(now/200) % 4;
				},
				hidden: ({battle, now}) => {
					if (!battle || battle.foe !== "lab-monster") {
						return true;
					}
					return battle.foeDefeated && Math.min(16, 11 + Math.floor((now - battle.foeDefeated) / 60)) >= 17;
				},
				combine: (item, game) => {
					return true;
				},
			},			
			...standardBattle(),
			...standardMenu(),
			...standardBag(),
		],
		onSceneRefresh: game => {
			if (!game.situation.shotTank || game.getSituation("final-corridor").monsterLetOut) {
				return;
			}
			const frame = Math.floor((game.now - game.situation.shotTank) / 100);
			if (frame < 90 || game.sceneData.labMonsterBattle) {
				return;
			}

			if (game.rotation !== 0) {
				if (!game.sceneData.turning) {
					game.waitCursor = true;
					game.sceneData.turning = game.now;

					if (game.rotation === 4 || game.rotation === 6) {
						game.turnLeft(game.now, game => {
							if (game.rotation !== 0) {
								game.turnLeft(game.now, game => {
									game.waitCursor = false;
								});
							} else {
								game.waitCursor = false;
							}
						});
					} else if (game.rotation === 2) {
						game.turnRight(game.now, game => {
							game.waitCursor = false;
						});
					}
				}
				return;
			}
			const {data, now} = game;
			game.sceneData.labMonsterBattle = now;

			game.playTheme(SOUNDS.BATTLE_THEME, {volume:.8});
			if (!data.battle) {
				data.battle = {
					time: now,
					foe: "lab-monster",
					fist: LEFT,
					attackSpeed: 4000,
					playerHit: 0,
					playerBlock: 0,
					foeBlockChance: 1,
					playerLeftAttack: 0,
					playerRightAttack: 0,
					playerAttackLanded: 0,
					playerAttackPeriod: 50,
					foeLife: 100,
					invincible: true,
					foeMaxLife: 100,
					foeBlock: 0,
					foeDefense: 10,
					foeDefeated: 0,
					attackPeriod: 60,
					riposteChance: .2,
					foeDamage: 25,
					xp: 0,
					belowTheBelt: false,
					noBlock: true,
					battleCry: SOUNDS.EAT,
				};
			}
		},
		... makeOnSceneBattle(),
		events: {
			'E': {
				blocking: true,
				showBag: true,
				onEvent: game => {
				},
			},
			'O': {
				blocking: true,
				showBag: true,
				onEvent: game => {
				},
			},
		},
	},
);