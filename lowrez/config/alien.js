gameConfig.scenes.push(
	{
		name: "alien",
		onScene: game => {
			game.hideCursor = true;
		},
		onSceneRefresh: game => {
			const frame = Math.floor((game.now - game.sceneTime) / 100) - 10;
			if (frame < 15) {
				game.sceneData.frame = 0;
			} else if (frame < 25) {
				game.sceneData.frame = 1;					
			} else if (frame < 33) {
				game.sceneData.frame = 0;
			} else if (frame < 35) {
				game.sceneData.frame = 2;
			} else if (frame < 70) {
				game.sceneData.frame = 3 + frame % 3;
			} else if (frame < 75) {
				game.sceneData.frame = 3;
			} else if (frame < 90) {
				game.sceneData.frame = 6;
			} else if (frame < 120) {
				game.sceneData.frame = 6 + Math.min(4, Math.floor((frame - 90)));
			} else if (frame < 150) {
				game.sceneData.frame = 10 + Math.floor((game.now - game.sceneTime) / 10) % 4;
			} else if (frame < 200) {
				if (!game.sceneData.explode) {
					game.playSound(SOUNDS.GUN_SHOT);
					game.delayAction(game => game.playSound(SOUNDS.GUN_SHOT), 50);
					game.delayAction(game => game.playSound(SOUNDS.GUN_SHOT), 50);
					game.sceneData.explode = game.now;
					game.sceneData.pieces = new Array(500).fill(null).map(a => {
						const byte = Math.max(0x10, Math.floor(Math.random() * 0xaa)).toString(16);
						const color = `#cc${byte}${byte}`;
						const size = Math.random() < .5 ? 1 : 2;

						const p = {
							x: [26 + 10 * (Math.random()-.5)],
							y: [30 + Math.random()*2],
							dx: Math.random() - .5,
							dy: -Math.random() * 3,
							size,
							color,
							appear: game.now + 4000 * Math.random(),
						};
						return p;
					});
				}
				game.sceneData.frame = 14;
			} else if (frame < 240) {
				game.sceneData.frame = Math.min(24, frame - 200 + 17);
				if (!game.sceneData.alienSound) {
					game.sceneData.alienSound = true;
					game.playSound(SOUNDS.ALIEN);					
				}
			} else {
				if (!game.data.gameOver) {
					game.gameOver(" “That was\n             not cake!”");
				}
			}
		},
		sprites: [
			{
				src: ASSETS.ALIEN_EATER, col: 5, row: 5,
				index: game => game.sceneData.frame || 0,
			},
			{
				custom: (game, sprite, ctx) => {
					if (game.sceneData.explode) {
						const pieces = game.sceneData.pieces || [];
						pieces.forEach(piece => {
							const { x, y, preX, preY, dx, dy, size, color, appear } = piece;
							if (appear < game.now) {
								ctx.fillStyle = color;
								for (let i = 0; i < x.length; i++) {
									ctx.fillRect(x[i], y[i], size - i*.1, size - i*.1);
								}
								if (x.length < 5) {
									x.push(x[x.length-1]);
									y.push(y[y.length-1]);
								}
								for (let i = x.length-1; i>=1; i--) {
									x[i] = x[i-1];
									y[i] = y[i-1];
								}
								piece.x[0] += dx;
								piece.y[0] += dy;
								piece.dy+= .15;
							}
						});
					}
				},
			},
		],
	},
);