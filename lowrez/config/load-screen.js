gameConfig.scenes.push(
	{
		name: "load-screen",
		startScene: true,
		onScene: game => {
			game.waitCursor = true;
		},
		onSceneRefresh: game => {
			const progress = game.loadCount / game.loadTotal;
			if (progress >= 1) {
				game.gotoScene("start-screen");
			}
		},
		sprites: [
			{
				custom: (game, sprite, ctx) => {
					ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
					ctx.fillStyle = "#999999";
					if (game.loadTotal) {
						const progress = game.loadCount / game.loadTotal;
						ctx.fillRect(5, 35, 1 + progress * 50, 2);
					}
				},
			},
		],	
	}
);