gameConfig.scenes.push(
	{
		name: "final-corridor",
		onScene: game => {
			if (!game.getSituation("lab").shotTank) {
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
			XXXXXXXXX
			XL.C..8EX
			XXXXXXXXX
		`,
		sprites: [
			{
				custom: (game, sprite, ctx) => ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height),
			},
			...getCommonMaze("_1"),
			{
				src: ASSETS.CEILING_HOLE_ONLY, col: 3, row: 3,
				hidden: game => {
					if (game.rotation % 2 !== 0) {
						return true;
					}
					if (game.facingEvent() && game.facingEvent().ceilinghole) {
						return false;
					}
					if (game.currentEvent() && game.currentEvent().ceilinghole) {
						return false;
					}
					if (game.behindEvent() && game.behindEvent().ceilinghole && game.frameIndex===3 && game.moving) {
						return false;
					}
					return true;
				},
				index: game => {
					if (game.facingEvent() && game.facingEvent().ceilinghole) {
						return 5 + (game.moving ? game.frameIndex : 0);
					}
					if (game.currentEvent() && game.currentEvent().ceilinghole) {
						return 1 + (game.moving ? game.frameIndex : 0);
					}
					if (game.behindEvent() && game.behindEvent().ceilinghole && game.frameIndex===3) {
						return 0;
					}
					return 0;
				},
				onClick: game => {
					game.sceneData.lookUp = game.now;
				},
			},
			{
				src: ASSETS.LAB_DOOR,
				hidden: game => {
					if (game.rotation % 2 !== 0) {
						return true;
					}
					if (game.facingEvent() && game.facingEvent().lab && !game.moving) {
						return false;
					}
					return true;
				},
				onClick: game => {
					if (game.situation.yupaOpenedDoor) {
						game.situation.labVisited = game.now;
						game.data.yupa.inBottle = 0;
						game.data.yupa.noMoreBottle = game.now;
						game.gotoScene("lab", {door: 'E'});
						return;
					}
					if (game.situation.yupaDropped) {
						game.waitCursor = true;
						game.showTip("Sweet, you're inside. Do you think you can open the door?", game => {
							game.playSound(SOUNDS.YUPA);
							game.showTip("Shure, lemme see.", () => {
								game.situation.yupaOpenedDoor = game.now + 1500;
								game.delayAction(game => {
									game.playSound(SOUNDS.DIVING);
								}, 1800);
								game.delayAction(game => {
									game.playSound(SOUNDS.YUPA);
									game.waitCursor = false;
									game.showTip("That waz easy.", null, null, { x: 1, y: 20, speed: 80, talker:"yupa", removeLock: true });
								}, 2500);
							}, null, { x: 1, y: 20, speed: 80, talker:"yupa" });
						});						
						return;
					}
					if (!game.sceneData.seenLab) {
						game.sceneData.seenLab = true;
						game.showTip(["I can see through the glass door. It looks like some kind of lab.", "The entrance is locked."]);
					} else {
						game.showTip("The entrance is locked.", null, null, {removeLock:true});
					}
				},
				combineMessage: (item, game) => {
					if (game.situation.yupaDropped) {
						return null;
					}
					return `I can't use ${item} on the door.`;
				},
			},
			{
				src: ASSETS.LAB_ENTRANCE, col: 3, row: 3,
				hidden: game => {
					if (game.rotation % 2 !== 0) {
						return true;
					}
					if (game.facingEvent() && game.facingEvent().lab) {
						return false;
					}
					if (game.furtherEvent() && game.furtherEvent().lab) {
						return false;
					}
					return true;
				},
				index: game => {
					if (game.facingEvent() && game.facingEvent().lab) {
						return game.moving ? game.frameIndex : 0;
					}
					if (game.furtherEvent() && game.furtherEvent().lab) {
						return 4 + (game.moving ? game.frameIndex : 0);
					}
					return 0;
				},
			},
			{
				src: ASSETS.YUPA_IN_LAB, col: 5, row: 6,
				hidden: game => {
					if (game.rotation % 2 !== 0) {
						return true;
					}
					if (game.facingEvent() && game.facingEvent().lab && !game.moving) {
						return !game.situation.yupaDropped;
					}
					return true;
				},
				index: game => {
					if (game.situation.labVisited) {
						return game.getSituation("lab").shotTank ? 25 : 24;
					}
					if (game.situation.yupaOpenedDoor) {
						const frame = 12 + Math.floor((game.now - game.situation.yupaOpenedDoor) / 100);
						if (game.pendingTip && game.pendingTip.talker === "yupa") {
							return 18 + frame % 5;
						}
						if (frame <= 20) {
							return Math.max(13, frame);
						}

						return 20 + (frame % 40 === 0 ? -1 : 0);
					}
					const frame = Math.floor((game.now - game.situation.yupaDropped) / 100);
					if (game.pendingTip && game.pendingTip.talker === "yupa") {
						return 8 + frame % 5;
					}
					return frame < 0 ? (frame % 10 === 0 ? 1 : 0) : frame <= 8 ? frame : frame % 40 === 0 ? 9 : 8;
				},
			},
			{
				src: ASSETS.ELECTRO_DIAL, col: 2, row: 3,
				index: game => {
					if (game.sceneData.lastError && game.now - game.sceneData.lastError < 500) {
						return 4;
					}
					if (!game.sceneData.zoomDial) {
						return Math.floor(game.now / 500) % 2;
					} else {
						return 2 + Math.floor(game.now / 500) % 2;
					}
					return 0;
				},
				hidden: game => {
					if (game.rotation % 2 !== 0) {
						return true;
					}
					if (game.facingEvent() && game.facingEvent().lab && !game.moving) {
						return false;
					}
					return true;
				},
				onClick: game => {
					if (!game.sceneData.zoomDial) {
						game.sceneData.zoomDial = game.now;
						game.pendingTip = null;
					} else {
						const padDim = {x0: 12, y0: 6, x1: 50, y1:53};
						const { x, y } = game.mouse;
						if (padDim.x0 <= x && x <= padDim.x1 && padDim.y0 <= y && y <= padDim.y1) {
							if (game.mouse && game.mouseDown) {
								const { x, y } = game.mouse;
								for (let i = 0; i < 9; i++) {
									const xx = 17 + 12 * (i % 3);
									const yy = 10 + 11 * Math.floor(i / 3);
									if (xx <= x && x <= xx+5 && yy <= y && y <= yy+6) {
										game.sceneData.beepCount = (game.sceneData.beepCount || 0) + 1;

										if (game.sceneData.beepCount % 5 === 0) {
											game.playSound(SOUNDS.BOP);
											game.delayAction(game => game.playSound(SOUNDS.BOP), 150);
											game.sceneData.lastError = game.now;
										} else {
											game.playSound(SOUNDS.BEEP);
										}										
										break;
									}
								}
							}
						} else {
							game.sceneData.zoomDial = 0;
							game.pendingTip = null;
						}
					}
				}
			},
			{
				src: ASSETS.BOTTLE_SLOT, col: 3, row: 3,
				index: game => {
					if (!game.sceneData.zoomSlot) {
						return 0;
					} else {
						if (game.sceneData.justDropped) {
							if (game.now - game.sceneData.justDropped.time < 500) {
								if (game.sceneData.justDropped.item === "empty bottle") {
									return 2;
								} else if (game.sceneData.justDropped.item === "water bottle") {
									return 3;
								} else {
									return 4;
								}
							}
						}
						return 1;
					}
				},
				hidden: game => {
					if (game.sceneData.zoomDial) {
						return true;
					}
					if (game.rotation % 2 !== 0) {
						return true;
					}
					if (game.facingEvent() && game.facingEvent().lab && !game.moving) {
						return false;
					}
					return true;
				},
				onClick: game => {
					if (!game.sceneData.zoomSlot) {
						game.sceneData.zoomSlot = game.now;
					} else {
						game.sceneData.zoomSlot = 0;
					}
					game.pendingTip = null;
				},
				combine: (item, game) => {
					if (!game.sceneData.zoomSlot) {
						game.sceneData.zoomSlot = game.now;
						game.pendingTip = null;
						return true;
					}
				},
			},
			{
				src: ASSETS.BOTTLE_SLOT, col: 3, row: 3,
				index: 5,
				hidden: game => !game.sceneData.zoomSlot,
				onClick: game => {
					if (!game.sceneData.readText) {
						game.sceneData.readText = game.now;
						game.showTip([
							"It's some kind of alien dialect",
							"I can't read.",
						]);
					} else {
						game.showTip([
							"I can't read.",
						], null, null, {removeLock: true});
					}
				},
			},
			{
				src: ASSETS.BOTTLE_SLOT, col: 3, row: 3,
				index: 6,
				hidden: game => {
					if (!game.sceneData.zoomSlot) {
						return true;
					}
					if (game.sceneData.justDropped) {
						if (game.now - game.sceneData.justDropped.time < 500) {
							return true;
						}
					}
					return false;
				},
				onClick: game => {
					if (!game.sceneData.checkSlot) {
						game.sceneData.checkSlot = game.now;
						game.showTip([
							"It's a round slot.",
							"I think it must be used to drop samples into the lab.",
						]);
					} else {
						game.showTip([
							"I think it's for dropping samples into the lab.",
						], null, null, {removeLock: true});
					}
				},
				combine: (item, game) => {
					switch(item) {
						case "water bottle":
						case "empty bottle":
						case "yupa bottle":
							game.removeFromInventory(item);
							game.sceneData.justDropped = {
								item, time: game.now,
							};
							game.playSound(SOUNDS.EAT);
							game.useItem = null;
							if (item !== "yupa bottle") {
								game.delayAction(game => {
									game.showTip(`Not sure what that accomplished, beside losing a bottle.`, null, null, {removeLock: true});
								}, 1000);
							} else {
								game.waitCursor = true;
								game.situation.yupaDropped = game.now + 3000;
								game.delayAction(game => {
									game.sceneData.zoomSlot = 0;
								}, 1000);
								game.delayAction(game => {
									game.playSound(SOUNDS.DRINK);
								}, 3200);
								game.delayAction(game => {
									game.waitCursor = false;
								}, 4000);
							}
							return true;
							break;
					}
				},
				combineMessage: (item, game) => {
					return `I don't want to drop my ${item} into the slot.`;
				},
			},
			{
				custom: (game, sprite, ctx) => {
					const ALIEN_DIGIT_0 = 1000;
					if (game.mouse && game.mouseDown) {
						const { x, y } = game.mouse;
						ctx.fillStyle = "#555599";
						for (let i = 0; i < 9; i++) {
							const xx = 17 + 12 * (i % 3);
							const yy = 10 + 11 * Math.floor(i / 3);
							if (xx <= x && x <= xx+5 && yy <= y && y <= yy+6) {
								ctx.fillRect(xx, yy, 5, 6);
							}
						}
					}					
					game.displayTextLine(ctx, {
						msg: ALPHAS[ALIEN_DIGIT_0 + 0].char,
						x:18, y:11,
					});
					game.displayTextLine(ctx, {
						msg: ALPHAS[ALIEN_DIGIT_0 + 1].char,
						x:31, y:11,
					});
					game.displayTextLine(ctx, {
						msg: ALPHAS[ALIEN_DIGIT_0 + 2].char,
						x:42, y:11,
					});
					game.displayTextLine(ctx, {
						msg: ALPHAS[ALIEN_DIGIT_0 + 3].char,
						x:18, y:22,
					});
					game.displayTextLine(ctx, {
						msg: ALPHAS[ALIEN_DIGIT_0 + 4].char,
						x:30, y:22,
					});
					game.displayTextLine(ctx, {
						msg: ALPHAS[ALIEN_DIGIT_0 + 5].char,
						x:42, y:22,
					});
					game.displayTextLine(ctx, {
						msg: ALPHAS[ALIEN_DIGIT_0 + 6].char,
						x:18, y:33,
					});
					game.displayTextLine(ctx, {
						msg: ALPHAS[ALIEN_DIGIT_0 + 7].char,
						x:30, y:33,
					});
					game.displayTextLine(ctx, {
						msg: ALPHAS[ALIEN_DIGIT_0 + 8].char,
						x:42, y:33,
					});
				},
				hidden: game => !game.sceneData.zoomDial,
			},
			{
				src: ASSETS.CEILING_ROPE_MOVE, col: 3, row: 3,
				hidden: game => {
					if (game.rotation % 2 !== 0) {
						return !game.currentEvent() || !game.currentEvent().ceilinghole;
					}
					if (game.facingEvent() && game.facingEvent().ceilinghole) {
						return false;
					}
					if (game.currentEvent() && game.currentEvent().ceilinghole) {
						return false;
					}
					if (game.behindEvent() && game.behindEvent().ceilinghole && game.frameIndex===3 && game.moving) {
						return false;
					}
					return true;
				},
				index: game => {
					if (game.facingEvent() && game.facingEvent().ceilinghole) {
						return 5 + (game.moving ? game.frameIndex : 0);
					}
					if (game.currentEvent() && game.currentEvent().ceilinghole) {
						return 1 + (game.moving ? game.frameIndex : 0);
					}
					if (game.behindEvent() && game.behindEvent().ceilinghole && game.frameIndex===3) {
						return 0;
					}
					return 0;
				},
			},
			{
				src: ASSETS.EXIT_OUT_CARNAGE, col: 3, row: 3,
				index: game => {
					return 0;
				},
				hidden: game => {
					if (!game.situation.monsterLetOut) {
						return true;
					}
					if (game.rotation % 2 !== 0) {
						return true;
					}
					if (!game.situation.gateOpened || game.situation.gateClosed) {
						return true;
					}
					if (game.facingEvent() && game.facingEvent().exit) {
						return game.moving;
					}
					return true;
				},
				onClick: game => {
					game.waitCursor = true;
					game.fadeToScene("outside-carnage", null, 2000);					
				},
			},
			{
				src: ASSETS.EXIT_OUT_CARNAGE, col: 3, row: 3,
				index: game => {
					if (game.facingEvent() && game.facingEvent().exit) {
						return (game.moving ? game.frameIndex : 0);
					}
					if (game.furtherEvent() && game.furtherEvent().exit) {
						return (game.moving ? game.frameIndex : 0) + 4;
					}
					return 0;
				},
				hidden: game => {
					if (!game.situation.monsterLetOut) {
						return true;
					}
					if (game.rotation % 2 !== 0) {
						return true;
					}
					if (game.facingEvent() && game.facingEvent().exit) {
						return false;
					}
					if (game.furtherEvent() && game.furtherEvent().exit) {
						return false;
					}
					return true;
				}
			},			
			{
				src: ASSETS.EXIT_OUT, col: 3, row: 3,
				index: game => {
					return 0;
				},
				hidden: game => {
					if (game.situation.monsterLetOut) {
						return true;
					}
					if (game.rotation % 2 !== 0) {
						return true;
					}
					if (!game.situation.gateOpened || game.situation.gateClosed) {
						return true;
					}
					if (game.facingEvent() && game.facingEvent().exit) {
						return game.moving;
					}
					return true;
				},
				tip: game => {
					return "There are several guards outside! Thankfully, they didn't notice me.";
				},
				onClick: game => {
					if (!game.battle) {
						game.fadeToScene("outside", null, 2000);
					}
				},
			},
			{
				src: ASSETS.EXIT_OUT, col: 3, row: 3,
				index: game => {
					if (game.facingEvent() && game.facingEvent().exit) {
						return (game.moving ? game.frameIndex : 0);
					}
					if (game.furtherEvent() && game.furtherEvent().exit) {
						return (game.moving ? game.frameIndex : 0) + 4;
					}
					return 0;
				},
				hidden: game => {
					if (game.situation.monsterLetOut) {
						return true;
					}
					if (game.rotation % 2 !== 0) {
						return true;
					}
					if (game.facingEvent() && game.facingEvent().exit) {
						return false;
					}
					if (game.furtherEvent() && game.furtherEvent().exit) {
						return false;
					}
					return true;
				}
			},
			{
				src: ASSETS.EXIT_GATE, col: 3, row: 3,
				index: game => {
					if (game.facingEvent() && game.facingEvent().exit) {
						return (game.moving ? game.frameIndex : 0);
					}
					return 0;
				},
				hidden: game => {
					if (game.rotation % 2 !== 0) {
						return true;
					}
					if (game.situation.gateOpened) {
						if (!game.situation.gateClosed || game.now - game.situation.gateClosed < 1000 || game.moving) {
							return true;
						}
					}
					if (game.facingEvent() && game.facingEvent().exit) {
						return false;
					}
					return true;
				},
			},
			{
				src: ASSETS.GATE_OPEN, col: 3, row: 3,
				index: game => {
					if (game.situation.gateClosed) {
						const frame = Math.floor((game.now - game.situation.gateClosed) / 100);
						return 8 - Math.min(frame, 8);						
					}
					const frame = Math.floor((game.now - game.situation.gateOpened) / 100);
					return Math.min(frame, 8);
				},
				hidden: game => {
					if (game.rotation % 2 !== 0 || game.moving) {
						return true;
					}
					if (!game.situation.gateOpened) {
						return true;
					}
					if (game.facingEvent() && game.facingEvent().exit) {
						return false;
					}
					return true;
				}
			},			
			{
				name: "scanner",
				src: ASSETS.SCAN_CARD, col: 1, row: 2,
				index: game => game.situation.gateOpened ? 1 : 0,
				offsetX: -1,
				combine: (item, game) => {
					if (item === "access card") {
						game.useItem = null;
						game.playSound(SOUNDS.DRINK);
						if (!game.situation.gateOpened || game.situation.gateClosed) {
							game.situation.gateClosed = 0;
							game.situation.gateOpened = game.now;
						} else {
							game.situation.gateClosed = game.now;
						}
						game.dialog = null;
						return true;
					}
				},
				hidden: game => !game.facingEvent() || !game.facingEvent().exit || game.rotation % 2 !== 0 || game.moving,
				onClick: game => {
					game.showTip("Looks like some kind of card reader.", null, null, {removeLock: true});
				},
			},			
			makeYupa(),
			{
				src: ASSETS.HOLE_IN_CEILING_BACK,
				hidden: game => !game.sceneData.lookUp,
				onClick: game => {
					game.sceneData.lookUp = 0;
				},
			},
			{
				src: ASSETS.HOLE_IN_CEILING_HOLE,
				hidden: game => !game.sceneData.lookUp,
				onClick: game => {
					game.fadeToScene("ceiling-maze", {door:'H'}, 1000, game => {
						game.rotation = (game.rotation + 4) % 8;
					});
				},
			},
			{
				src: ASSETS.HOLE_IN_CEILING_ROPE,
				hidden: game => !game.sceneData.lookUp,
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
			makeFoe('guard', ASSETS.GUARD_2),
			...standardBattle(),
			...standardMenu(),
			...standardBag(),
		],
		... makeOnSceneBattle(),
		onSceneRefresh: game => {
			if (!game.getSituation("lab").shotTank || game.waitCursor) {
				return;
			}
			const frame = Math.floor((game.now - game.sceneTime) / 100);
			if (game.situation.monsterLetOut || frame < 130 && game.situation.monsterSide !== "right-left" || game.sceneData.labMonsterBattle) {
				return;
			}

			if (game.rotation !== 2 && game.situation.monsterSide !== "right-left") {
				if (!game.sceneData.turning) {
					game.waitCursor = true;
					game.sceneData.turning = game.now;
					game.sceneData.lookUp = 0;

					if (game.rotation === 4 || game.rotation === 6) {
						game.turnLeft(game.now, game => {
							if (game.rotation !== 2) {
								game.turnLeft(game.now, game => {
									game.waitCursor = false;
								});
							} else {
								game.waitCursor = false;
							}
						});
					} else if (game.rotation === 0) {
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
		doors: {
		},
		events: {
			'E': {
				exit: true,
				blocking: true,
				wall: true,
				showBag: true,
				onEvent: (game, events) => {
				},
			},
			'L': {
				lab: true,
				hideYupa: true,
				blocking: true,
				showBag: true,
				onEvent: (game, event) => {
					const { yupa } = game.data;
					yupa.rotation = (game.rotation + 4) % 8;
				},
			},
			'C': {
				ceilinghole: true,
				noMenu: true,
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
				onEvent: (game, {foe, foeLife, foeBlockChance, foeDefense, attackSpeed, riposteChance, attackPeriod, foeDamage, onWin, xp, belowTheBelt}) => {
					if (game.getSituation("lab").shotTank) {
						return;
					}
					const {data, now} = game;
					game.chest = null;
					const theme = data.theme.song;
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
							theme,
						};
					}
					return true;
				},
				onWin: game => game.findChest(game.now + 2000, {
					item:"bullet", image:ASSETS.GRAB_GUN, message: "I found one bullet for my gun.",
				}),
			},		
		},
	},
);
