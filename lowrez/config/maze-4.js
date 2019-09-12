gameConfig.scenes.push(
	{
		name: "maze-4",
		onScene: game => {
			game.save();
		},
		arrowGrid: [
			[ null, null, MENU, 	null, null ],
			[],
			[ LEFT, null, s(2),     null, RIGHT ],
			[ LEFT, null, s(1),     null, RIGHT ],
			[ LEFT, null, s(9),	    null, RIGHT ],
		],
		map: `
			XXXXXXXXXXX
			XXXXX3XXXXX
			XXXXX.XXXXX
			X1.......2X
			XXXXXXXXXXX
		`,
		sprites: [
			{
				custom: (game, sprite, ctx) => ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height),
			},
			...getCommonMaze("_BLUE_1"),
			...standardMenu(),
			...standardBag(),
		],
		doors: {
			1: {
				scene: "maze-3",
				exit: (game, {scene}) =>  game.fadeToScene(scene, {door:2}, 1000),
			},
			2: {
				lock: true,
				wayUp: true,
				scene: "cell-maze", door: 2,
				exit: (game, {scene, door}) => {
					game.fadeToScene(scene, {door}, 1000);
				},
			},
			3: {
				scene: "first-prison-cell",
				exit: (game, {scene}) =>  game.fadeToScene(scene, null, 1000),
			},
		},
	},
);