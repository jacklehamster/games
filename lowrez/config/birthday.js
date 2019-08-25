gameConfig.scenes.push(
	{
		name: "birthday",
		onScene: game => {
			game.waitCursor = true;
			if (!game.data.seen["writing"]) {
				game.data.seen["writing"] = game.now;
				game.showTip(["Hey, it looks like I carved a birthday cake on the wall.", "I can't remember but could it be... it's my BIRTHDAY?!"],
					game => {
						game.gotoScene("jail-cell");
						game.rotation = 6;
					}
				);
			} else {
				game.showTip("♪♪ Happy\nbirthday\nto me ♪♪", game => {
					game.gotoScene("jail-cell");
					game.rotation = 6;
				});
			}
		},
		sprites: [
			{
				src: ASSETS.BIRTHDAY,
			},
		],
	},
);