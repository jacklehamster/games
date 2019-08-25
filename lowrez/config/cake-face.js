gameConfig.scenes.push(
	{
		name: "cake-face",
		onScene: game => {
			game.hideCursor = true;
		},
		onSceneRefresh: game => {
			const frame = Math.floor((game.now - game.sceneTime) / 200);					
			if (frame > 1 && !game.sceneData.caked) {
				game.sceneData.caked = game.now;
				game.playSound(SOUNDS.EAT);
				game.playTheme(null);
			}
			if (frame > 10) {
				game.gotoScene("guards-laughing-2");
			}
		},
		sprites: [
			{
				src: ASSETS.POOR_HITMAN_BACK,
			},
			{
				src: ASSETS.HITMAN_CAKE_FACE,
				index: ({ now, sceneTime }) => Math.min(4, Math.floor((now - sceneTime) / 200)),
			},
		],
	},
);