gameConfig.scenes.push(
	{
		name: "maze",
		onScene: game => {
			game.playTheme(SOUNDS.CHIN_TOK_THEME, {volume: .2});
			game.save();
		},
		arrowGrid: [
			[null, null,  MENU, null, null ],
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
			...getCommonMaze("_BLUE_1"),
			...standardMenu(),
		],
		doors: {
			1: {
				scene: "jail-cell",
				exit: (game, {scene}) => {
					game.fadeToScene(scene, null, game.hasVisited(scene) ? 1000 : 3000);
				},
			},
			2: {
				scene: "maze-2",
				exit: (game, {scene}) => game.fadeToScene(scene, {door:1}, 1000),
			},
		},
	},	
);