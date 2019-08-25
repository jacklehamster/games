gameConfig.scenes.push(
	{
		name: "what-so-funny",
		onScene: game => {
			game.hideCursor = true;
			game.showTip(["Hahaha...", "Even in this situation, I'm glad I can laugh with you guys.", "By the way, what's so funny?"],
				game => {
					game.gotoScene("cake-face");
				}
			);					
		},
		sprites: [
			{
				src: ASSETS.POOR_HITMAN_BACK,
			},
			{
				src: ASSETS.POOR_HITMAN,
				hidden: ({ pendingTip }) => pendingTip && pendingTip.index < 2,
				index: ({ pendingTip, now }) => pendingTip && pendingTip.progress < 1 ? Math.floor(now / 150) % 4 : 0,
			},
			{
				src: ASSETS.HITMAN_LAUGH,
				hidden: ({ pendingTip }) => !pendingTip || pendingTip.index >= 2,
				index: ({ pendingTip, now }) => pendingTip && pendingTip.progress < 1 && pendingTip.index !== 0 ? Math.floor(now / 150) % 4 : Math.floor(now / 150) % 2,
			},
			{
				src: ASSETS.POOR_HITMAN_GUARD,
				index: game => Math.floor((game.now - game.sceneTime) / 200) % 4, 
			},
		],
	},
);