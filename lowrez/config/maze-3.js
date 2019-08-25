gameConfig.scenes.push(
		{
			name: "maze-3",
			onScene: game => {
				game.save();
			},
			arrowGrid: [
				[],
				[],
				[ null, null, s(2),     null, null  ],
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
				...getCommonMaze("1"),
			],
			doors: {
				1: {
					scene: "maze-2",
					exit: (game, {scene}) => {
						const fadeDuration = 1000;
						game.fadeOut(game.now, {duration:fadeDuration * 1.5, fadeDuration, color:"#000000", onDone: game => {
							game.gotoScene(scene, {door:5});
						}});
					},
				},
				2: {
					scene: "maze-4",
					exit: (game, {scene}) => {
						const fadeDuration = 1000;
						game.fadeOut(game.now, {duration:fadeDuration * 1.5, fadeDuration, color:"#000000", onDone: game => {
							game.gotoScene(scene, {door:1});
						}});
					},
				},
				3: {
					scene: "locker-room",
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