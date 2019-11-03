gameConfig.scenes.push(
	{
		name: "evening-date",
		onScene: game => {
			game.playTheme(SOUNDS.SOFT_THEME, {volume: .8});
			game.hideCursor = true;
			game.delayAction(game => {
				game.showTip([
					"We spent that evening together ...",
					"I told her all the stories of my childhood ...",
					"things I never told anyone ...",
					"I really felt at peace ...",
					"All my stress, all my anger ... everything started fading away ...",
					"At that moment, deep inside my heart, I knew only one thing for sure ...",
					"I would be ...",
					"without a shadow of a doubt ...",
				], game => {
					game.fadeOut(game.now, {duration:5000, fadeDuration:5000, color:"#000000"});
					game.showTip([
						" ... spending the rest of my life by her side.",
					], game => {
						game.delayAction(game => {
							game.gotoScene("morning-after");
						}, 1000);
					}, 120);
				}, 100);
			}, 8000);
		},
		onSceneRefresh: game => {
			if (game.now - game.sceneTime <= 10000) {
				game.fade = Math.min(1, 1 - (game.now - game.sceneTime) / 5000);
			}
		},
		sprites: [
			{
				src: ASSETS.EVENING_DATE,
			},
		],
	},
);