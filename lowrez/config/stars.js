gameConfig.scenes.push(
	{
		name: "stars",
		onScene: game => {
			game.hideCursor = true;
			const { sceneData } = game;
			game.playTheme(SOUNDS.SOUP_CHOU_THEME, {volume: .7});
			sceneData.stars = new Array(40).fill(null).map(() => {
				return {
					x: (Math.random() - .5) * 64,
					y: (Math.random() - .5) * 64,
					size: .2,
				};
			});
			game.delayAction(game => game.hideCursor = false, 10000);
		},
		onSceneRefresh: game => {
			const { sceneData, now, sceneTime } = game;
			sceneData.stars.forEach(star => {
				star.x *= 1.01;
				star.y *= 1.01;
				star.size *= 1.01;
				if (star.size >= 1.5) {
					star.size = 1.5;
				}
				if (Math.abs(star.x) > 32 || Math.abs(star.y) > 32) {
					star.x = (Math.random() - .5) * 64;
					star.y = (Math.random() - .5) * 64;
					star.size = .2;
				}
			});
			if (now - sceneTime > 5000 && now - sceneTime < 10000) {
				game.playTheme(SOUNDS.SOUP_CHOU_THEME, {volume: .7 - Math.min(.3, now - sceneTime - 5000)});
			}
		},
		sprites: [
			{
				custom: (game, sprite, ctx) => {
					ctx.fillStyle = "#000022";
					ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
					ctx.fillStyle = "#FFFFFF";
					const { sceneData } = game;
					sceneData.stars.forEach(({x, y, size}) => {
						ctx.fillRect(32 + x, 32 + y, size, size);
					});
				},
			},
			{
				src: ASSETS.HOTTUB,
				frame: ({now}) => Math.floor(now / 1000),
				alpha: ({now, sceneTime}) => Math.min(1, Math.max(0, now - sceneTime - 5000) / 3000),
				scale: ({now, sceneTime}) => {
					const dx = Math.max(0, now - sceneTime - 5000) / 4000;
					return 4 / Math.min(4, dx * dx);
				},
				offsetX: (game, sprite) => 32 - 32 * game.evaluate(sprite.scale),
				offsetY: (game, sprite) => 16 - 16 * game.evaluate(sprite.scale),
			},
			...standardMenu(),
			...standardBag(),		
		],
	},
);