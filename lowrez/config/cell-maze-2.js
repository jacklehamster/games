gameConfig.scenes.push(
	{
		name: "cell-maze-2",
		onScene: game => {
			game.save();
		},
		arrowGrid: [
			[ null, null, MENU,  null, null ],
			[],
			[ LEFT, null, s(2), null, RIGHT ],
			[ LEFT, s(7), s(8), s(7), RIGHT ],
			[ LEFT, s(7), s(9), s(7), RIGHT ],
		],
		map: `
			XXXXXXXXXXX
			X5.......XX
			XXXXXXXXXXX
		`,
		sprites: [
			{
				custom: (game, sprite, ctx) => ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height),
			},
			...getCommonMaze("_1"),
			...standardBattle(),
			...standardMenu(),
			...standardBag(),
		],
		... makeOnSceneBattle(),
		doors: {
			5: {
				wayDown: true,
				scene: "cell-maze", door: 5,
				exit: (game, {scene, door}) =>  game.fadeToScene(scene, {door}, 1000),
			},
		},
		events: {
		},
	},
);