gameConfig.scenes.push(
	{
		name: "stars",
		arrowGrid: [
			[ null, null, MENU,  null, null ],
			[],
			[],
			[],
			[ null, null, null, null, null ],
		],
		onScene: game => {
			game.hideCursor = true;
			const { sceneData } = game;
			game.playTheme(SOUNDS.SOUP_CHOU_THEME, {volume: .7});
			game.delayAction(game => game.hideCursor = false, 10000);

			/** remove useless items */
			delete game.inventory["access card"];
			delete game.inventory["empty bottle"];
			delete game.inventory["fruit?"];
			delete game.inventory["key"];
			delete game.inventory["lighter"];
			delete game.inventory["water bottle"];
			/** restore health */
			game.data.stats.life = game.data.stats.maxLife;

		},
		onSceneRefresh: game => {
			const { sceneData, now, sceneTime } = game;
			if (now - sceneTime > 5000 && now - sceneTime < 10000) {
				game.playTheme(SOUNDS.SOUP_CHOU_THEME, {volume: .7 - .4 * Math.min(1, (now - (sceneTime + 5000)) / 5000) });
			}
		},
		startTalk: (game, talker, msg, onDone, removeLock) => {
			let x, y;
			if (talker === "human") {
				x = 15;
				y = 23;
				game.playSound(SOUNDS.HUM);
			} else if (talker === "yupa") {
				x = 3;
				y = 23;
				game.playSound(SOUNDS.YUPA);
			} else if (talker === "alexa") {
				x = 12;
				y = 20;				
				game.playSound(SOUNDS.OKAY);
				msg = msg.split("").map(a => " ").join("");
			}
			game.showTip(msg, onDone, talker === "yupa" ? 140 : 100, { x, y, talker, removeLock });
		},
		sprites: [
			{
				init: ({sceneData}) => {
					sceneData.stars = new Array(100).fill(null).map(() => {
						return {
							x: (Math.random() - .5) * 64,
							y: (Math.random() - .5) * 64,
							size: .2,
						};
					});
				},
				onRefresh: (game, sprite) => {
					const { sceneData, now, sceneTime } = game;
					sceneData.stars.forEach(star => {
						star.x *= 1.01;
						star.y *= 1.01;
						star.size *= 1.01;
						if (star.size > 1) {
							star.size = 1;
						}
						if (Math.abs(star.x) > 32 || Math.abs(star.y) > 32) {
							star.x = (Math.random() - .5) * 64;
							star.y = (Math.random() - .5) * 64;
							star.size = .2;
						}
					});
				},
				custom: (game, sprite, ctx) => {
					ctx.fillStyle = "#000022";
					ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
					ctx.fillStyle = "#FFFFFF";
					const { sceneData } = game;
					sceneData.stars.forEach(({x, y, size}) => {
						ctx.fillRect(32 + x, 32 + y, size, size);
					});
				},
			},
			{
				src: ASSETS.HOTTUB, col: 1, row: 2,
				index: ({now}) => Math.floor(now / 1000)% 2,
				alpha: ({now, sceneTime}) => Math.min(1, Math.max(0, now - sceneTime - 5000) / 3000),
				scale: ({now, sceneTime}) => {
					const dx = Math.max(0, now - sceneTime - 5000) / 4000;
					return 4 / Math.min(4, dx * dx);
				},
				offsetX: (game, sprite) => 32 - 32 * game.evaluate(sprite.scale),
				offsetY: (game, sprite) => 16 - 16 * game.evaluate(sprite.scale),
			},
			{				
				src: ASSETS.YUPA_HOTTUB, col: 1, row: 2,
				index: ({now, pendingTip}) => pendingTip && pendingTip.talker === "yupa" ? Math.floor(now/100) % 2 : 0,
				alpha: ({now, sceneTime}) => Math.min(1, Math.max(0, now - sceneTime - 5000) / 3000),
				scale: ({now, sceneTime}) => {
					const dx = Math.max(0, now - sceneTime - 5000) / 4000;
					return 4 / Math.min(4, dx * dx);
				},
				offsetX: (game, sprite) => 32 - 32 * game.evaluate(sprite.scale),
				offsetY: (game, sprite) => 16 - 16 * game.evaluate(sprite.scale),
				onClick: game => {
					game.startDialog({
						time: game.now,
						index: 0,
						conversation: [
							{
								options: [
									{
										hidden: game.sceneData.spoken1,
										msg: game => game.sceneData.spoken1 ? "" : "This is great!",
										onSelect: (game) => {
											game.waitCursor = true;
											game.sceneData.spoken1 = game.now;
											game.currentScene.startTalk(game, "human", "This is great!", game => {
												game.currentScene.startTalk(game, "yupa", "Yuuup!...", game => {
													game.currentScene.startTalk(game, "human", "What a genius idea to install a hot tub in your spaceship!", game => {
														game.waitCursor = false;
														game.currentScene.startTalk(game, "yupa", "Yuuup!...");
													});
												});
											});
										},
									},
									{
										hidden: game.sceneData.spoken2,
										msg: game => game.sceneData.spoken2 ? "" : "So, what now?",
										onSelect: (game) => {
											game.sceneData.spoken2 = game.now;
											game.waitCursor = true;
											game.currentScene.startTalk(game, "human", "So, what do we do now?", game => {
												game.currentScene.startTalk(game, "yupa", `Chill ${game.data.name}, we jost chill.`, game => {
													game.currentScene.startTalk(game, "human", "Just chill? Forever?", game => {
														game.currentScene.startTalk(game, "yupa", "Yuuup!...", game => {
															game.waitCursor = false;
															game.currentScene.startTalk(game, "human", "Haha! Alright Yupa.");
														});
													});
												});
											});
										},
									},
									{
										msg: game => game.calledAlexa ? "Nevermind" : "Let's drink?",
										onSelect: game => {
											if (game.calledAlexa) {
												game.dialog = null;
												return;
											}
											game.waitCursor = true;
											game.currentScene.startTalk(game, "human", "Yupa, let's go get a drink. What do you think?", game => {
												game.currentScene.startTalk(game, "yupa", "Im good but halp yorself wif Alectra", game => {
													game.currentScene.startTalk(game, "human", "Alright, don't mind if I do.", game => {
														game.currentScene.startTalk(game, "human", "ALECTRA!", null, true);
														game.dialog.index = 1;
														game.dialog.paused = game.now;
														game.delayAction(game => {
															game.calledAlexa = game.now;
															game.playSound(SOUNDS.DIVING, {volume:.5});
														}, 1500);
														game.delayAction(game => {
															game.currentScene.startTalk(game, "alexa", "Okay.", game => {
																game.dialog.paused = 0;
																game.waitCursor = false;
															});
														}, 3000);
													});
												});
											});
										},
									},
									{},
									{},
								],
							},
							{
								options: [
									{
										msg: "I want a beer!", onSelect: (game, dialog) => {
											game.waitCursor = true;
											game.currentScene.startTalk(game, "human", "Alectra, bring me a nice cold beer!", game => {
												game.currentScene.startTalk(game, "alexa", "Okay.", game => {
													game.situation.drink = "beer";
													game.sceneData.alexaRotate = game.now;
													game.playSound(SOUNDS.DIVING, {volume:.5});
													game.waitCursor = false;
													game.dialog = null;
												});
											});;
										},
									},
									{
										msg: "Bring me cider!", onSelect: (game, dialog) => {
											game.waitCursor = true;
											game.currentScene.startTalk(game, "human", "I want some sparklin' cidah! Gimme some!", game => {
												game.currentScene.startTalk(game, "alexa", "Okay.", game => {
													game.situation.drink = "sparklin' cidah";
													game.sceneData.alexaRotate = game.now;
													game.playSound(SOUNDS.DIVING, {volume:.5});
													game.waitCursor = false;
													game.dialog = null;
												});
											});
										},
									},
									{
										msg: "Got Ramune?", onSelect: (game, dialog) => {
											game.waitCursor = true;
											game.currentScene.startTalk(game, "human", ["Do you know Ramune?", "I love that drink, bring me Ramune!"], game => {
												game.currentScene.startTalk(game, "alexa", "Okay.", game => {
													game.situation.drink = "Ramune";
													game.sceneData.alexaRotate = game.now;
													game.playSound(SOUNDS.DIVING, {volume:.5});
													game.waitCursor = false;
													game.dialog = null;
												});
											});
										},
									},
								],
							},
						],
					});
				},
			},
			{
				src: ASSETS.HUMAN_HOTTUB, col: 1, row: 2,
				index: ({now, pendingTip }) => pendingTip && pendingTip.talker === "human" ? Math.floor(now/100) % 2 : 0,
				alpha: ({now, sceneTime}) => Math.min(1, Math.max(0, now - sceneTime - 5000) / 3000),
				scale: ({now, sceneTime}) => {
					const dx = Math.max(0, now - sceneTime - 5000) / 4000;
					return 4 / Math.min(4, dx * dx);
				},
				offsetX: (game, sprite) => 32 - 32 * game.evaluate(sprite.scale),
				offsetY: (game, sprite) => 16 - 16 * game.evaluate(sprite.scale),
			},
			{
				src: ASSETS.ALEXA, col: 4, row: 4,
				index: ({now, pendingTip}) => {
					if (game.sceneData.alexaRotate) {
						return Math.min(5, Math.floor((now - game.sceneData.alexaRotate) / 100)) + 2;
					}
					return pendingTip && pendingTip.talker === "alexa" ? Math.floor(now/100) % 2 : 0;
				},
				offsetY: (game, sprite) => {
					const progress = Math.max(0, Math.min(1, 1 - (game.now - game.calledAlexa) / 3000));
					return Math.round(-30 * progress * progress);
				},
				hidden: game => !game.calledAlexa,
				noHighlight: game => !game.sceneData.alexaRotate,
				onClick: game => {
					game.gotoScene("zoom-hottub");
				},
			},
			...standardMenu(),
			...standardBag(),		
		],
	},
);