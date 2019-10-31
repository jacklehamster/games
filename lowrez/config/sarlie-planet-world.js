gameConfig.scenes.push(
	{
		name: "sarlie-planet-world",
		arrowGrid: [
			[ null, null, MENU,  null, null ],
			[],
			[],
			[],
			[ null, null, BAG, null, null ],
		],
		onSceneHoldItem: (game, item) => {
			game.save();
			if (item === "gun") {
				game.useItem = null;
				game.showTip(["This place is so peaceful", "Let's not stir any trouble here."], null, 80, { removeLock: true });
			}
		},		
		onScene: game => {
			game.playTheme(SOUNDS.FUTURE_SONG_THEME, {volume: .8});
			if (!game.situation.hitman) {
				game.situation.hitman = {
					pos: { x: 0, y: 42, },
					goal: { x: 0, y: 42, sprite: null },
					visible: true,
					speed: 1/6,
					direction: 4,
					anim: [
						[12,13,14,15],	//	N
						[16,17,18,19],	//	NW
						[24,25,26,27],	//	W
						[4,5,6,7],		//	SW
						[0,1,2,3],		//	S
						[8,9,10,11],	//	SE
						[28,29,30,31],	//	E
						[20,21,22,23],	//	NE
					],
				};
			} else {
				game.situation.hitman.goal.y = 42;
			}

			if (!game.situation.yupa) {
				game.situation.yupa = {
					pos: { x: 0, y: 42, },
					goal: { x: 0, y: 42, },
					visible: false,
					speed: 1/6,
					dist: 20,
					moving: false,
				};
			}
			if (!game.situation.shift) {
				game.situation.shift = 0;
			}
			game.sceneData.zoom = .7;
			if (game.sceneData.fromDoctor) {
				game.situation.hitman.pos.x = 120;
				game.situation.hitman.goal.x = 120;
				game.situation.yupa.pos.x = 125;
				game.situation.yupa.goal.x = 125;
			}
			game.situation.hitman.visible = true;
		},
		onSceneRefresh: game => {
			const { pos, goal, speed } = game.situation.hitman;
			const dx = pos.x > goal.x ? -1 : pos.x < goal.x ? 1 : 0;
			const dy = pos.y > goal.y ? -1 : pos.y < goal.y ? 1 : 0;

			if (Math.abs(pos.x-goal.x) - Math.abs(pos.y-goal.y) > 1) {
				pos.x += dx * Math.min(Math.abs(pos.x - goal.x), speed);
			} else if (Math.abs(pos.y-goal.y) - Math.abs(pos.x-goal.x) > 1) {
				pos.y += dy * Math.min(Math.abs(pos.y - goal.y), speed);
			} else if (Math.abs(pos.x-goal.x) >= 1 || Math.abs(pos.y-goal.y) >= 1) {
				const dist = Math.sqrt(dx*dx + dy*dy);
				pos.x += dx * Math.min(Math.abs(pos.x - goal.x), speed / dist);
				pos.y += dy * Math.min(Math.abs(pos.y - goal.y), speed / dist);
			} else {
				pos.x = goal.x;
				pos.y = goal.y;
				if (goal.sprite && goal.sprite.onReach) {
					goal.sprite.onReach(game, goal.sprite);
				}
				goal.sprite = null;
			}
			const { yupa, hitman } = game.situation;
			if (hitman && yupa) {
				const dx = hitman.pos.x - yupa.pos.x;
				const dy = hitman.pos.y - yupa.pos.y;
				const dist = Math.sqrt(dx*dx + dy*dy);
				if (dist > yupa.dist) {
					yupa.pos.x += dx / dist * yupa.speed;
					yupa.pos.y = 42,
					// yupa.pos.y += dy / dist * yupa.speed;
					yupa.moving = true;
				} else {
					yupa.moving = false;
				}
				const shiftDiff = Math.round(hitman.pos.x + game.situation.shift);
				game.situation.shift = Math.min(0, Math.max(-64, game.situation.shift + (-hitman.pos.x+32 - game.situation.shift) / 50));
			}
		},
		arrowGrid: [
			[ null, null, MENU,  null, null ],
			[],
			[],
			[],
			[ null, null, BAG, null, null ],
		],
		sprites: [
			{
				src: ASSETS.SARLIE_PLANET_BG,
				noHighlight: game => game.mouse.y < 55,
				onClick: game => {
					const { pos, goal } = game.situation.hitman;
					game.situation.hitman.visible = true;
					game.situation.hitman.speed = 1/4;
					if (game.mouseDown) {
						goal.x = Math.round(game.mouse.x) - Math.round(game.situation.shift);
						goal.y = 42;
						goal.sprite = null;
					}
				},
				scale: game => game.sceneData.zoom / .7,
			},
			{
				src: ASSETS.SARLIE_SHOP, size: [128, 64],
				offsetX: game => Math.round(game.situation.shift),
				onClick: (game, sprite) => {
					const { pos, goal } = game.situation.hitman;
					goal.x = 26;
					goal.y = 37;
					goal.sprite = sprite;
				},
				scale: game => game.sceneData.zoom / .7,
				onReach: game => {
					if (game.data.seen.doctor) {
						game.situation.hitman.visible = false;
						game.fadeToScene("shop", {door:1});
					} else {
						game.showTip(["The door is locked.", "There's a sign but I can't read it."], null, null, {removeLock: true});
					}
				},
			},
			{
				src: ASSETS.SARLIE_HOSPITAL, size: [128, 64],
				offsetX: game => Math.round(game.situation.shift),
				onClick: (game, sprite) => {
					const { pos, goal } = game.situation.hitman;
					goal.x = 135;
					goal.y = 42;
					goal.sprite = sprite;
					game.situation.yupa.goal.x = 135;
				},
				scale: game => game.sceneData.zoom / .7,
				onReach: game => {
					if (game.data.seen.doctor) {
						game.fadeToScene("doctar-room", null, 1000);
					} else {
						game.fadeToScene("doctar", null, 3000);
					}
				},
			},
			{
				src: ASSETS.SARLIE_PLANET_WORLD, size: [128, 64],
				offsetX: game => Math.round(game.situation.shift),
				scale: game => game.sceneData.zoom / .7,
			},
			{
				src: ASSETS.SHOP_DOOR, size: [128, 64],
				offsetX: game => Math.round(game.situation.shift),
				scale: game => game.sceneData.zoom / .7,
				hidden: game => game.data.seen.doctor,
			},
			{
				src: ASSETS.PEDRO,
				hidden: game => !game.data.seen.doctor,
				offsetX: game => Math.round(game.situation.shift + 50),
				scale: game => game.sceneData.zoom,
				onClick: (game, sprite) => {
					const { pos, goal } = game.situation.hitman;
					goal.x = 65;
					goal.y = 40;
					goal.sprite = sprite;
				},
				combine: (item, game) => {
					game.useItem = null;
					const { pos, goal } = game.situation.hitman;
					goal.x = 65;
					goal.y = 40;
					goal.sprite = sprite;
				},
				onReach: (game, sprite) => {
					game.sceneData.zoomOnPedro = game.now;
					const pedroSpeed = 40;

					game.delayAction(game => {
						game.startDialog({
							time: game.now,
							index: 0,
							conversation: [
								{
									options: [
										{
											hidden: game => game.situation.gaveTicket,
											msg: game => "Hello",
											onSelect: (game, dialog) => {
												game.showTip([
													"Halo ma friend",
													"You like party?",
													"I got party for u",
													"Come to Party!",
													"Free ride for first timers!"
												], game => {
													dialog.index = 1;
												}, pedroSpeed, { talker:"pedro" });
											},
										},
										{
											hidden: game => !game.situation.gaveTicket,
											msg: game => "Go to the party!",
											onSelect: (game, dialog) => {
												game.showTip([
													"Alright ma friend",
													"Ya we can go to the party.",
													"Show me those tickets!"
												],
												null, pedroSpeed, { talker:"pedro" });
											},
										},
										{ msg: "LEAVE", onSelect: game => {
												game.sceneData.zoomOnPedro = 0;
												game.dialog = null;
												game.situation.hitman.goal.y = 42;
											},
										},
									],
								},
								{
									options: [
										{
											hidden: game => game.sceneData.describedParty,
											msg: game => game.sceneData.describedParty ? "Party where?" : "Party?",
											onSelect: (game, dialog) => {
												game.showTip(game.sceneData.describedParty ? "Party in Ecsta city!" : [
													"Party in Ecsta City",
													"The city where party never stops!",
													"I'll take you there for free.",
													"First time is always free.",
												], game => {
													game.sceneData.describedParty = true;
												}, pedroSpeed, { talker:"pedro" });
											},
										},
										{
											msg: game => "Sure!",
											onSelect: (game, dialog) => {
												game.situation.gaveTicket = game.now;
												game.showTip([
													"Alright ma friend",
													"Here are the tickets.",
												], game => {
													game.pickUp({item: "ticket", count: 2, image: ASSETS.GRAB_TICKETS, onPicked: game => {
														game.showTip([
															"Come back and lemme know when ya want to go",
															"Until then, let see more people wanna join.",
														], game => {
															game.dialog = null;
															game.sceneData.zoomOnPedro = 0;
															game.situation.hitman.goal.y = 42;
														}, pedroSpeed, { talker: "pedro" });
													}});
												}, pedroSpeed, { talker:"pedro" });
											},
										},
										{
											msg: game => "No thanks.",
											onSelect: (game, dialog) => {
												game.showTip([
													"Com'on ma friend",
													"You dunt like party?",
													"Haha... whadda party pooper!"],
												game => {
													game.dialog = null;
													game.sceneData.zoomOnPedro = 0;
													game.situation.hitman.goal.y = 42;
												}, pedroSpeed, { talker:"pedro" })
											},
										},
									],
								}
							],
						});
					}, 50);
				},
			},
			{
				src: ASSETS.HITMAN_WALK, size:[16,32], col: 6, row: 6,
				offsetX: (game, {scale}) => Math.round(game.situation.hitman.pos.x - 8 * game.evaluate(scale)) + Math.round(game.situation.shift),
				offsetY: (game, {scale}) => Math.round(game.situation.hitman.pos.y - 32 * game.evaluate(scale)),
				index: game => {
					const { pos, goal, anim } = game.situation.hitman;
					let dx = pos.x > goal.x ? -1 : pos.x < goal.x ? 1 : 0;
					let dy = pos.y > goal.y ? -1 : pos.y < goal.y ? 1 : 0;
					const moving = Math.abs(pos.x-goal.x) >= 1 || Math.abs(pos.y-goal.y) >= 1;
					if (Math.abs(pos.x - goal.x) > Math.abs(pos.y - goal.y) + 1) {
						dy = 0;
					} else if (Math.abs(pos.y - goal.y) > Math.abs(pos.x - goal.x) + 1) {
						dx = 0;
					}

					const animation = game.getAnimation(dx, dy);
					const frame = moving ? Math.floor(game.now/100) % 4 : 0;
					return anim[animation][frame];
				},
				scale: game => game.sceneData.zoom,
				hidden: game => !game.situation.hitman.visible,
			},
			{
				offsetX: (game, {scale}) => Math.round(game.situation.hitman.pos.x - 8 * game.evaluate(scale)) + Math.round(game.situation.shift),
				offsetY: (game, {scale}) => Math.round(game.situation.hitman.pos.y - 32 * game.evaluate(scale)),
				src: ASSETS.HITMAN_BEARD_WALK, size:[16,32], col: 6, row: 6,
				index: game => {
					const { pos, goal, anim } = game.situation.hitman;
					const dx = pos.x > goal.x ? -1 : pos.x < goal.x ? 1 : 0;
					const dy = pos.y > goal.y ? -1 : pos.y < goal.y ? 1 : 0;
					const moving = Math.abs(pos.x-goal.x) >= 1 || Math.abs(pos.y-goal.y) >= 1;
					const animation = game.getAnimation(dx, dy);
					const frame = moving ? Math.floor(game.now/100) % 4 : 0;
					return anim[animation][frame];
				},
				scale: game => game.sceneData.zoom,
				hidden: game => game.data.shaved || !game.situation.hitman.visible,
			},			
			{
				offsetX: (game, {scale}) => {
					const { pos, goal } = game.situation.hitman;
					const dx = pos.x > goal.x ? -1 : pos.x < goal.x ? 1 : 0;
					const dy = pos.y > goal.y ? -1 : pos.y < goal.y ? 1 : 0;
					if (dy === 0) {
						if (dx < 0) {
							return Math.round(pos.x - 105 * game.evaluate(scale)) + Math.round(game.situation.shift);
						} else if (dx > 0) {
							return Math.round(pos.x - 20 * game.evaluate(scale)) + Math.round(game.situation.shift);
						}
					}
					return Math.round(pos.x - 35 * game.evaluate(scale)) + Math.round(game.situation.shift) + (dx < 0 ? -4 : dx > 0 ? 5 : 0) * game.evaluate(scale);
				},
				offsetY: (game, {scale}) => {
					const { pos, goal, anim } = game.situation.hitman;
					const moving = Math.abs(pos.x-goal.x) >= 1 || Math.abs(pos.y-goal.y) >= 1;
					return Math.round(game.situation.hitman.pos.y - 80 * game.evaluate(scale)) + (moving ? Math.floor(game.now/100)%2 : 0);
				},
				src: ASSETS.BEARD_SHAVED,
				scale: game => game.sceneData.zoom * .5,
				side: game => {
					const { pos, goal } = game.situation.hitman;
					const dx = pos.x > goal.x ? -1 : pos.x < goal.x ? 1 : 0;
					const dy = pos.y > goal.y ? -1 : pos.y < goal.y ? 1 : 0;
					return dy > 0 ? null : dx < 0 ? RIGHT : dx > 0 ? LEFT : null;
				},
				hidden: game => {
					if (!game.situation.hitman.visible) {
						return true;
					}
					if (!game.data.shaved) {
						return true;
					}
					const { pos, goal, anim } = game.situation.hitman;
					const dy = pos.y > goal.y ? -1 : pos.y < goal.y ? 1 : 0;
					return dy < 0;
				},
			},
			{
				src: ASSETS.YUPA_WALK, size:[16, 32], col: 3, row: 2,
				offsetX: (game, {scale}) => Math.round(game.situation.yupa.pos.x - 8 * game.evaluate(scale)) + Math.round(game.situation.shift),
				offsetY: (game, {scale}) => Math.round(game.situation.yupa.pos.y - 30 * game.evaluate(scale)),
				index: game => game.situation.yupa.moving ? Math.floor(game.now/100) % 4 : 0,
				scale: game => game.sceneData.zoom,
				onClick: game => {
					game.sceneData.zoomYupa = game.now;

					game.delayAction(game => {
						game.startDialog({
							time: game.now,
							index: 0,
							conversation: [
								{
									options: [
										{
											msg: game => "What do I do?",
											onSelect: (game, dialog) => {
												game.playSound(SOUNDS.YUPA);
												if (!game.data.seen.doctor) {
													game.showTip(["Go see doctar Sarlie", "The white bilding at the end"], null, 80, { talker:"yupa" });
												} else {
													game.showTip(["Ask da shopkeepa abowt Baby Hitlah"], null, 80, {talker:"yupa"});
												}
											},
										},
										{ msg: "LEAVE", onSelect: game => {
												game.sceneData.zoomYupa = 0;
												game.dialog = null;
												game.situation.hitman.goal.y = 42;
											},
										},
									],
								},
							],
						});
					}, 50);					
				},
			},
			{
				src: ASSETS.SARLIE_PLANET_WORLD_OVERLAY, size: [128, 64],
				offsetX: game => Math.round(game.situation.shift),
				scale: game => game.sceneData.zoom / .7,
			},
			{
				src: ASSETS.SARLIE_PLANET_BG,
				noHighlight: true,
				onClick: game => {
				},
				hidden: game => !game.sceneData.zoomOnPedro && !game.sceneData.zoomYupa,
			},			
			{
				src: ASSETS.PEDRO,
				offsetY: -4,
				index: game => game.pendingTip && game.pendingTip.talker === "pedro" && game.pendingTip.progress < 1 ? Math.floor(game.now / 80) % 2 : 0,
				hidden: game => !game.sceneData.zoomOnPedro,
				combine: (item, game) => {
					if (item === "photo") {
						game.useItem = null;
						game.showTip("Have you seen this baby?", game => {
							game.showTip([
								"Nah ma friend",
								"But I tell ya what",
								"Why dunt you come to party",
								"Lots of people at party",
								"Im sure someone can help ya!"],
							null, 40, { talker:"pedro" });
						});
						return true;
					} else if (item === "ticket") {
						game.useItem = null;
						game.showTip([
							"Alright, ma friend",
							"Let's go now!",
							"Ecsta city, here we go!",
						],
						game => {
							console.log("TODO => GO TO ECSTA CITY");
						}, 40, { talker:"pedro" });
						return true;
					}
				},
				onShoot: game => {
				},
				onRefresh: game => {
					if (game.pendingTip && game.pendingTip.talker === "pedro" && game.pendingTip.progress < 1) {
						if (!game.sceneData.yapping) {
							game.sceneData.yapping = true;
							game.playSound(SOUNDS.YAP, {loop:true});
						}						
					} else {
						if (game.sceneData.yapping) {
							game.sceneData.yapping = false;
							game.stopSound(SOUNDS.YAP);
						}
					}
				},
			},
			{
				src: ASSETS.ZOOM_YUPA_ALONE, col: 3, row: 3,
				hidden: game => !game.sceneData.zoomYupa || game.sceneData.yupa_photo,
				index: game => {
					const { pendingTip, now, sceneData } = game;
					if (pendingTip && pendingTip.talker === "yupa") {
						return 5 + Math.floor(now / 50) % 3;
					}
					return game.useItem ? 4 : Math.min(3, Math.floor((now - sceneData.zoomYupa)/50));
				},
				combine: (item, game) => {
					if (item === "photo") {
						game.useItem = null;
						game.sceneData.yupa_photo = game.now;
						game.dialog.paused = true;
						return true;
					}
				},
			},
			{
				src: ASSETS.YUPA_GRAB_PHOTO_ALONE, col: 2, row: 3,
				hidden: game => !game.sceneData.yupa_photo,
				index: game => {
					const frame = Math.floor((game.now - game.sceneData.yupa_photo) / 80);
					if (frame < 30) {
						return Math.min(frame, 3);
					} else if (frame < 60) {
						return frame % 2 + 4;
					} else if (frame < 85) {
						return 3;
					} else {
						return Math.max(0, 3 + 85 - frame);
					}
				},
				onRefresh: game => {
					const frame = Math.floor((game.now - game.sceneData.yupa_photo) / 80);
					if (frame > 30 && !game.sceneData.yupalaugh) {
						game.sceneData.yupalaugh = game.now;
						game.playSound(SOUNDS.YUPA_HAHA);
					} 
					if (frame > 90) {
						game.sceneData.yupa_photo = 0;
						game.dialog.paused = false;
					}
				},
			},
			{
				src: ASSETS.SPEECH_OUT,
				hidden: game => !game.sceneData.zoomOnPedro || game.pendingTip || game.sceneData.yupa_photo,
				index: game => {
					return Math.min(3, Math.floor((game.now - game.sceneData.zoomOnPedro) / 50));
				},
			},
			...standardMenu(),
			...standardBag(),
		],
	},
);