gameConfig.scenes.push(
	{
		name: "toilets",
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
				exit: game => game.fadeToScene("maze-2", {door:2}),
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
			// {
			// 	src: ASSETS.BATHROOM,
			// },
			{
				src: ASSETS.TOILETS,
				side: LEFT,
				offsetX: 5,
				offsetY: 1,
				combineMessage: (item, game) => {
					if (item === "empty bottle") {
						return "Why get the water from the toilet when there's a water fountain next to it?";
					}
					return `The ${item} has no effect on the toilet.`;
				},
				onClick: game => {
					game.gotoScene("toilet-zoom");
				},
				hidden: game => game.rotation !== 0,
			},
			{
				src: ASSETS.TOILETS,
				side: RIGHT,
				tip: () => "I wonder if the water is drinkable.",
				combine: (item, game) => {
					if (item === "empty bottle") {
						game.removeFromInventory("empty bottle");
						game.useItem = null;
						game.pickUp({item:"water bottle", image:ASSETS.GRAB_WATER_BOTTLE, message:"It does look like water... so far."});
						return true;
					}
				},
				hidden: game => game.rotation !== 0,
			},
			...standardMenu(),
			...standardBag(),
		],
	},
);