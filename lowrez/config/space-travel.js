gameConfig.scenes.push(
	{
		name: "space-travel",
		onScene: game => {
			game.hideCursor = true;
		},
		sprites: [
			{
				init: (game, sprite) => {
					game.playTheme(SOUNDS.FUTURE_SONG_THEME, {volume: .7});

					const {sceneData} = game;
					sceneData.stars = new Array(100).fill(null).map(() => {
						return {
							x: (Math.random() - .5) * 64,
							y: (Math.random() - .5) * 64,
							size: .2,
						};
					});
					for (let i = 0; i < 100; i++) {
						sprite.onRefresh(game, sprite);
					}

					game.delayAction(game => {
						game.fadeToScene("sarlie-planet");
					}, 6000);
				},
				onRefresh: (game, sprite) => {
					const { sceneData, now, sceneTime } = game;
					sceneData.stars.forEach(star => {
						star.x *= 1.01;
						star.y *= 1.01;
						star.size *= 1.01;
						if (star.size > 1) {
							star.size = 1;
						}
						if (Math.abs(star.x) > 32 || Math.abs(star.y) > 32) {
							star.x = (Math.random() - .5) * 64;
							star.y = (Math.random() - .5) * 64;
							star.size = .2;
						}
					});
				},
				custom: (game, sprite, ctx) => {
					ctx.fillStyle = "#000022";
					ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
					ctx.fillStyle = "#FFFFFF";
					const { sceneData } = game;
					sceneData.stars.forEach(({x, y, size}) => {
						ctx.fillRect(32 + x, 32 + y, size, size);
					});
				},
				hidden: ({sceneData}) => !sceneData.stars,
			},
			{
				src: ASSETS.SPACESHIP, col: 1, row: 2,
				scale: game => {
					const timeProgress = Math.max(0, 1 - (Math.max(0, game.now - game.sceneTime - 2000) / 3000));
					return timeProgress * timeProgress;
				},
				offsetX: (game, sprite) => 10 + 20 - game.evaluate(sprite.scale) * 20,
				offsetY: (game, sprite) => 5 + 20 - game.evaluate(sprite.scale) * 20,
				hidden: (game, sprite) => !game.evaluate(sprite.scale),
			},
			...standardMenu(),
			...standardBag(),		
		],
	},
);