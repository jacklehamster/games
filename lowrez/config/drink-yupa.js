gameConfig.scenes.push(
	{
		name: "drink-yupa",
		onScene: game => {
			game.hideCursor = true;
		},
		onSceneRefresh: game => {

		},
		sprites: [
			{
				src: ASSETS.DRINK_YUPA, col: 5, row: 5,
				index: 0,
			},
		],
	},
);