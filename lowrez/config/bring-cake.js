gameConfig.scenes.push(
	{
		name: "bring-cake",
		onScene: game => {
			game.waitCursor = true;
			game.sceneData.scenario = 0;
		},
		onSceneRefresh: game => {
			if (game.sceneData.scenario === 0) {
				const frame = Math.floor((game.now - game.sceneTime) / 300);
				if (frame >= 10) {
					game.showTip([
						"...",
						"Wait... why did he just leave?",
						"That's odd.",
						"Maybe he went to get me a birthday cake.",
						"Wouldn't that be funny?!?",
					], game => {
						game.sceneData.scenario = 2;
						game.sceneData.scenarioTime = game.now;
					});
					game.sceneData.scenario = 1;
				}
			} else if (game.sceneData.scenario === 2) {
				const frame = Math.floor((game.now - game.sceneData.scenarioTime) / 500);
				if (frame >= 5) {
					game.sceneData.scenario = 3;
					game.showTip("OMG!", game => {
						game.gotoScene("poor-hitman");
					});
				}
			}
		},
		sprites: [
			{
				src: ASSETS.JAIL, col:3, row:3,
				index: () => Math.random() < .1 ? 1 : 0,
			},
			{
				src: ASSETS.DIMMING_LIGHT,
				index: () => Math.random() < .1 ? 1 : 0,
			},
			{
				src: ASSETS.RIGHT_GUARD, col:3, row:3,
				index: 0,
			},
			{
				src: ASSETS.BRING_CAKE, col:3, row:3,
				index: game => {
					if (game.sceneData.scenario === 0) {
						const frame = Math.floor((game.now - game.sceneTime) / 300);
						return Math.min(frame, 3);
					} else if (game.sceneData.scenario === 1) {
						return 3;
					} else if (game.sceneData.scenario === 2) {
						const frame = Math.floor((game.now - game.sceneData.scenarioTime) / 500);
						return Math.min(6, frame + 4);
					}
					const frame = Math.floor((game.now - game.sceneTime) / 300);
					return 5 + frame % 2;
				},
			},
			{
				src: ASSETS.CAGE, col:2, row:3,
				index: 0,
			},
		],
	},
);