gameConfig.scenes.push(
	{
		name: "guards-laughing",
		onScene: game => {
			game.hideCursor = true;
		},
		onSceneRefresh: game => {
			const frame = Math.floor((game.now - game.sceneTime) / 150);					
			if (frame > 50) {
				game.gotoScene("what-so-funny");
			} else if (!game.sceneData.laughing && frame > 30) {
				game.sceneData.laughing = true;
				game.playSound(SOUNDS.HAHAHA);
			}
		},
		sprites: [
			{
				src: ASSETS.GUARDS_LAUGHING,
				index: game => {
					const frame = Math.floor((game.now - game.sceneTime) / 150);
					if (frame < 15) {
						return 0;
					} else if (frame < 30) {
						return 1;
					} else {
						return frame % 2 + 2;
					}
				},
			},
		],
	},
);