gameConfig.scenes.push(
	{
		name: "slots",
		arrowGrid: [
			[null, null,  null,  null, null ],
			[],
			[ null, null, null,  null, null ],
			[ null, null, null,  null, null ],
			[ null, null, BAG ,  null, null ],
		],
		onScene: game => {
			if (!game.situation.initial) {
				const numCoins = game.countItem("coin");
				game.situation.coinPlayed = 0;
				game.situation.initial = {
					lastCoin: Math.min(20, numCoins),
					slots: numCoins < 7 ? [0,0,0] : numCoins < 18 ? [1,1,1] : [2,2,2],
				};
				game.situation.slots = [
					0, 1, 2,
				];				
			}
		},
		onSceneHoldItem: (game, item) => {
			if (item === "gun") {
				game.useItem = null;
				game.waitCursor = true;
				game.showTip("I don't want to cause trouble here.", game => {
					game.waitCursor = false;
				});
			}
		},
		onSceneRefresh: game => {
			if (game.sceneData.roll && game.now > game.sceneData.roll) {
				game.sceneData.roll = 0;
				if (game.situation.slots[0] === game.situation.slots[1] && game.situation.slots[1] === game.situation.slots[2]) {
					if (game.situation.slots[0] === 0) {
						const gains = 20;
						game.addToInventory({item:"coin", count:gains, image:ASSETS.GRAB_COIN});
						for (let i = 0; i < 3; i++) {
							game.delayAction(game => game.playSound(SOUNDS.DUD), 50*i);
						}
						game.showTip(`Wow! I won ${gains}`, null, null, { removeLock:true });
					} else if (game.situation.slots[0] === 1) {
						const gains = 100;
						game.addToInventory({item:"coin", count:gains, image:ASSETS.GRAB_COIN});
						for (let i = 0; i < 10; i++) {
							game.delayAction(game => game.playSound(SOUNDS.DUD), 50*i);
						}
						game.showTip(`Wow! I won ${gains}`, null, null, { removeLock:true });
					} else if (game.situation.slots[0] === 2) {
						const gains = 500;
						game.addToInventory({item:"coin", count:gains, image:ASSETS.GRAB_COIN});
						for (let i = 0; i < 20; i++) {
							game.delayAction(game => game.playSound(SOUNDS.DUD), 50*i);
						}
						game.showTip(`Oh wow! I won ${gains}!`, null, null, { removeLock:true });
					}
				}
			}
		},
		sprites: [
			{
				src: ASSETS.SLOTS, col: 4, row: 4,
				index: 9,
				onClick: game => {
					game.gotoScene("shop");					
				},
			},
			{
				src: ASSETS.SLOTS, col: 4, row: 4,
				index: game => {
					if (!game.sceneData.roll || game.sceneData.roll - game.now < 0) {
						return 10 + game.situation.slots[0];
					}
					const frame = Math.floor(game.now / 50 + game.situation.slots[0]) % 3;
					return 10 + frame;
				},
			},
			{
				src: ASSETS.SLOTS, col: 4, row: 4,
				offsetX: 11,
				index: game => {
					if (!game.sceneData.roll || game.sceneData.roll - game.now < 0) {
						return 10 + game.situation.slots[1];
					}
					const frame = Math.floor(game.now / 50 + game.situation.slots[1]) % 3;
					return 10 + frame;
				},
			},
			{
				src: ASSETS.SLOTS, col: 4, row: 4,
				offsetX: 22,
				index: game => {
					if (!game.sceneData.roll || game.sceneData.roll - game.now < 0) {
						return 10 + game.situation.slots[2];
					}
					const frame = Math.floor(game.now / 50 + game.situation.slots[2]) % 3;
					return 10 + frame;
				},
			},
			{
				src: ASSETS.SLOTS, col: 4, row: 4,
				index: game => {
					if (game.sceneData.putCoin) {
						const frame = Math.floor((game.now - game.sceneData.putCoin)/100);
						if (frame <= 8) {
							return frame;
						}
					}
					return 0;
				},
				onClick: game => {
					game.showTip("It's a slot machine, just like the ones in Vegas!");
				},
				combine: (item, game) => {
					if (item === "coin") {
						game.sceneData.putCoin = game.now;
						game.sceneData.coinSound = 0;
						game.removeFromInventory(item);
						game.useItem = null;
						game.delayAction(game => {
							game.playSound(SOUNDS.DUD);	
						}, 400);
						game.delayAction(game => {
							game.playSound(SOUNDS.JINGLE);
							game.sceneData.roll = game.now + 2000;
							game.situation.coinPlayed++;
							if (game.situation.coinPlayed === game.situation.initial.lastCoin) {
								game.situation.slots = game.situation.initial.slots;
							} else if (game.situation.coinPlayed < game.situation.initial.lastCoin) {
								game.situation.slots = [
									Math.floor(Math.random() * 3),
									Math.floor(Math.random() * 3),
									Math.floor(Math.random() * 3),
								];
								if (game.situation.slots[0] === game.situation.slots[1]) {
									game.situation.slots[2] = (game.situation.slots[1] + 1) % 3;
								}
							} else {
								const chances = 1500;
								const roll = Math.floor(chances * Math.random());
								if (roll === 0) {
									game.situation.slots = [2,2,2];
								} else if (roll <= 5) {
									game.situation.slots = [1,1,1];
								} else if (roll <= 20) {
									game.situation.slots = [0,0,0];
								} else {
									game.situation.slots = [
										Math.floor(Math.random() * 3),
										Math.floor(Math.random() * 3),
										Math.floor(Math.random() * 3),
									];
									if (game.situation.slots[0] === game.situation.slots[1]) {
										game.situation.slots[2] = (game.situation.slots[1] + 1) % 3;
									}
								}
							}
						}, 800);
						return true;
					}
				},
			},
			...standardMenu(),
			...standardBag(),
		],
	},
);
