gameConfig.scenes.push(
	{
		name: "ceiling-maze",
		onScene: game => {
			game.save();
		},
		arrowGrid: [
			[ null, null, MENU,  null, null ],
			[],
			[ LEFT, null, s(2), null, RIGHT ],
			[ LEFT, s(7), s(8), s(7), RIGHT ],
			[ LEFT, s(7), s(9), s(7), RIGHT ],
		],
		map: `
			XXXXXXXXXXX
			X5......HXX
			XXXXXXXXXXX
		`,
		sprites: [
			{
				custom: (game, sprite, ctx) => ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height),
			},
			...getCommonMaze("_RED_1"),
			{
				src: ASSETS.LADDER,
				hidden: game => !game.facingEvent() || !game.facingEvent().hole || game.rotation % 2 !== 0 || game.moving,
				tip: game => game.situation.roppedLadder ? "This should hold." : "The ladder is broken.",
				combine: (item, game) => {
					if (item === "rope") {
						game.situation.roppedLadder = game.now;
						game.showTip("This should hold", null, null, {removeLock:true});
						game.removeFromInventory("rope");
						return true;
					}
				},
			},
			{
				src: ASSETS.HOLE,
				index: game => (game.sceneData.viewingHole ? 2 : 0) + (game.situation.roppedLadder ? 1 : 0),
				hidden: game => !game.facingEvent() || !game.facingEvent().hole || game.rotation % 2 !== 0 || game.moving,
				onClick: game => {
					if (game.sceneData.viewingHole) {
						game.pendingTip = null;
						game.startDialog({
							time: game.now,
							index: 0,
							conversation: [
								{
									options: [
										{ 
										},
										{ msg: "Go down", onSelect: game => {
											console.log("Going down");
										}},
										{ msg: "LEAVE", onSelect: game => {
											game.sceneData.viewingHole = 0;
											game.dialog = null;
										}},
									],
								},
							],
						});
					} else {
						game.showTip("It looks deep.", null, null, {removeLock:true});
						game.sceneData.viewingHole = game.now;
					}
				},
			},
			makeYupa(),
			...standardBattle(),
			...standardMenu(),
			...standardBag(),
		],
		... makeOnSceneBattle(),
		doors: {
			5: {
				wayDown: true,
				scene: "cell-maze", door: 5,
				exit: (game, {scene, door}) =>  game.fadeToScene(scene, {door}, 1000),
			},
		},
		events: {
			'H': {
				blocking: true,
				hole: true,
				showBag: true,
				onEvent: (game, event) => {

				},
			},
		},
	},
);