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
		},
		sprites: [
			...getRoomMaze("_BLUE"),
			{
				src: ASSETS.VENDING_MACHINE,
				hidden: game => game.rotation !== 0,
			},
			{
				src: ASSETS.MACHINE, col: 2, row: 2,
				index: game => {
					return (game.getSituation("zoom-vending-machine").grabbedBottle ? 1 : 0)
					 | (game.getSituation("zoom-vending-machine").grabbedApple ? 2 : 0);
				},
				tip: "Looks like a vending machine. There's a big hole in it.",
				onClick: game => game.gotoScene("zoom-vending-machine"),
				combine: (item, game) => {
					if (item === "coin") {
						game.gotoScene("zoom-vending-machine");
						game.useItem = item;
						return true;
					}
				},
				hidden: game => game.rotation !== 0,
			},
			{
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
				init: ({now, data}, {name}) => {
					data.pickedUp[name] = now;
				},
			},
			{
				name: "coin 3",
				src: ASSETS.COIN_2,
				offsetX: -5,
				offsetY: 1,
				hidden: (game,{name}) => game.data.pickedUp[name] || game.rotation !== 0,
				onClick: (game, {name}) => {
					game.data.pickedUp[name] = game.now;
					game.pickUp({item:"coin", image:ASSETS.GRAB_COIN, message:""});
				},
				init: ({now, data}, {name}) => {
					data.pickedUp[name] = now;
				},
			},
			...standardMenu(),
			...standardBag(),
		],
	},
);