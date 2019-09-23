gameConfig.scenes.push(
	{
		name: "final-corridor",
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
			XXXXXXXXXXXX
			X5....C...1X
			XXXXXXXXXXXX
		`,
		sprites: [
			{
				custom: (game, sprite, ctx) => ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height),
			},
			...getCommonMaze("_1"),

			makeYupa(),
			...standardBattle(),
			...standardMenu(),
			...standardBag(),
		],
		... makeOnSceneBattle(),
		doors: {
		},
		events: {
			'C': {
				blocking: true,
				ceilinghole: true,
				showBag: true,
				onEvent: (game, event) => {

				},
			},
		},
	},
);