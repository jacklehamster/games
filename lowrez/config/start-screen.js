gameConfig.scenes.push(
	{
		name: "start-screen",
		sprites: [
			{
				custom: (game, sprite, ctx) => ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height),
			},
			{
				custom: ({sceneData}, sprite, ctx) => {
					if (sceneData.savedImages && sceneData.savedImages.length) {
						const image = sceneData.savedImages[0];
						ctx.drawImage(image, 0, 0);
					}
				},
			},
			{
				src: ASSETS.MOON_BASE,
				hidden: game => game.dialog && game.dialog.index === 2,
			},
		],
		onScene: game => {
			const list = game.getSaveList();
			game.sceneData.savedImages = [];
			for (let name in list) {
				const { image } = list[name];
				const img = new Image();
				img.src = image;
				game.sceneData.savedImages.push(img);
			}

			const backSelection = {
				msg: "Back",
				onSelect: (game, dialog) => dialog.index = 0,
			};
			game.startDialog({
				time: game.now,
				index: 0,
				highlightColor: "#00998899",
				conversation: [
					{
						options: [
							{
								msg: "New Game",
								onSelect: game => {
									game.dialog = null;
									game.hideCursor = true;
									const fadeDuration = 3000;
									game.fadeOut(game.now, {duration:fadeDuration * 1.5, fadeDuration, color:"#000000", onDone: game => {
										game.gotoScene("jail-cell")
									}});
								}
							},
							{
								msg: "Load",
								onSelect: (game, dialog) => dialog.index = 2,
							},
							{
								msg: "Options",
								onSelect: (game, dialog) => dialog.index = 1,
							},
						],
					},
					{
						options: [
							{},
							{
								msg: () => `Retro mode ${scanlines.checked?"ON":"OFF"}`,
								onSelect: (game, dialog) => scanlines.click(),
							},
							backSelection,
						],
					},
					{
						options: [
							{},
							{},
							backSelection,
						],
					}
				],
			});
		},
	},
);