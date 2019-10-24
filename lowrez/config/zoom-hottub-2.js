gameConfig.scenes.push(
	{
		name: "zoom-hottub-2",
		onScene: game => {
			game.hideCursor = true;
		},
		sprites: [
			{
				init: ({sceneData}) => {
					sceneData.stars = new Array(100).fill(null).map(() => {
						return {
							x: (Math.random() - .5) * 64,
							y: (Math.random() - .5) * 64,
							size: .2,
						};
					});
				},
				onRefresh: (game, sprite) => {
					const { sceneData, now, sceneTime } = game;
					sceneData.stars.forEach(star => {
						star.x *= 1.01;
						star.y *= 1.01;
						star.size *= 1.01;
						if (star.size > 1) {
							star.size = 1;
						}
						if (Math.abs(star.x) > 32 || Math.abs(star.y) > 32) {
							star.x = (Math.random() - .5) * 64;
							star.y = (Math.random() - .5) * 64;
							star.size = .2;
						}
					});
				},
				custom: (game, sprite, ctx) => {
					ctx.fillStyle = "#000022";
					ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
					ctx.fillStyle = "#FFFFFF";
					const { sceneData } = game;
					sceneData.stars.forEach(({x, y, size}) => {
						ctx.fillRect(32 + x, 32 + y, size, size);
					});
				},
			},
			{
				src: ASSETS.HOTTUP_CLOSE_UP, col: 6, row: 7,
				index: ({sceneData, pendingTip, now}) => {
					if (pendingTip) {
						if (pendingTip.talker === "human") {
							return Math.floor(now / 100) % 2 + 26;
						}
						if (pendingTip.talker === "human2") {
							return (Math.floor(now / 100) % 2) + 30;
						}
						if (pendingTip.talker === "yupa") {
							return (Math.floor(now / 100) % 2) + 28;
						}
						if (pendingTip.talker === "yupa2") {
							return (Math.floor(now / 100) % 2) + 32;							
						}
						if (pendingTip.talker === "yupa3") {
							return (Math.floor(now / 100) % 2) + 34;
						}
						if (pendingTip.talker === "alexa") {
							return (Math.floor(now / 100) % 2) + 35;						
						}
					}
					return sceneData.frame;
				},		
				startTalk: (game, talker, msg, onDone, removeLock) => {
					let x, y;
					if (talker === "human" || talker === "human2") {
						x = 5;
						y = 60;
						game.playSound(SOUNDS.HUM);
					} else if (talker === "yupa" || talker === "yupa2" || talker === "yupa3") {
						x = 2;
						y = 60;
						game.playSound(SOUNDS.YUPA);
					} else if (talker === "alexa") {
						x = 12;
						y = 20;				
						game.playSound(SOUNDS.OKAY);
						msg = msg.split("").map(a => " ").join("");
					}
					game.showTip(msg, onDone, talker === "yupa" ? 140 : 100, { x, y, talker, removeLock });
				},
				init: (game, sprite) => {
					const { sceneData } = game;
					sceneData.frame = 27;
					sceneData.script = [
						game => {
							sprite.startTalk(game, "human", `I have no left hand!`, game => {
								sprite.startTalk(game, "yupa", "Wat ya mean?", game => {
									sprite.startTalk(game, "human", "My left hand, it's gone!", game => {
										sprite.startTalk(game, "yupa", "Ya never had left hand", game => {
											sprite.startTalk(game, "human2", "What? Of course I had a left hand!", game => {
												sprite.startTalk(game, "yupa2", "When was last tam ya remember usin it?", game => {
													sprite.startTalk(game, "human2", "Well I... I don't remember.", games => {
														sprite.startTalk(game, "yupa2", "Seee....?", game => {
															sprite.startTalk(game, "human2", "But I don't recall missing a left hand!", game => {
																sprite.startTalk(game, "yupa2", "I dun rememba ya miss a tail either, dun mean ya had one.", game => {
																	sprite.startTalk(game, "human2", "Listen! We need to find out what happened to my left hand", game => {
																		sprite.startTalk(game, "yupa2", ["Oke oke.. i know frend dat can halp ya", "Alectra!"], game => {
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
							});
							return true;
						},
						({pendingTip}) => {
							return !pendingTip;
						},
						game => {
							sprite.startTalk(game, "alexa", "Okay", game => {
								sprite.startTalk(game, "yupa3", "Tek us to doctar Sarlie", game => {
									sprite.startTalk(game, "alexa", "Okay");
								});
							});
							return true;
						},
						({pendingTip}) => {
							return !pendingTip;
						},
						game => {
							sceneData.frame = Math.min(40, 38 + Math.floor((game.now - game.sceneData.scriptTime) / 100));
							return sceneData.frame === 40;
						},
						game => {
							game.gotoScene("space-travel");
						},
					];
				},
				onRefresh: game => {
					const { script } = game.sceneData;
					if (script && script.length) {
						while (script.length && script[0](game)) {
							if (!game.sceneTime) {
								break;
							}
							script.shift();
							game.sceneData.scriptTime = game.now;
						}
					}
				},
			},
			{
				src: ASSETS.HOTTUB_WATER_WAVE, col: 1, row: 2,
				index: ({now}) => Math.floor(now / 1000)% 2,
			}
		],
	},
);