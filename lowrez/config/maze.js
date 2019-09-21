gameConfig.scenes.push(
	{
		name: "maze",
		onScene: game => {
			game.playTheme(SOUNDS.CHIN_TOK_THEME, {volume: .2});
			game.save();
		},
		arrowGrid: [
			[null, null,  MENU, null, null ],
			[],
			[ LEFT, null, s(2),     null, RIGHT ],
			[ LEFT, null, s(1),     null, RIGHT ],
			[ LEFT, null, BACKWARD, null, RIGHT ],
		],
		map: `
			XXXXXXXXX
			XT......3
			XXX.XX.XX
			XXX1XX.XX
			XXXXXX2XX
			XXXXXXXXX
		`,
		sprites: [
			{
				custom: (game, sprite, ctx) => ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height),
			},
			...getCommonMaze("_BLUE_1"),
			{
				src: ASSETS.TREASURE_CHEST,
				hidden: game => {
					const {chest, now, rotation, moving, frameIndex} = game;
					if (!chest || now < chest.found || rotation % 2 == 1 || moving) {
						return true;
					}
					const event = game.facingEvent();
					if (!event || !event.chest) {
						return true;
					}
					return false;
				},
				onClick: (game, sprite) => {
					const {now, chest, situation} = game;
					if (situation.chestCleared) {
						return;
					}
					if (chest && !chest.opened) {
						chest.opened = now;
						game.playSound(SOUNDS.DRINK);
					}
				},
				index: ({now, chest, situation}) => situation.chestCleared ? 3 : !chest.opened ? 0 : Math.min(3, Math.floor((now - chest.opened) / 100)),
				onRefresh: (game, sprite) => {
					const {now, chest, situation} = game;
					if (chest.opened) {
						const frame = Math.floor((now - chest.opened) / 100);
						if (frame > 4 && !chest.checked) {
							chest.checked = now;
							const { item, image } = chest;
							game.pickUp({item, image, message:"", onPicked: game => {
								game.battle = null;
								situation.chestCleared = now;
							}});
						}
					}
				},
			},
			...standardMenu(),
			...standardBag(),
		],
		doors: {
			1: {
				scene: "jail-cell",
				exit: (game, {scene}) => {
					game.fadeToScene(scene, null, game.hasVisited(scene) ? 1000 : 3000);
				},
			},
			2: {
				scene: "maze-2",
				exit: (game, {scene}) => game.fadeToScene(scene, {door:1}, 1000),
			},
			3: {
				scene: "training-room",
				exit: (game, {scene}) => game.fadeToScene(scene, {door:1}, 1000),
			},
		},
		events: {
			T: {
				chest: true,
				blocking: true,
				onEvent: (game, event) => {
					const {data, now} = game;
					game.findChest(now, {
						item:"coin", image:ASSETS.GRAB_COIN,
						cleared: game.situation.chestCleared,
					});
				},
			},
		},
	},	
);