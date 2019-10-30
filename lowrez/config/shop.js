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
		onSceneHoldItem: (game, item) => {
			if (item === "gun") {
				game.useItem = null;
				game.waitCursor = true;
				game.showTip("I don't want to hurt anyone.", () => {
					game.waitCursor = false;
				});
			}

		},
		// onSceneShot: game => {
		// 	console.log("HERE");
		// },
		sprites: [
			...getRoomMaze("_RED_1"),
			{	//	Shopkeepa
				src: ASSETS.SHOP, col: 2, row: 3,
				index: 1,
				hidden: game => game.rotation !== 0,
				onClick: game => {
					game.gotoScene("shopkeepa");
				},
				combine: (item, game) => {
					game.gotoScene("shopkeepa");
					game.useItem = item;
					return true;
				},
			},
			{	//	Slot machine
				src: ASSETS.SHOP, col: 2, row: 3,
				index: 2,
				hidden: game => game.rotation !== 0,
				onClick: game => {
					game.gotoScene("slots");
				},
			},
			{	//	Yupa
				src: ASSETS.SHOP,
				index: 4,
				hidden: game => game.rotation !== 0,
				onClick: game => {
					game.gotoScene("shopkeepa");
				},
				combine: (item, game) => {
					game.gotoScene("shopkeepa");
					game.useItem = item;
					return true;
				},
			},
			{
				src: ASSETS.SHOP, col: 2, row: 3,
				hidden: game => game.rotation !== 0,
			},
			...standardMenu(),
			...standardBag(),
		],
	},
);
