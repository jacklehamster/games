gameConfig.scenes.push(
	{
		name: "disk-screen",
		sprites: [
			{
				custom: (game, sprite, ctx) => ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height),
			},
			... (new Array(4).fill(null).map((a, index) => {
				return {
					index,
					isSaveFile: true,
					custom: ({sceneData}, {index}, ctx) => {
						if (sceneData.loadSave) {
							const { img } = sceneData.loadSave[index];
							ctx.drawImage(img, 2 + index % 2 * 32, 2 + Math.floor(index / 2) * 32);
						}
					},
					hidden: ({sceneData}, sprite) => !sceneData.loadSave || !sceneData.loadSave[sprite.index],
				};
			})),
			... (new Array(4).fill(null).map((a, index) => {
				return {
					index,
					isSaveFile: true,
					custom: ({sceneData}, {index, hoverTime}, ctx) => {
						if (sceneData.loadSave) {
							const left = 2 + index % 2 * 32;
							const top = 2 + Math.floor(index / 2) * 32;
							const width = 28, height = 28;
							const x = left + width/2 - 6;
							const y = top + height / 2 - 8;

							ctx.fillStyle = hoverTime ? "#8888cc" : "#000088bb";
							ctx.fillRect(x-1, y-1, 15, 7);
							game.displayTextLine(ctx, {
								msg: "load",
								x, y,
							});
						}
					},
					onClick: (game, {index}) => {
						const {sceneData} = game;
						game.load(index);
					},
					hidden: ({sceneData}, sprite) => !sceneData.loadSave || !sceneData.loadSave[sprite.index],
				};
			})),
			... (new Array(4).fill(null).map((a, index) => {
				return {
					index,
					isSaveFile: true,
					custom: ({sceneData}, {index, hoverTime}, ctx) => {
						if (sceneData.loadSave) {
							const left = 2 + index % 2 * 32;
							const top = 2 + Math.floor(index / 2) * 32;
							const width = 28, height = 28;
							const x = left + width/2 - 10;
							const y = top + height / 2 + 6;

							ctx.fillStyle = hoverTime ? "#cc8888" : "#880000bb";
							ctx.fillRect(x-1, y-1, 22, 7);
							game.displayTextLine(ctx, {
								msg: "delete",
								x, y,
							});
						}
					},
					onClick: (game, {index}) => {
						const returnScene = game.sceneData.returnScene;
						const screenshot = game.sceneData.screenshot;
						game.deleteSave(index);
						game.gotoScene("disk-screen");
						game.sceneData.returnScene = returnScene;
						game.sceneData.screenshot = screenshot;
					},
					hidden: ({sceneData}, sprite) => !sceneData.loadSave || !sceneData.loadSave[sprite.index],
				};
			})),
			... (new Array(4).fill(null).map((a, index) => {
				return {
					index,
					isSaveFile: true,
					custom: ({sceneData}, {index, hoverTime}, ctx) => {
						const left = 2 + index % 2 * 32;
						const top = 2 + Math.floor(index / 2) * 32;
						const width = 28, height = 28;
						const x = left + width/2 - 5;
						const y = top + height / 2 - 3;
						ctx.beginPath();
						ctx.lineWidth = "3px"
						ctx.strokeStyle = "#334444";
						ctx.rect(3 + index % 2 * 32 + 1, 3 + Math.floor(index / 2) * 32 + 1, 24, 24);
						ctx.stroke();
					},
					hidden: ({sceneData}, sprite) => !sceneData.loadSave || sceneData.loadSave[sprite.index],
				};
			})),
			... (new Array(4).fill(null).map((a, index) => {
				return {
					index,
					isSaveFile: true,
					custom: ({sceneData}, {index, hoverTime}, ctx) => {
						const left = 2 + index % 2 * 32;
						const top = 2 + Math.floor(index / 2) * 32;
						const width = 28, height = 28;
						const x = left + width/2 - 7;
						const y = top + height / 2 - 3;

						ctx.fillStyle = hoverTime ? "#88cc88" : "#008800bb";
						ctx.fillRect(x-1, y-1, 16, 7);
						game.displayTextLine(ctx, {
							msg: "save",
							x, y,
						});
					},
					onClick: (game, {index}) => {
						const screenshot = game.sceneData.screenshot;
						game.gotoScene(game.sceneData.returnScene, null, true);
						game.save(index, screenshot);
					},
					hidden: ({sceneData}, sprite) => !sceneData.loadSave || sceneData.loadSave[sprite.index],
				};
			})),		],
		onScene: game => {
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

			game.startDialog({
				time: game.now,
				index: 0,
				highlightColor: "#00998899",
				conversation: [
					{
						options: [
							{},
							{},
							{
								msg: "Back",
								onSelect: (game, dialog) => game.gotoScene(game.sceneData.returnScene, null, true),
							},
						],
					}
				],
			});
		},
	},
);