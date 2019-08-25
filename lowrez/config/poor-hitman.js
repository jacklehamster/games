gameConfig.scenes.push(
	{
		name: "poor-hitman",
		onScene: game => {
			game.hideCursor = true;
			game.showTip(["What a surprise, how thoughtful of you!", "You really do care about me after all.."],
				game => {
					game.gotoScene("guards-laughing");
				}
			);					
		},
		sprites: [
			{
				src: ASSETS.POOR_HITMAN_BACK,
			},
			{
				src: ASSETS.POOR_HITMAN,
				index: ({ pendingTip, now }) => pendingTip && pendingTip.progress < 1 ? Math.floor(now / 150) % 4 : 0,
			},
			{
				src: ASSETS.POOR_HITMAN_GUARD,
				index: game => Math.floor((game.now - game.sceneTime) / 200) % 4, 
			},
		],
	},
);