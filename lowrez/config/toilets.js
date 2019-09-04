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
						delete game.inventory[item];
						game.useItem = null;
						game.pickUp({item:"water bottle", image:ASSETS.GRAB_WATER_BOTTLE, message:"It does look like water... so far."});
						return true;
					}
				},
				hidden: game => game.rotation !== 0,
			},
			{
				name: "self",
				src: ASSETS.EATER, col:2, row:2,
				index: (game, sprite) => game.hoverSprite === sprite ? Math.min(2, Math.floor((game.now - sprite.hoverTime) / 100)) : 0,
				hidden: game => game.useItem !== 'water bottle',
				combine: (item, game) => {
					if (item === 'water bottle') {
						game.removeFromInventory(item);
						game.useItem = null;
						game.playSound(SOUNDS.DRINK);
						game.addToInventory({item:"empty bottle", image:ASSETS.GRAB_BOTTLE},)
						game.showTip("Refreshing!");
					}
					return true;
				},
			},
			{
				bag: true,
				src: ASSETS.BAG_OUT,
				index: game => game.frameIndex,
				hidden: ({arrow, bagOpening, dialog}) => !bagOpening && (arrow !== BAG || dialog && dialog.conversation[dialog.index].options.length > 2),
				alpha: game => game.emptyBag() ? .2 : 1,
				onClick: game => game.clickBag(),
			},
			...standardMenu(),
		],
	},
);