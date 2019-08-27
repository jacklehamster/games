gameConfig.scenes.push(
		{
			name: "toilet-zoom",
			sprites: [
				{
					src: ASSETS.TOILET_ZOOM_BACKGROUND,
					onClick: game => game.gotoScene("toilets"),
				},
				{
					src: ASSETS.TOILET_ZOOM,
					offsetX: -3, offsetY: -3,
					onClick: game => {
						game.startDialog({
							time: game.now,
							index: 0,
							conversation: [
								{
									message: "",
									options: [
										{},
										{ msg: "Sit on toilet", onSelect: game => {
											game.gotoScene("toilet-monster");
										}},
										{ msg: "CANCEL", onSelect: game => {
											game.dialog = null;
										}},
									],
								},
							],
						});
					},
				},
				{
					src: ASSETS.SPEECH_OUT,
					offsetY: 9,
					hidden: game => game.pendingTip || !game.dialog,
					index: game => Math.min(3, Math.floor((game.now - game.sceneTime) / 80)),
				},
			],
		},

);