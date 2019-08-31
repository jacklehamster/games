gameConfig.scenes.push(
	{
		name: "arcade-room",
		arrowGrid: [
			[null, null,  MENU, null, null ],
			[],
			[],
			[],
			[],
		],		
		onScene: game => {
			game.save();
			game.playTheme(SOUNDS.CHIN_TOK_THEME, {volume: .2});
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
								const fadeDuration = 1000;
								game.fadeOut(game.now, {duration:fadeDuration * 1.5, fadeDuration, color:"#000000", onDone: game => {
									game.gotoScene("maze-2", {door:4})
								}});
							}},
						],
					},
				],
			});
		},
		sprites: [
			{
				src: ASSETS.ARCADE_ROOM,
			},
			{
				src: ASSETS.ARCADE,
				onClick: game => game.gotoScene("zoom-arcade"),
			},
			{
				src: ASSETS.SPEECH_OUT,
				offsetY: 15,
				hidden: game => game.bagOpening || game.useItem || game.pendingTip,
				index: game => Math.min(3, Math.floor((game.now - game.sceneTime) / 80)),
			},
			...standardMenu(),
		],
	},
);