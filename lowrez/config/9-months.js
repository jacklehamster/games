gameConfig.scenes.push(
	{
		name: "9-months",
		onScene: game => {
			game.playTheme(SOUNDS.CHIN_TOK_THEME, {volume: .8});
			game.hideCursor = true;
		},
		sprites: [
			{
				custom: (game, sprite, ctx) => {
					ctx.clearRect(0, 0, 64, 64);
				},
			},
			{
				custom: (game, sprite, ctx) => {
					ctx.globalAlpha = game.evaluate(sprite.alpha);
					game.displayTextLine(ctx, {msg: "9 MONTHS", x: 10, y: 22});
					game.displayTextLine(ctx, {msg: "LATER", x: 17, y: 29});
					ctx.globalAlpha = 1;
				},
				hidden: game => game.now - game.sceneTime >= 10000 || game.now === game.sceneTime,
				alpha: game => {
					const time = game.now - game.sceneTime;
					return time < 5000 ? Math.min(1, time / 3000) : Math.max(0, 1 - (time - 5000) / 3000);
				},
			},
		],
	},
);