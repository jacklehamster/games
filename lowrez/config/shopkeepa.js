gameConfig.scenes.push(
	{
		name: "shopkeepa",
		arrowGrid: [
			[],
			[],
			[ null, null, null,  null, null  ],
			[ null, null, null,  null, null ],
			[ null, null, BAG ,  null, null ],
		],
		onSceneHoldItem: (game, item) => {
			if (item === "gun") {
				game.useItem = null;
				game.waitCursor = true;
				if (game.situation.askedWhereInSpace) {
					game.sceneData.shopkeepaSmiles = 0;
					game.currentScene.startTalk(game, "shopkeepa", "Hey, watch what you're doing with that!", game => {
						game.dialog.index = 13;
						game.useItem = null;
						game.waitCursor = false;
					});
				} else {
					game.showTip("I don't want to hurt anyone.", () => {
						game.waitCursor = false;
					});
				}
			}
		},
		startTalk: (game, talker, msg, onDone, removeLock, speed) => {
			let x, y;
			if (talker === "human") {
				x = 2;
				y = 62;
				game.playSound(SOUNDS.HUM);
			} else if (talker === "shopkeepa" || talker === "shopkeepa2" || talker === "shopkeepaphoto") {
				x = 4;
				y = 57;
				game.playSound(SOUNDS.ANIMAL_CRY);
			} else if (talker === "yupa" || talker === "yupa2") {
				x = 2;
				y = 55;
				game.playSound(SOUNDS.YUPA);				
			}
			game.showTip(msg, onDone, speed || 80, { x, y, talker, removeLock });
		},
		onStartDialog: game => {
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
								msg: "LEAVE",
								onSelect: game => {
									game.dialog = null;
									game.currentScene.startTalk(game, "shopkeepa", "Hope to see you soon.", game => {
										game.gotoScene("shop");
									});
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
												game.showTip("Nice doing business with you.", null, null, { x: 1, y: 15, speed: 60, talker:"shopkeepa", removeLock: true });
											}});
											const itemObj = game.situation.inventory.filter(obj=>obj.item===item)[0];
											if (itemObj && itemObj.unique) {
												itemObj.available = false;
											}
										}
									} else {
										game.playErrorSound();
										game.showTip("I'm sorry, you can't afford this.", null, null, { x: 1, y: 15, speed: 60, talker:"shopkeepa", removeLock: true });
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
					{	//	TEENAGE HITLER
						options: [
							{
								msg: "That sucks!",
								onSelect: (game, dialog) => {
									game.currentScene.startTalk(game, "human", "This is terrible!", game => {
										game.currentScene.startTalk(game, "shopkeepa", "Why is that?", game => {
											dialog.index += 2;
										});
									});
								},
							},
							{
								msg: "That's great!",
								onSelect: (game, dialog) => {
									game.currentScene.startTalk(game, "human", "Really, that's great!", game => {
										game.currentScene.startTalk(game, "shopkeepa", "Why is that?", game => {
											dialog.index += 1;
										});
									});
								},
							},
							{},
						],
					},
					{	//	That's great
						options: [
							{
								msg: "I can kill him!",
								onSelect: (game, dialog) => {
									game.currentScene.startTalk(game, "human", [
										"Now that he's no longer a baby...", 
										"I won't feel any remorse killing him.",
									], game => {
										game.currentScene.startTalk(game, "yupa", [
											"Hey ya dum dum,",
											"If ya kill him, ya gonna die!",
										], game => {
											game.currentScene.startTalk(game, "human", [
												"Oh right, I forgot",
											]);
											dialog.index = 8;
										});
									});
								},
							},
							{
								msg: "Beer buddy.",
								onSelect: (game, dialog) => {
									game.currentScene.startTalk(game, "human", [
										"Now I can hang out with him, have a beer and all.",
									], game => {
										game.currentScene.startTalk(game, "yupa", [
											"Ya wanna hava bier wid Hitler?",
										], game => {
											game.currentScene.startTalk(game, "human", [
												"Well... whatever...",
											]);
											dialog.index = 8;
										});
									});
								},
							},
							{
								msg: "Don't know.",
								onSelect: (game, dialog) => {
									game.currentScene.startTalk(game, "human", "Hum.. I don't know why I said that.", game => {
										dialog.index = 8;
									});
								},
							},
						],
					},
					{	//	That sucks
						options: [
							{
								msg: "He's too old!",
								onSelect: (game, dialog) => {
									game.currentScene.startTalk(game, "human", [
										"He's too old to be turned back into Hitler,",
										"after spending fifteen years in space!",
										"How are we going to do that?",
									], game => {
										game.currentScene.startTalk(game, "yupa", [
											"Ah dun worry abowt dat,",
											"We have wayz, therez a thingy called...",
											"mind purifaya...",
										], game => {
											game.currentScene.startTalk(game, "shopkeepa", [
												"In earth terms, they call that Brain Wash.",
											], game => {
												game.currentScene.startTalk(game, "human", [
													"That's terrible!",
												]);
											});
											dialog.index = 8;
										});
									});
								},
							},
							{
								msg: "Lost time.",
								onSelect: (game, dialog) => {
									game.currentScene.startTalk(game, "human", [
										"I was hoping to spend time with Baby Hitler,",
										"Watch him grow and all",
										"All this lost time...",
									], game => {
										game.currentScene.startTalk(game, "yupa", [
											"Ya did watch him grow",
											"Ya just dun rememba da last fifteen years,",
											"We only lost Baby Hitler abowt a year ago.",
										], game => {
											game.currentScene.startTalk(game, "human", [
												"Wait what?!",
												"So I lost fifteen years of memory?",,
												"And Yupa, you knew that Baby Hitler is a teenager?",
												"And you didn't tell me?",
												"Geez! I keep you around but you're not helping at all!",
											], game => {
												dialog.index = 8;
												game.currentScene.startTalk(game, "yupa", [
													"Hey I dun know maan!",
													"Whyz it so\nimportunt\nhez now teen Hitler? I dun know.",
												]);
											});
										});
									});
								},
							},
							{
								msg: "Don't know.",
								onSelect: (game, dialog) => {
									game.currentScene.startTalk(game, "human", "Hum.. I don't know why I said that.", game => {
										dialog.index = 8;
									});
								},
							},
						],
					},
					{
						options: [
							{
								msg: "Where in space?",
								hidden: game => game.situation.askedWhereInSpace,
								onSelect: (game, dialog) => {
									game.currentScene.startTalk(game, "human", [
										"So where in space are we going to find a human\nteenager?",
									], game => {
										game.currentScene.startTalk(game, "shopkeepa", [
											"Well, there aren't many places where humans thrive.",
											"In fact, there's only one\nearthling\ncommunity I know, outside of earth.",
											"Westrow X33, third planet in the Walak system.",
											"That's your best bet!",
										], game => {
											game.currentScene.startTalk(game, "yupa2", [
												"Da Walak system, datz liteyears away!",
												"We'll nevar get there on tame!"
											], game => {
												game.currentScene.startTalk(game, "shopkeepa", [
													"Well, we happen to be selling a very advanced warp drive.",
													"The top notch for space travel.",
													"It can take you there a couple days!",
													"It is quite costly, but if you can afford it...",
												], game => {
													game.situation.inventory.filter(({item}) => item==="warpdrive").forEach(item => {
														item.available = true;
													});
													game.situation.askedWhereInSpace = game.now;
													if (game.situation.askedWhereInSpace && game.situation.askedHowHeLookedLike) {
														dialog.index = 0;
													}
												});
											});
										})
									})
								},
							},
							{
								msg: "How he look like?",
								hidden: game => game.situation.askedHowHeLookedLike,
								onSelect: (game, dialog) => {
									game.currentScene.startTalk(game, "human", [
										"How are we going to recognize Baby Hitler?",
										"I don't know how Hitler looked like as a teenager!",
									], game => {
										game.currentScene.startTalk(game, "yupa", [
											"Dun worry, I can racognize dat baby.",
											"We all lived togetha, like big famaly, ya know?",
										], game => {
											game.currentScene.startTalk(game, "shopkeepa", [
												"I'm sure the kid will recognize your face as well,",
												"given the time you've spent together.",
											], game => {
												game.situation.askedHowHeLookedLike = game.now;
												if (game.situation.askedWhereInSpace && game.situation.askedHowHeLookedLike) {
													dialog.index = 0;
												}
											});
										});
									});
								},
							},
							{},
							{},
						],
					},
					{
						options: [
							{
								msg: "Let's trade",
								onSelect: game => {
									if (game.situation.proposedTrade) {
										game.currentScene.startTalk(game, "shopkeepa", [
											"Ok, so what do you want for those tickets?",
										], game => {
											game.dialog.index++;
										});
									} else {
										game.situation.proposedTrade = game.now;
										game.currentScene.startTalk(game, "human", [
											"You really want to go to Ecsta City, don't you?",
										], game => {
											game.currentScene.startTalk(game, "shopkeepa2", [
												"You have no idea!",
												"I love Tammy Slow, ever since I was little.",
												"It would mean the world to me, if I could just see her once in concert.",
											], game => {
												game.currentScene.startTalk(game, "human", [
													"Maybe we could come to some kind of ... arrangement",
												], game => {
													game.currentScene.startTalk(game, "shopkeepa", [
														"I see... you'd like a make a deal!",
														"Well, I guess now you know how much I want that ticket.",
														"But no matter, I'm ready to listen.",
														"What would you like in exchange?",
													], game => {
														game.dialog.index++;
													});
												});
											});
										});
									}
								},
							},
							{
								msg: "Nevermind",
								onSelect: game => {
									game.currentScene.startTalk(game, "human", "Let me think about it.", game => {
										game.dialog.index = 0;
									});
								},
							},
							{},
						],
					},
					{
						options: [
							{
								hidden: game => !game.situation.askedWhereInSpace,
								msg: "The warp drive",
								onSelect: game => {
									game.currentScene.startTalk(game, "human", [
										"I want the warp drive.",
									], game => {
										game.currentScene.startTalk(game, "shopkeepa", [
											"I guessed you would ask for that...",
										], game => {
											game.currentScene.startTalk(game, "shopkeepa2", [
												"Well, what can I say! I am a sucker for TAMMY SLOW!",
											], game => {
												game.currentScene.startTalk(game, "shopkeepa", [
													"But that warp drive, it's pretty expensive.",
													"I don't know if I can afford to give it away like that...",
												], game => {
													game.currentScene.startTalk(game, "human", [
														"How about you get both tickets?",
													], game => {
														game.currentScene.startTalk(game, "shopkeepa", [
															"Both tickets?",
														], game => {
															game.currentScene.startTalk(game, "human", [
																"Listen, we really need that warp drive!",
																"I must find Baby Hitler!",
																"It's a matter of life or death!",
															], game => {
																game.currentScene.startTalk(game, "shopkeepa", [
																	"Ok ok! I got it.",
																	"Sure I'll take both tickets. Maybe I'll find a buyer on the island."
																], game => {
																	game.currentScene.startTalk(game, "shopkeepa2", [
																		"Still, thank you so much!",
																		"I'm finally going to see Tammy Slow in concert! I'm so happy",
																	], game => {
																		game.removeFromInventory("ticket", 2);
																		game.pickUp({item:"warpdrive", image:ASSETS.GRAB_WARP_DRIVE, message:"Finally got it.", onPicked: game => {
																			game.currentScene.startTalk(game, "human", "We did it Yupa! Let's go find find Baby Hitler!", game => {
																				game.dialog = null;
																			});
																		}});					
																	});
																});
															});
														});
													});
												})
											});
										});
									});
								},
							},
							{
								msg: "A date",
								hidden: game => game.situation.askedForDate && !game.situation.canAskAgain,
								onSelect: game => {
									if (game.situation.askedForDate) {
										game.currentScene.startTalk(game, "human", [
											"I'd like to ask you out on a date.",
										], game => {
											game.currentScene.startTalk(game, "shopkeepa", [
												"Again with the date?",
											], game => {
												game.dialog.index++;
											});
										});
									} else {
										game.situation.askedForDate = game.now;
										game.currentScene.startTalk(game, "human", [
											"I'd like to ask you out on a date.",
										], game => {
											game.currentScene.startTalk(game, "shopkeepa", [
												"What?",
											], game => {
												game.currentScene.startTalk(game, "human", [
													"A date",
													"On Earth,\nsometimes two people go out together",
													"have a good time, get to know each other...",
												], game => {
													game.currentScene.startTalk(game, "shopkeepa", [
														"I know what a date is.",
														"I'm just confused... Why?",
													], game => {
														game.dialog.index++;
													});
												});
											});
										});
									}
								},
							},
							{
								msg: "Money",
								onSelect: game => {
									game.currentScene.startTalk(game, "human", [
										"I'm willing to sell.",
									], game => {
										game.currentScene.startTalk(game, "shopkeepa", [
											"You know I can't afford the full price.",
										], game => {
											game.sceneData.shopkeepaSmiles = game.now;
											game.currentScene.startTalk(game, "shopkeepa2", [
												"But if you're willing to give me a big discount,",
												"I can pay 142 coins!",
											]);
											game.dialog.index = 12;
										});
									});
								},
							},
							{
								msg: "Your soul",
								hidden: game => game.situation.yourSoul,
								onSelect: game => {
									game.situation.yourSoul = game.now;
									game.currentScene.startTalk(game, "human", [
										"In exchange for those tickets,",
										"I will own your soul!",
									], game => {
										game.currentScene.startTalk(game, "shopkeepa", [
											"I see...",
											"You were just joking.",
											"Oh well... It's ok.",
											"I shouldn't keep my hopes up like this.",
										], game => {
											game.dialog.index--;											
										});
									});
								},
							},
							{
								msg: "Nevermind",
								onSelect: game => {
									game.currentScene.startTalk(game, "human", "Let me think about it.", game => {
										game.dialog.index = 0;
									});
								},
							},
						],
					},
					{
						options: [
							{
								msg: "The warpdrive",
								hidden: game => !game.situation.askedWhereInSpace || game.situation.dateForWarpdrive,
								onSelect: game => {
									game.situation.dateForWarpdrive = game.now;
									game.currentScene.startTalk(game, "human", [
										"I just really need that warpdrive.",
										"I thought maybe we could...",
									], game => {
										game.currentScene.startTalk(game, "shopkeepa", [
											"Hey! I don't know how you do business on your planet,",
											"but here, if you want something, you just say it!",
											"If you want the warpdrive, we can talk about that,",
											"but don't run around the bushes...",
											"... whatever that expression you earthlings have.",
										], game => {
											game.currentScene.startTalk(game, "human", [
												"Okay okay...",
												"Forget what I said."
											], game => {
												game.currentScene.startTalk(game, "shopkeepa2", [
													"Done!",
												], game => {
													game.dialog.index = 0;
												});
											});
										})
									});
								},
							},
							{
								msg: "I'm horny",
								onSelect: game => {
									game.currentScene.startTalk(game, "human", [
										"Listen... I've been stuck in a jail cell for a very long time.",
										"A man, has his needs...",
										"You know what I mean, right? Release tension and stuff!",
									], game => {
										game.currentScene.startTalk(game, "shopkeepa", [
											"I don't really know...",
										], game => {
											game.currentScene.startTalk(game, "human", [
												"I NEED SEX OK? PLEASE, I'M HORNY!..",
											], game => {
												game.delayAction(game => {
													game.sceneData.yupaLookAtShopkeepa = game.now;
												}, 300);
												game.currentScene.startTalk(game, "shopkeepa", [
													"Hey! Calm down here!",
													"This is a place for business.",
													"Let's keep it that way!",
												], game => {
													game.sceneData.shopkeepaSmiles = game.now;
													game.currentScene.startTalk(game, "shopkeepa2", [
														"So thanks for your funny little joke, now let's keep it\nprofessional here.",
													], game => {
														game.delayAction(game => {
															game.sceneData.yupaLookAtShopkeepa = 0;
														}, 300);

														game.currentScene.startTalk(game, "human", [
															"Sorry, forget what I said",
														], game => {
															game.currentScene.startTalk(game, "shopkeepa2", [
																"Done!",
															], game => {
																game.sceneData.shopkeepaSmiles = 0;
																game.dialog.index = 0;
															});
														});
													});
												});
											});
										});
									})
								},
							},
							{
								msg: "I like you",
								onSelect: game => {
									game.currentScene.startTalk(game, "human", [
										"Hum... I like you.",
									], game => {
										game.currentScene.startTalk(game, "shopkeepa", [
											"Get out of here!",
										], game => {
											game.delayAction(game => {
												game.sceneData.shopkeepaSmiles = game.now;
											}, 5500);
											game.delayAction(game => {
												game.sceneData.yupaLookAtShopkeepa = game.now;
											}, 6500);
											game.currentScene.startTalk(game, "human", [
												"Hey for real yo!",
												"You keep raving about Tammy Slow, now I really wanna meet her.",
												"Let's go to that concert together.",
											], game => {
												game.currentScene.startTalk(game, "shopkeepa2", [
													"You're kidding me. You want to me to come with you to Ecsta City?",
												], game => {
													game.delayAction(game => {
														game.sceneData.yupaLookAtShopkeepa = 0;
													}, 300);
													game.sceneData.shopkeepaSmiles = 0;
													game.delayAction(game => {
														game.sceneData.yupaLookAtShopkeepa = game.now;
														game.delayAction(game => {
															game.sceneData.yupaLookAtShopkeepa = 0;
														}, 1000);
													}, 5500);
													game.delayAction(game => {
														game.sceneData.shopkeepaLookAtYupa = game.now;
														game.delayAction(game => {
															game.sceneData.shopkeepaLookAtYupa = 0;
														}, 1000);
													}, 6000);
													game.currentScene.startTalk(game, "human", [
														"Like I said, I like you...",
														"I think you're cute!",
														"So I wanna spend time with you, get to know you better.",
													], game => {
														game.sceneData.yupaLookAtShopkeepa = 0;
														game.sceneData.shopkeepaLookAtYupa = game.now;
														game.currentScene.startTalk(game, "yupa", [
															"Hey! Waida minut!",
															"One of thoze tickets iz mine!",
															"Ya cant just givewai ma ticket fo free!",
														], game => {
															game.delayAction(game => {
																game.sceneData.shopkeepaLookAtYupa = 0;
															}, 500);
															game.currentScene.startTalk(game, "human", [
																"You're right Yupa.",
															], game => {
																game.dialog.index = 14;
															});
														});
													});
												});
											});
										});
									});
								},
							},
							{
								msg: "Forget it!",
								hidden: game => game.situation.forgetIt,
								onSelect: game => {
									game.situation.forgetIt = game.now;
									game.currentScene.startTalk(game, "human", [
										"Forget what I said",
										"Didn't mean to scare you...",
									], game => {
										game.currentScene.startTalk(game, "shopkeepa2", [
											"Oh no, it's ok!",
											"I was just\nsurprised\nthat's all!",
										], game => {
											game.situation.canAskAgain = true;
											game.sceneData.shopkeepaSmiles = 0;
											game.dialog.index = 0;
										});
									});
								},
							},
						],
					},
					{
						options: [
							{
								msg: "Sure",
								onSelect: game => {
									game.sceneData.soldTickets = game.now;
									game.sceneData.shopkeepaSmiles = game.now;
									game.currentScene.startTalk(game, "human", "Sure, that will do.", game => {
										game.currentScene.startTalk(game, "shopkeepa2", [
											"Wow, really?",
											"I'm so happy! I'm going to see Tammy Slow in concert!",
										], game => {
											game.sceneData.takeTicket = game.now;
											game.dialog.paused = true;
											game.delayAction(game => {
												game.currentScene.startTalk(game, "shopkeepa2", [
													"I'm very grateful to you for that.",
												], game => {
													game.sceneData.takeTicket = 0;
													game.dialog.paused = false;
													game.addToInventory({item:"coin", count: 142, image:ASSETS.GRAB_COIN});
													game.removeFromInventory("ticket");
													game.dialog.index = 0;
													game.sceneData.shopkeepaSmiles = 0;
												});
											}, 300);
										});
									});
								},
							},
							{
								msg: "No",
								onSelect: game => {
									game.currentScene.startTalk(game, "human", "That's not enough.", game => {
										game.sceneData.shopkeepaSmiles = 0;
										game.currentScene.startTalk(game, "shopkeepa", "Yeah I figured.", game => {
											game.dialog.index = 0;
										});
									});
								},
							},
							{},
						],
					},
					{
						options: [
							{
								msg: "The warp drive",
								hidden: game => game.situation.askedWhereInSpace,
								onSelect: game => {
									const { sceneData } = game;
									game.waitCursor = true;
									game.useItem = "gun";
									game.currentScene.startTalk(game, "human", "Give me the warp drive, or else!", game => {
										sceneData.yupaLookAtShopkeepa = game.now;
										game.currentScene.startTalk(game, "shopkeepa", "You can't be serious.", game => {
											sceneData.yupaLookAtShopkeepa = 0;
											game.currentScene.startTalk(game, "human", [
												"Oh, I'm very serious!",
												"You wanna know how serious I am, I'll show you!",
											], game => {
												sceneData.yupaLookAtShopkeepa = game.now;
												game.currentScene.startTalk(game, "shopkeepa", [
													"Cut it out! I got the point.",
													"Alright, here's the warpdrive.",
													"I'll even\nconfigure the parameters for you.",
												], game => {
													game.situation.stoleWarpDrive = game.now;
													game.waitCursor = false;
													game.pickUp({item:"warpdrive", image:ASSETS.GRAB_WARP_DRIVE, message:"That's it! The warpdrive!", onPicked: game => {
														game.waitCursor = true;
														game.currentScene.startTalk(game, "shopkeepa", "I hope you're satisfied, now that you got what you want.", game => {
															game.currentScene.startTalk(game, "human", [
																"You gave me no choice",
															], game => {
																game.delayAction(game => {
																	sceneData.yupaLookAtShopkeepa = 0;
																}, 50);
																game.currentScene.startTalk(game, "human", [
																	"Let's go Yupa,",
																	"We're going to find Baby Hitler.",
																], game => {
																	game.hideCursor = true;
																	game.dialog = null;
																	game.fadeToScene("monster-in-space");
																});
															});
														});
													}});					
												});
											});
										});
									});
								},
							},
							{
								msg: "Sorry",
								onSelect: game => {
									game.currentScene.startTalk(game, "human", "Sorry, I didn't mean to scare you", game => {
										game.currentScene.startTalk(game, "shopkeepa", "I'm not scared.", game => {
											game.dialog.index = 0;
										});
									});
								},
							},
						],
					},
					{
						options: [
							{
								msg: "I'll owe you",
								onSelect: game => {
									game.currentScene.startTalk(game, "human", [
										"Thanks for your ticket Yupa. I'll owe you one.",
									], game => {
										game.currentScene.startTalk(game, "yupa", [
											"Scuw ya!",
										], game => {
											game.currentScene.startTalk(game, "human", [
												"So what do you say, will you join me this evening?",
											], game => {
												game.dialog.paused = true;
												game.delayAction(game => {
													game.sceneData.shopkeepaCuteSmile = game.now;
													game.delayAction(game => {
														game.currentScene.startTalk(game, "shopkeepa2", [
															"Okay",
														], game => {
															game.delayAction(game => {
																game.dialog = null;
																game.fadeToScene("tammy-slow", null, 3000);
															}, 1000);
														}, null, 200);
													}, 2000);
												}, 4000);
											});
										});
									});
								},
							},
							{
								msg: "We'll sneak you in",
								onSelect: game => {
									game.delayAction(game => {
										game.sceneData.shopkeepaLookAtYupa = game.now;
									}, 1000);
									game.currentScene.startTalk(game, "human", [
										"Don't worry Yupa. I have a plan.",
										"We'll put you inside a bottle like last time and sneak you in!",
									], game => {
										game.currentScene.startTalk(game, "yupa", [
											"Scuw ya!",
										], game => {
											game.delayAction(game => {
												game.sceneData.shopkeepaLookAtYupa = 0;
											}, 100);
											game.currentScene.startTalk(game, "human", [
												"So what do you say, will you join me this evening?",
											], game => {
												game.dialog.paused = true;
												game.delayAction(game => {
													game.sceneData.shopkeepaCuteSmile = game.now;
													game.delayAction(game => {
														game.currentScene.startTalk(game, "shopkeepa2", [
															"Okay",
														], game => {
															game.delayAction(game => {
																game.dialog = null;
																game.fadeToScene("the-date", null, 3000);
															}, 1000);
														}, null, 200);
													}, 2000);
												}, 4000);
											});
										});
									});
								},
							},
							{
								msg: "Nevermind",
								onSelect: game => {
									game.currentScene.startTalk(game, "human", [
										"Sorry, Yupa's right. I can't really give you his ticket.",
									], game => {
										game.currentScene.startTalk(game, "shopkeepa", [
											"Don't worry, I understand.",
										], game => {
											game.dialog.index = 0;
										})
									});
								},
							},
						],
					}
				],
			});
		},
		onScene: game => {
			if (!game.situation.inventory) {
				game.situation.inventory = [
					{ item: "tip",			name: "tip",			cost: 1,									available:true,
						msg: "Don't know what to do? I can give you a hint.",
					},
					{ item: "bullet", 		name: "bullet", 		cost: 5,	src: ASSETS.GRAB_GUN,			available:true,
						msg: "A bit expensive, but it'll help you out in a fight.",
					},
					{ item: "warpdrive",    name: "warpdrive",      cost: 1000, src: ASSETS.GRAB_WARP_DRIVE,			available:false,
					},
				];
			}

			if (game.useItem) {
				game.currentScene.onStartDialog(game);
			} else {
				game.currentScene.startTalk(game, "shopkeepa", game.situation.askedForDate && !game.situation.canAskAgain ? "Hey!" : "Hello, handsome!", game => {
					game.delayAction(game => {
						game.currentScene.onStartDialog(game);
					}, 50);
				});
			}
		},
		sprites: [
			{
				src: ASSETS.SHOPKEEPA, col: 6, row: 6,
				index: 23,
				combine: (item, game) => {
					if (item === "photo") {
						if (game.situation.explainedPhoto) {
							game.sceneData.sheTookPhoto = game.now;
							game.dialog.paused = true;
							game.useItem = null;
							game.delayAction(game => {
								game.currentScene.startTalk(game, "shopkeepa2", ["What a cute baby...", "Look at that mustache!"], game => {
									game.sceneData.sheTookPhoto = 0;
									game.sceneData.returnPhoto = game.now;
									game.delayAction(game => {
										game.useItem = "photo";
										game.useItem = null;
										game.delayAction(game => {
											game.dialog.paused = false;
										}, 300);
									}, 300);									
								});
							}, 1000);
						} else {
							game.situation.explainedPhoto = game.now;
							game.currentScene.startTalk(game, "shopkeepa", "We don't buy back items in this shop.", game => {
								game.currentScene.startTalk(game, "human", "Actually, we're looking for this baby. Have you seen him?", game => {
									game.dialog.paused = true;
									game.currentScene.startTalk(game, "shopkeepa", "Oh, ok... let me see the photo.", game => {
										game.sceneData.sheTookPhoto = game.now;
										game.useItem = null;
										game.delayAction(game => {
											game.currentScene.startTalk(game, "shopkeepa", ["That's a human baby.", "It's not\nsomething you find every day."], game => {
												game.currentScene.startTalk(game, "human", ["So I've heard.", "Have you seen him?"], game => {
													game.currentScene.startTalk(game, "shopkeepa", [
														"This baby? No...",
														"I don't even recall the last time I saw a human baby.",
														"There's\nsomething\npeculiar about this photo though...",
														"Let me see...",
													], game => {
														game.sceneData.sheLookPhoto = game.now;
														game.delayAction(game => {
															game.sceneData.sheLookPhoto = 0;
															game.currentScene.startTalk(game, "shopkeepa", [
																"You'll never find your baby with this.",
																"This photo was taken more than 15 years ago!",
																"Your baby human is now at least a 15 years old!",
															], game => {
																game.sceneData.sheTookPhoto = 0;
																game.sceneData.returnPhoto = game.now;
																game.delayAction(game => {
																	game.useItem = "photo";
																	game.currentScene.startTalk(game, "human", ["Wait, you mean Baby Hitler...", "is now Teenage Hitler?!"], game => {
																		game.currentScene.startTalk(game, "shopkeepa", "That's right!", game => {
																			game.useItem = null;
																			game.dialog.paused = false;
																			game.dialog.index = 5;
																		});
																	});
																}, 300)
															});
														}, 5000);
													});
												});
											});
										}, 1000);
									});
								});
							});
						}
						return true;
					} else if (item === "coin") {
						game.useItem = null;
						game.currentScene.startTalk(game, "shopkeepa", "What would you like to buy?", game => {
							if (game.dialog) {
								game.dialog.index = 1;
								game.sceneData.showStats = game.now;
								if (game.pendingTip) {
									game.pendingTip.end = game.now;
								}								
							}
						});		
						return true;
					} else if (item === "ticket") {
						if (game.sceneData.soldTickets) {
							game.currentScene.startTalk(game, "shopkeepa2", [
								"Haha, thanks but I really can't afford a second ticket.",
								"Why don't you go as well? It'll have fun!",
							], game => {
								game.currentScene.startTalk(game, "yupa2", "Dat other ticket iz mine!", game => {
									game.useItem = null;
								});
							});
						} else if (game.situation.showedTickets) {
							game.useItem = null;
							game.currentScene.startTalk(game, "shopkeepa", [
								"Yeah yeah I know...",
								"You get to go to Ecsta City.",
								"I envy you."
							]);
							game.dialog.index = 9;
						} else {
							game.situation.showedTickets = game.now;
							game.currentScene.startTalk(game, "shopkeepa2", [
								"Wow! you got tickets to Ecsta City!",
							], game => {
								game.currentScene.startTalk(game, "shopkeepa", [
									"Oh right, that's your first time here. Pedro must have given you a free pass.",
								], game => {
									game.currentScene.startTalk(game, "shopkeepa2", [
										"I'm so envious! I really wanted to see...",
										"TAMMY SLOW\nin concert!",
									], game => {
										game.useItem = null;
										game.currentScene.startTalk(game, "shopkeepa", [
											"But the tickets to Ecsta City are sooo\nexpensive!",
											"If I miss her this time, I'm sure I'll never see her in concert.",
										], game => {
											game.dialog.index = 9;
										});
									})
								});
							});
						}
						return true;
					} else {
						game.currentScene.startTalk(game, "shopkeepa", "We don't buy back items in this shop.", game => {
							game.useItem = null;
						});						
						return true;
					}
				},
			},
			{
				src: ASSETS.SHOPKEEPA, col: 6, row: 6,
				index: (game, sprite) => {
					const { pendingTip, currentScene, now, sceneData } = game;
					if (sceneData.takeTicket) {
						const frame = Math.floor((now - sceneData.takeTicket) / 200);
						if (frame < 2) {
							return 8 + frame;
						}
					}

					if (sceneData.returnPhoto && now - sceneData.returnPhoto < 800) {
						return Math.max(8, 11 - Math.floor((now - sceneData.returnPhoto)/100));
					}

					if (sceneData.sheLookPhoto) {
						const frame = 15 + Math.floor((now - sceneData.sheLookPhoto) / 100);
						if (frame < 18) {
							return frame;
						} else if (frame < 50) {
							return 18;
						} else {
							const f = Math.max(14, 18 - (frame - 50));
							return f === 14 ? 11 : f;
						}
						return Math.min(18, 15 + Math.floor((now - sceneData.sheLookPhoto) / 100));
					}
					if (sceneData.sheTookPhoto) {
						if (pendingTip && pendingTip.talker === "shopkeepa" && pendingTip.progress < 1) {
							return 11 + Math.floor(now / 100) % 4;
						}

						return Math.min(11, 8 + Math.floor((now - sceneData.sheTookPhoto)/100));

					}
					if (pendingTip && pendingTip.talker==="yupa2") {
						return 22;
					}
					if (game.sceneData.shopkeepaCuteSmile) {
						if (pendingTip && (pendingTip.talker==="shopkeepa" || pendingTip.talker==="shopkeepa2")) {
							return 24 + (pendingTip.progress < 1 ? Math.floor((now - game.sceneData.shopkeepaCuteSmile) / 100) % 7 : 0);
						}
						return 24;
					}
					if (pendingTip && pendingTip.talker==="shopkeepa") {
						return pendingTip.progress < 1 ? Math.floor(now / 100) % 4 : 0;
					}
					if (pendingTip && pendingTip.talker==="shopkeepa2") {
						return 4 + (pendingTip.progress < 1 ? Math.floor(now / 100) % 4 : 0);
					}
					if (game.sceneData.shopkeepaSmiles) {
						return 4;
					}
					if (game.sceneData.shopkeepaLookAtYupa) {
						return 22;
					}
					return 0;
				},
			},
			{
				src: ASSETS.YUPA_IN_SHOP, col: 3, row: 4,
				index: (game, sprite) => {
					const { pendingTip, currentScene, now, sceneData } = game;
					if (pendingTip && pendingTip.talker==="yupa") {
						return Math.floor(now / 100) % 4;
					}
					if (pendingTip && pendingTip.talker==="yupa2") {
						return 4 + Math.floor(now / 100) % 4;
					}
					if (sceneData.sheTookPhoto && (!pendingTip || pendingTip.talker!=="human")) {
						return 4;
					}
					if (sceneData.yupaLookAtShopkeepa) {
						return 4;
					}
					const frame = Math.floor((game.now - game.sceneTime) / 100);
					return frame > 2 ? 0 : frame + 8;
				},
				combine: (item, game) => {
					game.useItem = null;
					game.currentScene.startTalk(game, "yupa", "Show dat to da shopkeepa, nat me");
					return true;
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
								game.showTip(msg, null, null, { x: 1, y: 15, speed: 60, talker:"shopkeepa", removeLock: true });
								game.dialog.index = 3;
								game.playSound(SOUNDS.BEEP, {volume:.5});
							}
							count ++;
						}
					});					
				},
				hidden: ({now, sceneData}) => !sceneData.showStats || now - sceneData.showStats < 300,
			},			
			{
				src: ASSETS.SPEECH_OUT,
				hidden: game => game.bagOpening || game.useItem || game.pendingTip || game.sceneData.showStats || !game.dialog || game.dialog.paused,
				index: game => Math.min(3, Math.floor((game.now - game.sceneTime) / 50)),
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