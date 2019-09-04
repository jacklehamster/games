gameConfig.scenes.push(
	{
		name: "vending-machine",
		arrowGrid: [
			[null, null,  MENU, null, null ],
			[],
			[],
			[],
			[],
		],
		onScene: game => {
			game.save();
			game.startDialog({
				time: game.now,
				index: 0,
				conversation: [
					{
						message: "",
						options: [
							{ },
							{ },
							{ msg: "LEAVE", onSelect: game => {
								const fadeDuration = 1000;
								game.fadeOut(game.now, {duration:fadeDuration * 1.5, fadeDuration, color:"#000000", onDone: game => {
									game.gotoScene("maze-2", {door:3})
								}});
							}},
						],
					},
				],
			});
		},
		sprites: [
			{
				src: ASSETS.VENDING_MACHINE,
			},
			{
				src: ASSETS.MACHINE, col: 1, row: 2,
				index: game => game.getSituation("zoom-vending-machine").grabbedBottle ? 1 : 0,
				tip: "Looks like a vending machine. There's a big hole in it.",
				onClick: game => game.gotoScene("zoom-vending-machine"),
			},
			{
				name: "coin 1",
				src: ASSETS.COIN_1,
				hidden: (game,{name}) => game.data.pickedUp[name],
				onClick: (game, {name}) => {
					game.data.pickedUp[name] = game.now;
					game.pickUp({item:"coin", image:ASSETS.GRAB_COIN, message:""});
				},
			},
			{
				name: "coin 2",
				src: ASSETS.COIN_1,
				hidden: (game,{name}) => !game.data.pickedUp.apple || game.data.pickedUp[name],
				onClick: (game, {name}) => {
					game.data.pickedUp[name] = game.now;
					game.pickUp({item:"coin", image:ASSETS.GRAB_COIN, message:""});
				},
			},
			{
				src: ASSETS.SPEECH_OUT,
				offsetY: 15,
				hidden: game => game.bagOpening || game.useItem || game.pendingTip,
				index: game => Math.min(3, Math.floor((game.now - game.sceneTime) / 80)),
			},
			{
				bag: true,
				src: ASSETS.BAG_OUT,
				index: game => game.frameIndex,
				hidden: ({arrow, bagOpening, dialog}) => !bagOpening && (arrow !== BAG || dialog && dialog.conversation[dialog.index].options.length > 2),
				alpha: game => game.emptyBag() ? .2 : 1,
				onClick: game => game.clickBag(),
			},
			...standardMenu(),
		],
	},
);