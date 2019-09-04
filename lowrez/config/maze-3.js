gameConfig.scenes.push(
		{
			name: "maze-3",
			onScene: game => {
				game.save();
			},
			arrowGrid: [
				[null, null,  MENU, null, null ],
				[],
				[ LEFT, null, s(2),     null, RIGHT ],
				[ LEFT, null, s(1),     null, RIGHT ],
				[ LEFT, null, BACKWARD, null, RIGHT ],
			],
			map: `
				XXXXXXXXXXXX
				X.........XX
				X.XXXXXXX.XX
				X.XX3.....XX
				X.XXXXXXX.XX
				X.X.......MX
				X.X.XX.XX.XX
				X.X1XX.XX.XX
				X.XXXX.XX.XX
				X......XX2XX
				XXXXXXXXXXXX
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
					scene: "maze-2",
					exit: (game, {scene}) =>  game.fadeToScene(scene, {door:5}, 1000),
				},
				2: {
					scene: "maze-4",
					exit: (game, {scene}) =>  game.fadeToScene(scene, {door:1}, 1000),
				},
				3: {
					scene: "locker-room",
					exit: (game, {scene}) =>  game.fadeToScene(scene, null, 1000),
				},
			},
		},
);