gameConfig.scenes.push(
	{
		name: "zoom-hottub",
		onScene: game => {
			game.hideCursor = true;
			
			game.sceneData.frames = [
				{ time: 5000 },
				
			];


			game.sceneData.frames = [
				[ 0, 20 ],
				[ 1, 8, game => {
					game.sceneData.hitman.visible = false;
					game.waitCursor = false;
				} ],
				[ 2, 8 ],
				[ 3, 1 ],
				[ 4, 8 ],
				[ 5, 5, game => {
					game.sceneData.hitman.visible = true;
					game.sceneData.hitman.speed = 1/4;
				} ],
			];
			for (let i = 1; i < frames.length; i++) {
				frames[i][1] += frames[i-1][1];
			}			
		},
		onSceneRefresh: game => {
			if (game.sceneData.frames) {
				const frame = Math.floor((game.now - game.sceneTime) / 100);
				for (let index = 0; index < game.sceneData.frames.length; index++) {
					if (frame < game.sceneData.frames[index][1]) {
						if (game.sceneData.frames[index][2] && !game.sceneData.frames[index][3]) {
							const fun = game.sceneData.frames[index][2];
							fun(game);
							game.sceneData.frames[index][3] = true;
						}
						break;
					}
				}
			}
		},
		sprites: [
			{
				init: ({sceneData}) => {
					sceneData.stars = new Array(100).fill(null).map(() => {
						return {
							x: (Math.random() - .5) * 64,
							y: (Math.random() - .5) * 64,
							size: .2,
						};
					});
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
			},
			{
				src: ASSETS.HOTTUP_CLOSE_UP, col: 4, row: 4,
			},
		],
	},
);