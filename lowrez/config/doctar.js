gameConfig.scenes.push(
	{
		name: "doctar",
		onScene: game => {
			game.waitCursor = true;
			game.playTheme(SOUNDS.JAIL_CELL_THEME);
		},
		sprites: [
			{
				src: ASSETS.DOCTAR, col: 4, row: 5,
				hidden: ({sceneData, pendingTip}) => pendingTip && pendingTip.talker === "human4",
				index: ({sceneData, pendingTip, dialog, now}) => {
					if (pendingTip) {
						if (pendingTip.talker === "human") {
							return (pendingTip.progress >= 1 ? 0 : Math.floor(now / 100) % 2) * 2 + 7;						
						}
						if (pendingTip.talker === "human2") {
							return Math.floor(pendingTip.progress >= 1 ? 0 : now / 100) % 2 + 11;
						}
						if (pendingTip.talker === "human3") {
							return Math.floor(pendingTip.progress >= 1 ? 0 : now / 100) % 2 + 18;
						}
						if (pendingTip.talker === "doctar") {
							return (pendingTip.progress >= 1 ? 0 : Math.floor(now / 100) % 2) + 7;						
						}
						if (pendingTip.talker === "doctar2") {
							return (pendingTip.progress >= 1 ? 0 : Math.floor(now / 100) % 2) * 2 + 15;						
						}
						if (pendingTip.talker === "doctarzoom") {
							return (pendingTip.progress >= 1 ? 0 : Math.floor(now / 100) % 4) + 2;						
						}
						if (pendingTip.talker === "yupa2") {
							if (game.now < pendingTip.time + 500) {
								return (pendingTip.progress >= 1 ? 0 : Math.floor(now / 100) % 2) + 13;
							}
							return (pendingTip.progress >= 1 ? 0 : Math.floor(now / 100) % 2) + 15;
						}
						if (pendingTip.talker === "yupa") {
							return (pendingTip.progress >= 1 ? 0 : Math.floor(now / 100) % 2) + 15;
						}
					}
					if (dialog) {
						const f = Math.floor(now/100)  % 20;
						return Math.min(1, f) + 6;
					}
					return sceneData.frame;
				},		
				startTalk: (game, talker, msg, onDone, removeLock) => {
					let x, y;
					if (talker === "human" || talker === "human2" || talker === "human3" || talker === "human4") {
						x = 5;
						y = 60;
						game.playSound(SOUNDS.HUM);
					} else if (talker === "yupa" || talker === "yupa2") {
						x = 2;
						y = 62;
						game.playSound(SOUNDS.YUPA);
					} else if (talker === "doctar" || talker === "doctar2") {
						x = 5;
						y = 23;				
						game.playSound(SOUNDS.HUHUH);
					} else if (talker === "doctarzoom") {
						x = 5;
						y = 18;						
						game.playSound(SOUNDS.HUHUH);
					} else if (talker === "offscreen") {
						game.playSound(SOUNDS.HUHUH);
					} else if (talker === "offscreenyupa") {
						game.playSound(SOUNDS.YUPA);						
					}
					game.showTip(msg, onDone, 80, { x, y, talker, removeLock });
				},
				init: (game, sprite) => {
					const { sceneData } = game;
//					sceneData.timeline = game.now;
					sceneData.scriptTime = game.now;
					sceneData.script = [
						({now, sceneTime, sceneData}) => {
							const f = Math.floor((now - sceneTime)/100)  % 20;
							sceneData.frame = Math.min(2, f);
							return now - sceneData.scriptTime >= 3000;
						},
						({now, sceneTime, sceneData}) => {
							const f = Math.floor((now - sceneTime)/100)  % 20;
							sceneData.frame = Math.min(1, f) + 6;
							return now - sceneData.scriptTime >= 3000;
						},
						({now, sceneTime, sceneData}) => {
							sprite.startTalk(game, "doctar", "Well, I can tell you one thing.");
							return true;
						},
						({pendingTip}) => {
							return !pendingTip;
						},
						({now, sceneTime, sceneData}) => {
							game.waitCursor = false;
							game.startDialog({
								time: now,
								index: 0,
								conversation: [
									{
										options: [
											{},
											{
												msg: game => "Tell me",
												onSelect: (game, dialog) => {
													game.waitCursor = true;
													game.dialog = null;
													sprite.startTalk(game, "human", "Tell me doctor.");
												},
											},
											{
												msg: game => "Don't tell me",
												onSelect: (game, dialog) => {
													game.waitCursor = true;
													game.dialog = null;
													sprite.startTalk(game, "human", "Don't tell me...");
												},
											},
										],
									},
								],
							});
							return true;
						},
						({pendingTip, dialog}) => {
							return !pendingTip && !dialog;
						},
						({now, sceneTime, sceneData}) => {
							const f = Math.floor((now - sceneTime)/100)  % 20;
							sceneData.frame = Math.min(1, f) + 6;
							return now - sceneData.scriptTime >= 1000;
						},
						({now, sceneTime, sceneData}) => {
							sprite.startTalk(game, "doctarzoom", "You never had a left hand.");
							return true;
						},
						({pendingTip}) => {
							return !pendingTip;
						},
						({now, sceneTime, sceneData}) => {
							sprite.startTalk(game, "human2", "What? I said already!", game => {
								game.waitCursor = false;
								game.startDialog({
									time: now,
									index: 0,
									conversation: [
										{
											options: [
												{},
												{
													msg: game => "Not true!",
													onSelect: (game, dialog) => {
														game.waitCursor = true;
														game.dialog = null;
														sprite.startTalk(game, "human2", "I never lacked a limb my whole life!");
													},
												},
												{
													msg: game => "It's true!",
													onSelect: (game, dialog) => {
														game.waitCursor = true;
														game.dialog = null;
														sprite.startTalk(game, "human2", [
															"You're right! I never had a left hand.",
															"I just never noticed until you brought it up!"
														]);
													},
												},
											],
										},
									],
								});
							});
							return true;
						},
						({pendingTip, dialog}) => {
							return !pendingTip && !dialog;
						},
						({now, sceneTime, sceneData}) => {
							sprite.startTalk(game, "yupa2", ["Since I met him", "I nevar saw hiz left hand."]);
							return true;
						},
						({pendingTip}) => {
							return !pendingTip;
						},
						({now, sceneTime, sceneData}) => {
							sprite.startTalk(game, "doctar2", "Where did you find this human?");
							return true;
						},
						({pendingTip}) => {
							return !pendingTip;
						},
						({now, sceneTime, sceneData}) => {
							sprite.startTalk(game, "yupa", [
								"Youll nevar guess!",
								"He was travlin bak in tam.",
								"Tryin to kill a baby! Haha!"]);
							return true;
						},
						({pendingTip}) => {
							return !pendingTip;
						},
						({now, sceneTime, sceneData}) => {
							sprite.startTalk(game, "doctar2", "Well did he do it?");
							return true;
						},
						({pendingTip}) => {
							return !pendingTip;
						},
						({now, sceneTime, sceneData}) => {
							sprite.startTalk(game, "yupa", "What ya mean?");
							return true;
						},
						({pendingTip}) => {
							return !pendingTip;
						},
						({now, sceneTime, sceneData}) => {
							sprite.startTalk(game, "doctarzoom", "Did he kill the baby?");
							return true;
						},
						({pendingTip}) => {
							return !pendingTip;
						},
						({now, sceneTime, sceneData}) => {
							sprite.startTalk(game, "human3", [
								"Hey I'm here, you two!",
								"No, I did not kill Baby Hitler.",
								"I failed my mission.",
								"Instead, we kidnapped him.",
							 ]);
							return true;
						},
						({pendingTip}) => {
							return !pendingTip;
						},
						({now, sceneTime, sceneData}) => {
							sprite.startTalk(game, "yupa", ["Dat's true!", "We took da baby with us! Haha!", "But we lost him."]);
							return true;
						},
						({pendingTip}) => {
							return !pendingTip;
						},
						({now, sceneTime, sceneData}) => {
							sprite.startTalk(game, "doctarzoom", [
								"I see...",
								"I think I know what might have happened!",
							]);
							return true;
						},
						({pendingTip}) => {
							return !pendingTip;
						},
						({now, sceneTime, sceneData}) => {
							sceneData.timeline = now;
							sprite.startTalk(game, "offscreen", [
								"You travelled back in time and altered history by taking the baby.",
								"As a result, an alternate universe was created.",
								"One in which, you do not exist.",
								"And that universe is trying to rectify itself",
								"by erasing your existence, slowly.",
							]);
							return true;
						},
						({pendingTip}) => {
							return !pendingTip;
						},
						({now, sceneTime, sceneData}) => {
							sprite.startTalk(game, "offscreenyupa", [
								"If he dun exist, wad he still doin hee?",
							]);
							return true;
						},
						({pendingTip}) => !pendingTip,
						({now, sceneTime, sceneData}) => {
							game.sceneData.pushDownYupa = now;
							sprite.startTalk(game, "offscreen", [
								"I'm getting to that."
							], game => {
								game.sceneData.lineBack = game.now;
								sprite.startTalk(game, "offscreen", [
									"I believe there is still a slim chance",
									"for this human to restore the future where he exists.",
								]);
							});
							return true;
						},
						({pendingTip}) => !pendingTip,
						({now, sceneTime, sceneData}) => {
							sceneData.timeline = 0;
							sceneData.jumpin = now;
							sprite.startTalk(game, "human4", [
								"Really doctor?",
								"Please tell me!",
								"What do I have to do?",
								"I'll do it!",
							 ]);
							return true;							
						},
						({pendingTip}) => !pendingTip,
						({now, sceneTime, sceneData}) => {
							sprite.startTalk(game, "doctarzoom",
								[
									"I believe",
									"you already know the answer to that question."
								]);
							return true;
						},
						({pendingTip}) => !pendingTip,
						game => {
							const {now, sceneTime, sceneData} = game;
							sceneData.human_wah = now;
							game.delayAction(game => {
								sprite.startTalk(game, "human4", [
									"Oh no!",
									"You mean I have to...",
									"Let Baby Hitler become\nHITLER!    ",
								 ], game => {
								 	game.sceneData.canGoNextScene = game.now;
								 });
							}, 1000);
							return true;
						},
						game => {
							return game.sceneData.canGoNextScene;
						},
						game => {
							game.fadeToScene("doctar-room");
							return true;
						},
					];
				},
				onRefresh: game => {
					const { script } = game.sceneData;
					if (script) {
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
				custom: (game, sprite, ctx) => {
					ctx.fillStyle = "#222255";
					ctx.fillRect(0, 0, 64, 64);
				},
				hidden: game => !game.sceneData.timeline,
			},			
			{
				src: ASSETS.HITMAN_WALK, size: [16, 21],
				offsetX: 46, offsetY: 26,
				hidden: game => {
					const phase1_start = game.sceneData.timeline;
					const phase1_duration = 1000;
					const phase1_progress = Math.min(1, (game.now - phase1_start) / phase1_duration);
					return phase1_progress < 1 || !game.sceneData.timeline;
				},
			},
			{
				src: ASSETS.HITMAN_BEARD_WALK, size: [16, 21],
				offsetX: 46, offsetY: 26,
				hidden: game => {
					const phase1_start = game.sceneData.timeline;
					const phase1_duration = 1000;
					const phase1_progress = Math.min(1, (game.now - phase1_start) / phase1_duration);
					return phase1_progress < 1 || !game.sceneData.timeline;
				},
			},
			{
				src: ASSETS.HITMAN_WALK, size: [16, 21],
				alpha: game => {
					const phase1_start = game.sceneData.timeline;
					const phase1_duration = 1000;
					const phase1_progress = Math.min(1, (game.now - phase1_start) / phase1_duration);
					const phase2_start = phase1_start + phase1_duration;
					const phase2_duration = 5000;
					const phase2_progress = Math.min(1, (game.now - phase2_start) / phase2_duration);
					const phase3_start = phase2_start + phase2_duration;
					const phase3_duration = 4000;
					const phase3_progress = Math.min(1, (game.now - phase3_start) / phase3_duration);
					const phase4_start = phase3_start + phase3_duration;
					const phase4_duration = 2000;
					const phase4_progress = Math.min(1, (game.now - phase4_start) / phase4_duration);
					const phase5_start = phase4_start + phase4_duration;
					const phase5_duration = 1000;
					const phase5_progress = Math.min(1, (game.now - phase5_start) / phase5_duration);
					const phase6_start = phase5_start + phase5_duration;
					const phase6_duration = 1000;
					const phase6_progress = Math.min(1, (game.now - phase6_start) / phase6_duration);
					return Math.max(.2, 1 - (game.now - phase4_start - 10500)/5000);
				},
				offsetX: 46, offsetY: 1,
				hidden: game => {
					const phase1_start = game.sceneData.timeline;
					const phase1_duration = 1000;
					const phase1_progress = Math.min(1, (game.now - phase1_start) / phase1_duration);
					const phase2_start = phase1_start + phase1_duration;
					const phase2_duration = 5000;
					const phase2_progress = Math.min(1, (game.now - phase2_start) / phase2_duration);
					const phase3_start = phase2_start + phase2_duration;
					const phase3_duration = 4000;
					const phase3_progress = Math.min(1, (game.now - phase3_start) / phase3_duration);
					const phase4_start = phase3_start + phase3_duration;
					const phase4_duration = 2000;
					const phase4_progress = Math.min(1, (game.now - phase4_start) / phase4_duration);
					const phase5_start = phase4_start + phase4_duration;
					const phase5_duration = 1000;
					const phase5_progress = Math.min(1, (game.now - phase5_start) / phase5_duration);
					const phase6_start = phase5_start + phase5_duration;
					const phase6_duration = 1000;
					const phase6_progress = Math.min(1, (game.now - phase6_start) / phase6_duration);
					return phase4_progress < 1 || !game.sceneData.timeline;
				},
			},
			{
				src: ASSETS.HITMAN_BEARD_WALK, size: [16, 21],
				alpha: game => {
					const phase1_start = game.sceneData.timeline;
					const phase1_duration = 1000;
					const phase1_progress = Math.min(1, (game.now - phase1_start) / phase1_duration);
					const phase2_start = phase1_start + phase1_duration;
					const phase2_duration = 5000;
					const phase2_progress = Math.min(1, (game.now - phase2_start) / phase2_duration);
					const phase3_start = phase2_start + phase2_duration;
					const phase3_duration = 4000;
					const phase3_progress = Math.min(1, (game.now - phase3_start) / phase3_duration);
					const phase4_start = phase3_start + phase3_duration;
					const phase4_duration = 2000;
					const phase4_progress = Math.min(1, (game.now - phase4_start) / phase4_duration);
					const phase5_start = phase4_start + phase4_duration;
					const phase5_duration = 1000;
					const phase5_progress = Math.min(1, (game.now - phase5_start) / phase5_duration);
					const phase6_start = phase5_start + phase5_duration;
					const phase6_duration = 1000;
					const phase6_progress = Math.min(1, (game.now - phase6_start) / phase6_duration);
					return Math.max(.2, 1 - (game.now - phase4_start - 10500)/5000);
				},
				offsetX: 46, offsetY: 1,
				hidden: game => {
					const phase1_start = game.sceneData.timeline;
					const phase1_duration = 1000;
					const phase1_progress = Math.min(1, (game.now - phase1_start) / phase1_duration);
					const phase2_start = phase1_start + phase1_duration;
					const phase2_duration = 5000;
					const phase2_progress = Math.min(1, (game.now - phase2_start) / phase2_duration);
					const phase3_start = phase2_start + phase2_duration;
					const phase3_duration = 4000;
					const phase3_progress = Math.min(1, (game.now - phase3_start) / phase3_duration);
					const phase4_start = phase3_start + phase3_duration;
					const phase4_duration = 2000;
					const phase4_progress = Math.min(1, (game.now - phase4_start) / phase4_duration);
					const phase5_start = phase4_start + phase4_duration;
					const phase5_duration = 1000;
					const phase5_progress = Math.min(1, (game.now - phase5_start) / phase5_duration);
					const phase6_start = phase5_start + phase5_duration;
					const phase6_duration = 1000;
					const phase6_progress = Math.min(1, (game.now - phase6_start) / phase6_duration);
					return phase4_progress < 1 || !game.sceneData.timeline;
				},
			},		
			{
				custom: (game, sprite, ctx) => {
					const phase1_start = game.sceneData.timeline;
					const phase1_duration = 1000;
					const phase1_progress = Math.min(1, (game.now - phase1_start) / phase1_duration);
					const phase2_start = phase1_start + phase1_duration;
					const phase2_duration = 5000;
					const phase2_progress = Math.min(1, (game.now - phase2_start) / phase2_duration);
					const phase3_start = phase2_start + phase2_duration;
					const phase3_duration = 4000;
					const phase3_progress = Math.min(1, (game.now - phase3_start) / phase3_duration);
					const phase4_start = phase3_start + phase3_duration;
					const phase4_duration = 2000;
					const phase4_progress = Math.min(1, (game.now - phase4_start) / phase4_duration);
					const phase5_start = phase4_start + phase4_duration;
					const phase5_duration = 1000;
					const phase5_progress = Math.min(1, (game.now - phase5_start) / phase5_duration);
					const phase6_start = phase5_start + phase5_duration;
					const phase6_duration = 1000;
					const phase6_progress = Math.min(1, (game.now - phase6_start) / phase6_duration);

					const shiftY = -10;
					ctx.strokeStyle = "#bbcccc";
					ctx.lineWidth = "1px";
					ctx.setLineDash([]);
					ctx.beginPath();
					ctx.moveTo(2, shiftY + 40.5);
					ctx.lineTo(2 + Math.sqrt(phase1_progress) * 42, shiftY + 40.5);

					if (phase3_progress > 0) {
						ctx.moveTo(8, shiftY + 40.5);
						ctx.lineTo(8 + 10 * phase3_progress, shiftY + 40.5 - 20 * phase3_progress);						
					}

					if (phase4_progress > 0) {
						ctx.moveTo(18, shiftY + 20.5);
						ctx.lineTo(18 + 25 * phase4_progress, shiftY + 20.5);						
					}

					ctx.stroke();

					if (phase2_progress > 0) {
						ctx.beginPath();
						ctx.setLineDash([3, 2]);
						ctx.arc(26, shiftY + 23, 25, Math.PI/2 - .8, Math.PI/2 - .8 + .8*2*phase2_progress);

						if (game.sceneData.lineBack) {
							const progress = Math.min(1, (game.now - game.sceneData.lineBack) / 3000);
							ctx.moveTo(30, shiftY + 20.5);
							ctx.lineTo(30 + 10 * progress, shiftY + 20.5 + 20 * progress);
						}

						ctx.stroke();
					}

					ctx.beginPath();
					ctx.setLineDash([]);
					ctx.lineWidth = "2px";
					ctx.strokeStyle = "#aa0000";
					if (phase5_progress > 0) {
						ctx.moveTo(49, shiftY + 10);
						ctx.lineTo(49 + 10 * phase5_progress, shiftY + 10 + 15 * phase5_progress);
					}
					if (phase6_progress > 0) {
						ctx.moveTo(49, shiftY + 25);
						ctx.lineTo(49 + 10 * phase6_progress, shiftY + 25 - 15 * phase6_progress);
					}
					ctx.stroke();
				},
				hidden: game => !game.sceneData.timeline,
			},
			{
				src: ASSETS.YUPA_WOOPSIE,
				hidden: ({pendingTip}) => (!pendingTip || pendingTip.talker !== "offscreenyupa") && !game.sceneData.pushDownYupa,
				index: game => game.sceneData.pushDownYupa ? 2 : Math.floor(game.now / 100) % 2,
				offsetY: game => {
					if (game.sceneData.pushDownYupa) {
						const time = (game.now - game.sceneData.pushDownYupa) / 50;
						return Math.min(Math.round(time), 30);
					}

					const time = game.now - game.pendingTip.time;
					return Math.max(0, 10 - time/100);
				},
			},
			{
				custom: (game, sprite, ctx) => {
					ctx.fillStyle = "#000000";
					ctx.fillRect(0, 0, 64, 64);
				},
				hidden: game => !game.sceneData.human_wah,
			},
			{
				src: ASSETS.HUMAN_WAH, col: 3, row: 3,
				index: ({pendingTip, now, sceneData}) => {
					if (sceneData.human_wah) {
						if (pendingTip) {
							return 4 + (pendingTip && pendingTip.progress >= 1 ? 0 : Math.floor(now / 100) % 4);
						}
						return 4;
					}
					return pendingTip.talker === "human4" && pendingTip.progress < 1 ? Math.floor(now / 100) % 4 : 0;
				},
				hidden: ({pendingTip, sceneData}) => !sceneData.human_wah && (!pendingTip || pendingTip.talker !== "human4"),
				offsetY: ({pendingTip, now, sceneData}) => {
					if (sceneData.human_wah) {
						return 0;
					}
					return pendingTip && pendingTip.talker === "human4" ? Math.max(0, 50 - (now - sceneData.jumpin)) : 0;
				},
			},
		],
	},
);
