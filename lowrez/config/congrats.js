gameConfig.scenes.push(
		{
			name: "congrats",
			onScene: game => {
				game.fade = 0;
				game.hideCursor = true;
				game.showTip([
					"Congratulation, you win!",
					"This game was produced for #LOWREZJAM\n2019.",
					"By Jack Le\nHamster (that's\nme applauding and looking very impressed).",
					"I didn't actually finished making this game, which is supposed to be a sequel to a previous game I made.",
					"But please come back again and follow this game's progress.",
					"Hopefully, when I'm done, you can play the game as it was meant to be...",
				], game => {
					const fadeDuration = 3000;
					game.fadeOut(game.now, {duration:fadeDuration * 1.5, fadeDuration, color:"#000000", onDone: game => {
						game.gotoScene("final-title");
					}});
				});
			},
			sprites: [
				{
					src: "assets/congrats.png|darken", col: 3, row: 3,
					index: ({now}) => Math.floor(now / 100) % 9,
				},
			],
		},
);