gameConfig.scenes.push(
	{
		name: "leo-end",
		onScene: game => game.showTip("Congrats Leo, you reached the end so far. I didn't program the rest yet."),
		sprites: [
			{ fade: 1, fadeColor: "#cc5588" }
		],
	},
	{
		name: "temp-end",
		onScene: game => {
			game.showTip("Thanks for playing so far. I will unlock the rest of the game once I've completed it.", game => {
				game.gameOver();
			});
		},
		sprites: [
			{ fade: 1, fadeColor: "#5588cc" }
		],
	},
);