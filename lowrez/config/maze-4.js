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
				[ LEFT, null, BACKWARD, null, RIGHT ],
			],
			map: `
				XXXXXXXXXXX
				X1.......2X
				XXXXXXXXXXX
			`,
			sprites: [
				{
					custom: (game, sprite, ctx) => ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height),
				},
				...getCommonMaze("_1"),
				...standardMenu(),
			],
			doors: {
				1: {
					scene: "maze-3",
					exit: (game, {scene}) =>  game.fadeToScene(scene, {door:2}, 1000),
				},
				2: {
					scene: "final-exit",
					exit: (game, {scene}) =>  game.fadeToScene(scene, null, 1000),
				},
			},
		},
);