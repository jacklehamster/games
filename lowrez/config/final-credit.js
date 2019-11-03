gameConfig.scenes.push(
	{
		name: "final-credit",
		onScene: game => {
			game.playTheme(SOUNDS.SOFT_THEME, {volume: .8});
			game.hideCursor = true;
			game.sceneData.credits = `${game.title||" Where in Space is\n  BABY HITLER"}



				A game from
				DOBUKI STUDIO
				by
				Jack Le Hamster

				Coded in JavaScript
				with Sublime Text
				Art made with Piskel
				Music made with BeepBox
				Sound effects made with VoiceChanger.io and Brfx

				This game is a sequel to Kill Baby Hitler. The first part of this game was releazed for
				#LOWREZJAM\n2019\nas Escape from Labbyrithe.

				I worked more on this game to continue the story, until the point where you reach Baby Hitler.
				
				Of course, you didn't reach Baby Hitler since you weaseled out.

				(I'm kidding, it was the noble thing to do.)

				Anyway, thanks for playing.
				Please make sure to follow my games, share them, and say great things about them to your family and friends.

				You have finished the game, with
				NOBLE ENDING.

				Humanity has been spared Hitler, thanks to you.

				The course of mankind has been altered.

				For better or worst?

				Who knows...

				Thanks for playing.
			`.split("\n").map((a, index) => index > 2 ? game.wordwrap(a.trim(), 9) : a).join("\n").split("\n");
		},
		onSceneRefresh: game => {
			const shift = - (game.now - game.sceneTime) / 200 + 50;
			if (game.sceneData.credits.length * 6 + shift < 10) {
				if (!game.sceneData.showYupa) {
					game.sceneData.showYupa = game.now;
				}
			}
		},
		sprites: [
			{
				custom: (game, sprite, ctx) => {
					ctx.fillStyle = `#000000`;
					ctx.fillRect(0, 0, 64, 64);
				},
			},
			{
				src: ASSETS.YUPA_DANCE, col: 4, row: 4,
				scale: game => Math.min(1, Math.pow(Math.max(.01, game.now - game.sceneData.showYupa) / 5000, 2)),
				offsetX: (game, {scale}) => 32 - 32 * game.evaluate(scale),
				offsetY: (game, {scale}) => 32 - 32 * game.evaluate(scale),
				index: (game, {scale}) => {
					const {dialog, now, pendingTip, moving} = game;
					if (pendingTip && pendingTip.talker === "yupa") {
						return 8 + (pendingTip.progress < 1 ? Math.floor(now / 100) % 3: 0);
					}
					return game.evaluate(scale) < 1 ? Math.floor(now / 120) % 4 + 12 : 0;
				},
				onRefresh: (game, {scale}) => {
					if (!game.sceneData.yupaTalk && game.evaluate(scale) >= 1) {
						game.playSound(SOUNDS.YUPA);
						game.sceneData.yupaTalk = game.now;
						game.showTip([
							"Hey, ya still here!",
							"Im glad ya stuck arownd",
							"I know ya feel good abowt yarself",
							"Ya made the nuble choize, saving mankind",
							"Yadi yada",
							"Letz be real. Ya curius abowt findin Baby Hitler, rite?",
							"Juz hit dat tryagain buttun and letz go find da baby, for goat steak!!!",
						], game => {
							game.gameOver();
						}, null, {
							talker: "yupa",
						});
					}
				},
				hidden: game => !game.sceneData.showYupa,
			},
			{
				custom: (game, sprite, ctx) => {
					const shift = - (game.now - game.sceneTime) / 200 + 50;
					game.sceneData.credits.forEach((line, index) => {
						const y = index * 6 + shift;
						if (y > 0 && y < 55) {
							game.displayTextLine(ctx, {
								msg: line,
								x:1, y: Math.round(y),
								alpha: Math.max(0.05, Math.min(.8, y/5, (55 - y)/5)),
							});
						}
					});
				},
			},
		],
	},
);