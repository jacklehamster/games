gameConfig.scenes.push(
		{
			name: "locker-room",
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
										game.gotoScene("maze-3", {door:3})
									}});
								}},
							],
						},
					],
				});
			},
			sprites: [
				{
					src: ASSETS.LOCKER_ROOM,
				},
				{
					name: "access card",
					src: ASSETS.ACCESS_CARD,
					hidden: (game, {name}) => !game.situation.midLockerOpen || game.data.pickedUp[name],
					onClick: (game, {name}) => game.pickUp({item:name, image:ASSETS.GRAB_ACCESS_CARD, message:"An access card!"}),
				},
				{
					src: ASSETS.LOCKER_DOOR,
					index: ({situation}) => situation.rightLockerOpen ? 1 : 0,
					onClick: ({situation}) => situation.rightLockerOpen = !situation.rightLockerOpen,
				},
				{
					src: ASSETS.LOCKER_DOOR,
					index: ({situation}) => situation.midLockerOpen ? 3 : 2,
					onClick: (game) => {
						const {situation} = game;
						if (game.data.lock_unlocked) {
							situation.midLockerOpen = !situation.midLockerOpen;
						} else {
							game.gotoScene("lock-zoom");
						}
					}
				},
				{
					src: ASSETS.LOCK_BLOCK,
					hidden: game => game.data.lock_unlocked,
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
					hidden: game => game.arrow !== BAG && !game.bagOpening || game.sceneData.firstShot,
					alpha: game => game.emptyBag() && game.frameIndex === 0 ? .2 : 1,
					onClick: game => game.clickBag(),
				},
			],
		},
);