gameConfig.scenes.push(
	{
		name: "in-progress",
		arrowGrid: [
			[null, null,  MENU, null, null ],
			[],
			[ LEFT, null, s(2), null, RIGHT ],
			[ LEFT, null, s(1), null, RIGHT ],
			[ LEFT, null, s(5), null, RIGHT ],
		],
		onScene: game => {
			game.showTip(`CONGRATS! You reach the end of this demo. But come back soon! I'll keep making updates to this game, and bring a proper ending. But hey, you've made it this far, but the rest might not be so easy. HAHAHA!`,
				null, null, {removeLock: true});
		},
		doors: {
			1: {
				exit: game => game.fadeToScene("cell-maze", {door:5}),
			},
		},
		map: `
			XXX
			XOX
			X.X
			X1X
			XXX
		`,
		onSceneRefresh: (game) => {
			const {orientation, sceneData, frameIndex} = game;
			if (sceneData.orientation !== orientation) {
				sceneData.orientation = orientation;

				if (frameIndex === 3) {
					game.frameIndex = 0;
				}
			}
		},
		sprites: [
			...getRoomMaze("_2"),
			...standardMenu(),
			...standardBag(),
		],
	},
);