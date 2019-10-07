gameConfig.scenes.push(
	{
		name: "ceiling-maze",
		onScene: game => {
			if (!game.getSituation('lab').shotTank) {
				game.save();
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
			X5......HXX
			XXXXXXXXXXX
		`,
		onSceneHoldItem: (game, item) => {
			if (game.battle) {
				if (item === "gun") {
					game.battle.ball = game.now;
					game.battle.preventAttack = true;
					game.battle.belowTheBelt = true;
					game.battle.fatalKick = true;
					game.playSound(SOUNDS.FEMBOT);
				} else {
					game.battle.restoreBot = game.now + 1000;
				}
			}
		},		
		sprites: [
			...getCommonMaze("_RED_1"),
			{
				src: ASSETS.HOLE_BOTTOM,
				hidden: game => !game.situation.viewingHole,
				onClick: game => {
					game.pendingTip = null;
					game.startDialog({
						time: game.now,
						index: 0,
						conversation: [
							{
								options: [
									{ 
									},
									{ msg: game => game.situation.roppedLadder ? "Go down" : "Jump down", onSelect: game => {
										if (game.situation.roppedLadder) {
											game.fadeToScene("final-corridor", {door:"L"}, 500);
										} else {
											game.fadeToScene("deadly-landing", {door:5}, 500);
										}
									}},
									{ msg: "CANCEL", onSelect: game => {
										game.dialog = null;
									}},
								],
							},
						],
					});
				},
			},
			{
				src: ASSETS.LADDER,
				hidden: game => game.situation.viewingHole || !game.facingEvent() || !game.facingEvent().hole || game.rotation % 2 !== 0 || game.moving,
				tip: game => game.battle ? null : game.situation.roppedLadder ? "This should hold." : "The ladder is broken.",
				combine: (item, game) => {
					if (game.battle) {
						return;
					}
					if (item === "rope") {
						game.situation.roppedLadder = game.now;
						game.showTip("This should hold", null, null, {removeLock:true});
						game.removeFromInventory(item);
						return true;
					}
				},
			},
			{
				src: ASSETS.HOLE,
				index: game => game.situation.roppedLadder ? 1 : 0,
				hidden: game => game.situation.viewingHole || !game.facingEvent() || !game.facingEvent().hole || game.rotation % 2 !== 0 || game.moving,
				onClick: game => {
					if (game.battle) {
						return;
					}
					if (!game.getSituation("lab").shotTank) {
						game.showTip("It looks deep.", null, null, {removeLock:true});						
					}
					game.situation.viewingHole = game.now;
					if (!game.getSituation("final-corridor").monsterLetOut) {
						game.getSituation("final-corridor").monsterSide = null;
					}
					game.save();
				},
				combineMessage: (item, game) => {
					return `I don't want to throw the ${item} in that hole!`;
				},
			},
			{
				onRefresh: game => {
					if (game.battle.restoreBot) {
						const frame = Math.min(3, Math.floor((game.now - game.battle.restoreBot)/100));
						if (frame >= 3) {
							game.battle.restoreBot = 0;
							game.battle.ball = 0;
							game.battle.preventAttack = false;
							game.battle.belowTheBelt = false;
							game.battle.fatalKick = false;
							game.playSound(SOUNDS.FEMBOT);
						}
					}
					if (game.battle.foeDefeated) {
						if (Math.min(16, 11 + Math.floor((game.now - game.battle.foeDefeated) / 60)) >= 16) {
							game.battle = null;
							game.delayAction(game => {
								game.playSound(SOUNDS.GUN_SHOT, {volume: .4});
								game.playSound(SOUNDS.FEMBOT, {volume: .2});
							}, 500);
							game.showTip("Goal!!", null, null, {removeLock:true});
						}
					}
				},
				src: ASSETS.FEMBOT, col: 4, row: 4,
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
					if (battle.foeDefeated) {
						return Math.min(16, 11 + Math.floor((now - battle.foeDefeated) / 60));
					}

					if (game.battle.restoreBot) {
						const frame = Math.max(0, Math.min(3, Math.floor((game.now - game.battle.restoreBot)/100)));
						return frame>=3 ? 0 : 9 + 2 - frame;
					}
					if (game.battle.ball) {
						const frame = Math.min(2, Math.floor((game.now - game.battle.ball)/100));
						return 9 + frame;
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
					if (!battle || battle.foe !== "fembot") {
						return true;
					}
					return battle.foeDefeated && Math.min(16, 11 + Math.floor((now - battle.foeDefeated) / 60)) >= 17;
				},
				onShot: (game, sprite) => {
					const {battle, data} = game;
					game.delayAction(game => {
						game.playSound(SOUNDS.DUD);
					}, 200);
				},
				combine: (item, game) => {
					game.battle.nextAttack =  Math.min(game.now + 3000, game.battle.nextAttack);
					if (item === "gun") {
						game.showTip("I'm out of ammo.", null, 50, {removeLock: true});
					} else if (item === "photo") {
						game.showTip("Have you seen this baby?", null, 50, {removeLock: true});
					} else {
						game.showTip(`Would you like this ${item}?`, null, 50, {removeLock: true});
					}
					return true;
				},
			},
			makeYupa(),
			{
				src: ASSETS.THE_HOLE,
				hidden: game => !game.situation.viewingHole,
				onClick: game => {
					if(game.situation.viewingHole) {
						game.situation.viewingHole = 0;
						game.pendingTip = null;
						game.save();
					}
				},
			},
			{
				hidden: game => !game.situation.viewingHole || !game.getSituation("lab").shotTank,
				index: game => {
					const frame = Math.floor((game.now - game.getSituation("final-corridor").monsterHole) / 100);
					if (frame > 5 || frame < 0) {
						return 10;
					}
					return (game.getSituation("final-corridor").monsterSide === 'left-right' ? 0 : 5) + Math.max(frame, 0);
				},
				src: ASSETS.LAB_MONSTER_THROUGH_HOLE, col: 3, row: 4,
				onRefresh: game => {
					if (game.getSituation("final-corridor").monsterLetOut) {
						return;
					}
					let justSwitchedSide = false;
					if (!game.getSituation("final-corridor").monsterSide) {
						game.getSituation("final-corridor").monsterSide = "left-right";
						game.getSituation("final-corridor").monsterHole = game.now + 1000;
						justSwitchedSide = true;
					} else {
						const frame = Math.floor((game.now - game.getSituation("final-corridor").monsterHole) / 100);
						if (frame > 10) {
							game.getSituation("final-corridor").monsterHole = game.now + (game.getSituation("final-corridor").monsterSide === "left-right" ? 4000 : 10000);
							game.getSituation("final-corridor").monsterSide =
								game.getSituation("final-corridor").monsterSide === "left-right" 
								? "right-left" : "left-right";
							justSwitchedSide = true;
						}
					}
					if (game.getSituation("final-corridor").gateOpened && !game.getSituation("final-corridor").gateClosed) {
						if (game.getSituation("final-corridor").monsterSide === "left-right" && justSwitchedSide) {
							game.getSituation("final-corridor").monsterLetOut = game.now;
						}
					}					
				},
			},
			{
				src: ASSETS.HOLE,
				index: game => 2,// + (game.situation.roppedLadder ? 1 : 0),
				hidden: game => !game.situation.viewingHole || !game.facingEvent() || !game.facingEvent().hole || game.rotation % 2 !== 0 || game.moving,
			},
			{
				src: ASSETS.ROPE_CEILING,
				offsetX: game => {
					if (game.sceneData.shakeRopeTime) {
						const time = game.now - game.sceneData.shakeRopeTime;
						if (time > 0) {
							return 1.5 * Math.sin(time / 300) * (Math.max(0, 6000 - time) / 6000) * (game.sceneData.shakeRopeDirection === "left-right" ? 1 : -1);
						}
					}
					return 0;
				},
				hidden: game => !game.situation.viewingHole || !game.situation.roppedLadder || !game.facingEvent() || !game.facingEvent().hole || game.rotation % 2 !== 0 || game.moving,
				onRefresh: game => {
					if (game.getSituation("final-corridor").monsterHole) {
						const time = game.now - game.getSituation("final-corridor").monsterHole;
						if (time > 0) {
							game.sceneData.shakeRopeDirection = game.getSituation("final-corridor").monsterSide;
							game.sceneData.shakeRopeTime = game.getSituation("final-corridor").monsterHole;
						}
					}
				},
			},
			...standardBattle(),
			...standardMenu(),
			...standardBag(),
		],
		... makeOnSceneBattle(),
		doors: {
			5: {
				wayDown: true,
				scene: "cell-maze", door: 5,
				exit: (game, {scene, door}) =>  game.fadeToScene(scene, {door}, 1000),
			},
		},
		events: {
			'H': {
				blocking: true,
				hole: true,
				showBag: true,
				foe: "fembot",
				foeLife: 100,
				foeBlockChance: 1,
				attackSpeed: 4000,
				riposteChance: .2,
				attackPeriod: 100,
				foeDamage: 5,
				foeDefense: 10,
				xp: 0,
				invincible: true,
				belowTheBelt: false,
				blocking: true,
				battleCry: SOUNDS.FEMBOT,
				onEvent: (game, {foe, foeLife, foeBlockChance, foeDefense, attackSpeed, riposteChance, attackPeriod, foeDamage, onWin, xp, belowTheBelt, invincible, battleCry}) => {
					const {data, now} = game;
					const { yupa } = game.data;
					yupa.rotation = (game.rotation + 4) % 8;
					
					if (game.situation.defeatedBot) {
						return;
					}
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
							invincible,
							battleCry,
						};
					}
					return true;
				},
				onWin: game => {
					game.situation.defeatedBot = game.now;
				},
			},
		},
	},
);