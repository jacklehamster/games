gameConfig.scenes.push(
		{
			name: "lock-zoom",
			onScene: game => {
				game.save();
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
					if (code === "2505") {
						game.data.lock_unlocked = game.now;
						game.playSound(SOUNDS.DUD);
						game.showTip("Looks like the right combination!", game => {
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
					src: ASSETS.LOCK_DIGIT, col: 3, row: 3,
					index: game => game.situation.digit1 || 0,
					onClick: game => {
						if (game.data.lock_unlocked) {
							return;
						}
						game.situation.digit1 = ((game.situation.digit1||0) + 1) % 8;
					},
				},
				{
					src: ASSETS.LOCK_DIGIT, col: 3, row: 3,
					offsetX: 11,
					index: game => game.situation.digit2 || 0,
					onClick: game => {
						if (game.data.lock_unlocked) {
							return;
						}
						game.situation.digit2 = ((game.situation.digit2||0) + 1) % 8;
					},
				},
				{
					src: ASSETS.LOCK_DIGIT, col: 3, row: 3,
					offsetX: 22,
					index: game => game.situation.digit3 || 0,
					onClick: game => {
						if (game.data.lock_unlocked) {
							return;
						}
						game.situation.digit3 = ((game.situation.digit3||0) + 1) % 8;
					},
				},
				{
					src: ASSETS.LOCK_DIGIT, col: 3, row: 3,
					offsetX: 33,
					index: game => game.situation.digit4 || 0,
					onClick: game => {
						if (game.data.lock_unlocked) {
							return;
						}
						game.situation.digit4 = ((game.situation.digit4||0) + 1) % 8;
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