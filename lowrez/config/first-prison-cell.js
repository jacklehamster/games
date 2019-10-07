gameConfig.scenes.push(
	{
		name: "first-prison-cell",
		arrowGrid: [
			[null, null,  MENU, null, null ],
			[],
			[ LEFT, null, s(2), null, RIGHT ],
			[ LEFT, null, s(1), null, RIGHT ],
			[ LEFT, null, s(5), null, RIGHT ],
		],
		onScene: game => {
			game.save();
		},
		doors: {
			1: {
				exit: game => game.fadeToScene("maze-4", {door:3}),
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
			...getRoomMaze(""),
			{
				src: ASSETS.SHOP_MONSTER,
				onClick: game => {
					game.gotoScene("zoom-shop-monster");
				},
				hidden: game => game.rotation !== 0,
				tip: "There's a hole in the ceiling, with a creature in it.",
			},
			{
				src: ASSETS.CAGE_OPENED, col: 2, row: 2,
				index: 3,
				hidden: game => game.rotation !== 0,
			},
			...standardMenu(),
			...standardBag(),
		],
	},
);