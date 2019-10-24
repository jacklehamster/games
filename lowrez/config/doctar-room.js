gameConfig.scenes.push(
	{
		name: "doctar-room",
		onScene: game => {
			game.save();
			game.playTheme(SOUNDS.JAIL_CELL_THEME);
			game.sceneData.reached = {};
			if (!game.sceneData.to) {
				game.sceneData.from = null;
				game.sceneData.to = "seat";
				game.sceneData.toReach = null;
			}
			game.sceneData.switchTime = game.now;
			game.sceneData.fadeSpeed = 2000;
		},
		arrowGrid: [
			[ null, null, MENU,  null, null ],
			[],
			[],
			[],
			[ null, null, BAG, null, null ],
		],
		sprites: [
			{	//	seat
				src: ASSETS.DOCTAR_ROOM, col: 5, row: 5,
				index: 1,
				onClick: game => {
					if (game.sceneData.to !== "seat") {
						game.sceneData.from = game.sceneData.to;
						game.sceneData.to = "seat";
						game.sceneData.switchTime = game.now;
					}
					game.sceneData.toReach = "seat";
				},
			},			
			{	//	mirror
				src: ASSETS.DOCTAR_ROOM, col: 5, row: 5,
				index: 3,
				onClick: game => {
					if (game.sceneData.to !== "mirror") {
						game.sceneData.from = game.sceneData.to;
						game.sceneData.to = "mirror";
						game.sceneData.switchTime = game.now;
					}
					game.sceneData.toReach = "mirror";
				},
			},
			{
				src: ASSETS.DOCTAR_ROOM, col: 5, row: 5,
			},
			{
				src: ASSETS.DOCTAR_ROOM, col: 5, row: 5,
				index: 22,
				hidden: game => !game.data.seen.doctor,
				onClick: game => {
					game.sceneData.to = "door";
					game.sceneData.from = null;
					game.sceneData.switchTime = game.now - game.sceneData.fadeSpeed;
					game.sceneData.toReach = null;
					game.fadeToScene("sarlie-planet-world", null, null, game => {
						game.sceneData.fromDoctor = true;
					});
				},
			},
			{	//	yupa and doctar sarlie
				src: ASSETS.DOCTAR_ROOM, col: 5, row: 5,
				index: 2,
				onClick: game => {
					if (game.sceneData.to !== "door") {
						game.sceneData.from = game.sceneData.to;
						game.sceneData.to = "door";
						game.sceneData.switchTime = game.now;
					}
					game.sceneData.toReach = "door";
				},
				hidden: game => game.data.seen.doctor,
			},
			{	//	human look at mirror
				id: "mirror",
				src: ASSETS.DOCTAR_ROOM, col: 5, row: 5,
				index: 7,
				alpha: ({sceneData, now}, {id}) => {
					if (sceneData.to === id) {
						return Math.min(1, (now - sceneData.switchTime)/sceneData.fadeSpeed);
					} else if (sceneData.from === id) {
						return 1 - Math.min(1, (now - sceneData.switchTime)/sceneData.fadeSpeed);
					}
				},
				hidden: ({sceneData, now}, {id}) => (sceneData.to !== id || now <= sceneData.switchTime) && (sceneData.from !== id || (now - sceneData.switchTime)/sceneData.fadeSpeed >= 1),
				onRefresh: (game, sprite) => {
					if (game.sceneData.toReach === sprite.id && !game.sceneData.reached[sprite.id] && game.now - game.sceneData.switchTime >= game.sceneData.fadeSpeed) {
						game.sceneData.reached[sprite.id] = game.now;
						sprite.onReach(game, sprite);
					}
				},
				onReach: (game, sprite) => {
					game.gotoScene("mirror");
				},
			},
			{
				id: "mirror",
				src: ASSETS.BEARD_SHAVED,
				scale: .25,
				offsetX: 10,
				offsetY: 17,
				alpha: ({sceneData, now}, {id}) => {
					if (game.sceneData.to === id) {
						return .5 * Math.min(1, (game.now - game.sceneData.switchTime)/sceneData.fadeSpeed);
					} else if (game.sceneData.from === id) {
						return .5 * (1 - Math.min(1, (game.now - game.sceneData.switchTime)/sceneData.fadeSpeed));
					}
				},
				hidden: ({sceneData, now}, {id}) => (sceneData.to !== id || now <= sceneData.switchTime) && (sceneData.from !== id || (now - sceneData.switchTime)/sceneData.fadeSpeed >= 1),
			},
			{	//	human talk to yupa and sarlie
				id: "door",
				src: ASSETS.DOCTAR_ROOM, col: 5, row: 5,
				index: 8,
				alpha: ({sceneData, now}, {id}) => {
					if (sceneData.to === id) {
						return Math.min(1, (now - sceneData.switchTime)/sceneData.fadeSpeed);
					} else if (sceneData.from === id) {
						return 1 - Math.min(1, (now - sceneData.switchTime)/sceneData.fadeSpeed);
					}
				},
				hidden: ({sceneData, now}, {id}) => (sceneData.to !== id || now <= sceneData.switchTime) && (sceneData.from !== id || (now - sceneData.switchTime)/sceneData.fadeSpeed >= 1),
				onRefresh: (game, sprite) => {
					if (game.sceneData.toReach === sprite.id && !game.sceneData.reached[sprite.id] && game.now - game.sceneData.switchTime >= game.sceneData.fadeSpeed) {
						game.sceneData.reached[sprite.id] = game.now;
						sprite.onReach(game, sprite);
					}
				},
				onReach: (game, sprite) => {
					game.gotoScene("yupa-sarlie");
				},
			},
			{	//	human sitting
				id: "seat",
				src: ASSETS.DOCTAR_ROOM, col: 5, row: 5,
				index: 9,
				alpha: ({sceneData, now}, {id}) => {
					if (game.sceneData.to === id) {
						return Math.min(1, (game.now - game.sceneData.switchTime)/sceneData.fadeSpeed);
					} else if (game.sceneData.from === id) {
						return 1 - Math.min(1, (game.now - game.sceneData.switchTime)/sceneData.fadeSpeed);
					}
				},
				hidden: ({sceneData, now}, {id}) => (sceneData.to !== id || now <= sceneData.switchTime) && (sceneData.from !== id || (now - sceneData.switchTime)/sceneData.fadeSpeed >= 1),
				onRefresh: (game, sprite) => {
					if (game.sceneData.toReach === sprite.id && !game.sceneData.reached[sprite.id] && game.now - game.sceneData.switchTime >= game.sceneData.fadeSpeed) {
						game.sceneData.reached[sprite.id] = game.now;
						sprite.onReach(game, sprite);
					}
				},
				onReach: (game, sprite) => {
				},
			},
			{
				id: "seat",
				src: ASSETS.BEARD_SHAVED, size: [32, 64],
				scale: .3,
				offsetX: 15,
				offsetY: 35,
				alpha: ({sceneData, now}, {id}) => {
					if (game.sceneData.to === id) {
						return Math.min(1, (game.now - game.sceneData.switchTime)/sceneData.fadeSpeed);
					} else if (game.sceneData.from === id) {
						return 1 - Math.min(1, (game.now - game.sceneData.switchTime)/sceneData.fadeSpeed);
					}
				},
				hidden: ({sceneData, now}, {id}) => (sceneData.to !== id || now <= sceneData.switchTime) && (sceneData.from !== id || (now - sceneData.switchTime)/sceneData.fadeSpeed >= 1),
			},
			...standardMenu(),
			...standardBag(),		
		],
	},
);