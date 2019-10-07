gameConfig.scenes.push(
	{
		name: "drink-yupa",
		onScene: game => {
			game.playTheme(null);
			game.hideCursor = true;
			game.playSound(SOUNDS.YUPA);
			game.showTip([`Dont do it, ${game.data.name}!`, "I warn ya, ya ganna regret it!"], game => {
			}, null, { x: 2, y: 22, speed: 80, talker:"yupa" });
		},
		onSceneRefresh: game => {
			const frame = Math.floor((game.now - game.sceneTime) / 100);
			if (!game.sceneData.drankYupa && frame >= 80) {
				game.sceneData.drankYupa = game.now;
				game.playSound(SOUNDS.YUPA, {loop:true});
				game.showTip("Don't!", null, null, { x: 2, y: 22, speed: 10, talker:"yupa" });
				game.delayAction(game => {
					game.stopSound(SOUNDS.YUPA);
					game.playSound(SOUNDS.DRINK);
					game.pendingTip = null;
				}, 800);
				game.delayAction(game => {
					game.playSound(SOUNDS.JINGLE);
					game.playTheme(SOUNDS.GOGOL);
					game.sceneData.tripping = game.now;
					game.showTip(["Oh, yeesss.... now I have....", "Yupa Suppapawaa!!!!",
						"I can.... liqueefaiiii", "Oh yeahh.... Imma supayupa yumaaannn...",
						"Immaaa supppaa mmaann"], game => {
							game.sceneData.crazy = game.now;

							game.delayAction(game => {
								game.stopSound(SOUNDS.GOGOL);
								game.playSound(SOUNDS.YUPA);
								game.showTip("Yu are very stuped man", game => {
									game.showTip("I know", game => {
										game.gameOver(" “YUPA is not\n           YOPLAIT!”");
									}, null, {x: 20, y: 30, speed: 100, talker: "human"});
								}, null, { x: 2, y: 22, speed: 80, talker:"yupa" })
							}, 8000);
						});
				}, 1200);
			}
			if (game.data.gameOver) {
				game.fade = Math.min(.7, Math.max(0, (game.now - game.data.gameOver) / 1000));
			}
		},
		sprites: [
			{
				custom: (game, sprite, ctx) => {
					ctx.clearRect(0, 0, 64, 64);
				},
				hidden: game => game.sceneData.tripping && !game.sceneData.crazy,
			},
			{
				offsetX: game => game.sceneData.tripping && !game.sceneData.crazy? Math.sin(game.now/50) * Math.sin(game.now / 1000) * 5 : 0,
				offsetY: game => game.sceneData.tripping && !game.sceneData.crazy? Math.cos(game.now/150) * Math.cos(game.now / 700) * 5 : 0,
				globalCompositeOperation: game => game.sceneData.tripping && !game.sceneData.crazy?(Math.random() < .3 ? "overlay" : Math.random() < .5 ? "darken": "lighten"):null,
				src: ASSETS.DRINK_YUPA, col: 7, row: 7,
				index: game => {
					const frame = Math.floor((game.now - game.sceneTime) / 100);
					if (frame < 80) {
						if (game.pendingTip && game.pendingTip.talker === "yupa") {
							return Math.floor(game.now / 100) % 4;
						}
					} else if (!game.sceneData.crazy) {
						return Math.min(frame-80, 9);
					} else {
						const f = Math.floor((game.now - game.sceneData.crazy) / 100);
						if (game.pendingTip && game.pendingTip.talker === "yupa") {
							return f % 2 + 43;
						} else if (game.pendingTip && game.pendingTip.talker === "human") {
							return f % 2 + 45;
						}
						return Math.max(9, Math.min(f, 42));
					}
				},
			},
		],
	},
);