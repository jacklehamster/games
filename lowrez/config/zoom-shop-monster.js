gameConfig.scenes.push(
	{
		name: "zoom-shop-monster",
		onSceneHoldItem: (game, item) => {
			if (!item) {
				return;
			}
			game.useItem = null;
			switch(item) {
				case "gun":
					game.showTip("No way, not my gun!");
					break;
				case "coin":
					game.showTip("You can't sell money, dumb human!", null, null, { x: 1, y: 15, speed: 60, talker:"monster", removeLock: true });
					break;
				case "water bottle": case "empty bottle":
					game.dialog.index = 2;
					game.sceneData.price = 1;
					game.sceneData.forSale = item;
					game.showTip(`${item}... I'll give you one coin for that.`, null, null, { x: 1, y: 15, speed: 60, talker:"monster", removeLock: true });
					break;
				case "fruit?":
					game.dialog.index = 2;
					game.sceneData.price = 2;
					game.sceneData.forSale = item;
					game.showTip(`Ah, that's a woompachuice. I'll take it for two coins.`, null, null, { x: 1, y: 15, speed: 60, talker:"monster", removeLock: true });
					break;
				case "lighter":
					game.dialog.index = 2;
					game.sceneData.price = 3;
					game.sceneData.forSale = item;
					game.showTip(`A lighter. I'll give you three coins for it.`, null, null, { x: 1, y: 15, speed: 60, talker:"monster", removeLock: true });
					break;
				case "photo":
					game.showTip(["A photo of a newborn human?", "That's worthless!"], game => {
						game.playSound(SOUNDS.HUM);
						game.showTip("Actually, I just wanted to know if you've seen this baby before.", game => {
							game.showTip("All humans more or less look the same to me.", game => {
								game.showTip("But no, I've never seen a newborn human before.", null, null, { x: 1, y: 15, speed: 60, talker:"monster", removeLock: true });
							}, null, { x: 1, y: 15, speed: 60, talker:"monster" });							
						});
					}, null, { x: 1, y: 15, speed: 60, talker:"monster" });
					break;
				case "key":
					game.dialog.index = 2;
					game.sceneData.price = 8;
					game.sceneData.forSale = item;
					game.showTip("Oh, you found a key. I'll take it for 8 coins", null, null, { x: 1, y: 15, speed: 60, talker:"monster", removeLock: true });
					break;
				case "access card":
					game.dialog.index = 2;
					game.sceneData.price = 10;
					game.sceneData.forSale = item;
					game.showTip("An access card. You sure you want to sell it? I'll take it for 10 coins", null, null, { x: 1, y: 15, speed: 60, talker:"monster", removeLock: true });
					break;
				default:
					game.showTip("That's worthless!", null, null, { x: 1, y: 15, speed: 60, talker:"monster", removeLock: true });
					break;
			}
			return true;			
		},
		onScene: game => {
			if (!game.situation.inventory) {
				game.situation.inventory = [
					{ item: "tip",			name: "tip",			cost: 1,									available:true,
						msg: "Don't know what to do? I can give you a hint.",
					},
					{ item: "lighter", 		name: "lighter", 		cost: 6, 	src: ASSETS.GRAB_LIGHTER, 		available:false,
						msg: "You want your lighter back? You can have it.",
					},
					{ item: "fruit?", 		name: "fruit", 			cost: 4, 	src: ASSETS.GRAB_APPLE,			available:true,
						msg: "We call it a woompachuice. You can have it for 4 coins.",
					},
					{ item: "water bottle", name: "water", 			cost: 2,	src: ASSETS.GRAB_WATER_BOTTLE,	available:true,
						msg: "Fresh water to quensh your thirst. Only 2 coins.",
					},
					{ item: "bullet", 		name: "bullet", 		cost: 5,	src: ASSETS.GRAB_GUN,			available:true,
						msg: "A bit expensive, but it'll help you out in a fight.",
					},
					{ item: "access card", 	name: "access card", 	cost: 20,	src: ASSETS.GRAB_ACCESS_CARD,	available:false,
						msg: "I warned you, you should have kept this. 20 coins to get it back.",
					},
					{ item: "key", 			name: "key", 			cost: 7,	src: ASSETS.GRAB_KEY,			available:false,
						msg: "You can have your key back for 15 coins.",
					},
				];
			}


			// game.situation.metBefore = game.now;
			const initialDialog = game.situation.metBefore ? "So, wanna trade?" : [
				"Oh.. you're the human.",
				"Looks like you managed to escape from your cage. Impressive, hahaha..",
				"Don't worry, I'm not gonna rat you out. I'm here to do business. With anyone!",
				"So, got anything to trade?",
			];
			const removeLock = game.situation.metBefore ? true : false;
			game.situation.metBefore = game.now;

			const dialogCallback = game => {
				game.startDialog({
					time: game.now,
					index: 0,
					conversation: [
						{
							options: [
								{
									msg: "Buy",
									onSelect: (game, dialog) => {
										dialog.index++;
										game.playSound(SOUNDS.BEEP, {volume:.5});
										game.sceneData.showStats = game.now;
										if (game.pendingTip) {
											game.pendingTip.end = game.now;
										}
									},
								},
								{
									msg: "Sell",
									onSelect: (game, dialog) => {
										game.playSound(SOUNDS.BEEP, {volume:.5});
										game.clickBag();
										if (game.pendingTip) {
											game.pendingTip.end = game.now;
										}
									},
								},
								{
									msg: "LEAVE",
									onSelect: game => {
										game.dialog = null;
										game.showTip("Come back soon!.", game => {
											game.gotoScene("first-prison-cell");
										}, null, { x: 1, y: 15, speed: 60, talker:"monster", removeLock: true });
									}
								},
							],
						},
						{
							options: [
								{},
								{},
								{
									msg: "Back",
									onSelect: (game, dialog) => {
										game.playSound(SOUNDS.BEEP, {volume:.5});
										game.sceneData.showStats = 0;
										dialog.index--;
									},
								},
							],
						},
						{	//	SELL
							options: [
								{
									cantSelect: true,
									msg: ({sceneData}) => `${sceneData.price} coin${sceneData.price>1?'s':''}?`,
								},
								{
									msg: "Sure",
									onSelect: (game, dialog) => {
										game.removeFromInventory(game.sceneData.forSale);
										game.addToInventory({
											item: "coin",
											count: game.sceneData.price,
											image: ASSETS.GRAB_COIN,
										});
										game.playSound(SOUNDS.PICKUP);
										game.showTip("Nice doing business with you.", null, null, { x: 1, y: 15, speed: 60, talker:"monster", removeLock: true });

										const itemObj = game.situation.inventory.filter(({item})=>item===game.sceneData.forSale)[0];
										if (itemObj && !itemObj.available) {
											itemObj.available = true;
											itemObj.unique = true;
										}	

										game.sceneData.showStats = 0;
										dialog.index = 0;
										game.sceneData.forSale = null;
									},										
								},
								{
									msg: "No",
									onSelect: (game, dialog) => {
										game.playSound(SOUNDS.BOP, {volume:.5});
										game.sceneData.showStats = 0;
										dialog.index = 0;
										game.sceneData.forSale = null;
										if (game.pendingTip) {
											game.pendingTip.end = game.now;
										}
									},
								},
							],
						},
						{	//	BUY
							options: [
								{
									cantSelect: true,
									msg: ({sceneData}) => `${sceneData.price} coin${sceneData.price>1?'s':''}?`,
								},
								{
									msg: game => game.sceneData.itemToBuy && game.sceneData.itemToBuy.item === "tip" ? "Yes, help me!" : "Sure",
									onSelect: (game, dialog) => {
										const {item, name, cost, src, available, msg} = game.sceneData.itemToBuy;
										if (cost <= game.countItem("coin")) {
											game.removeFromInventory("coin", cost);
											if (item === "tip") {
												game.sceneData.showStats = 0;
												dialog.index++;
												if (game.pendingTip) {
													game.pendingTip.end = game.now;
												}
												if (!game.situation.hints) {
													game.situation.hints = {};
												}
												return;
											} else {
												game.pickUp({item, image:src, onPicked: game => {
													game.showTip("Nice doing business with you.", null, null, { x: 1, y: 15, speed: 60, talker:"monster", removeLock: true });
												}});
												const itemObj = game.situation.inventory.filter(obj=>obj.item===item)[0];
												if (itemObj && itemObj.unique) {
													itemObj.available = false;
												}
											}
										} else {
											game.playErrorSound();
											game.showTip("Hey, you don't have enough! Don't try to trick me.", null, null, { x: 1, y: 15, speed: 60, talker:"monster", removeLock: true });
										}

										game.sceneData.showStats = 0;
										dialog.index = 0;
										game.sceneData.itemToBuy = null;
									},										
								},
								{
									msg: "No",
									onSelect: (game, dialog) => {
										game.playSound(SOUNDS.BOP, {volume:.5});
										game.sceneData.showStats = 0;
										dialog.index = 0;
										game.sceneData.forSale = null;
										if (game.pendingTip) {
											game.pendingTip.end = game.now;
										}
									},
								},
							],
						},
						{	//	HINT
							options: [
								{
									msg: "Locker code?",
									onSelect: (game, dialog) => {
										const { cost } = game.sceneData.itemToBuy;
										game.removeFromInventory("coin", cost);
										game.sceneData.itemToBuy = null;
										const HINTS = [
											["One guard kept bragging about his score at the arcade.", "...perhaps he used that as his locker code."],
											"To get ranked on the arcade, you'll need to destroy at least 20 ships.",
											"The locker code is in Urrzi. Same as the arcade machine.",
											["I almost saw the code once.", `I think it starts with ${game.toAlienDigits(Math.floor(HIGHSCORE/1000), 1)} and ends with ${game.toAlienDigits(HIGHSCORE%10, 1)}.`],
											"I don't know what else to say.",
										];

										game.showTip(HINTS[Math.min(HINTS.length-1, game.situation.hints.locker||0)], null, null, { x: 1, y: 15, speed: 60, talker:"monster" });
										game.situation.hints.locker = (game.situation.hints.locker||0) + 1;
										dialog.index = 0;
										game.playSound(SOUNDS.PICKUP);
									}
								},
								{
									msg: "Where's the key?",
									onSelect: (game, dialog) => {
										const { cost } = game.sceneData.itemToBuy;
										game.removeFromInventory("coin", cost);
										game.sceneData.itemToBuy = null;
										const HINTS = [
											["The key should be somewhere on this floor.", "Explore every corner of it."],
											"The key is probably somewhere in the previous area.",
											"Make sure to explore every corners of the maps.",
											"I don't know what else to say.",
										];
										game.showTip(HINTS[Math.min(HINTS.length-1, game.situation.hints.key||0)], null, null, { x: 1, y: 15, speed: 60, talker:"monster" });
										game.situation.hints.key = (game.situation.hints.key||0) + 1;
										dialog.index = 0;
										game.playSound(SOUNDS.PICKUP);
									}
								},
								{
									msg: "Fighting tips?",
									onSelect: (game, dialog) => {
										const { cost } = game.sceneData.itemToBuy;
										game.removeFromInventory("coin", cost);
										game.sceneData.itemToBuy = null;
										const HINTS = [
											["Sometimes, foes attack immediately after blocking.", "Be prepare to block yourself."],
											"With the gun, you can end the battle, but you won't earn any experience.",
											"Blocking will make you hurt less, but you'll still hurt.",
											"You should level up yourself to fight better.",
											"I don't know what else to say.",
										];
										game.showTip(HINTS[Math.min(HINTS.length-1, game.situation.hints.battle||0)], null, null, { x: 1, y: 15, speed: 60, talker:"monster" });
										game.situation.hints.battle = (game.situation.hints.battle||0) + 1;
										dialog.index = 0;
										game.playSound(SOUNDS.PICKUP);
									}
								},
							],
						},
					],
				});
			};

			if (removeLock) {
				dialogCallback(game);
			}

			game.delayAction(game => {
				game.showTip(initialDialog, removeLock ? null : dialogCallback, null, { x: 1, y: 15, speed: 60, talker:"monster", removeLock });
			}, 300);
		},
		sprites: [
			{
				src: ASSETS.ZOOM_SHOP_MONSTER,
				index: ({ pendingTip, now }) => pendingTip && pendingTip.talker === "monster" && pendingTip.progress < 1 ? Math.floor(now / 150) % 4 : 0,
			},
			{
				custom: (game, sprite, ctx) => {
					ctx.fillStyle = "#00000088";
					ctx.fillRect(0, 0, 64, 20);
				},
			},
			{
				src: ASSETS.STATS,
				index: ({now, sceneData}) => Math.min(3, Math.floor((now - sceneData.showStats)/100)),
				hidden: ({sceneData}) => !sceneData.showStats,
				onClick: game => {},
			},
			{
				custom: (game, sprite, ctx) => {
					let space = game.displayTextLine(ctx, {msg: game.countItem("coin")+"", x:1, y:0 });
					game.displayImage(ctx, {src: ASSETS.GRAB_COIN, index:1, offsetX: -10 + space, offsetY: -46});
				},
				hidden: ({now, sceneData}) => (!sceneData.showStats || now - sceneData.showStats < 300) && !sceneData.forSale,
			},
			{
				custom: (game, sprite, ctx) => {
					let count = 0;
					const { mouse } = game;
					ctx.fillStyle = "#889933";
					game.situation.inventory.forEach(({item, name, cost, src, available}, index) => {
						if (available) {
							const yLine = 8 + count*6;
							if (mouse && mouse.y >= yLine && mouse.y < yLine+6 && mouse.x >= 4 && mouse.x <= 60) {
								ctx.fillRect(4, yLine, 56, 5);
							}
							game.displayTextLine(ctx, {msg: name, x:5, y:yLine });
							game.displayTextLine(ctx, {msg: ""+cost, x:43, y:yLine });
							game.displayImage(ctx, {src: ASSETS.GRAB_COIN, index:1, offsetX: 41, offsetY: -38 + count*6});
							count ++;
						}
					});
				},
				onClick: game => {
					let count = 0;
					const { mouse } = game;
					game.situation.inventory.forEach((itemToBuy, index) => {
						const {item, name, cost, src, available, msg} = itemToBuy;
						if (available) {
							const yLine = 8 + count*6;
							if (mouse && mouse.y >= yLine && mouse.y < yLine+6 && mouse.x >= 4 && mouse.x <= 60) {
								game.sceneData.showStats = 0;
								game.sceneData.itemToBuy = itemToBuy;
								game.sceneData.price = cost;
								game.showTip(msg, null, null, { x: 1, y: 15, speed: 60, talker:"monster", removeLock: true });
								game.dialog.index = 3;
								game.playSound(SOUNDS.BEEP, {volume:.5});
							}
							count ++;
						}
					});					
				},
				hidden: ({now, sceneData}) => !sceneData.showStats || now - sceneData.showStats < 300,
			},
			...standardBag(),
			{
				src: ({sceneData, inventory}) => inventory[sceneData.forSale].image,
				index: 3,
				hidden: ({sceneData}) => !sceneData.forSale,
			},
		],
	},
);