gameConfig.scenes.push(
	{
		name: "i-have-no-hand",
		onScene: game => {
			game.hideCursor = true;
			game.playTheme(SOUNDS.GOGOL);
			game.delayAction(game => {
				game.playSound(SOUNDS.HUM);
				game.showTip("No left hand!")
			}, 2000);			
			game.delayAction(game => {
				game.gotoScene("zoom-hottub-2");
			}, 5000);
		},
		sprites: [
			{
				src: ASSETS.HUMAN_NO_HAND,
				index: game => game.pendingTip && game.pendingTip.progress < 1 ? Math.floor(game.now / 100) % 4 : 0,
			},
			{
				src: ASSETS.NO_HAND,
				offsetY: game => Math.max(0, 10 - Math.round(10 * (game.now - game.sceneTime)/1000)),
			}
		],
	},
);