gameConfig.scenes.push(
	{
		name: "human-woke",
		onScene: game => {
			game.playTheme(SOUNDS.FUTURE_SONG_THEME, {volume: .8});
			game.hideCursor = true;
			game.delayAction(game => {
				const { currentScene } = game;
				currentScene.startTalk(game, "yupa", "Hey look, he wakin up!", game => {
					game.hideCursor = false;
						game.startDialog({
							time: game.now,
							index: 0,
							conversation: [
								{
									options: [
										{
											msg: "Why am I here?",
											onSelect: (game, dialog) => {
												currentScene.startTalk(game, "human", [
													"I thought I was dead,",
													"What am I still doing here?",
												], game => {
													currentScene.startTalk(game, "yupa", [
														`Ya diden die, ${game.data.name||"hitman"},`,
														"We gave ya nother chance tu change yo mind.",
													], game => {
														currentScene.startTalk(game, "doctar", [
															"You ingested a drug that simulates the effects of dying.",
															"We usually give it to suicidal patients,",
															"In case they have a change of heart.",
															"After experiencing this simulation of death,",
															"many choose to live.",
														], game => {
															dialog.index++;
														});
													});
												});
											},
										},
										{
											msg: "Where am I?",
											onSelect: (game, dialog) => {
												currentScene.startTalk(game, "human", [
													"Where am I?",
													"Is this hell or heaven?",
													"It's hell isn't it? I'm sure it is...",
												], game => {
													currentScene.startTalk(game, "yupa", [
														`It's not hell, ${game.data.name||"hitman"},`,
														"You have ya nother chance at life.",
													], game => {
														currentScene.startTalk(game, "doctar", [
															"We gave you a drug that simulates the effects of dying.",
															"It's usually prescribed to suicidal patients,",
															"In case they have a change of heart.",
															"After experiencing this simulation of death,",
															"many choose to live.",
														], game => {
															dialog.index++;
														});
													});
												});
											},
										},
										{
											msg: "I'm alive!",
											onSelect: (game, dialog) => {
												currentScene.startTalk(game, "human", [
													"I'm still alive!",
													"How is that possible?"
												], game => {
													currentScene.startTalk(game, "yupa", [
														"Ya diden die yet.",
														"We gave ya nother chance!",
													], game => {
														currentScene.startTalk(game, "doctar", [
															"You took a drug that simulates the effects of dying.",
															"It's usually prescribed to suicidal patients,",
															"In case they have a change of heart.",
															"After experiencing this simulation of death,",
															"many choose to live.",
														], game => {
															dialog.index++;
														});
													});
												});
											},
										},
									],
								},
								{
									options: [
										{
											msg: game => game.sceneData.toldWhy ? "" : "Why?",
											cantSelect: game => game.sceneData.toldWhy,
											onSelect: game => {
												currentScene.startTalk(game, "human", [
													"Why would you keep me alive?",
												], game => {
													currentScene.startTalk(game, "yupa", [
														"Well... I dun realey want ya to go",
														"Kinda like havin ya round...",
														"You sure ya dun wanna go out dhere,",
														"find da Baby wid me,",
														"and becom big famely agan?",
													], game => {
														game.sceneData.toldWhy = game.now;
													});
												});
											},											
										},
										{
											msg: "Let me die!",
											onSelect: game => {
												currentScene.startTalk(game, "human", [
													"Let me die, you crazies!",
												], game => {
													game.sceneData.looking = game.now;
													currentScene.startTalk(game, "human", [
														"This time for real, just leave me alone!",
														"I wanna die in peace!",
													], game => {
														game.sceneData.looking = 0;
														currentScene.startTalk(game, "yupa", [
															`Ok, ${game.data.name || "hitman"}`,
															"It waz nice knowin ya.",
															"Ya doing nobol sacriface for humanz,",
															"... ya stuped human....",
														], game => {
															game.dialog = null;
															game.fadeToScene("final-doom");
														});
													});
												});
											},
										},
										{
											msg: "I wanna live!",
											onSelect: game => {
												currentScene.startTalk(game, "human", [
													"I wanna live this time!",
													"I don't want to go through this hell again!",
													"Let's go Yupa, we're gonna find dat damn baby!"
												], game => {
													currentScene.startTalk(game, "yupa", [
														`Sura think, ${game.data.name || "hitman"}`,
														"Letz stard wid da shopkeepa.",
														"Docta said he knowz lotza piple.",
													], game => {
														game.dialog = null;
														game.data.seen.doctor = game.now;
														game.fadeToScene("sarlie-planet-world", null, null, game => {
															game.sceneData.fromDoctor = true;
														});
													});
												});
											},											
										},
									],
								},
							],
						});
				});
			}, 3000);
		},
		startTalk: (game, talker, msg, onDone, removeLock) => {
			let x, y;
			if (talker === "human" || talker === "human2") {
				x = 2;
				y = 64;
				game.playSound(SOUNDS.HUM);
			} else if (talker === "yupa") {
				x = 2;
				y = 20;
				game.playSound(SOUNDS.YUPA);
			} else if (talker === "doctar") {
				x = 2;
				y = 21;				
				game.playSound(SOUNDS.HUHUH);
			}
			game.showTip(msg, onDone, 80, { x, y, talker, removeLock });
		},
		sprites: [
			{
				src: ASSETS.OPERATION_ROOM, col: 2, row: 3,
				side: LEFT,
				index: game => {
					if (game.sceneData.looking) {
						return 4;
					}
					return game.pendingTip && game.pendingTip.talker === "yupa" ? Math.floor(game.now / 100) % 4 : 0;
				},
			},
			{
				src: ASSETS.OPERATION_ROOM, col: 2, row: 3,
				side: RIGHT,
				index: game => {
					if (game.sceneData.looking) {
						return 4;
					}
					return game.pendingTip && game.pendingTip.talker === "doctar" ? Math.floor(game.now / 100) % 4 : 0;
				},
			},
			{
				src: ASSETS.EYES_OPEN, col: 3, row: 3,
				index: game => {
					const time = game.now - game.sceneTime;
					const frame =  Math.floor(time / 200);
					if (frame < 5) {
						return frame;
					} else if (frame < 10) {
						return 5 - (frame - 5);
					} else {
						return Math.min(8, frame - 10);
					}
					return frame;
				},
			},
		],
	},
);