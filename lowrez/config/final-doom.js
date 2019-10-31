gameConfig.scenes.push(
	{
		name: "final-doom",
		onScene: game => {
			game.playTheme(null);
			game.hideCursor = true;
			game.showTip([
				"This time, they let me go for real.",
				"I close my eyes, and waited to fade away.",
				"Turns out, it wasn't painful at all.",
				"That drug to simulate death was just a scam.",
				"As my spirit fades away",
				"I felt ...",
				"absolutely NOTHING.",
			], game => {
				game.gotoScene("final-credit");
			}, 100, {maxLines: 10});
		},
		sprites: [
			{
				custom: (game, sprite, ctx) => {
					ctx.fillStyle = `#000000`;
					ctx.fillRect(0, 0, 64, 64);
				},
			},
		],
	},
);