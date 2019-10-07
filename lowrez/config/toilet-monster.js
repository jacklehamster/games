gameConfig.scenes.push(
		{
			name: "toilet-monster",
			onScene: game => {
				game.hideCursor = true;
				game.playTheme(null);
			},
			onSceneRefresh: game => {
				const frame = Math.floor((game.now - game.sceneTime) / 100) - 50;
				if (frame < 50) {
					if (Math.floor(frame / 2) < 5) {
						game.sceneData.frame = Math.max(0, Math.floor(frame / 4));
					} else {
						game.sceneData.frame = Math.min(13, 5 + (frame - 10));
						if (frame > 13 && !game.sceneData.eat) {
							game.sceneData.eat = game.now;
							game.playSound(SOUNDS.EAT);
						}
					}
				} else {
					if (!game.data.gameOver) {
						game.gameOver("  “What a sad way\n         to die!”");
					}
				}
			},
			sprites: [
				{
					src: ASSETS.TOILET_MONSTER, col: 4, row: 4,
					index: game => game.sceneData.frame || 0,
				},
			],
		},
);