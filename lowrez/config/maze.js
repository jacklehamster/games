gameConfig.scenes.push(
	{
		name: "maze",
		onScene: game => {
			game.playTheme(SOUNDS.CHIN_TOK_THEME, {volume: .2});
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
			XXXXXXXX
			X.....XX
			XX.XX.XX
			XX1XX.XX
			XXXXX2XX
			XXXXXXXX
		`,
		sprites: [
			{
				custom: (game, sprite, ctx) => ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height),
			},
			...getCommonMaze("BLUE_1"),
		],
		doors: {
			1: {
				scene: "jail-cell",
				exit: (game, {scene}) => {
					const fadeDuration = game.hasVisited(scene) ? 1000 : 3000;
					game.fadeOut(game.now, {duration:fadeDuration * 1.5, fadeDuration, color:"#000000", onDone: game => {
						game.gotoScene(scene);
					}});
				},
			},
			2: {
				scene: "maze-2",
				exit: (game, {scene}) => {
					const fadeDuration = 1000;
					game.fadeOut(game.now, {duration:fadeDuration * 1.5, fadeDuration, color:"#000000", onDone: game => {
						game.gotoScene(scene, {door:1});
					}});
				},
			},
		},
	},	
);