gameConfig.scenes.push(
	{
		name: "load-screen",
		startScene: true,
		onScene: game => {
			game.waitCursor = true;
			game.sceneData.startTime = game.now;
			game.sceneData.estimate = 3600000;
		},
		onSceneRefresh: game => {
			const progress = game.currentScene.getProgress(game);
			const progressSpeed = progress / (game.now - game.sceneData.startTime);
			const estimate = (1 - progress) / progressSpeed;
			if (game.sceneData.estimate > estimate) {
				game.sceneData.estimate = estimate;
			}
			if (progress >= 1) {
				const numScenesLoaded = game.config.scenes.length;
				const totalScenes = game.getSceneCount();
				if (numScenesLoaded >= totalScenes) {
					game.gotoScene("start-screen");
				}
			}
		},
		getProgress: game => {
			const numAssetsLoaded = game.countAssets(true);
			const totalAssets = game.countAssets();

			return (numAssetsLoaded) / (totalAssets);
		},
		sprites: [
			{
				custom: (game, sprite, ctx) => {
					ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
					ctx.fillStyle = "#003377";
					ctx.fillRect(5, 35, 51, 2);
					ctx.fillStyle = "#999999";
					const progress = game.currentScene.getProgress(game);
					ctx.fillRect(5, 35, 1 + progress * 50, 2);

					ctx.font = "14px Trebuchet MS";
					ctx.strokeStyle = "#ffffff";
					ctx.strokeText("Loading." + (game.now % 1500 < 500 ? "" : game.now % 1500 < 1000 ? "." : ".."), 0, 30);
					if (game.sceneData.estimate < 3600000 && Math.floor(game.sceneData.estimate / 1000) > 0) {
						ctx.strokeText(Math.floor(game.sceneData.estimate / 1000) + " sec", 8, 50);
					}
				},
				onClick: game => {
					game.gotoScene("start-screen");
				},
			},
		],	
	}
);