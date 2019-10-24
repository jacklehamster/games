gameConfig.scenes.push(
		{
			name: "lock-zoom",
			onScene: game => {
				// game.save();
				// game.showTip(!game.getSituation("zoom-arcade").gotHighScore 
				// 	? "The combination seems to be in alien symbols."
				// 	: "Where have I seen those?...", null, null, {removeLock: true})
				game.startDialog({
					time: game.now,
					index: 0,
					conversation: [
						{
							message: "",
							options: [
								{ },
								{ },
								{ msg: "LEAVE", onSelect: game => {
									game.gotoScene("locker-room");
								}},
							],
						},
					],
				});
			},
			onSceneRefresh: (game) => {
				const { situation } = game;
				if (!game.data.lock_unlocked) {
					const code = [situation.digit1||0, situation.digit2||0, situation.digit3||0, situation.digit4||0].join("");
					if (code === HIGHSCORE + "") {
						game.data.lock_unlocked = game.now;
						game.playSound(SOUNDS.DUD);
						game.delayAction(game=> {
							game.playSound(SOUNDS.DUD);
						}, 150);
						game.showTip("It's the right combination!", game => {
							game.gotoScene("locker-room");
						});
					}
				}
			},
			sprites: [
				{
					src: ASSETS.LOCK_BACK,
				},
				{
					name: "digit1",
					custom: (game, {name}, ctx) => {
						const ALIEN_DIGIT_0 = 1000;

						const num = game.situation[name] || 0;
						let msg = ALPHAS[ALIEN_DIGIT_0 + num].char;
						ctx.fillStyle = "#224455";
						ctx.fillRect(16,33,5,8);
						game.displayTextLine(ctx, {
							msg,
							x:17 + (num===1 || num===3 ? 1 : 0), y:35,
						});
					},
					onClick: (game, {name}) => {
						if (game.data.lock_unlocked) {
							return;
						}
						game.playSound(SOUNDS.DUD);
						game.situation[name] = ((game.situation[name]||0) + 1) % 10;
						const { situation } = game;
						const code = [situation.digit1||0, situation.digit2||0, situation.digit3||0, situation.digit4||0].join("");
						console.log(code);
						game.pendingTip = null;
					},
				},
				{
					name: "digit2",
					custom: (game, {name}, ctx) => {
						const ALIEN_DIGIT_0 = 1000;

						const num = game.situation[name] || 0;
						let msg = ALPHAS[ALIEN_DIGIT_0 + num].char;
						ctx.fillStyle = "#224455";
						ctx.fillRect(26,33,5,8);
						game.displayTextLine(ctx, {
							msg,
							x:27 + (num===1 || num===3 ? 1 : 0), y:35,
						});
					},
					onClick: (game, {name}) => {
						if (game.data.lock_unlocked) {
							return;
						}
						game.playSound(SOUNDS.DUD);
						game.situation[name] = ((game.situation[name]||0) + 1) % 10;
						const { situation } = game;
						const code = [situation.digit1||0, situation.digit2||0, situation.digit3||0, situation.digit4||0].join("");
						console.log(code);
						game.pendingTip = null;
					},
				},
				{
					name: "digit3",
					custom: (game, {name}, ctx) => {
						const ALIEN_DIGIT_0 = 1000;

						const num = game.situation[name] || 0;
						let msg = ALPHAS[ALIEN_DIGIT_0 + num].char;
						ctx.fillStyle = "#224455";
						ctx.fillRect(35,33,5,8);
						game.displayTextLine(ctx, {
							msg,
							x:36 + (num===1 || num===3 ? 1 : 0), y:35,
						});
					},
					onClick: (game, {name}) => {
						if (game.data.lock_unlocked) {
							return;
						}
						game.playSound(SOUNDS.DUD);
						game.situation[name] = ((game.situation[name]||0) + 1) % 10;
						const { situation } = game;
						const code = [situation.digit1||0, situation.digit2||0, situation.digit3||0, situation.digit4||0].join("");
						console.log(code);
						game.pendingTip = null;
					},
				},
				{
					name: "digit4",
					custom: (game, {name}, ctx) => {
						const ALIEN_DIGIT_0 = 1000;

						const num = game.situation[name] || 0;
						let msg = ALPHAS[ALIEN_DIGIT_0 + num].char;
						ctx.fillStyle = "#224455";
						ctx.fillRect(45,33,5,8);
						game.displayTextLine(ctx, {
							msg,
							x:46 + (num===1 || num===3 ? 1 : 0), y:35,
						});
					},
					onClick: (game, {name}) => {
						if (game.data.lock_unlocked) {
							return;
						}
						game.playSound(SOUNDS.DUD);
						game.situation[name] = ((game.situation[name]||0) + 1) % 10;

						const { situation } = game;
						const code = [situation.digit1||0, situation.digit2||0, situation.digit3||0, situation.digit4||0].join("");
						console.log(code);
						game.pendingTip = null;
					},
				},
				{
					src: ASSETS.SPEECH_OUT,
					offsetY: 15,
					hidden: game => game.bagOpening || game.useItem || game.pendingTip,
					index: game => Math.min(3, Math.floor((game.now - game.sceneTime) / 80)),
				},
			],
		},
);