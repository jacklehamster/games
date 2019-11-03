gameConfig.scenes.push({
	name: "the-date",
	onScene: game => {
		game.waitCursor = true;
		game.situation.talked = {};
		game.playTheme(SOUNDS.SOFT_THEME, {volume: .8});
		game.delayAction(game => {
			game.sceneData.eyesWideOpened = game.now;
			game.currentScene.startTalk(game, "shopkeepa", [
				"I had a great time!", 
				"It was better than I ever imagined!",
			], game => {
				game.sceneData.eyesWideOpened = 0;
				game.currentScene.startTalk(game, "shopkeepa", [
					"So tell me,",
					"what do you think about about Tammy Slow?",
				], game => {
					game.waitCursor = false;
					game.currentScene.onDialog(game);
				});
			});
		}, 8000);
	},
	onWaiter: game => {
		game.dialog.paused = true;
		game.sceneData.waiter = game.now;
		game.delayAction(game => {
			game.sceneData.lookRight = game.now;
		}, 3000);
		game.delayAction(game => {
			game.currentScene.startTalk(game, "shopkeepa", "Hello", game => {
				game.currentScene.startTalk(game, "waiter", [
					"Welcome, I'm here to take your order",
				], game => {
					game.currentScene.startTalk(game, "shopkeepa", [
						"Great, I'd like a hot bun with spicy hot sauce,",
						"with hot pepper, crushberries, and lot's of honey!",
					], game => {
						game.currentScene.startTalk(game, "waiter", [
							"Excellent choice, Miss.",
						], game => {
							game.sceneData.waiterServeHuman = game.now;
							game.delayAction(game => {
								game.sceneData.lookRight = 0;
							}, 100);
							game.currentScene.startTalk(game, "waiter", [
								"And for the gentleman?",
							], game => {
								game.currentScene.startTalk(game, "shopkeepa", [
									"Order something...",
									"Tonight, it is my treat...",
								], game => {
									game.currentScene.startTalk(game, "human", [
										"Huh... I don't know what to order.",
										"Are you sure it's safe?",
										"Earlier, they gave me a cake that was so corrosive,",
										"it burned through metal when lit on fire.",
									], game => {
										game.currentScene.startTalk(game, "waiter", [
											"No need to\nworry, sir.",
											"We accommodate for every species, including humans.",
										], game => {
											game.currentScene.startTalk(game, "human", "So what's on the menu?", game => {
												game.currentScene.startTalk(game, "waiter", [
													"We serve\neverything.\nChoose anything you'd like!",
												], game => {
													game.currentScene.startTalk(game, "human", "Anything?", game => {
														game.dialog.paused = false;
														game.dialog.index++;
													});
												});
											});
										});
									});
								});
							});
						});
					});
				});
			});
		}, 3500);
	},
	laugh: game => {
		game.sceneData.laughing = game.now;
		game.playSound(SOUNDS.ANIMAL_CRY);
	},
	onDialog: (game, index) => {
		game.startDialog({
			index,
			conversation: [
				{
					options: [
						{
							msg: "Amazing!",
							onSelect: game => {
								game.currentScene.startTalk(game, "human", [
									"She is so amazing!",
								], game => {
									game.dialog.paused = true;
									game.sceneData.eyesWideOpened = 0;
									game.currentScene.laugh(game);
									game.delayAction(game => {
										game.sceneData.laughing = 0;
										game.currentScene.startTalk(game, "shopkeepa", [
											"Sounds like she got a new fan!",
											"Her voice is so unique. It takes a very special person to appreciate it.",
										], game => {
											game.currentScene.onWaiter(game);
										});
									}, 3000);
								});
							},
						},
						{
							msg: "Awful!",
							onSelect: game => {
								game.currentScene.startTalk(game, "human", [
									"To be honest",
									"This was awful!",
								], game => {
									game.dialog.paused = true;
									game.sceneData.eyesWideOpened = 0;
									game.currentScene.laugh(game);
									game.delayAction(game => {
										game.currentScene.startTalk(game, "human", [
											"I can't even begin to describe...",
											"how painful it was to sit through that concert",
											"for five hours straight!",
										], game => {
											game.sceneData.laughing = 0;
											game.currentScene.startTalk(game, "shopkeepa", [
												"Did you know that Tammy's voice",
												"exceeds far beyond the\naudible range of most humans?",
												"I can image, it must have been hard for you. Since you can barely hear any of the music.",
											], game => {
												game.currentScene.startTalk(game, "human", [
													"Well that explains a lot ...",
													"At least I had your company,",
													"that I enjoyed!",
												],
												game => {
													game.currentScene.startTalk(game, "shopkeepa", [
														"How sweet...",
													], game => {
														game.currentScene.onWaiter(game);
													});
												});
											});
										}, 3000);
									}, 2000);
								});
							},
						},
						{
							msg: "Tammy who?",
							onSelect: game => {
								game.currentScene.startTalk(game, "human", [
									"Tammy who?",
								], game => {
									game.dialog.paused = true;
									game.sceneData.eyesWideOpened = 0;
									game.currentScene.laugh(game);
									game.delayAction(game => {
										game.sceneData.laughing = 0;
										game.currentScene.startTalk(game, "shopkeepa", [
											"Did you fall asleep halfway or what?",
											"I know that humans, unlike most species in this universe,",
											"can't really appreciate a slow and mellow song,",
											"but they enjoy fast repetitive music ...",
											"Humans are so weird!",
										], game => {
											game.currentScene.onWaiter(game);
										});
									}, 1500);
								});
							},
						},
					],
				},
				{
					options: [
						{
							msg: "Fried T-Rex",
							onSelect: game => {
								game.currentScene.startTalk(game, "human", "Ok, I'll have a fried T-rex, please", game => {
									game.currentScene.startTalk(game, "waiter", "Right away, sir", game => {
										game.sceneData.waiterLeave = game.now;
										game.currentScene.startTalk(game, "human", "Wait, does he even know what a T-rex is?", game => {
											game.currentScene.startTalk(game, "shopkeepa", [
												"Your choice is irrelevant.",
												"Here, they\nanalyze your thoughts and feelings,",
												"and produce a dish perfectly tailored to your taste.",
											], game => {
												game.currentScene.startTalk(game, "human", "Outstanding!", game => game.dialog.index++);
											});
										})
									});
								});
							},
						},
						{
							msg: "Crisp salad",
							onSelect: game => {
								game.currentScene.startTalk(game, "human", "I'll just have a crisp salad.", game => {
									game.currentScene.startTalk(game, "waiter", "Right away, sir", game => {
										game.sceneData.waiterLeave = game.now;
										game.currentScene.startTalk(game, "human", "Better stay safe with my choices of food.", game => {
											game.currentScene.startTalk(game, "shopkeepa", [
												"Your choice is irrelevant.",
												"Here, they\nanalyze your thoughts and feelings,",
												"and produce a dish perfectly tailored to your taste.",
											], game => {
												game.currentScene.startTalk(game, "human", "Outstanding!", game => game.dialog.index++);
											});
										})
									});
								});
							},
						},
						{
							msg: "Spicy Yupa",
							onSelect: game => {
								game.currentScene.startTalk(game, "human", "How about a spicy ... Yupa?", game => {
									game.currentScene.startTalk(game, "waiter", "Right away, sir", game => {
										game.sceneData.waiterLeave = game.now;
										game.currentScene.startTalk(game, "human", [
											"Hey, wait up! I was kidding!",
											"He's not gonna cut up Yupa in pieces and serve that to me, is he?",
										], game => {
											game.currentScene.startTalk(game, "shopkeepa", [
												"Your choice is irrelevant. It's just for the experience.",
												"Here, they\nanalyze your thoughts and feelings,",
												"and produce a dish perfectly tailored to your taste.",
											], game => {
												game.currentScene.startTalk(game, "human", "Outstanding!", game => game.dialog.index++);
											});
										})
									});
								});
							},
						},
					],
				},
				{
					options: [
						{
							msg: "Whats your name?",
							hidden: (game, {msg}) => game.situation.talked[msg],
							onSelect: (game, dialog, conversation, {msg}) => {
								game.situation.talked[msg] = game.now;
								game.currentScene.startTalk(game, "human", [
									"So, I never introduced myself.",
									`I'm ${game.data.name || "Hitman"}`,
									"What is your name?",
								], game => {
									dialog.paused = true;
									game.delayAction(game => {
										dialog.paused = false;
										game.currentScene.startTalk(game, "shopkeepa", [
											"My name is\nAmari.",
										], game => {
											game.currentScene.startTalk(game, "human", [
												"That's a pretty name...",
												"What does it mean?",
											], game => {
												game.currentScene.startTalk(game, "shopkeepa", [
													"You'll find out eventually...",
												], game => {
//													game.dialog = null;
												});
											});
										})
									}, 1000);
								});
							},
						},
						{
							msg: "Earth music",
							hidden: (game, {msg}) => game.situation.talked[msg],
							onSelect: (game, dialog, conversation, {msg}) => {
								game.dialog.paused = true;
								game.situation.talked[msg] = game.now;
								game.currentScene.startTalk(game, "human", [
									"That Tammy, she's really something...",
									"So there's no music from Earth that you actually listen to?",
								], game => {
									game.currentScene.startTalk(game, "shopkeepa", [
										"Hum, I tried to, but the range of sound is so limited.",
										"What kind of music do you like?",
									], game => {
										game.dialog.paused = false;
										game.dialog.index ++;
									});
								});
							},
						},
						{
							msg: "Where you from?",
							hidden: (game, {msg}) => game.situation.talked[msg],
							onSelect: (game, dialog, conversation, {msg}) => {
								game.dialog.paused = true;
								game.situation.talked[msg] = game.now;
								game.currentScene.startTalk(game, "human", [
									"So, tell me...",
								], game => {
									game.sceneData.neutral = game.now;
									game.currentScene.startTalk(game, "human", [
										"What planet are you from?",
									], game => {
										game.sceneData.neutral = 0;
										game.delayAction(game => {
											game.currentScene.startTalk(game, "shopkeepa", [
												"I grew up in a planet called Salamanda.",
												"A beautiful place, light years from here.",
												"Filled with flowers that grow tall,\nhundreds of meters.",
											], game => {
												game.currentScene.startTalk(game, "human", [
													"You must miss your home!",
												], game => {
													game.currentScene.startTalk(game, "shopkeepa", [
														"Yes, very much. But I like it here. It's not so lonely.",
													]);
													game.dialog.paused = false;
												})
											});
										}, 500);
									});
								});
							},
						},
						{
							msg: "Any friends?",
							hidden: (game, {msg}) => game.situation.talked[msg] || !game.situation.talked["Where you from?"],
							onSelect: (game, dialog, conversation, {msg}) => {
								game.dialog.paused = true;
								game.situation.talked[msg] = game.now;
								game.currentScene.startTalk(game, "human", [
									"Tell me about your friends.",
								], game => {
									game.currentScene.startTalk(game, "shopkeepa", [
										"Well, not many people live in this area of town.",
										"There's Pedro, who's selling tickets to tourists.",
										"He's such a funny guy!",
										"Doctor Sarlie is nice too.",
										"Sometimes I bring fruits to his office, and we like to chat around a cup of warm chutea.",
									], game => {
										game.currentScene.startTalk(game, "human", [
											"Any... boyfriend?",
										], game => {
											game.currentScene.laugh(game);
											game.delayAction(game => {
												game.sceneData.laughing = 0;
												game.currentScene.startTalk(game, "shopkeepa", [
													"No! Oh my, Why do you ask?",
												], game => {
													game.currentScene.startTalk(game, "human", [
														"Just curious, that's all!",
													], game => {
														game.dialog.paused = false;
													});
												});
											}, 2000);
										});
									});
								});
							},
						},
						{
							msg: "Your dreams",
							hidden: (game, {msg}) => game.situation.talked[msg],
							onSelect: (game, dialog, conversation, {msg}) => {
								game.dialog.paused = true;
								game.situation.talked[msg] = game.now;
								game.currentScene.startTalk(game, "human", [
									"What are your dreams? Any plans in life?",
								], game => {
									game.delayAction(game => {
										game.currentScene.startTalk(game, "shopkeepa", [
											"Hum... not much I guess.",
											"Perhaps I'd like to start a family someday.",
											"And together, we would travel all over the universe ...",
										], game => {
											game.dialog.paused = false;
										});
									}, 500);
								});
							},
						},
						{
							msg: "Travel?",
							hidden: (game, {msg}) => game.situation.talked[msg] || !game.situation.talked["Your dreams"],
							onSelect: (game, dialog, conversation, {msg}) => {
								game.dialog.paused = true;
								game.situation.talked[msg] = game.now;
								game.currentScene.startTalk(game, "human", [
									"Where would you like to travel?",
								], game => {
									game.delayAction(game => {
										game.currentScene.startTalk(game, "shopkeepa", [
											"Hum... there's so many great planets to visit...",
											"The snowy planet of Udan...",
											"Or the peaceful desert of Solaris...",
											"But there's really one place that I want to visit the most...",
										], game => {
											game.currentScene.startTalk(game, "human", [
												"Which one is it?",
											], game => {
												game.dialog.paused = false;
												game.currentScene.startTalk(game, "shopkeepa", "Earth.");
											});
										});
									}, 500);
								});
							},
						},
						{
							msg: "Lets keep quiet",
							onSelect: (game, dialog, conversation, {msg}) => {
								game.dialog.paused = true;
								game.situation.talked[msg] = game.now;
								game.currentScene.startTalk(game, "human", [
									"Let's enjoy this peaceful moment ...",
								], game => {
									game.currentScene.startTalk(game, "shopkeepa", [
										"Sure",
									], game => {
										game.dialog = null;
									});
								});
							},
						},
					],
				},
				{
					options: [
						{
							msg: "Classical",
							onSelect: game => {
								game.dialog.paused = true;
								game.currentScene.startTalk(game, "human", [
									"I quite enjoy classical music!",
								], game => {
									game.currentScene.startTalk(game, "shopkeepa", [
										"Oh, classical... like what?",
									], game => {
										game.currentScene.startTalk(game, "human", [
											"I listen to Mozart!",
										], game => {
											game.sceneData.eyesWideOpened = game.now;
											game.currentScene.startTalk(game, "shopkeepa", [
												"Mozart... hey I know Mozart! Yeah he's great!",
											], game => {
												game.sceneData.eyesWideOpened = 0;
												game.currentScene.startTalk(game, "human", [
													"Hey, but you said you never listen to Earth music?",
												], game => {
													game.currentScene.startTalk(game, "shopkeepa", [
														"Haha, Mozart is actually an being from planet Zorxis.",
														"He's stayed on Earth disguised as a human to make music you all.",
													], game => {
														game.currentScene.laugh(game);
														game.delayAction(game => {
															game.sceneData.laughing = 0;
															game.currentScene.startTalk(game, "shopkeepa", [
																"Oh, the secret messages he put in his music.",
																"So funny!...",
															], game => {
																game.dialog.paused = false;
																game.dialog.index = 2;
															});
														}, 1000);
													});
												});
											});
										});
									});
								});
							},
						},
						{
							msg: "Techno",
							onSelect: game => {
								game.currentScene.startTalk(game, "human", [
									"I listen to Techno Music! Yeah!",
								], game => {
									game.currentScene.startTalk(game, "shopkeepa", [
										"Techno? What is that?",
									], game => {
										game.currentScene.startTalk(game, "human", [
											"It's very fast and repetitive music",
										], game => {
											game.dialog.paused = true;
											game.currentScene.laugh(game);
											game.delayAction(game => {
												game.sceneData.laughing = 0;
												game.currentScene.startTalk(game, "shopkeepa", [
													"You even admit it!",
													"Human music is so weird!",
												], game => {
													game.dialog.paused = false;
													game.dialog.index = 2;
												});
											}, 1000);
										})
									})
								});
							},
						},
						{
							msg: "Pop music",
							onSelect: game => {
								game.currentScene.startTalk(game, "human", [
									"I just listen to Pop Music.",
									"Everyone on Earth loves it!",
								], game => {
									game.currentScene.startTalk(game, "shopkeepa", [
										"Pop music, huh? Tell me more about it.",
									], game => {
										game.currentScene.startTalk(game, "human", [
											"Well, there's this singer who's very\npopular in my time,",
											"her name is Taylor Swift",
										], game => {
											game.dialog.paused = true;
											game.currentScene.laugh(game);
											game.delayAction(game => {
												game.sceneData.laughing = 0;
												game.currentScene.startTalk(game, "shopkeepa", [
													"Taylor Swift?",
													"With a name like that,",
													"I'm sure she sings super fast, and jump up and down?",
												], game => {
													game.currentScene.startTalk(game, "human", [
														"Right! Exactly."
													], game => {
														game.dialog.paused = false;
														game.dialog.index = 2;
													});
												});
											}, 2000);
										});
									});
								});
							},
						},
					],
				},
			],
		});
	},
	onSceneRefresh: game => {
		game.fade = Math.min(1, 1 - (game.now - game.sceneTime) / 10000);
	},
	startTalk: (game, talker, msg, onDone, removeLock, speed) => {
		let x, y;
		if (talker === "human") {
			x = 2;
			y = 62;
			game.playSound(SOUNDS.HUM);
		} else if (talker === "shopkeepa") {
			x = 4;
			y = 57;
			game.playSound(SOUNDS.ANIMAL_CRY);
		} else if (talker === "waiter") {
			x = 5;
			y = 50;
			game.playSound(SOUNDS.WAITER);
		}
		game.showTip(msg, onDone, speed || 80, { x, y, talker, removeLock });
	},
	sprites: [
		{
			src: ASSETS.DATE_TABLE, col: 4, row: 5,
			index: 18,
			noHighlight: game => game.dialog && !game.dialog.paused,
			onClick: game => {
				if (!game.dialog) {
					game.currentScene.onDialog(game, 2);
				} else {
					game.dialog.paused = false;
				}
			},
		},
		{
			src: ASSETS.DATE_TABLE, col: 4, row: 5,
			index: ({now, sceneTime, sceneData, pendingTip}) => {
				const frame = Math.floor(now / 100);
				if (sceneData.laughing) {
					return frame % 2 + 8;
				}
				if (sceneData.eyesWideOpened) {
					return 10 + (pendingTip && pendingTip.talker === "shopkeepa" && pendingTip.progress < 1 ? frame % 4 : 0);
				}
				if (sceneData.lookRight) {
					return 14 + (pendingTip && pendingTip.talker === "shopkeepa" && pendingTip.progress < 1 ? frame % 4 : 0);
				}
				if (pendingTip && pendingTip.talker === "shopkeepa" && pendingTip.progress < 1) {
					return frame % 5 + 3;
				}
				if (sceneData.neutral) {
					return 19;
				}
				return Math.min(3, frame % 100);
			},
		},
		{
			src: ASSETS.CAFEE, col: 3, row: 3,
			index: game => Math.floor(game.now / 300) % 7,
		},
		{
			src: ASSETS.CAFEE, col: 3, row: 3,
			index: game => Math.floor((game.now-500) / 300) % 7,
		},
		{
			src: ASSETS.CAFEE, col: 3, row: 3,
			index: game => Math.floor((game.now-1000) / 300) % 7,
		},
		{
			src: ASSETS.CANDLE,
			index: game => Math.floor(game.now / 150) % 4,
		},
		{
			src: ASSETS.WAITER, col: 2, row: 3,
			index: ({pendingTip, now, sceneData}) => {
				if (sceneData.waiterLeave) {
					return 4;
				}
				if(pendingTip && pendingTip.talker === "waiter" && pendingTip.progress < 1) {
					return (sceneData.waiterServeHuman ? 2 : 0) + Math.floor((now / 100) % 2);
				}
				return sceneData.waiterServeHuman ? 2 : 0;
			},
			offsetX: game => {
				if (game.sceneData.waiterLeave) {
					return Math.min(30, (game.now - game.sceneData.waiterLeave) / 50);
				}
				return Math.max(5, Math.floor(20 - (game.now - game.sceneData.waiter) / 100));
			},
			hidden: game => !game.sceneData.waiter,
		},
		{
			src: ASSETS.NEXT_SCENE,
			hidden: game => {
				return game.dialog || game.hideCursor || game.waitCursor;
			},
			onClick: game => game.fadeToScene("evening-date", null, 5000),
		},
		{
			custom: (game, sprite, ctx) => {
				game.displayTextLine(ctx, {
					msg: "skip", x: 50, y: 47,
				});
			},
			hidden: game => !game.hoverSprite || game.hoverSprite.src !== ASSETS.NEXT_SCENE,
		},		
	],
});