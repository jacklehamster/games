gameConfig.scenes.push(
	{
		name: "vending-machine",
		arrowGrid: [
			[null, null,  MENU, null, null ],
			[],
			[ LEFT, null, s(2), null, RIGHT ],
			[ LEFT, null, s(1), null, RIGHT ],
			[ LEFT, null, s(5), null, RIGHT ],
		],
		map: `
			XXX
			XOX
			X.X
			X1X
			XXX
		`,
		doors: {
			1: {
				exit: game => game.fadeToScene("maze-2", {door:3}),
			},
		},
		onScene: game => {
			game.save();
			// game.startDialog({
			// 	time: game.now,
			// 	index: 0,
			// 	conversation: [
			// 		{
			// 			message: "",
			// 			options: [
			// 				{ },
			// 				{ },
			// 				{ msg: "LEAVE", onSelect: game => {
			// 					const fadeDuration = 1000;
			// 					game.fadeOut(game.now, {duration:fadeDuration * 1.5, fadeDuration, color:"#000000", onDone: game => {
			// 						game.gotoScene("maze-2", {door:3})
			// 					}});
			// 				}},
			// 			],
			// 		},
			// 	],
			// });
		},
		sprites: [
			...getRoomMaze(""),
			{
				src: ASSETS.VENDING_MACHINE,
				hidden: game => game.rotation !== 0,
			},
			{
				// offsetX: -5,
				src: ASSETS.MACHINE, col: 1, row: 2,
				index: game => game.getSituation("zoom-vending-machine").grabbedBottle ? 1 : 0,
				tip: "Looks like a vending machine. There's a big hole in it.",
				onClick: game => game.gotoScene("zoom-vending-machine"),
				hidden: game => game.rotation !== 0,
			},
			{
				// offsetX: -5,
				name: "coin 1",
				src: ASSETS.COIN_1,
				hidden: (game,{name}) => game.data.pickedUp[name] || game.rotation !== 0,
				onClick: (game, {name}) => {
					game.data.pickedUp[name] = game.now;
					game.pickUp({item:"coin", image:ASSETS.GRAB_COIN, message:""});
				},
			},
			{
				name: "coin 2",
				src: ASSETS.COIN_2,
				hidden: (game,{name}) => game.data.pickedUp[name] || game.rotation !== 0,
				onClick: (game, {name}) => {
					game.data.pickedUp[name] = game.now;
					game.pickUp({item:"coin", image:ASSETS.GRAB_COIN, message:""});
				},
			},
			// {
			// 	src: ASSETS.SPEECH_OUT,
			// 	offsetY: 15,
			// 	hidden: game => game.bagOpening || game.useItem || game.pendingTip,
			// 	index: game => Math.min(3, Math.floor((game.now - game.sceneTime) / 80)),
			// },
			...standardBag(),
			...standardMenu(),
		],
	},
);