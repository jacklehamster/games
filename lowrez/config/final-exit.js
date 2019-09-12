gameConfig.scenes.push(
	{
		name: "final-exit",
		arrowGrid: [
			[null, null,  MENU,  null, null ],
			[ null, null, s(4),  null, null ],
			[ null, null, s(4),  null, null ],
			[ null, null, s(4),  null, null ],
			[ null, null, BAG ,  null, null ],
		],
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
							{ msg: "LEAVE", onSelect: game => {
								const fadeDuration = 1000;
								game.fadeOut(game.now, {duration:fadeDuration * 1.5, fadeDuration, color:"#000000", onDone: game => {
									game.gotoScene("maze-4", {door:2})
								}});
							}},
						],
					},
				],
			});
		},
		onSceneRefresh: game => {
			if (!game.sceneData.forwardUnlocked && game.situation.openGate && (game.situation.openGate - game.now) / 1000 < -15) {
				game.sceneData.forwardUnlocked = game.now;
			}
		},
		onSceneForward: game => {
			if (!game.sceneData.clickedExit) {
				game.hideCursor = true;
				game.sceneData.clickedExit = true;
				const fadeDuration = 3000;
				game.fadeOut(game.now, {duration:fadeDuration * 1.5, fadeDuration, color:"#FFFFFF", onDone: game => {
					game.gotoScene("congrats");
				}});
			}
		},
		sprites: [
			{
				src: ASSETS.OUTDOOR,
				hidden: game => !game.situation.openGate,
			},
			{
				src: ASSETS.GATE,
				offsetY: game => !game.situation.openGate ? 0 : Math.max(-20, (game.situation.openGate - game.now) / 1000),
			},
			{
				src: ASSETS.FINAL_EXIT,
			},
			{
				name: "scanner",
				src: ASSETS.SCAN_CARD, col: 1, row: 2,
				combine: (item, game) => {
					if (item === "access card") {
						game.useItem = null;
						game.playSound(SOUNDS.DRINK);
						game.situation.openGate = game.now;
						game.dialog = null;
						return true;
					}
				},
			},
			{
				src: ASSETS.SPEECH_OUT,
				offsetY: 9,
				hidden: game => game.situation.openGate || game.bagOpening || game.useItem || game.pendingTip,
				index: game => Math.min(3, Math.floor((game.now - game.sceneTime) / 80)),
			},
			...standardMenu(),
			...standardBag(),
		],
	},
);