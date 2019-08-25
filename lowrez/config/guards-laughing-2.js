gameConfig.scenes.push(
	{
		name: "guards-laughing-2",
		onScene: game => {
			game.hideCursor = true;
			game.playSound(SOUNDS.HAHAHA);
		},
		onSceneRefresh: game => {
			const frame = Math.floor((game.now - game.sceneTime) / 150);					
			if (frame > 50) {
				game.gotoScene("guards-attack");
			}	
		},
		sprites: [
			{
				src: ASSETS.GUARDS_LAUGHING,
				index: game => {
					const frame = Math.floor((game.now - game.sceneTime) / 150);
					return frame < 20 ? frame % 2 + 2 : frame < 32 ? 0 : 4;
				},
			},
		],
	},
);