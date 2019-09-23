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
						game.pickUp({item:"fruit?", image:ASSETS.GRAB_APPLE, message:"Looks eatable."});
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
							game.situation.gotBottle = game.now;
							game.playSound(SOUNDS.DUD);
						}
					},
					tip: game => game.situation.pickedUpBottle ? "Nothing left." : "Looks like a bottle. Is that water?",
					combineMessage: (item, game) => item === "coin" ? "That goes in the coin slot." : null,
				},
				{
					src: ASSETS.VENDING_MACHINE_APPLE, col: 2, row: 3,
					index: game => !game.situation.gotApple ? 0 : Math.min(4, Math.floor((game.now - game.situation.gotApple) / 100)),
					onClick: game => {
						if ((game.situation.coin||0) < 3 || game.situation.gotApple) {
							game.playSound(SOUNDS.ERROR);
							game.delayAction(game => game.playSound(SOUNDS.ERROR), 100);
						} else {
							game.situation.coin-=3;
							if (!game.situation.coin) {
								delete game.situation.coin;
							}
							game.situation.gotApple = game.now;
							game.playSound(SOUNDS.DUD);
						}
					},
					tip: game => game.situation.pickedUpBottle ? "Nothing left." : "I hope that's food. I'm getting hungry.",
					combineMessage: (item, game) => item === "coin" ? "That goes in the coin slot." : null,
				},
				{ src: ASSETS.VENDING_MACHINE_GLASS },
				{
					custom: ({now, situation}, sprite, ctx) => {
						ctx.fillStyle = "#aa6666";
						ctx.fillRect(13, 33, 6, 2);
						ctx.fillRect(38, 33, 2, 2);
						ctx.fillRect(34, 33, 2, 2);
						ctx.fillRect(30, 33, 2, 2);

						if (now % 1000 < 500) {
							ctx.fillStyle = "#66cc66";
							if (situation.coin > 0) {
								ctx.fillRect(13, 33, 6, 2);
							}								
							if (situation.coin > 0) {
								ctx.fillRect(30, 33, 2, 2);
							}
							if (situation.coin > 1) {
								ctx.fillRect(34, 33, 2, 2);
							}
							if (situation.coin > 2) {
								ctx.fillRect(38, 33, 2, 2);
							}
						}
					},
				},
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
					src: ASSETS.VENDING_MACHINE_COIN_RETURN,
					index: ({now, sceneData}) => sceneData.returnCoin && now - sceneData.returnCoin < 100 ? 1 : 0,
					onClick: game => {
						const { now, situation, sceneData } = game;
						const coins = [
							"coin 1", "coin 2", "coin 3",
						];
						if (situation.coin) {
							sceneData.returnCoin = now;
							game.playSound(SOUNDS.DUD);							
						} else {
							game.playErrorSound();
						}
						while(situation.coin) {
							situation.coin--;
							for (let i = 0; i < coins.length; i++) {
								if (game.data.pickedUp[coins[i]]) {
									delete game.data.pickedUp[coins[i]];
									break;
								}
							}

						}
						delete situation.coin;
					},
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