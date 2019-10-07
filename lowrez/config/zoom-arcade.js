gameConfig.scenes.push(
	{
		name: "zoom-arcade",
		arrowGrid: [
			[null, null,  MENU,  null, null ],
			[],
			[ null, null, null,  null, null ],
			[ null, null, null,  null, null ],
			[ null, null, BAG ,  null, null ],
		],
		onScene: ({sceneData, now, situation}) => {
			sceneData.hand = {
				dx: 0,
				dy: 0,
				lastMove: 0,
			};
			if (!situation.highscores) {
				situation.highscores = [
					{ score: HIGHSCORE, player: 0 },
					{ score: 1075, 	player: 1 },
					{ score: 210, 	player: 2 },
					{ score: 135, 	player: 3 },
					{ score: 95, 	player: 4 },
				];
			}

			sceneData.gameStarted = 0;
			situation.coin = situation.coin || 0;
			sceneData.score = 0;
			sceneData.missiles = [];
			sceneData.alienMissiles = [];
			sceneData.dusts = [];
			sceneData.aliens = [
				{orgX:21, orgY:16, nextShot:now + 5000 * Math.random(), born:0, destroyed:now+3000},
				{orgX:30, orgY:16, nextShot:now + 5000 * Math.random(), born:0, destroyed:now+4000},
				{orgX:40, orgY:16, nextShot:now + 5000 * Math.random(), born:0, destroyed:now+3000},
			];
			sceneData.gameScreen = {
				x: 17, y: 9,
				width: 28, height: 32,
			};
			const { gameScreen } = sceneData;
			sceneData.stars = new Array(10).fill(null).map(() => {
				return {
					x: Math.floor(Math.random()*gameScreen.width + gameScreen.x),
					y: Math.floor(Math.random()*gameScreen.height + gameScreen.y),
					dy: Math.random()/4,
				};
			});
			sceneData.ship = {
				x: gameScreen.x + gameScreen.width / 2,
				y: gameScreen.y + gameScreen.height - 2,
				born: now,
				destroyed: 0,
				lives: 2,
			};
		},
		onSceneRefresh: game => {
			const { sceneData, situation, now } = game;
			const { gameScreen, hand } = sceneData;
			const { showHighScore } = situation;
			if (showHighScore) {
				return;
			}
			if (situation.putCoin && now - situation.putCoin > 400) {
				situation.putCoin = 0;
				game.playSound(SOUNDS.DUD);	
				game.situation.coin = (game.situation.coin||0) + 1;
			}

			if (sceneData.gameStarted) {
				const { ship } = sceneData;
				if (game.mouse) {
					const { x, y } = game.mouse;
					const { gameScreen } = sceneData;
					if (x >= gameScreen.x + 1 && x <= gameScreen.x + gameScreen.width - 2 && y >= gameScreen.y + 10 && y <= gameScreen.y + gameScreen.height - 2) {
						const dx = x - ship.x;
						const dy = y - ship.y;
						if (dx !== 0 || dy !== 0) {
							hand.dx = dx;
							hand.dy = dy;
							hand.lastMove = now;
						}
						ship.x = x;
						ship.y = y;
					}
				}

				if (ship.destroyed && now - ship.destroyed > 8000) {
					if (ship.lives > 0) {
						ship.x = gameScreen.x + gameScreen.width / 2;
						ship.y =  gameScreen.y + gameScreen.height - 2;
						ship.born = now;
						ship.destroyed = 0;
						ship.lives --;
					} else if (sceneData.score > situation.highscores[situation.highscores.length-1].score && !situation.showHighScore) {
						situation.highscores[situation.highscores.length-1] = { score: sceneData.score, player: 4 };
						situation.highscores.sort((a,b) => b.score-a.score);
						situation.showHighScore = now;
						situation.gotHighScore = now;
						game.showTip(`That was fun!`);
						game.playTheme(null);
					} else if(!situation.showHighScore) {
						sceneData.gameStarted = 0;
						if (!ship.lives && ship.destroyed && sceneData.score <= situation.highscores[situation.highscores.length-1].score) {
							game.showTip(`Darn it! I can do better. I wanna play again`);
							game.playTheme(null);
						}
					}
				}

				const maxDistDown = ship.destroyed 
					? Math.min(15, Math.max(5000 + ship.destroyed - now, 0) / 100)
					: Math.min(15, (now - ship.born) / 3000 * 15);
				sceneData.aliens.forEach(alien => {
					if (alien.destroyed) {
						if (now > alien.destroyed + 2000) {
							alien.destroyed = 0;
							alien.born = now;
						} else {
							return;
						}
					}
					const time = now - alien.born;
					alien.x = Math.round(3 * Math.sin(time / 500) + alien.orgX);
					alien.y = Math.round(alien.orgY + Math.max(0, Math.sin(time / 2000)) * maxDistDown);
					if (now > alien.nextShot) {
						alien.nextShot = now + Math.random() * 5000;
						if (!ship.destroyed) {
							sceneData.alienMissiles.push({
								x: alien.x,
								y: alien.y,
							});
						}
					}
				});

				sceneData.stars.forEach(star => {
					star.y += star.dy;
					if (star.y > gameScreen.y + gameScreen.height) {
						star.y = gameScreen.y;
						star.x = Math.floor(Math.random()*gameScreen.width + gameScreen.x);
						star.dy = Math.random()/4;
					}
				});		
				sceneData.missiles.forEach(missile => missile.y-=1);
				sceneData.alienMissiles.forEach(missile => missile.y+=.5);

				sceneData.dusts.forEach(dust => {
					dust.x += dust.dx;
					dust.y += dust.dy;
				});

				sceneData.missiles.forEach(missile => {
					const {x, y} = missile;
					sceneData.aliens.forEach(alien => {
						if (alien.destroyed) {
							return;
						}
						if (Math.abs(alien.x - x)<=2 && Math.abs(alien.y - y)<=2) {
							alien.destroyed = now;
							missile.destroyed = now;
							game.playSound(SOUNDS.HIT_LAND);
							sceneData.score = Math.min(9999, sceneData.score + 5);
							for (let i = 0; i < 5; i++) {
								sceneData.dusts.push({
									x: alien.x,
									y: alien.y,
									dx: Math.random()-.5,
									dy: -Math.random(),
									color: "#cc6699",
								});
							}
						}
					});
				});

				if (!ship.destroyed) {
					sceneData.alienMissiles.forEach(missile => {
						const {x, y, destroyed} = missile;
						if (destroyed) {
							return;
						}
						if (Math.abs(ship.x - x)<=1 && Math.abs(ship.y - y)<=2) {
							ship.destroyed = now;
							missile.destroyed = now;
							game.playSound(SOUNDS.PLAYER_HURT);
							for (let i = 0; i < 10; i++) {
								sceneData.dusts.push({
									x: ship.x,
									y: ship.y,
									dx: (Math.random()-.5) * 2,
									dy: (Math.random()-.5) * 2,
									color: "#4488aa",
								});
							}							
						}
					});

					sceneData.aliens.forEach(({x, y, destroyed}) => {
						if (destroyed) {
							return;
						}
						if (Math.abs(ship.x - x)<=2 && Math.abs(ship.y - y)<=2) {
							ship.destroyed = now;
							game.playSound(SOUNDS.PLAYER_HURT);
							for (let i = 0; i < 10; i++) {
								sceneData.dusts.push({
									x: ship.x, y: ship.y,
									dx: (Math.random()-.5) * 2,
									dy: (Math.random()-.5) * 2,
									color: "#4488aa",
								});
							}							
						}
					});
				}

				sceneData.missiles = sceneData.missiles.filter(({x, y, destroyed}) => y > gameScreen.y + 2);
				sceneData.alienMissiles = sceneData.alienMissiles.filter(({y,destroyed}) => !destroyed && y <= gameScreen.y + gameScreen.height);
				sceneData.dusts = sceneData.dusts.filter(({x, y}) => {
					return x < gameScreen.x + gameScreen.width && x > gameScreen.x
					&& y < gameScreen.y + gameScreen.height && y > gameScreen.y;
				});
			}
		},
		customCursor: game => {
			const { x, y } = game.mouse;
			const { sceneData, situation } = game;
			const { gameScreen, gameStarted } = sceneData;
			if (gameStarted && !situation.showHighScore) {
				if (x >= gameScreen.x && x <= gameScreen.x + gameScreen.width && y >= gameScreen.y && y <= gameScreen.y + gameScreen.height) {
					return Cursor.NONE;
				} else {
					return Cursor.WAIT;
				}
			}
		},
		sprites: [
			{
				custom: (game, sprite, ctx) => {
					ctx.fillStyle = "#7E7A18";
					ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
				},
				onClick: ({sceneData, situation}) => {
					const { gameStarted } = sceneData;
					const { showHighScore } = situation;
					if (!gameStarted || showHighScore) {
						game.gotoScene("arcade-room");
					}
				},
			},
			{ 
				src: ASSETS.ZOOM_ARCADE,
				combine: (item, game) => {
					if (item === "coin") {
						game.situation.putCoin = game.now;
						game.removeFromInventory(item);
						game.useItem = null;
						return true;
					}
				},
			},
			{
				hidden: ({situation, sceneData}) => !sceneData.gameStarted,
				custom: (game, sprite, ctx) => {
					const { sceneData, situation } = game;
					const { gameScreen } = sceneData;
					const { showHighScore } = situation;
					if (showHighScore) {
						return;
					}
					ctx.fillStyle = "#000012";
					ctx.fillRect(gameScreen.x, gameScreen.y, gameScreen.width, gameScreen.height);

					ctx.fillStyle = "#222233";
					sceneData.stars.forEach(({x,y}) => {
						ctx.fillRect(Math.round(x),Math.round(y),1,1);
					});		

					ctx.lineWidth = 1;

					const { ship } = sceneData;
					{
						ctx.strokeStyle = "#4488aa";
						ctx.beginPath();
						const { x, y, destroyed } = ship;
						if (!destroyed) {
							const px = Math.round(x)+.5;
							const py = Math.round(y)+.5;

							ctx.moveTo(px, py);
							ctx.lineTo(px-1, py+2);
							ctx.lineTo(px+1, py+2);
							ctx.lineTo(px, py);
						}
						for (let i = 0; i < ship.lives; i++) {
							const lx = gameScreen.x + 1 + i * 4 + .5, ly = gameScreen.y + 1 + .5;
							ctx.moveTo(lx, ly);
							ctx.lineTo(lx-1, ly+2);
							ctx.lineTo(lx+1, ly+2);
							ctx.lineTo(lx, ly);
						}
						ctx.stroke();
					}

					ctx.strokeStyle = "#FFFFFF";
					ctx.beginPath();
					sceneData.missiles.forEach(({x,y,destroyed}) => {
						if (destroyed) {
							return;
						}
						ctx.moveTo(x,y);
						ctx.lineTo(x,y-3);
					});
					ctx.stroke();

					ctx.strokeStyle = "#FFFF99";
					ctx.lineWidth = .5;
					ctx.beginPath();
					sceneData.alienMissiles.forEach(({x,y,destroyed}) => {
						if (destroyed) {
							return;
						}
						ctx.moveTo(x+.5,y);
						ctx.lineTo(x+.5,y-2);
					});
					ctx.stroke();

					ctx.fillStyle = "#cc6699";
					sceneData.aliens.forEach(({x,y,destroyed}) => {
						if (destroyed) {
							return;
						}
						ctx.beginPath();
						ctx.moveTo(x+.5,y+.5-2);
						ctx.lineTo(x+.5+2,y+.5);
						ctx.lineTo(x+.5,y+.5+2);
						ctx.lineTo(x+.5-2,y+.5);
						ctx.closePath();
						ctx.fill();
					});

					sceneData.dusts.forEach(({x,y,color}) => {
						ctx.fillStyle = color;
						ctx.fillRect(x,y,1,1);
					});
				},
				onClick: game => {
					const {sceneData, situation, now} = game;
					const { gameScreen, ship, gameStarted, missiles } = sceneData;
					const { showHighScore } = situation;
					ship.lastShot = now;
					if (gameStarted) {
						const { x, y } = game.mouse;
						if (missiles.length > 2) {
							return;
						}
						if (x >= gameScreen.x && x <= gameScreen.x + gameScreen.width && y >= gameScreen.y && y <= gameScreen.y + gameScreen.height) {
							if (!ship.destroyed) {
								game.playSound(SOUNDS.LAZER);
								const px = Math.round(ship.x)+.5;
								const py = Math.round(ship.y)+.5;
								missiles.push({x:px, y:py});
							}
						}
					}
				},
				tip: ({sceneData}) => sceneData.gameStarted ? null : "That looks like a fun game!",
			},
			{
				hidden: ({situation,sceneData}) => !sceneData.gameStarted,
				custom: (game, sprite, ctx) => {
					const { sceneData, situation } = game;
					const { score } = sceneData;
					const { showHighScore } = situation;
					if (showHighScore) {
						return;
					}
					const ALIEN_DIGIT_0 = 1000;

					const str = game.toAlienDigits(score, 4);

					game.displayTextLine(ctx, {
						msg: str,
						x:30, y:9,
					});
				},
			},
			{
				src: ASSETS.FLASH_SCREEN, col: 2, row: 2,
				hidden: ({situation, now, sceneData}) => {
					const { ship } = sceneData;
					const { gameStarted } = sceneData;
					return gameStarted && now >= gameStarted && (ship.lives || !ship.destroyed);
				},
				index: ({situation, now, sceneData}) => {
					const { showHighScore } = situation;
					if (showHighScore) {
						return 3;
					}

					const { ship } = sceneData;
					if (situation.coin && !sceneData.gameStarted) {
						return Math.floor(now / 500) % 2;
					} else if (sceneData.gameStarted && sceneData.gameStarted > now) {
						return Math.floor(now / 80) % 2;
					}
					return !ship.lives && ship.destroyed && sceneData.gameStarted ? 2 : 0;
				},
				combineMessage: (item, game) => {
					if (item === "coin") {
						return "That goes into the coin slot.";
					} else {
						return `I can't use ${item} like that.`;
					}
				},
				combine: (item, game) => {
					if (item === "coin") {
						game.situation.putCoin = game.now;
						game.removeFromInventory(item);
						game.useItem = null;
						return true;
					}
				},
				onHover: ({sceneData, now}) => {
					sceneData.hoverScreen = now;
					sceneData.hoverOutScreen = 0;
				},
				onHoverOut: ({sceneData, now}) => {
					sceneData.hoverScreen = 0;
					sceneData.hoverOutScreen = now;
				},
				onClick: (game) => {
					const {sceneData, now, situation} = game;
					const { ship, aliens } = sceneData;
					if (situation.coin > 0 && !sceneData.gameStarted) {
						const splashTime = 2500;
						sceneData.gameStarted = now + splashTime;
						sceneData.score = 0;
						situation.coin --;
						ship.destroyed = 0;
						ship.lastShot = now;
						ship.born = now;
						ship.lives = 2;
						aliens[0].destroyed = now  + splashTime + 3000;
						aliens[1].destroyed = now + splashTime + 4000;
						aliens[2].destroyed = now + splashTime + 3000;
						game.playTheme(null);
						game.playSound(SOUNDS.JINGLE);
						game.delayAction(() => game.playTheme(SOUNDS.BATTLE_THEME, {volume:.7}), 2500);
					} else if (situation.showHighScore) {
						ship.lastShot = now;
						game.playSound(SOUNDS.ERROR);
						if (situation.initial === 2) {
							situation.showHighScore = 0;
							situation.initial = 0;
							ship.destroyed = 0;
							sceneData.gameStarted = 0;
						} else {
							situation.initial = (situation.initial||0) + 1;
						}
					}
				},
			},
			{
				hidden: ({situation}) => !situation.showHighScore,
				custom: ({sceneData, situation}, sprite, ctx) => {
					const { gameScreen } = sceneData;
					const { showHighScore } = situation;
					const ALIEN_DIGIT_0 = 1000;
					for (let i = 0; i < situation.highscores.length; i++) {
						let s = situation.highscores[i].score;
						let str = "";
						while (s > 0 || str.length < 4) {
							const num = s % 10;
							str = ALPHAS[ALIEN_DIGIT_0 + s % 10].char + str;
							s = Math.floor(s / 10);
						}

						game.displayTextLine(ctx, {
							msg: str,
							x: gameScreen.x + 14, y: gameScreen.y + 2 + i * 6,
						});
					}
				},
			},
			{
				hidden: ({situation, now, sceneData}) => sceneData.gameStarted && now >= sceneData.gameStarted,
				custom: (game, sprite, ctx) => {
					const { sceneData, situation } = game;
					const { score } = sceneData;
					const { showHighScore } = situation;
					if (showHighScore) {
						return;
					}
					const ALIEN_DIGIT_0 = 1000;

					let s = score;
					let str = `${ALPHAS[ALIEN_DIGIT_0 + Math.min(9, situation.coin||0)].char}/${ALPHAS[ALIEN_DIGIT_0 + 1].char}`;

					game.displayTextLine(ctx, {
						msg: str,
						x:27, y:35,
					});
				},
			},
			{
				src: ASSETS.TOP_5, col: 3, row: 4,
				index: 0,
				offsetY: ({situation}, {index})=> {
					const { highscores } = situation;
					for (let i = 0; i < highscores.length; i++) {
						if (highscores[i].player === index) {
							return i * 6;
						}
					}
					return 0;
				},
				hidden: game => !game.situation.showHighScore,
			},
			{
				src: ASSETS.TOP_5, col: 3, row: 4,
				index: 1,
				offsetY: ({situation}, {index})=> {
					const { highscores } = situation;
					for (let i = 0; i < highscores.length; i++) {
						if (highscores[i].player === index) {
							return i * 6;
						}
					}
					return 0;
				},
				hidden: game => !game.situation.showHighScore,
			},
			{
				src: ASSETS.TOP_5, col: 3, row: 4,
				index: 2,
				offsetY: ({situation}, {index})=> {
					const { highscores } = situation;
					for (let i = 0; i < highscores.length; i++) {
						if (highscores[i].player === index) {
							return i * 6;
						}
					}
					return 0;
				},
				hidden: game => !game.situation.showHighScore,
			},
			{
				src: ASSETS.TOP_5, col: 3, row: 4,
				index: 3,
				offsetY: ({situation}, {index})=> {
					const { highscores } = situation;
					for (let i = 0; i < highscores.length; i++) {
						if (highscores[i].player === index) {
							return i * 6;
						}
					}
					return 0;
				},
				hidden: game => !game.situation.showHighScore,
			},
			{
				src: ASSETS.TOP_5, col: 3, row: 4,
				index: ({now, situation}) => {
					const index = 4 + (situation.initial||0) * 2;
					return Math.floor(now / 200) % 2 + index;
				},
				offsetY: ({situation}, {index})=> {
					const { highscores } = situation;
					for (let i = 0; i < highscores.length; i++) {
						if (highscores[i].player === 4) {
							return i * 6;
						}
					}
					return 0;
				},
				hidden: game => !game.situation.showHighScore,
			},
			{
				src: ASSETS.COINSTART,
				index: game => Math.min(3, Math.floor((game.now - game.situation.putCoin) / 100)),
				hidden: game => !game.situation.putCoin,
			},
			{
				src: ASSETS.ARCADE_HANDS,
				side: LEFT,
				offsetY: ({sceneData,now,situation}) => {
					const { coin, showHighScore } = situation;
					if (sceneData.gameStarted) {
						const { hand } = sceneData;
						if (hand.lastMove && now - hand.lastMove < 50) {
							return hand.dy < 0 ? 0 : hand.dy > 0 ? 2 : 1;
						}
					} else if ((coin || showHighScore) && sceneData.hoverScreen) {
						const diff = now - sceneData.hoverScreen;
						return Math.max(0, 40 - diff / 5);
					} else if ((coin || showHighScore) && sceneData.hoverOutScreen) {
						const diff = now - sceneData.hoverOutScreen;
						return Math.max(0, diff / 5);
					} else {
						return 40;
					}
				},
				offsetX: ({sceneData,now}) => {
					const { hand } = sceneData;
					if (hand.lastMove && now - hand.lastMove < 100) {
						return hand.dx < 0 ? -2 : hand.dx > 0 ? 0 : -1;
					}
					return 0;
				},
			},
			{
				src: ASSETS.ARCADE_HANDS,
				side: RIGHT,
				offsetY: ({sceneData, now, situation}) => {
					const { coin, showHighScore } = situation;
					const { ship } = sceneData;
					const buttonDown = ship.lastShot && now - ship.lastShot < 100 ? 1 : 0;
					if (sceneData.gameStarted) {
						return buttonDown;
					} else if ((coin || showHighScore) && sceneData.hoverScreen) {
						const diff = now - sceneData.hoverScreen;
						return Math.max(0, 40 - diff / 5) + buttonDown;
					} else if ((coin || showHighScore) && sceneData.hoverOutScreen) {
						const diff = now - sceneData.hoverOutScreen;
						return Math.max(0, diff / 5);
					} else {
						return 40;
					}
				},
			},
			...standardBag(),
		],
	},
);