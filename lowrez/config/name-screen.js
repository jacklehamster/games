gameConfig.scenes.push(
	{
		name: "name-screen",
		onScene: game => {
			game.sceneData.alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 ";
			if (!game.data.name) {
				game.data.name = "Hitman";
			}

			game.startDialog({
				time: game.now,
				index: 0,
				highlightColor: "#00998899",
				conversation: [
					{
						options: [
							{},
							{
								hidden: game => (game.data.name||"") === "",
								msg: "Undo",
								onSelect: (game, dialog) => game.data.name = game.data.name.substring(0, game.data.name.length-1),								
							},
							{
								hidden: game => (game.data.name||"") === "",
								msg: "Confirm",
								onSelect: (game, dialog) => {
									game.gotoScene(game.sceneData.returnScene, null, true);
									if (game.currentScene.onDialog) {
										game.currentScene.onDialog(game);
										game.showTip([
											`It's me, your friend ${game.data.name}.`,
											"Remember? We travel in space together, with Baby Hitler!",
										], onDone => {
											game.playSound(SOUNDS.YUPA);
											dialog.speaking = true;

											game.showTip("I been in few paralol universe. I canot rememba evry face!", game => {
												game.showTip("I should find something to help him rememba me.");
											}, null, { x: 1, y: 15, speed: 80, talker:"yupa" });
										});
									}
								}
							},
						],
					}
				],
			});			
		},
		customCursor: game => {
			const { mouse } = game;
			if (mouse) {
				const x = Math.floor(mouse.x/6), y = Math.floor(mouse.y/7);
				const index = x + y * 10 - 30;
				if (x < 10 && index >= 0 && index <= 36) {
					return "none";
				}
			}
		},
		sprites: [
			{
				custom: (game, sprite, ctx) => {
					ctx.fillStyle = "#333344",
					ctx.fillRect(0, 0, 64, 64);
				},
				onClick: game => {
					const { mouse } = game;
					if (mouse && !game.sceneData.waitCursor) {
						const x = Math.floor(mouse.x/6), y = Math.floor(mouse.y/7);
						const index = x + y * 10 - 30;
						if (x < 10 && index >=0 && index <= 36 && game.sceneData.nameSize < 38) {
							const name = (game.data.name || "");
							game.data.name = name + game.sceneData.alphabet[index];
							if (game.data.name===" ") {
								game.data.name = "";
							}
							game.data.name = game.data.name.split(" ")
								.map(text => text.charAt(0) + text.substr(1).toLowerCase())
								.join(" ");
							game.sceneData.waitCursor = true;
						}
					}
				},
			},
			{
				src: ASSETS.HITMAN_WALK, size: [16, 21],
			},
			{
				src: ASSETS.HITMAN_BEARD_WALK, size: [16, 21],
			},
			{
				custom: (game,sprite,ctx) => {
					const alphaSprite = {
						src: ASSETS.ALPHABET, size: [5,6], col: 10, row:7,
					};

					game.displayTextLine(ctx, {msg:"Your name?", x: 17, y: 1});
					ctx.strokeStyle = "#cccccc";
					ctx.fillStyle = "#000000";
					ctx.lineWidth = 1;
					ctx.beginPath();
					ctx.rect(17.5, 8.5, 45, 8);
					ctx.stroke();
					ctx.fillRect(17.5, 8.5, 45, 8);

					const { mouse } = game;

					for (let row = 0; row < 7; row++) {
						for (let col = 0; col < 10; col++) {

							const index = row*10 + col;
							if (index <= 36) {
								ctx.fillStyle = (col+row) % 2 === 0 ? "#222222" : "#111111";
								const x = col * 6 + 2, y = 22 + row * 7;
								ctx.fillRect(x, y, 5, 6);

								if (index < 36) {
									alphaSprite.index = row*10 + col;
									alphaSprite.offsetX = x;
									alphaSprite.offsetY = y;
									game.displayImage(ctx, alphaSprite);
								}
							}
						}
					}
					if (mouse) {
						const x = Math.floor(mouse.x/6), y = Math.floor(mouse.y/7);
						const index = x + y * 10 - 30;
						if (x < 10 && index >= 0 && index <= 36) {
							ctx.beginPath();
							const offX = 1.5, offY = .5;
							ctx.rect(Math.floor(mouse.x/6)*6+offX-1, Math.floor(mouse.y/7)*7+offY-1,8,9);
							ctx.rect(Math.floor(mouse.x/6)*6+offX-2, Math.floor(mouse.y/7)*7+offY-2,10,11);
							ctx.stroke();
							ctx.strokeStyle = "#000000";
							ctx.beginPath();
							ctx.rect(Math.floor(mouse.x/6)*6+offX, Math.floor(mouse.y/7)*7+offY,6,7);
							ctx.stroke();
						}
					}
					const blink = !game.sceneData.waitCursor && game.sceneData.nameSize < 38 && game.now % 1000 < 500;
					const name = (game.data.name || "");
					const nameSize = game.displayTextLine(ctx, {msg:`${name}${blink? "_":""}`, x:19, y:10});
					if (!blink) {
						game.sceneData.nameSize = nameSize;
						game.sceneData.waitCursor = false;
					}
				},
			},
		],
	},
);