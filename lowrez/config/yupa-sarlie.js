gameConfig.scenes.push(
	{
		name: "yupa-sarlie",
		onScene: game => {
			game.playTheme(SOUNDS.JAIL_CELL_THEME);
			game.startDialog({
				time: game.now,
				index: 0,
				findBabyHitler: game => {
					game.sceneData.hitmanSurprised = 0;
					game.sceneData.looking = 0;
					game.currentScene.startTalk(game, "yupa", [
						"Okay, ya dun seem sure",
						"Are ya sure?",
					], game => {
						game.startDialog({
							time: game.now,
							index: 0,
							conversation: [
								{
									options: [
										{},
										{
											msg: "Yes, I'm sure.",
											onSelect: game => {
												game.currentScene.startTalk(game, "human", [
													"Yes I'm sure, let's do it",
												], game => {
													game.currentScene.startTalk(game, "yupa", [
														"Okey, lets go look for da baby.",
													], game => {
														game.currentScene.startTalk(game, "doctar", [
															"You might start with the island's shopkeeper.",
															"He knows a lot of people.",
															"Maybe he knows someone who saw your baby.",
														], game => {
															game.currentScene.startTalk(game, "human", [
																"Thanks doctor.",
																"Yupa, let's go.",
															], game => {
																game.dialog = null;
																game.data.seen.doctor = game.now;
																game.fadeToScene("sarlie-planet-world", null, null, game => {
																	game.sceneData.fromDoctor = true;
																});
															});
														});
													});
												});
											},
										},
										{
											msg: "Not sure.",
											onSelect: game => {
												game.currentScene.startTalk(game, "human", [
													"Actually, I'm not sure.",
													"Give me some time to think about it",
												],
												game => {
													game.gotoScene("doctar-room");
													game.sceneData.from = null;
													game.sceneData.to = "door";
													game.sceneData.toReach = null;																		
												});
											},
										},
									],
								},
							],
						});
					});
				},
				conversation: [
					{
						options: [
							{},
							{
								msg: "I made a decision.",
								onSelect: (game, dialog) => {
									const { currentScene } = game;
									currentScene.startTalk(game, "human", [
										"I have made a decision.",
									], game => {
										game.dialog.index ++;
										currentScene.startTalk(game, "doctar", "Sure, what have you decided?");
									});
								}
							},
							{ msg: "LEAVE", onSelect: game => {
								game.gotoScene("doctar-room");
								game.sceneData.from = null;
								game.sceneData.to = "door";
								game.sceneData.toReach = null;
							}},
						],
					},
					{
						options: [
							{},
							{
								msg: "Find Baby Hitler.",
								onSelect: (game, dialog) => {
									const { currentScene } = game;
									currentScene.startTalk(game, "human", [
										"Let's go find Baby Hitler,",
										"bring him back to Earth,",
										"and let history unfold...",
									], game => {
										dialog.findBabyHitler(game);
									});
								},
							},
							{
								msg: "Forget the baby.",
								onSelect: (game, dialog) => {
									const { currentScene } = game;

									currentScene.startTalk(game, "human", [
										"Forget Baby Hitler.",
									], game => {
										game.sceneData.looking = game.now;
										if (game.situation.forgetTheBaby) {
											game.dialog.index = 4;											
											return;
										}


										currentScene.startTalk(game, "human", [
											"I can't let history repeat itself.",
										], game => {
											game.dialog.paused = game.now;
											game.delayAction(game => {
												game.sceneData.looking = 0;
												currentScene.startTalk(game, "yupa", [
													"But ya ganna disappear,",
													"Wayi would yo du dat?",
												], game => {
													dialog.index++;
													dialog.paused = false;
												});
											}, 1000);
										});
									});
								},
							},
						],
					},
					{
						onSelect: (game, dialog, conversation) => {
							const { currentScene } = game;
							dialog.paused = true;
							currentScene.startTalk(game, "human", [
								"I can't let Hitler return to earth.",
								"In my timeline, he killed millions of people.",
								"I'd rather die.",
							], game => {
								game.sceneData.looking = game.now;
								game.delayAction(game => {
									currentScene.startTalk(game, "yupa", [
										"I told ya",
										"Humaz are wierd."
									], game => {
										currentScene.startTalk(game, "doctar", [
											"You weren't kidding."
										], game => {
											game.sceneData.looking = 0;
											game.dialog.paused = 0;
											game.dialog.index ++;
											currentScene.startTalk(game, "yupa", [
												`Ya know ${game.data.name||"hitman"},`,
												"I know someone who killed a lat more peepol than Hitlah",
											]);
										});
									});
								}, 1000);
							});
						},
						options: [
							{
								msg: "To stop Hitler.",
								onSelect: (game, dialog, conversation) => {
									conversation.onSelect(game, dialog, conversation);
								},								
							},
							{
								msg: "To save humans.",
								onSelect: (game, dialog, conversation) => {
									game.currentScene.startTalk(game, "human", "I want to save mankind.", game => {
										conversation.onSelect(game, dialog, conversation);
									});
								},
							},
							{
								msg: "Changed my mind.",
								onSelect: (game, dialog, conversation) => {
									game.currentScene.startTalk(game, "human", [
										"Wait, I changed my mind,",
										"Forget what I said. Let me start over."], game => {
										game.dialog.index = 0;
									});
								},
							},
						],
					},
					{
						onSelect: (game, dialog, conversation) => {
							const { currentScene } = game;
							dialog.paused = true;
							currentScene.startTalk(game, "yupa", [
								"No ya dum dum.",
								"Im talkin abowt YOU!"
							], game => {
								currentScene.startTalk(game, "human", [
									"What?!?!",
								], game => {
									currentScene.startTalk(game, "human2", [
										"That's insane!",
										"I might be a hitman,",
										"but I'm not a mass murderer!"
									], game => {
										game.sceneData.looking = game.now;
										currentScene.startTalk(game, "doctar", [
											"I don't think he realizes."
										], game => {
											game.sceneData.looking = 0;
											currentScene.startTalk(game, "yupa", [
												`${game.data.name||"Hitman"},`,
												`yo rememba wat ya did before?`,
												`Ya travel back in tam, from da year ${new Date().getFullYear()} to 1889`,
												"To kell da babi.",
											], game => {
												currentScene.startTalk(game, "human2", [
													"Yes I know. And I did not kill him.",
													"We just took Baby Hitler into space.",
													"And I lived my life starting 1889... with you and Baby Hitler!",
												], game => {
													currentScene.startTalk(game, "yupa", [
														"Rite, so wad da ya think happen",
														`to 7 billionz humanz who wure living in ${new Date().getFullYear()}?`,
													], game => {
														game.sceneData.hitmanSurprised = game.now;
														game.delayAction(game => {
															currentScene.startTalk(game, "human2", [
																	".. they ...", "well, they ... didn't die", "did they?",
																	"I mean they didn't ...", "suffer ...", "... right?",
																], game => {
																	game.sceneData.hitmanSurprised = 0;
																	currentScene.startTalk(game, "yupa", [
																		"Rite they just gat erazed from existenss.",
																		"Theyll nevar finish deir livez.",
																		"Thatz not same as dyin for ya?",
																	], game => {
																		game.sceneData.hitmanSurprised = game.now;
																		currentScene.startTalk(game, "human2", [
																			"Oh no! You're right!",
																			"I did it! I killed them all!",
																			"I'm the biggest mass murderer in history!",
																		], game => {
																			game.sceneData.hitmanSurprised = 0;
																			currentScene.startTalk(game, "yupa", [
																				"Chill itz okaaay",
																				"My point, ya dun have take it so seriasly",
																				"Just live, enjuy lafe! Stay wid us.",
																				"Idz juzt a game aftar all!",
																			], game => {
																				game.situation.forgetTheBaby = game.now;
																				game.sceneData.hitmanSurprised = game.now;
																				game.dialog.paused = false;
																				game.dialog.index++;
																			});
																		});
																	});

															});
														}, 1000);
													});
												});
											});
										});
									});
								});
							});
						},
						options: [
							{
								msg: "Joseph Stalin?",
								onSelect: (game, dialog, conversation) => {
									game.currentScene.startTalk(game, "human", "You mean Joseph Stalin?", game => {
										conversation.onSelect(game, dialog, conversation);
									});
								},								
							},
							{
								msg: "Genghis Khan?",
								onSelect: (game, dialog, conversation) => {
									game.currentScene.startTalk(game, "human", "You're talking about Genghis Khan?", game => {
										conversation.onSelect(game, dialog, conversation);
									});
								},
							},
							{
								msg: "Donald Trump?",
								onSelect: (game, dialog, conversation) => {
									game.currentScene.startTalk(game, "human", "Who? Donald Trump?", game => {
										conversation.onSelect(game, dialog, conversation);
									});
								},
							},
						],
					},
					{
						options: [
							{},
							{
								msg: "I wanna die.",
								onSelect: (game, dialog, conversation) => {
									const { currentScene } = game;
									currentScene.startTalk(game, "human2", [
										"I really don't deserve to live, after what I've done.",
										"Let me go, I choose to die,",
										"I'll dizupeer from dis world!",
									], game => {
										game.dialog.paused = game.now;
										game.sceneData.hitmanSurprised = 0;
										game.sceneData.looking = game.now;
										game.delayAction(game => {
											currentScene.startTalk(game, "yupa", [
												"Ya know what am thinkin?"
											], game => {
												currentScene.startTalk(game, "doctar", [
													"Hum... not really, but you can tell me later",
												], game => {
													game.sceneData.looking = 0;
													game.dialog.paused = 0;
													game.dialog.index ++;
													currentScene.startTalk(game, "yupa", [
														`Okai, ${game.data.name||"hitman"},`,
														"We let you go.",
														"Just lay dawn on da bench, we'll giv ya somethin",
														"To halp reduz da suffarin...",
													]);
												});
											});
										}, 1000);
									});
								},								
							},
							{
								msg: "I wanna live.",
								onSelect: (game, dialog, conversation) => {
									game.currentScene.startTalk(game, "human2", [
										"Okay Yupa, you are right!",
										"Screw humans, screw everything!",
										"I just want to live. Let's find Baby Hitler and bring him back to earth!",
									], game => {
										dialog.findBabyHitler(game);
									});
								},
							},
						],
					},
					{
						options: [
							{
								msg: "Suffering?",
								onSelect: (game, dialog, conversation) => {
									game.currentScene.startTalk(game, "human", [
										"Wait, something to ease suffering?",
										"What something?"
									], game => {
										game.currentScene.startTalk(game, "yupa", [
											"Just truss mey,",
											"it will halp!",
										], game => {
											game.dialog = null;
											game.fadeToScene("doom");
										});
									});
								},								
							},
							{
								msg: "Thank you",
								onSelect: (game, dialog, conversation) => {
									game.currentScene.startTalk(game, "human", [
										"Thank you Yupa",
										"I will never forget what you did for me.",
									], game => {
										game.currentScene.startTalk(game, "yupa", [
											"Wad ya mean? Ya will disappear",
											"Ya wunt be able to think."
										], game => {
											game.currentScene.startTalk(game, "human", [
												"Oh right. Then please remember me.",
											], game => {
												game.currentScene.startTalk(game, "yupa", [
													"Of corse I cont rememba ya",
													"I will not even knaw ya existed.",
												], game => {
													game.currentScene.startTalk(game, "human", [
														"Nevarmind! Let's just get on with it!",
													], game => {
														game.dialog = null;
														game.fadeToScene("doom");
													});
												});
											});
										});										
									});
								},
							},
							{
								msg: "Changed my mind.",
								onSelect: (game, dialog, conversation) => {
									game.currentScene.startTalk(game, "human", [
										"Wait, I changed my mind,",
										"Forget what I said. Let me start over.",
										"...",
										"Hum.. so you guys actually forgot everything I said, right?",
									], game => {
										game.currentScene.startTalk(game, "yupa", [
											"Wad wur we\ntokin abowt?"
										], game => {
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
								msg: "Get on with it!",
								onSelect: game => {
									game.currentScene.startTalk(game, "human", [
										"Let's get on with it! I want to die!",
									], game => {
										game.currentScene.startTalk(game, "yupa", [
											"Okay.",
										], game => {
											game.fadeToScene("doom");
										});
									});
								},
							},
							{
								msg: "Changed my mind.",
								onSelect: (game, dialog, conversation) => {
									game.currentScene.startTalk(game, "human", [
										"I changed my mind, I don't want to die anymore!",
										"Forget everything I said. Let me start over!",
									], game => {
										game.dialog.index = 0;
									});
								},
							},
						],
					},
				],
			});
		},
		arrowGrid: [
			[ null, null, null,  null, null ],
			[],
			[],
			[],
			[ null, null, BAG, null, null ],
		],
		startTalk: (game, talker, msg, onDone, removeLock) => {
			let x, y;
			if (talker === "human" || talker === "human2") {
				x = 2;
				y = 64;
				game.playSound(SOUNDS.HUM);
			} else if (talker === "yupa") {
				x = 2;
				y = 22;
				game.playSound(SOUNDS.YUPA);
			} else if (talker === "doctar") {
				x = 5;
				y = 21;				
				game.playSound(SOUNDS.HUHUH);
			}
			game.showTip(msg, onDone, talker === "yupa" ? 100 : 80, { x, y, talker, removeLock });
		},
		sprites: [
			{
				src: ASSETS.DOCTAR_ROOM, col: 5, row: 5,
				index: 4,
			},
			{	//	yupa
				src: ASSETS.DOCTAR_ROOM, col: 5, row: 5,
				offsetY: 3,
				index: game => {
					if (game.sceneData.looking) {
						if (game.pendingTip && game.pendingTip.talker==="yupa") {
							return Math.floor(game.now / 100) % 2 + 16;
						}
						return 16;
					}
					if (game.pendingTip && game.pendingTip.talker==="yupa") {
						return Math.floor(game.now / 100) % 2 === 0 ? 5 : 18;
					}
					return 5;
				},
			},
			{
				//	doctar
				src: ASSETS.DOCTAR_ROOM, col: 5, row: 5,
				offsetY: 5,
				index: game => {
					if (game.sceneData.looking) {
						if (game.pendingTip && game.pendingTip.talker==="doctar") {
							return Math.floor(game.now / 100) % 2 + 19;
						}
						return 19;
					}
					if (game.pendingTip && game.pendingTip.talker==="doctar") {
						return Math.floor(game.now / 100) % 2 === 0 ? 6 : 21;
					}
					return 6;
				},
			},
			{
				custom: (game, sprite, ctx) => {
					ctx.fillStyle = "#967A8F";
					ctx.fillRect(0, 0, 64, 64);
				},
				hidden: game => !game.sceneData.hitmanSurprised && (!game.pendingTip || game.pendingTip.talker !== "human2"),
			},
			{
				src: ASSETS.HITMAN_ARGUES, col: 3, row: 3,
				index: (game, sprite) => {
					const { pendingTip, now, sceneData } = game;
					if (sceneData.hitmanSurprised) {
						return pendingTip && pendingTip.progress < 1 ? Math.floor(now / 100) % 4 + 4 : 4;
					}
					return pendingTip && pendingTip.progress < 1 ? Math.floor(now / 100) % 4 : 0;
				},
				hidden: game => !game.sceneData.hitmanSurprised && (!game.pendingTip || game.pendingTip.talker !== "human2"),
			},
			{
				src: ASSETS.BEARD_SHAVED, col: 3, row: 3,
				offsetY: -16,
				offsetX: -6.5,
				scale: 1.2,
				index: (game, sprite) => {
					const { pendingTip, now } = game;
					return pendingTip && pendingTip.progress < 1 ? Math.floor(now / 100) % 4 : 0;
				},
				hidden: game => !game.sceneData.hitmanSurprised && (!game.pendingTip || game.pendingTip.talker !== "human2"),
			},
			{
				src: ASSETS.ARGUE_MOUTH, col: 3, row: 3,
				index: (game, sprite) => {
					const { pendingTip, now, sceneData } = game;
					if (sceneData.hitmanSurprised) {
						return pendingTip && pendingTip.progress < 1 ? Math.floor(now / 100) % 4 + 4 : 4;
					}
					return pendingTip && pendingTip.progress < 1 ? Math.floor(now / 100) % 4 : 0;
				},
				hidden: game => !game.sceneData.hitmanSurprised && (!game.pendingTip || game.pendingTip.talker !== "human2"),
			},
			...standardMenu(),
			...standardBag(),		
		],
	},
);