gameConfig.scenes.push(
	{
		name: "maze-4",
		onScene: game => {
			game.save();
		},
		arrowGrid: [
			[ null, null, MENU, 	null, null ],
			[],
			[ LEFT, null, s(2),     null, RIGHT ],
			[ LEFT, null, s(1),     null, RIGHT ],
			[ LEFT, null, s(9),	    null, RIGHT ],
		],
		map: `
			XXXXXXXXXXX
			XXXXX3XXXXX
			XXXXX.XXXXX
			X1.......2X
			XXX.XXXXXXX
			XXXTXXXXXXX
			XXXXXXXXXXX
		`,
		sprites: [
			{
				custom: (game, sprite, ctx) => ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height),
			},
			...getCommonMaze("_1"),
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
			makeYupa(),
			...standardMenu(),
			...standardBag(),
		],
		doors: {
			1: {
				scene: "maze-3",
				wayDown: true,
				exit: (game, {scene}) =>  game.fadeToScene(scene, {door:2}, 1000),
			},
			2: {
				lock: true,
				scene: "cell-maze", door: 2,
				exit: (game, {scene, door}) => {
					game.fadeToScene(scene, {door}, 1000);
				},
			},
			3: {
				scene: "first-prison-cell",
				exit: (game, {scene}) =>  game.fadeToScene(scene, null, 1000),
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