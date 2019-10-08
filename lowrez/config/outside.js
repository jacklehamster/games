gameConfig.scenes.push(
		{
			name: "outside",
			sprites: [
				{
					src: ASSETS.OUTSIDE_BG,
				},
				{
					offsetY: game => Math.round((game.now - game.sceneTime)/100)-20,
					offsetX: (64-16) / 2,
					src: ASSETS.HITMAN_WALK, size:[16,32], col: 6, row: 6,
					index: game => Math.floor(game.now/100) % 4,
					hidden: game => game.now - game.sceneTime >= 2000,
				},
				{
					offsetY: game => Math.round((game.now - game.sceneTime)/100)-20,
					offsetX: (64-16) / 2,
					src: ASSETS.HITMAN_BEARD_WALK, size:[16,32], col: 6, row: 6,
					index: game => Math.floor(game.now/100) % 4,
					hidden: game => game.now - game.sceneTime >= 2000,
				},
				{
					onScene: game => {
						game.hideCursor = true;
						game.playTheme(SOUNDS.FUTURE_SONG_THEME, {volume: .8});
						const frames = [
							[ 0, 20 ],
							[ 0, 8 ],
							[ 1, 8 ],
							[ 2, 1 ],
							[ 3, 8 ],
							[ 4, 5 ],
							[ 5, 10 ],
							[ 6, 2 ],
							[ 7, 8 ],
							[ 8, 10, game => {
								game.playSound(SOUNDS.GUN_SHOT);
								game.delayAction(game => game.playSound(SOUNDS.GUN_SHOT), 50);
								game.delayAction(game => game.playSound(SOUNDS.GUN_SHOT), 100);
							} ],
							[ 9, 1, game => {
								game.delayAction(game => {
									game.hideCursor = false;
									game.gameOver(" “Discretion\n   ain't my forte.”");
								}, 3000);
							} ],
						];
						for (let i = 1; i < frames.length; i++) {
							frames[i][1] += frames[i-1][1];
						}
						game.sceneData.frames = frames;
					},
					onRefresh: game => {
						if (game.data.gameOver) {
							game.fade = Math.min(.7, Math.max(0, (game.now - game.data.gameOver) / 1000));
						}

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
					src: ASSETS.OUTSIDE, col: 3, row: 4,
					index: game => {
						const frame = Math.floor((game.now - game.sceneTime) / 100);
						for (let index = 0; index < game.sceneData.frames.length - 1; index++) {
							if (frame < game.sceneData.frames[index][1]) {
								return index;
							}
						}
						return game.sceneData.frames.length - 1;
					},
				},
			],
		},
);