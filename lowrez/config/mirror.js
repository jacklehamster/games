gameConfig.scenes.push(
	{
		name: "mirror",
		onScene: game => {
			game.playTheme(SOUNDS.JAIL_CELL_THEME);

			if (!game.data.seen.doctor) {
				if (!game.getSituation("doctar-room").thoughtIndex) {
					game.getSituation("doctar-room").thoughtIndex = 0;
				} else {
					game.getSituation("doctar-room").thoughtIndex --;
				}

				game.sceneData.thoughts = [
					"... so here we are ...",
					"... and thinking killing Baby Hitler ...",
					"... was the most difficult part ...",
					"... I thought this was all behind ...",
					"... avoiding the holocaust, spare the baby's life ...",
					"... it all seemed too easy ...",
					"... how foolish of me ...",
					"... as a hitman, I never feared death ...",
					"... I was willing to give my life for this mission ...",
					"... and yet ...",
					"... the thought of being erased from existence ...",
					"... it's something different ...",
					"... nobody will never know I ever existed ...",
					"... it is worst than being dead ...",
					"... being ... NOTHING ...",
					"... no more fond memories of traveling in space with Yupa ...",
					"... it's like those never happened ...",
					"... my life has no meaning ...",
					"... the world has no meaning to me ...",
					"... and I mean nothing to the world ...",
					"... ... ...",
					"... goodby cruel world ...",
					"... it was nice never knowing you ...",
					"... I should feel sad, but yet, I feel nothing ...",
					"... ... ...",
					"... so how long are you going to keep listening to by bullshit? ...",
					"... just keep playing the game already ...",
				].concat(new Array(100).fill("... watch me, I'm going to say the same thing over and over and bore you to death ..."))
				.concat([
					"... oh my god! you're still here ...",
					"... I ... I have nothing to say ...",
					"... this is ... unbelievable ...",
					"... am I stuck in some kind of loop? ...",
					"... let's start over from the beginning ...",
				]);
				game.sceneData.thoughts = game.sceneData.thoughts.concat(game.sceneData.thoughts).concat([
					"... actually no, I can't ...",
					"... I cannot believe it ...",
					"... you broke the game ...",
				]).concat(Game.toString().split("{").join("♪").split("}").join("♪").split("=").join("♪").split("\n").join(" ").split(" ").map(a => a.trim()).filter(a => a.length).join("\n"))
				.concat(game.sceneData.thoughts);

				game.currentScene.keepThinking(game);
			}
		},
		arrowGrid: [
			[ null, null, null,  null, null ],
			[],
			[],
			[],
			[ null, null, null, null, null ],
		],
		customCursor: ({sceneData, hoverSprite, arrow}) => arrow || !sceneData.pickedRazor ? null : "none",
		keepThinking: game => {
			const msg = game.sceneData.thoughts[game.getSituation("doctar-room").thoughtIndex];
			game.showTip(msg, game => {
				game.currentScene.keepThinking(game);
			}, msg.length > 100 ? 50 : 150, {removeLock: true, y: 64, maxLines: msg.length > 100 ? 10 : 2 });
			game.getSituation("doctar-room").thoughtIndex = (game.getSituation("doctar-room").thoughtIndex + 1) % game.sceneData.thoughts.length;
		},
		sprites: [
			{	//	face
				src: ASSETS.DOCTAR_ROOM, col: 5, row: 5,
				index: 10,
				offsetY: -5,
			},
			{	//	beard
				src: ASSETS.BEARD_SHAVED, col: 3, row: 3,
				index: 0,
				offsetY: -5,
				onRefresh: (game, sprite) => {
					if (game.mouseDown) {
						const stock = game.imageStock[sprite.src];
						const ctx = stock.img.getContext("2d");
						ctx.globalCompositeOperation = "destination-out";
						ctx.fillStyle = "#000000";
						const w = 64, h = 64, canvas = ctx.canvas;
						for (let yy = 0; yy < canvas.height; yy += h) {
							for (let xx = 0; xx < canvas.width; xx += w) {
								ctx.fillRect(xx + Math.round(game.mouse.x-.5), yy + Math.round(game.mouse.y-sprite.offsetY), 2, 1);
							}
						}
						if (!game.data.images) {
							game.data.images = {};
						}
						game.data.images[sprite.src] = stock.img.toDataURL();
						if (!game.data.shaved) {
							game.data.shaved = game.now;
						}
					}
				},
			},
			{	//	razor cursor
				src: ASSETS.RAZOR, col: 1, row: 2,
				offsetX: ({mouse}) => Math.round(mouse.x -16),
				offsetY: ({mouse}) => Math.round(mouse.y),
				// offsetX: ({mouse}) => Math.round((mouse.x - 32) * .5) - 16 + 32,
				// offsetY: ({mouse}) => Math.round((mouse.y - 32) * .5) + 32,
				index: 1,
				hidden: ({sceneData, mouse, hoverSprite}) => !sceneData.pickedRazor || !mouse || hoverSprite && hoverSprite.back ,
			},			
			{	//	back
				back: true,
				src: ASSETS.DOCTAR_ROOM, col: 5, row: 5,
				index: 13,
				noHighlight: true,
				onClick: game => {
					if (game.sceneData.pickedRazor) {
						game.sceneData.pickedRazor = 0;
					} else {
						game.gotoScene("doctar-room");
						game.sceneData.from = null;
						game.sceneData.to = "mirror";
						game.sceneData.toReach = null;
					}
				},
			},
			{	//	razor
				src: ASSETS.DOCTAR_ROOM, col: 5, row: 5,
				index: 15,
				hidden: ({sceneData}) => sceneData.pickedRazor,
				onClick: ({sceneData, now}) => sceneData.pickedRazor = now,
			},
			{	//	mirror
				src: ASSETS.DOCTAR_ROOM, col: 5, row: 5,
				index: 12,
			},
			{	//	sink
				src: ASSETS.DOCTAR_ROOM, col: 5, row: 5,
				offsetY: 3,
				index: 14,
			},
			{	//	razor cursor
				src: ASSETS.RAZOR, col: 1, row: 2,
				offsetX: ({mouse}) => Math.round(mouse.x -16),
				offsetY: ({mouse}) => Math.round(mouse.y),
				index: 0,
				hidden: ({sceneData, mouse, hoverSprite}) => !sceneData.pickedRazor || !mouse || !hoverSprite || !hoverSprite.back,
			},
			...standardMenu(),
			...standardBag(),		
		],
	},
);