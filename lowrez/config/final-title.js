gameConfig.scenes.push(
	{
		name: "final-title",
		onScene: game => {
			game.hideCursor = true;
			game.data.theEnd = game.now + 3000;
			game.playTheme(SOUNDS.FUTURE_SONG_THEME);
		},
		sprites: [
			{
				custom: (game, sprite, ctx) => ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height),
			},
			{
				ending: true,
			},
		],
	},
);