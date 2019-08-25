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
								{ msg: "LEAVE", onSelect: game => {
									game.gotoScene("vending-machine")
								}},
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

			},
			sprites: [
				{ src: ASSETS.VENDING_MACHINE_CLOSEUP },
				{
					src: ASSETS.VENDING_MACHINE_BOTTLE,
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
							delete game.data.pickedUp["coin 1"];
							game.situation.gotBottle = game.now;
							game.playSound(SOUNDS.DUD);
						}
					},
					tip: "Looks like a bottle. Is that water?",
				},
				{
					src: ASSETS.VENDING_MACHINE_APPLE,
					onClick: game => {
						game.playSound(SOUNDS.ERROR);
						game.delayAction(game => game.playSound(SOUNDS.ERROR), 100);
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
					src: ASSETS.SPEECH_OUT,
					offsetY: 9,
					hidden: game => game.bagOpening || game.useItem || game.pendingTip,
					index: game => Math.min(3, Math.floor((game.now - game.sceneTime) / 80)),
				},
				{
					name: "self",
					src: ASSETS.EATER, col:2, row:2,
					index: (game, sprite) => game.hoverSprite === sprite ? Math.min(2, Math.floor((game.now - sprite.hoverTime) / 100)) : 0,
					hidden: game => game.useItem !== 'water bottle',
					combine: (item, game) => {
						if (item === 'water bottle') {
							delete game.inventory[item];
							game.useItem = null;
							game.playSound(SOUNDS.DRINK);
							game.addToInventory({item:"empty bottle", image:ASSETS.GRAB_BOTTLE},)
							game.showTip("Refreshing!");
						}
						return true;
					},
				},
				{
					bag: true,
					src: ASSETS.BAG_OUT,
					index: game => game.frameIndex,
					hidden: ({arrow, bagOpening, dialog}) => !bagOpening && (arrow !== BAG || dialog && dialog.conversation[dialog.index].options.length > 2),
					alpha: game => game.emptyBag() ? .2 : 1,
					onClick: game => game.clickBag(),
				}
			],
		},
);