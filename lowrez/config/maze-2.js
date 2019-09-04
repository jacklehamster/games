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
			{
				src: ASSETS.PUNCH, col: 4, row: 4,
				side: ({battle}) => !battle.playerRightAttack ? RIGHT : 0,
				offsetX: ({now, battle}) => Math.cos((now-Math.PI) / 100) + 1,
				offsetY: ({now, battle}) => Math.sin((now-Math.PI) / 100) + 1 + (battle.playerLeftAttack?10:0),
				index: ({battle, now}) => {
					if (!battle.playerRightAttack) {
						return 12;
					}
					const attackPeriod = battle.playerAttackPeriod;
					const frame = Math.min(3, Math.floor((now - battle.playerRightAttack) / attackPeriod));
					return !battle ? 0 : frame;
				},
				hidden: game => {
					const {battle, arrow, useItem, bagOpening} = game;
					return !battle || game.data.gameOver || battle.foeDefeated || (game.blocking() && !battle.playerLeftAttack && !battle.playerRightAttack && !battle.playerHit || useItem || bagOpening);
				},
			},
			{
				src: ASSETS.PUNCH, col: 4, row: 4,
				side: ({battle}) => !battle.playerLeftAttack ? LEFT : 0,
				offsetX: ({now, battle}) => Math.sin(now / 100) - 1,
				offsetY: ({now, battle}) => Math.cos(now / 100) + 1 + (battle.playerRightAttack?10:0),
				index: ({battle, now}) => {
					if (!battle.playerLeftAttack) {
						return 12;
					}
					const attackPeriod = battle.playerAttackPeriod;
					const frame = Math.min(3, Math.floor((now - battle.playerLeftAttack) / attackPeriod));
					return !battle ? 0 : 4 + frame;
				},
				hidden: game => {
					const {battle, arrow, useItem, bagOpening} = game;
					return !battle || game.data.gameOver || battle.foeDefeated || game.blocking() && !battle.playerLeftAttack && !battle.playerRightAttack && !battle.playerHit || useItem || bagOpening;
				},
			},
			{
				src: ASSETS.PUNCH, col: 4, row: 4,
				offsetY: ({battle, now}) => battle.playerBlock && now - battle.playerBlock < 50 ? 5 : 0,
				index: 13,
				hidden: game => {
					const {battle, arrow, useItem, bagOpening, hoverSprite} = game;
					if (!game.blocking() || hoverSprite && hoverSprite.bag || battle.foeDefeated || battle.playerHit || battle.playerLeftAttack || battle.playerRightAttack || useItem || bagOpening) {
						return true;
					}
					return false;
				},
			},
			{
				src: ASSETS.TREASURE_CHEST,
				hidden: ({chest, now}) => !chest || now < chest.found,
				onClick: (game, sprite) => {
					const {now, chest} = game;
					if (chest && !chest.opened) {
						chest.opened = now;
						game.playSound(SOUNDS.DRINK);
					}
				},
				index: ({now, chest}) => !chest.opened ? 0 : Math.min(3, Math.floor((now - chest.opened) / 100)),
				onRefresh: (game, sprite) => {
					const {now, chest} = game;
					if (chest.opened) {
						const frame = Math.floor((now - chest.opened) / 100);
						if (frame > 4 && !chest.checked) {
							chest.checked = now;
							const { item, image } = chest;
							game.pickUp({item, image, message:"", onPicked: game => {
								game.battle = null;
								game.chest = null;
								game.blocked = 0;
							}});
						}
					}
				},
			},
			{
				custom: (game, sprite, ctx) => {
					const { stats, battle } = game.data;
					ctx.fillStyle = "#333333";
					ctx.fillRect(4, 60, 56, 3);
					ctx.fillRect(4, 2, 56, 3);

					ctx.fillStyle = "#aa0022";
					ctx.fillRect(5, 61, 54, 1);

					ctx.fillStyle = "#770022";
					ctx.fillRect(5, 3, 54, 1);

					ctx.fillStyle = "#bbcc22";
					ctx.fillRect(5, 61, 54 * stats.life / stats.maxLife, 1);

					ctx.fillStyle = "#cc22bb";
					ctx.fillRect(5, 3, 54 * battle.foeLife / battle.foeMaxLife, 1);
				},
				hidden: ({battle, data}) => !battle || data.stats.life <= 0 || battle.foeDefeated,
			},
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
		onSceneBattle: (game, battle) => {
			const {now, arrow, data} = game;
			if (battle.foeDefeated) {
				return;
			}
			if (!battle.nextAttack) {
				battle.nextAttack = Math.random() * battle.attackSpeed + now;
			} else if (now >= battle.nextAttack) {
				const frame = 4 + Math.floor((now - battle.nextAttack) / battle.attackPeriod);
				if (frame === 7 && !battle.foeDidAttack) {
					const foeChargePercent = Math.min(1, (now - battle.foeCharge) / battle.foeChargeTime);
					battle.foeCharge = now - Math.max(0, (foeChargePercent - 1/4) * battle.foeChargeTime);

					if (game.blocking() && !battle.playerLeftAttack && !battle.playerRightAttack) {
						game.playSound(SOUNDS.DUD);
						battle.playerBlock = now;
					} else {
						game.playSound(SOUNDS.HIT);
						battle.playerHit = now;
						battle.playerLeftAttack = battle.playerRightAttack = 0;
						game.damagePlayer(battle.foeDamage);
					}
					battle.foeDidAttack = now;
				} else if (frame > 7) {
					battle.foeDidAttack = 0;
					battle.nextAttack = null;
				}
			}
			if (battle.playerBlock && now - battle.playerBlock > 200) {
				battle.playerBlock = 0;
			}
			if (battle.playerHit && now - battle.playerHit > 400) {
				battle.playerHit = 0;
			}

			const attackPeriod = (battle.foeBlock ? 1.5 : 1) * battle.playerAttackPeriod;
			const playerAttack = battle.playerLeftAttack || battle.playerRightAttack;
			if (playerAttack) {
				const frame = Math.floor((now - playerAttack) / attackPeriod);
				if (frame === 3 && !battle.playerAttackLanded && !battle.foeBlock) {
					if (now >= battle.nextAttack || Math.random()>=battle.foeDefense) {
						battle.nextAttack = null;
						game.playSound(SOUNDS.HIT);
						battle.playerAttackLanded = now;
						game.damageFoe(data.stats.damage);
					} else if (!battle.foeBlock) {
						game.playSound(SOUNDS.DUD);
						battle.foeBlock = now;
						if (Math.random() >= battle.riposteChance) {
							battle.nextAttack = Math.min(battle.nextAttack, now + 50);
						}
					}
				}
				if (frame > 4) {
					battle.playerRightAttack = 0;
					battle.playerLeftAttack = 0;
					battle.playerAttackLanded = 0;						
					battle.fist = battle.fist === LEFT ? RIGHT: LEFT;
				}
			}
			if (game.data.stats.life <= 0 && !game.data.gameOver) {
				game.gameOver();
				const fadeDuration = 3000;
				game.fadeOut(game.now, {duration:fadeDuration * 1.5, fadeDuration, color:"#FF0000", max: .7});
			}
		},
		onScenePunch: ({useItem}, battle) => {
			return !useItem;
		},
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