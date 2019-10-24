gameConfig.scenes.push(
	{
		name: "locker-room",
		arrowGrid: [
			[null, null,  MENU, null, null ],
			[],
			[ LEFT, null, s(2), null, RIGHT ],
			[ LEFT, null, s(1), null, RIGHT ],
			[ LEFT, null, s(5), null, RIGHT ],
		],	
		doors: {
			1: {
				exit: game => game.fadeToScene("maze-3", {door:3}),
			},
		},
		map: `
			XXX
			XOX
			X.X
			X1X
			XXX
		`,			
		onScene: game => {
			game.save();
			// game.startDialog({
			// 	time: game.now,
			// 	index: 0,
			// 	conversation: [
			// 		{
			// 			message: "",
			// 			options: [
			// 				{ },
			// 				{ },
			// 				{ msg: "LEAVE", onSelect: game => {
			// 					const fadeDuration = 1000;
			// 					game.fadeOut(game.now, {duration:fadeDuration * 1.5, fadeDuration, color:"#000000", onDone: game => {
			// 						game.gotoScene("maze-3", {door:3})
			// 					}});
			// 				}},
			// 			],
			// 		},
			// 	],
			// });
		},
		sprites: [
			...getRoomMaze("_BLUE_1"),
			{
				src: ASSETS.LOCKER_ROOM,
				hidden: game => game.rotation !== 0,
			},
			{
				name: "access card",
				src: ASSETS.ACCESS_CARD,
				hidden: (game, {name}) => game.rotation !== 0 || !game.situation.midLockerOpen || game.data.pickedUp[name],
				onClick: (game, {name}) => game.pickUp({item:name, image:ASSETS.GRAB_ACCESS_CARD, message:"Looks like some kind of access card!"}),
			},
			{
				src: ASSETS.LOCKER_DOOR,
				index: ({situation}) => situation.rightLockerOpen ? 1 : 0,
				onClick: ({situation}) => {
					game.playSound(SOUNDS.DOOR);
					situation.rightLockerOpen = !situation.rightLockerOpen;
				},
				hidden: game => game.rotation !== 0,
			},
			{
				src: ASSETS.LOCKER_DOOR,
				index: ({situation}) => situation.midLockerOpen ? 3 : 2,
				onClick: (game) => {
					const {situation} = game;
					if (game.data.lock_unlocked) {
						game.playSound(SOUNDS.DOOR);
						situation.midLockerOpen = !situation.midLockerOpen;
					} else {
						game.gotoScene("lock-zoom");
					}
				},
				tip: ({situation, data}) => situation.midLockerOpen || data.lock_unlocked ? null :
				game.getSituation("zoom-arcade").gotHighScore ? "Looks like some symbol on that locker. It looks familiar." : "Looks like some symbol on that locker.",
				hidden: game => game.rotation !== 0,
			},
			{
				src: ASSETS.LOCK_BLOCK,
				hidden: game => game.rotation !== 0 || game.data.lock_unlocked,
			},
			// {
			// 	src: ASSETS.SPEECH_OUT,
			// 	offsetY: 15,
			// 	hidden: game => game.rotation !== 0 || game.bagOpening || game.useItem || game.pendingTip,
			// 	index: game => Math.min(3, Math.floor((game.now - game.sceneTime) / 80)),
			// },
			// {
			// 	bag: true,
			// 	src: ASSETS.BAG_OUT,
			// 	index: game => game.frameIndex,
			// 	hidden: game => game.arrow !== BAG && !game.bagOpening || game.sceneData.firstShot,
			// 	alpha: game => game.emptyBag() && game.frameIndex === 0 ? .2 : 1,
			// 	onClick: game => game.clickBag(),
			// },
			...standardBag(),
			...standardMenu(),				
		],
	},
);