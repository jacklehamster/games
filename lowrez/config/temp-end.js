gameConfig.scenes.push(
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
