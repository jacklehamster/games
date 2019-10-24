gameConfig.scenes.push(
	{
		name: "mirror",
		onScene: game => {
			game.playTheme(SOUNDS.JAIL_CELL_THEME);
		},
		arrowGrid: [
			[ null, null, null,  null, null ],
			[],
			[],
			[],
			[ null, null, null, null, null ],
		],
		customCursor: ({sceneData, hoverSprite, arrow}) => arrow || !sceneData.pickedRazor ? null : "none",
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