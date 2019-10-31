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
					"... I was willing to give my life for the cause ...",
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

				game.delayAction(() => {
					game.currentScene.keepThinking(game);
				}, 3000);
			}
		},
		keepThinking: game => {
			const msg = game.sceneData.thoughts[game.getSituation("doctar-room").thoughtIndex];
			game.showTip(msg, game => {
				game.currentScene.keepThinking(game);
			}, msg.length > 100 ? 50 : 150, {removeLock: true, y: 64, maxLines: msg.length > 100 ? 10 : 2 });
			game.getSituation("doctar-room").thoughtIndex = (game.getSituation("doctar-room").thoughtIndex + 1) % game.sceneData.thoughts.length;
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