gameConfig.scenes.push(
	{
		name: "shop",
		arrowGrid: [
			[null, null,  MENU, null, null ],
			[],
			[ LEFT, null, s(2), null, RIGHT ],
			[ LEFT, null, s(1), null, RIGHT ],
			[ LEFT, null, s(5), null, RIGHT ],
		],
		onScene: game => {
			game.save();
			game.playTheme(SOUNDS.CHIN_TOK_THEME);
		},
		doors: {
			1: {
				exit: game => game.fadeToScene("sarlie-planet-world"),
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
			...getRoomMaze("_RED_1"),
			...standardMenu(),
			...standardBag(),
		],
	},
);
