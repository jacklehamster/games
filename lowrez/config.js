const gameConfig = {
	scenes: [
		{
			name: "jail-cell",
			arrowGrid: [
				[],
				[],
				[ null, null, null,  null, null  ],
				[ LEFT, null, null,  null, RIGHT ],
				[ LEFT, null, BAG , null, RIGHT ],
			],
			onScene: game => {
				if (location.search.indexOf("bad-guards") >= 0) {
					game.data.seen.badguards = true;						
				}

				if (!game.data.seen.intro) {
					game.data.seen.intro = true;
					if (location.search.indexOf("skip-intro") < 0) {
						game.fade = 1;
						game.sceneIntro = true;
						game.hideCursor = true;
						game.hideArrows = true;
						setTimeout(() => {
							game.showTip([
								"My brain... it hurts...",
								"And my body is filled with bruises...",
								"Where am I? I don't remember anything.",
								"WHO am I?"
								], game => {
								game.sceneIntro = false;
								game.sceneData.beginTime = game.now;
								game.hideCursor = false;
							});
						},3000);
					}
				} else if (game.data.seen.badguards && !game.data.seen.badguards_intro) {
					game.data.seen.badguards_intro = true;
					if (location.search.indexOf("skip-intro") < 0) {
						game.fade = 1;
						game.sceneIntro = true;
						game.hideCursor = true;
						game.hideArrows = true;
						setTimeout(() => {
							game.showTip([
								"My brain... it hurts...",
								"And my body is filled with bruises...",
								"... now at least, I know how I got those.",
								"I must find a way out of here.",
								], game => {
								game.sceneIntro = false;
								game.sceneData.beginTime = game.now;
								game.hideCursor = false;
							});
						},3000);
					}						
				}
			},
			onSceneRefresh: game => {
				if (!game.sceneIntro) {
					game.fade = Math.max(0, 1 - (game.now - game.sceneData.beginTime) / 3000);
					if (game.hideArrows && game.fade === 0) {
						game.hideArrows = false;
					} 
				}
			},
			sprites: [
				{
					name: "lock",
					src: ASSETS.LOCK,
					hidden: game => game.rotation !== 0,
					onClick: game => {
						console.log("lock");
					},
				},
				{
					name: "lamp",
					src: ASSETS.LAMP,
					hidden: game => game.rotation !== 0,
					onClick: game => {
						console.log("lamp");
					},
				},
				{
					src: ASSETS.EXIT_DOOR,
					hidden: game => game.rotation !== 0,
					onClick: game => {
						console.log("exit door");
					},
				},
				{
					src: ASSETS.JAIL, col:3, row:3,
					index: () => Math.random() < .1 ? 1 : 0,
					hidden: game => game.rotation !== 0,
				},
				{
					src: ASSETS.DIMMING_LIGHT,
					index: () => Math.random() < .1 ? 1 : 0,
					hidden: game => game.rotation !== 0,
				},
				{
					name: "guard",
					src: ASSETS.RIGHT_GUARD, col:3, row:3,
					index: 0,
					hidden: game => game.rotation !== 0,
					onClick: game => game.gotoScene("zoom-guards"),
					tip: game => game.data.seen.badguards ? null : "He looks bored.",
					combine: (item, game) => {
						game.gotoScene("zoom-guards");
						game.useItem = item;
						return true;
					}
				},
				{
					name: "guard",
					src: ASSETS.LEFT_GUARD, col:3, row:3,
					index: 0,
					hidden: game => game.rotation !== 0,
					onClick: game => game.gotoScene("zoom-guards"),
					tip: game => game.data.seen.badguards ? null : "He's reading a book.",
					combine: (item, game) => {
						game.gotoScene("zoom-guards");
						game.useItem = item;
						return true;
					}
				},
				{
					name: "tilehole",
					src: ASSETS.TILE, col:3, row:3,
					index: game => (game.rotation + 8) % 8,
					hidden: game => game.rotation === 0 || !game.data.pickedUp.tile,
					onClick: game => game.gotoScene("tile-hole"),
					combineMessage: (item, game) => "I don't need to put anything in there.",
				},					
				{
					src: ASSETS.CAGE,
					index: 0,
					hidden: game => game.rotation !== 0,
				},
				{
					src: ASSETS.JAIL360, col:3, row:3,
					index: game => (game.rotation + 8) % 8,
					hidden: game => game.rotation === 0,
				},
				{
					src: ASSETS.WRITING, col:3, row:3,
					index: game => (game.rotation + 8) % 8,
					hidden: game => game.rotation === 0,
					onClick: game => {
						if (game.rotation === 6) {
							game.gotoScene("birthday");
						}
					},
					tip: ({rotation, data}) => rotation === 4 || data.seen["writing"] ? null : "How long was I in this cell?",
				},
				{
					name: "photo",
					src: ASSETS.PHOTO, col:3, row:3,
					index: game => (game.rotation + 8) % 8,
					hidden: (game,{name}) => game.rotation === 0 || game.data.pickedUp[name],
					onClick: (game, sprite) => game.pickUp(sprite.name, ASSETS.GRAB_PHOTO, "It's ...\nBABY HITLER!"),
					tip: ({rotation}) => rotation === 4 ? null : "This photo looks familiar",
				},
				{
					name: "tile",
					src: ASSETS.TILE, col:3, row:3,
					index: game => (game.rotation + 8) % 8,
					hidden: game => game.rotation === 0 || game.data.pickedUp.tile,
					onClick: game => game.showTip("I can't lift it with my fingers. I need some kind of lever."),
					tip: "The tile seems loose.",
					combineMessage: (item, game) => "That doesn't work as a lever.",
					combine: (item, game) => {
						if (item !== "cake fork") {
							return false;
						}
						game.data.pickedUp.tile = true;
						delete game.inventory[game.useItem];
						game.useItem = null;
						game.showTip(["I was able to lift the tile.", "Let's see what's underneath."]);
						return true;
					},
				},
				{
					src: ASSETS.CAKE_TRASH, col:3, row:3,
					index: game => (game.rotation + 8) % 8,
					hidden: (game,{name}) => !game.data.seen.badguards || game.rotation === 0,
				},
				{
					name: "cake",
					src: ASSETS.CAKE_PIECE, col:3, row:3,
					index: game => (game.rotation + 8) % 8,
					hidden: (game,{name}) => !game.data.seen.badguards || game.rotation === 0 || game.data.pickedUp[name],
					tip: "I don't think the cake was edible. That thing burned my eyes.",
					onClick: (game, sprite) => {
						game.pickUp(sprite.name, ASSETS.GRAB_CAKE, "The most\npathetic part of this, is that I still want to have a bite of that cake.");
					},
				},
				{
					name: "cake fork",
					src: ASSETS.CAKE_FORK, col:3, row:3,
					index: game => (game.rotation + 8) % 8,
					hidden: (game,{name}) => !game.data.seen.badguards || game.rotation === 0 || game.data.pickedUp[name],
					tip: "That looks like a fork.",
					onClick: (game, sprite) => {
						game.pickUp(sprite.name, ASSETS.GRAB_FORK, "Hum... they took the time to bring me a cake fork.\nFeels like it's made of some new kind of solid metal.");
					},
				},
				{
					name: "lighter",
					src: ASSETS.LIGHTER, col:3, row:3,
					index: game => (game.rotation + 8) % 8,
					hidden: (game,{name}) => !game.data.seen.badguards || game.rotation === 0 || game.data.pickedUp[name],
					tip: "Turns out they did leave a bunch of presents behind.",
					onClick: (game, sprite) => {
						game.pickUp(sprite.name, ASSETS.GRAB_LIGHTER, "For the candle on my cake, they actually used a lighter.");
					},
				},
				{
					name: "empty bottle",
					src: ASSETS.BOTTLE, col:3, row:3,
					index: game => (game.rotation + 8) % 8,
					hidden: (game,{name}) => game.rotation === 0 || game.data.pickedUp[name],
					onClick: (game, sprite) => {
						game.pickUp(sprite.name, ASSETS.GRAB_BOTTLE, "It's empty.");
					},
				},
				{
					bag: true,
					src: ASSETS.BAG_OUT,
					index: game => game.frameIndex,
					hidden: game => game.arrow !== BAG && !game.bagOpening,
					alpha: game => game.emptyBag() ? .2 : 1,
					onClick: game => game.clickBag(),
				},
			],
		},
		{
			arrowGrid: [
				[],
				[],
				[ null, null, null,     null, null  ],
				[ LEFT, null, FORWARD,  null, RIGHT ],
				[ LEFT, null, BACKWARD, null, RIGHT ],
			],
			map: `
				XXXXXXXX
				X.....XX
				XX.XX.XX
				XX8XX.XX
				XXXXX1XX
				XXXXXXXX
			`,
			doors: {
				1: {
					exit: game => {
						game.fadeOut(game.now, {duration:3000, fadeDuration:2000, color:"#000000", onDone:() => {
							game.gotoScene(0);
						}});
					},
				},
			},
		},
		{
			name: "zoom-guards",
			arrowGrid: [
				[],
				[],
				[ null, null, null,  null, null  ],
				[ null, null, null,  null, null ],
				[ null, null, BAG ,  null, null ],
			],
			onScene: game => {
				game.startDialog({
					time: game.now,
					index: 0,
					conversation: [
						{
							message: "",
							options: [
								{
									msg: "Say Hello", 
									onSelect: (game, dialog) => {
										game.playSound(SOUNDS.HELLO);
										dialog.guardSpeaking = true;
										game.hideCursor = true;
										game.showTip("...", () => {
											dialog.guardSpeaking = false;
											game.hideCursor = false;
										});
										dialog.index = 1;
									}
								},
								{ msg: "LEAVE", onSelect: game => game.gotoScene("jail-cell")},
							],
						},
						{
							message: "",
							options: [
								{
									msg: "Let me out?", 
									onSelect: (game, dialog) => {
										game.playSound(SOUNDS.HAHAHA);
										dialog.guardSpeaking = true;
										game.hideCursor = true;
										game.showTip("... seems like he's laughing at me ...", () => {
											dialog.guardSpeaking = false;
											game.hideCursor = false;
										});
									}
								},
								{
									hidden: game => !game.data.seen.writing,
									msg: "It's my birthday", 
									onSelect: (game, dialog) => {
										game.playSound(SOUNDS.BIRTHDAY);
										dialog.guardSpeaking = true;
										game.hideCursor = true;
										game.showTip("... did he\nunderstand? ...", game => {
											game.gotoScene("bring-cake");
										});
									}
								},
								{ msg: "LEAVE", onSelect: game => game.gotoScene("jail-cell")},
							],
						},
					],
				});
			},
			sprites: [
				{
					src: ASSETS.ZOOM_GUARDS,
					index: game => {
						if (game.dialog && game.dialog.guardSpeaking) {
							return Math.floor(game.now / 100) % 4;
						}
						const frame = Math.floor(game.now / 200);
						return frame % 31 === 1 ? 1 : 0;
					},
					combineMessage: (item, game) => `The guard shrugs at your ${item}.`,
				},
				{
					src: ASSETS.SPEECH_OUT,
					hidden: game => game.bagOpening || game.useItem || game.pendingTip,
					index: game => Math.min(3, Math.floor((game.now - game.sceneTime) / 80)),
				},
				{
					bag: true,
					src: ASSETS.BAG_OUT,
					index: game => game.frameIndex,
					hidden: ({arrow, bagOpening, dialog}) => arrow !== BAG && !bagOpening || dialog && dialog.conversation[dialog.index].options.length > 2,
					alpha: game => game.emptyBag() ? .2 : 1,
					onClick: game => game.clickBag(),
				}
			],
		},
		{
			name: "birthday",
			onScene: game => {
				game.hideCursor = true;
				if (!game.data.seen["writing"]) {
					game.data.seen["writing"] = true;
					game.showTip(["Hey, it looks like I carved a birthday cake on the wall.", "I can't remember but could it be... it's my BIRTHDAY?!"],
						game => {
							game.gotoScene("jail-cell");
							game.rotation = 6;
						}
					);
				} else {
					game.showTip("♪♪ Happy\nbirthday\nto me ♪♪",
						game => {
							game.gotoScene("jail-cell");
							game.rotation = 6;
						});
				}
			},
			sprites: [
				{
					src: ASSETS.BIRTHDAY,
				},
			],
		},
		{
			name: "bring-cake",
			onScene: game => {
				game.hideCursor = true;
				game.sceneData.scenario = 0;
			},
			onSceneRefresh: game => {
				if (game.sceneData.scenario === 0) {
					const frame = Math.floor((game.now - game.sceneTime) / 300);
					if (frame >= 10) {
						game.showTip([
							"...",
							"Wait... did he just leave?",
							"That's odd.",
							"Maybe he went to get me a birthday cake.",
							"Wouldn't that be funny?!?",
						], game => {
							game.sceneData.scenario = 2;
							game.sceneData.scenarioTime = game.now;
						});
						game.sceneData.scenario = 1;
					}
				} else if (game.sceneData.scenario === 2) {
					const frame = Math.floor((game.now - game.sceneData.scenarioTime) / 500);
					if (frame >= 5) {
						game.sceneData.scenario = 3;
						game.showTip("OMG!", game => {
							game.gotoScene("poor-hitman");
						});
					}
				}
			},
			sprites: [
				{
					src: ASSETS.JAIL, col:3, row:3,
					index: () => Math.random() < .1 ? 1 : 0,
				},
				{
					src: ASSETS.DIMMING_LIGHT,
					index: () => Math.random() < .1 ? 1 : 0,
				},
				{
					src: ASSETS.RIGHT_GUARD, col:3, row:3,
					index: 0,
				},
				{
					src: ASSETS.BRING_CAKE, col:3, row:3,
					index: game => {
						if (game.sceneData.scenario === 0) {
							const frame = Math.floor((game.now - game.sceneTime) / 300);
							return Math.min(frame, 3);
						} else if (game.sceneData.scenario === 1) {
							return 3;
						} else if (game.sceneData.scenario === 2) {
							const frame = Math.floor((game.now - game.sceneData.scenarioTime) / 500);
							return Math.min(6, frame + 4);
						}
						const frame = Math.floor((game.now - game.sceneTime) / 300);
						return 5 + frame % 2;
					},
				},
				{
					src: ASSETS.CAGE,
					index: 0,
				},
			],
		},
		{
			name: "poor-hitman",
			onScene: game => {
				game.hideCursor = true;
				game.showTip(["What a surprise, how thoughtful of you!", "You really do care about me after all.."],
					game => {
						game.gotoScene("guards-laughing");
					}
				);					
			},
			sprites: [
				{
					src: ASSETS.POOR_HITMAN_BACK,
				},
				{
					src: ASSETS.POOR_HITMAN,
					index: ({ pendingTip, now }) => pendingTip && pendingTip.progress < 1 ? Math.floor(now / 150) % 4 : 0,
				},
				{
					src: ASSETS.POOR_HITMAN_GUARD,
					index: game => Math.floor(game.now / 200) % 4, 
				},
			],
		},
		{
			name: "guards-laughing",
			onScene: game => {
				game.hideCursor = true;
			},
			onSceneRefresh: game => {
				const frame = Math.floor((game.now - game.sceneTime) / 150);					
				if (frame > 50) {
					game.gotoScene("what-so-funny");
				} else if (!game.sceneData.laughing && frame > 30) {
					game.sceneData.laughing = true;
					game.playSound(SOUNDS.HAHAHA);
				}
			},
			sprites: [
				{
					src: ASSETS.GUARDS_LAUGHING,
					index: game => {
						const frame = Math.floor((game.now - game.sceneTime) / 150);
						if (frame < 15) {
							return 0;
						} else if (frame < 30) {
							return 1;
						} else {
							return frame % 2 + 2;
						}
					},
				},
			],
		},
		{
			name: "what-so-funny",
			onScene: game => {
				game.hideCursor = true;
				game.showTip(["Hahaha...", "Even in this situation, I'm glad I can laugh with you guys.", "By the way, what's so funny?"],
					game => {
						game.gotoScene("cake-face");
					}
				);					
			},
			sprites: [
				{
					src: ASSETS.POOR_HITMAN_BACK,
				},
				{
					src: ASSETS.POOR_HITMAN,
					hidden: ({ pendingTip }) => pendingTip && pendingTip.index < 2,
					index: ({ pendingTip, now }) => pendingTip && pendingTip.progress < 1 ? Math.floor(now / 150) % 4 : 0,
				},
				{
					src: ASSETS.HITMAN_LAUGH,
					hidden: ({ pendingTip }) => !pendingTip || pendingTip.index >= 2,
					index: ({ pendingTip, now }) => pendingTip && pendingTip.progress < 1 && pendingTip.index !== 0 ? Math.floor(now / 150) % 4 : Math.floor(now / 150) % 2,
				},
				{
					src: ASSETS.POOR_HITMAN_GUARD,
					index: game => Math.floor(game.now / 200) % 4, 
				},
			],
		},
		{
			name: "cake-face",
			onScene: game => {
				game.hideCursor = true;
			},
			onSceneRefresh: game => {
				const frame = Math.floor((game.now - game.sceneTime) / 200);					
				if (frame > 10) {
					game.gotoScene("guards-laughing-2");
				}
			},
			sprites: [
				{
					src: ASSETS.POOR_HITMAN_BACK,
				},
				{
					src: ASSETS.HITMAN_CAKE_FACE,
					index: ({ now, sceneTime }) => Math.min(4, Math.floor((now - sceneTime) / 200)),
				},
			],
		},
		{
			name: "guards-laughing-2",
			onScene: game => {
				game.hideCursor = true;
				game.playSound(SOUNDS.HAHAHA);
			},
			onSceneRefresh: game => {
				const frame = Math.floor((game.now - game.sceneTime) / 150);					
				if (frame > 40) {
					game.gotoScene("guards-attack");
				}	
			},
			sprites: [
				{
					src: ASSETS.GUARDS_LAUGHING,
					index: game => {
						const frame = Math.floor((game.now - game.sceneTime) / 150);
						return frame < 20 ? frame % 2 + 2 : 4;
					},
				},
			],
		},
		{
			name: "guards-attack",
			onScene: game => {
				game.hideCursor = true;
				game.fadeColor = "#000000";

				game.data.seen.badguards = true;
			},
			onSceneRefresh: game => {
				const frame = Math.floor((game.now - game.sceneTime) / 100);
				game.fade = Math.max(0, Math.min(1, (frame - 50) / 10));

				if (frame > 70) {
					game.gotoScene("jail-cell");
					game.data.seen.intro = true;
				}
			},
			sprites: [
				{
					src: ASSETS.GUARDS_ATTACK,
					index: 2,
				},
				{
					src: ASSETS.GUARDS_ATTACK,
					index: 1,
					hidden: game => {
						const frame = Math.floor((game.now - game.sceneTime) / 100);
						return frame >= 40;
					},
					alpha: game => {
						const frame = Math.floor((game.now - game.sceneTime) / 100);
						return Math.max(0, Math.min(1, (40 - frame) / 10));
					}					
				},
				{
					src: ASSETS.GUARDS_ATTACK,
					index: 0,
					hidden: game => {
						const frame = Math.floor((game.now - game.sceneTime) / 100);
						return frame >= 20;
					},
					alpha: game => {
						const frame = Math.floor((game.now - game.sceneTime) / 100);
						return Math.max(0, Math.min(1, (20 - frame) / 10));
					}					
				},
			],
		},
		{
			name: "tile-hole",
			sprites: [
				{
					src: ASSETS.TILE_HOLE,
				},
				{
					name: "gun",
					src: ASSETS.GUN,
					hidden: (game, {name}) => game.data.pickedUp[name],
					onClick: (game, {name}) => {
						game.pickUp(name, ASSETS.GRAB_GUN, "A loaded gun! Did I hide this in here?",
							game => {
								game.gotoScene("jail-cell");
								game.rotation = 4;
							}
						);
					},
				},
				{
					bag: true,
					src: ASSETS.BAG_OUT,
					index: game => game.frameIndex,
					hidden: game => !game.bagOpening,
				},
			],
		},		
	],
};