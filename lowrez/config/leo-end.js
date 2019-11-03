gameConfig.scenes.push(
	{
		name: "leo-end",
		onScene: game => game.showTip("Congrats Leo, you reached the end so far. I didn't program the rest yet."),
		sprites: [
			{ fade: 1, fadeColor: "#cc5588" }
		],
	},
);
