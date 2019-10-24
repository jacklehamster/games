gameConfig.scenes.push(
		{
			name: "outside-carnage",
			onScene: game => {
				game.playTheme(SOUNDS.FUTURE_SONG_THEME, {volume: .8});
				game.sceneData.hitman = {
					pos: { x: 64/2, y: 12, },
					goal: { x: 64/2, y: 32, },
					visible: true,
					speed: 1/6,
					direction: 4,
					anim: [
						[12,13,14,15],	//	N
						[16,17,18,19],	//	NW
						[24,25,26,27],	//	W
						[4,5,6,7],		//	SW
						[0,1,2,3],		//	S
						[8,9,10,11],	//	SE
						[28,29,30,31],	//	E
						[20,21,22,23],	//	NE
					],
				};
				game.sceneData.yupa = {
					pos: { x: 64/2, y: 12, },
					visible: false,
					speed: 1/6,
					dist: 20,
					moving: false,
				};
			},
			onSceneRefresh: game => {
				const { pos, goal, speed } = game.sceneData.hitman;
				const dx = pos.x > goal.x ? -1 : pos.x < goal.x ? 1 : 0;
				const dy = pos.y > goal.y ? -1 : pos.y < goal.y ? 1 : 0;
				if (Math.abs(pos.x-goal.x) >= 1 || Math.abs(pos.y-goal.y) >= 1) {
					const dist = Math.sqrt(dx*dx + dy*dy);
					pos.x += dx * Math.min(Math.abs(pos.x - goal.x), speed / dist);
					pos.y += dy * Math.min(Math.abs(pos.y - goal.y), speed / dist);
					if (pos.y >= 80 && !game.waitCursor) {
						game.waitCursor = true;
					}
				} else {
					pos.x = goal.x;
					pos.y = goal.y;
					if (pos.y >= 120 && !game.fade) {
						game.fadeToScene("landscape");
					}
				}
				const { yupa, hitman } = game.sceneData;
				if (hitman && yupa) {
					const dx = hitman.pos.x - yupa.pos.x;
					const dy = hitman.pos.y - yupa.pos.y;
					const dist = Math.sqrt(dx*dx + dy*dy);
					if (dist > yupa.dist) {
						yupa.pos.x += dx / dist * yupa.speed;
						yupa.pos.y += dy / dist * yupa.speed;
						yupa.moving = true;
					} else {
						yupa.moving = false;
					}
				}
			},
			arrowGrid: [
				[ null, null, MENU,  null, null ],
				[],
				[],
				[],
				[ null, null, BAG, null, null ],
			],
			sprites: [
				{
					src: ASSETS.OUTSIDE_BG,
					noHighlight: game => game.mouse.y < 55,
					onClick: game => {
						const { pos, goal } = game.sceneData.hitman;
						game.sceneData.frames.length = 0;
						game.sceneData.hitman.visible = true;
						game.sceneData.hitman.speed = 1/4;
						if (game.mouseDown) {
							if (game.mouse.y > 55) {
								goal.x = Math.round(game.mouse.x);
								goal.y = 120;
							} else {
								goal.x = Math.round(game.mouse.x);
								goal.y = Math.round(game.mouse.y);
							}
						}
					},
				},
				{
					onScene: game => {
						game.waitCursor = true;
						game.playTheme(SOUNDS.FUTURE_SONG_THEME, {volume: .7});
						const frames = [
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
					src: ASSETS.OUTSIDE_CARNAGE, col: 3, row: 4,
					index: game => {
						if (game.sceneData.hitman.visible) {
							return 0;
						}
						const frame = Math.floor((game.now - game.sceneTime) / 100);
						for (let index = 0; index < game.sceneData.frames.length - 1; index++) {
							if (frame < game.sceneData.frames[index][1]) {
								return index;
							}
						}
						return game.sceneData.frames.length - 1;
					},
				},
				{
					src: ASSETS.YUPA_WALK, size:[16, 32], col: 3, row: 2,
					offsetX: ({sceneData}) => Math.round(sceneData.yupa.pos.x - 8),
					offsetY: ({sceneData}) => Math.round(sceneData.yupa.pos.y - 32),
					index: game => game.sceneData.yupa.moving ? Math.floor(game.now/100) % 4 : 0,
					hidden: game => !game.sceneData.hitman.visible,
				},
				{
					src: ASSETS.HITMAN_WALK, size:[16,32], col: 6, row: 6,
					offsetX: ({sceneData}) => sceneData.hitman.pos.x - 8,
					offsetY: ({sceneData}) => sceneData.hitman.pos.y - 32,
					index: game => {
						const { pos, goal, anim } = game.sceneData.hitman;
						const dx = pos.x > goal.x ? -1 : pos.x < goal.x ? 1 : 0;
						const dy = pos.y > goal.y ? -1 : pos.y < goal.y ? 1 : 0;
						const moving = Math.abs(pos.x-goal.x) >= 1 || Math.abs(pos.y-goal.y) >= 1;
						const animation = game.getAnimation(dx, dy);
						const frame = moving ? Math.floor(game.now/100) % 4 : 0;
						return anim[animation][frame];
					},
					hidden: game => !game.sceneData.hitman.visible,
				},
				{
					offsetX: ({sceneData}) => sceneData.hitman.pos.x - 8,
					offsetY: ({sceneData}) => sceneData.hitman.pos.y - 32,
					src: ASSETS.HITMAN_BEARD_WALK, size:[16,32], col: 6, row: 6,
					index: game => {
						const { pos, goal, anim } = game.sceneData.hitman;
						const dx = pos.x > goal.x ? -1 : pos.x < goal.x ? 1 : 0;
						const dy = pos.y > goal.y ? -1 : pos.y < goal.y ? 1 : 0;
						const moving = Math.abs(pos.x-goal.x) >= 1 || Math.abs(pos.y-goal.y) >= 1;
						const animation = game.getAnimation(dx, dy);
						const frame = moving ? Math.floor(game.now/100) % 4 : 0;
						return anim[animation][frame];
					},
					hidden: game => !game.sceneData.hitman.visible,
				},
				...standardMenu(),
				...standardBag(),
			],
		},
);