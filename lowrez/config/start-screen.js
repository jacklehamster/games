gameConfig.scenes.push(
	{
		name: "start-screen",
		sprites: [
			{
				custom: (game, sprite, ctx) => ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height),
			},
			... (new Array(4).fill(null).map((a, index) => {
				return {
					index,
					isSaveFile: true,
					custom: ({sceneData}, {index, hoverTime}, ctx) => {
						if (sceneData.loadSave) {
							const { img } = sceneData.loadSave[index];
							ctx.drawImage(img, 2 + index % 2 * 32, 2 + Math.floor(index / 2) * 32);
							if (hoverTime) {
								ctx.beginPath();
								ctx.lineWidth = "2px"
								ctx.strokeStyle = "#aaccff";
								ctx.rect(2 + index % 2 * 32, 2 + Math.floor(index / 2) * 32, 28, 28);
								ctx.stroke();														
							}
						}
					},
					onClick: (game, {index}) => {
						const {sceneData} = game;
						game.load(sceneData.loadSave[index].name);
					},
					hidden: ({sceneData, dialog}, sprite) => !dialog || dialog.index !== 2 || !sceneData.loadSave || !sceneData.loadSave[sprite.index],
				};
			})),
			{
				src: ASSETS.MOON_BASE,
				hidden: ({dialog}) => dialog && dialog.index === 2,
			},
			{
				src: ASSETS.MOON_BASE_GUARD, col: 1, row: 2,
				side: LEFT,
				index: ({now, sceneTime}) => Math.floor((now - sceneTime) / 1000) % 2,
				offsetX: ({now, sceneTime}) => -15 + Math.floor((now - sceneTime) / 1000) % 75,
				offsetY: -2,
				hidden: ({dialog}) => dialog && dialog.index === 2,
			},
			{
				src: ASSETS.MOON_BASE_GUARD, col: 1, row: 2,
				side: RIGHT,
				index: ({now, sceneTime}) => Math.floor((now - sceneTime) / 1000) % 2,
				offsetX: ({now, sceneTime}) => +15 - Math.floor((now - sceneTime) / 1000) % 75,
				hidden: ({dialog}) => dialog && dialog.index === 2,
			},
		],
		onScene: game => {
			game.playTheme(SOUNDS.FUTURE_SONG_THEME, {volume: .5});
			const list = game.getSaveList();
			game.sceneData.loadSave = {};
			for (let name in list) {
				if (name !== "last") {
					const { image } = list[name];
					const img = new Image();
					img.src = image;
					game.sceneData.loadSave[name] = { img, name, };
				}
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
								hidden: ({sceneData}) => Object.keys(sceneData.loadSave).length,
							},
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
								hidden: ({sceneData}) => !Object.keys(sceneData.loadSave).length,
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
							{
								msg: game => `Sound ${!game.mute?"ON":"OFF"}`,
								onSelect: (game, dialog) => game.mute = !game.mute,
							},
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
			game.gameLoaded = true;
		},
	},
);