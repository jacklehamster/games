gameConfig.scenes.push(
	{
		name: "monster-in-space",
		onScene: game => {
			game.hideCursor = true;
		},
		startTalk: (game, talker, msg, onDone, removeLock) => {
			let x, y;
			if (talker === "human") {
				x = 7;
				y = 58;
				game.playSound(SOUNDS.HUM);
			} else if (talker === "yupa") {
				x = 2;
				y = 22;
				game.playSound(SOUNDS.YUPA);				
			}
			game.showTip(msg, onDone, 100, { x, y, talker, removeLock });
		},		
		sprites: [
			{
				init: (game, sprite) => {
					game.playTheme(SOUNDS.SOUP_CHOU_THEME, {volume: .7});

					const {sceneData} = game;
					sceneData.stars = new Array(100).fill(null).map(() => {
						return {
							x: (Math.random() - .5) * 64,
							y: (Math.random() - .5) * 64,
							size: .2,
						};
					});
					for (let i = 0; i < 100; i++) {
						sprite.onRefresh(game, sprite);
					}

					game.delayAction(game => {
						game.currentScene.startTalk(game, "yupa", [
							`So, ${game.data.name||"hitman"}...`,
							"I hope ya know what ya doing.",
						], game => {
							game.currentScene.startTalk(game, "human", [
								"Hum, not really. Why?",
							], game => {
								game.currentScene.startTalk(game, "yupa", [
									"Welz... I dun really understand how da warp drave worx...",
									"but I knaw if ya configure it bad,",
									"wee culd go wrang diraxion...",
								], game => {
									game.currentScene.startTalk(game, "human", [
										"Well, we should be ok, right?",
										"The shopkeeper configured it for us.",
									], game => {
										game.currentScene.startTalk(game, "yupa", [
											"Ya, but she waz nat happy duin it,",
											"with us stealin da warp drave and all...",
										], game => {
											game.currentScene.startTalk(game, "human", [
												"So... what do you suggest she might have done?...",
											], game => {
												game.sceneData.toPlanet = game.now;
												game.playTheme(SOUNDS.GOGOL);
											});
										});
									});
								});
							});
						});
					}, 5000);
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
				hidden: ({sceneData}) => !sceneData.stars,
			},
			{
				src: ASSETS.MONSTER_PLANET, col: 3, row: 3,
				scale: game => {
					if (!game.sceneData.toPlanet) {
						return 0;
					}
					const timeProgress = Math.min(1, (Math.max(0, game.now - game.sceneData.toPlanet) / 5000));
					return timeProgress * timeProgress;
				},
				index: game => {
					const timeProgress = Math.floor((game.now - game.sceneData.toPlanet - 4000) / 200);
					if (timeProgress < 20) {
						return Math.min(Math.max(0, timeProgress), 6);
					} else {
						return Math.max(0, 6 - (timeProgress - 20));
					}
				},
				offsetX: (game, sprite) => 32 - game.evaluate(sprite.scale) * 32,
				offsetY: (game, sprite) => 32 - game.evaluate(sprite.scale) * 32,
				hidden: (game, sprite) => !game.evaluate(sprite.scale),
				onRefresh: game => {
					const timeProgress = Math.floor((game.now - game.sceneData.toPlanet - 4000) / 200);
					if (timeProgress > 30 && !game.sceneData.gameOver) {
						game.sceneData.gameOver = game.now;
						game.playTheme(null);
						game.gameOver(" “Don't fack with\n       alien lady!”");
					}
				},
			},
			{
				src: ASSETS.SPACESHIP, col: 1, row: 2,
				scale: game => {
					if (!game.sceneData.toPlanet) {
						return 1;
					}
					const timeProgress = Math.max(0, 1 - (Math.max(0, game.now - game.sceneData.toPlanet - 5000) / 3000));
					return timeProgress * timeProgress;
				},
				offsetX: (game, sprite) => 10 + 20 - game.evaluate(sprite.scale) * 20,
				offsetY: (game, sprite) => 10 + 20 - game.evaluate(sprite.scale) * 20,
				hidden: (game, sprite) => !game.evaluate(sprite.scale),
			},
			...standardMenu(),
			...standardBag(),		
		],
	},
);