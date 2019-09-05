gameConfig.scenes.push(
		{
			name: "zoom-vending-machine",
			onScene: ({sceneData}) => {
				sceneData.putCoin = 0;
				game.startDialog({
					time: game.now,
					index: 0,
					conversation: [
						{
							message: "",
							options: [
								{ },
								{ msg: "LEAVE",
								  onSelect: game => game.gotoScene("vending-machine"),
								},
							],
						},
					],
				});
			},
			arrowGrid: [
				[],
				[],
				[ null, null, null,  null, null ],
				[ null, null, null,  null, null ],
				[ null, null, BAG ,  null, null ],
			],
			onSceneRefresh: game => {
				if (game.situation.gotBottle && !game.situation.grabbedBottle) {
					const frame = Math.floor((game.now - game.situation.gotBottle)) / 100;
					if (frame > 4) {
						game.pickUp({item:"water bottle", image:ASSETS.GRAB_WATER_BOTTLE, message:"Looks like water."});
						game.situation.grabbedBottle = game.now;
					}
				}
				if (game.situation.gotApple && !game.situation.grabbedApple) {
					const frame = Math.floor((game.now - game.situation.gotApple)) / 100;
					if (frame > 4) {
						game.pickUp({item:"fruit?", image:ASSETS.GRAB_APPLE, message:"That looks eatable."});
						game.situation.grabbedApple = game.now;
					}					
				}

			},
			sprites: [
				{ src: ASSETS.VENDING_MACHINE_CLOSEUP },
				{
					src: ASSETS.VENDING_MACHINE_BOTTLE, col: 2, row: 3,
					index: game => !game.situation.gotBottle ? 0 : Math.min(4, Math.floor((game.now - game.situation.gotBottle) / 100)),
					onClick: game => {
						if (!game.situation.coin || game.situation.gotBottle) {
							game.playSound(SOUNDS.ERROR);
							game.delayAction(game => game.playSound(SOUNDS.ERROR), 100);
						} else {
							game.situation.coin--;
							if (!game.situation.coin) {
								delete game.situation.coin;
							}
							if (game.data.pickedUp["coin 1"]) {
								delete game.data.pickedUp["coin 1"];
							} else {
								delete game.data.pickedUp["coin 2"];								
							}
							game.situation.gotBottle = game.now;
							game.playSound(SOUNDS.DUD);
						}
					},
					tip: "Looks like a bottle. Is that water?",
				},
				{
					src: ASSETS.VENDING_MACHINE_APPLE, col: 2, row: 3,
					index: game => !game.situation.gotApple ? 0 : Math.min(4, Math.floor((game.now - game.situation.gotApple) / 100)),
					onClick: game => {
						if ((game.situation.coin||0) < 2 || game.situation.gotApple) {
							game.playSound(SOUNDS.ERROR);
							game.delayAction(game => game.playSound(SOUNDS.ERROR), 100);
						} else {
							game.situation.coin--;
							if (!game.situation.coin) {
								delete game.situation.coin;
							}
							delete game.data.pickedUp["coin 1"];
							delete game.data.pickedUp["coin 2"];
							game.situation.gotApple = game.now;
							game.playSound(SOUNDS.DUD);
						}
					},
					tip: "I hope that's food. I'm getting hungry.",
				},
				{ src: ASSETS.VENDING_MACHINE_GLASS },
				{
					name: "coin-slot",
					src: ASSETS.VENDING_MACHINE_COIN_SLOT,
					index: ({now, sceneData}) => Math.min(3, Math.floor((now - sceneData.putCoin) / 100)),
					combine: (item, game) => {
						if (item === "coin") {
							game.useItem = null;
							game.playSound(SOUNDS.DUD);
							game.sceneData.putCoin = game.now;
							game.situation.coin = (game.situation.coin||0) + 1;
							game.removeFromInventory("coin");
							return true;
						}
					}
				},
				{
					src: ASSETS.SPEECH_OUT,
					offsetY: 9,
					hidden: game => game.bagOpening || game.useItem || game.pendingTip,
					index: game => Math.min(3, Math.floor((game.now - game.sceneTime) / 80)),
				},
				...standardBag(),
			],
		},
);