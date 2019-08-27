gameConfig.scenes.push(
		{
			name: "maze-4",
			onScene: game => {
				game.save();
			},
			arrowGrid: [
				[ null, null, MENU, 	null, null ],
				[],
				[ null, null, s(2),     null, null  ],
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
					exit: (game, {scene}) => {
						const fadeDuration = 1000;
						game.fadeOut(game.now, {duration:fadeDuration * 1.5, fadeDuration, color:"#000000", onDone: game => {
							game.gotoScene(scene, {door:2});
						}});
					},
				},
				2: {
					scene: "final-exit",
					exit: (game, {scene}) => {
						const fadeDuration = 1000;
						game.fadeOut(game.now, {duration:fadeDuration * 1.5, fadeDuration, color:"#000000", onDone: game => {
							game.gotoScene(scene);
						}});
					},
				},
			},
		},
);