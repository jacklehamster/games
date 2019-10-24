gameConfig.scenes.push(
	{
		name: "zoom-guards",
		arrowGrid: [
			[],
			[],
			[ null, null, null,  null, null  ],
			[ null, null, null,  null, null ],
			[ null, null, BAG ,  null, null ],
		],
		onSceneHoldItem: (game, item) => {
			if (item === "gun") {
				game.waitCursor = true;
				game.showTip("...", () => {
					game.waitCursor = false;
					game.gotoScene("jail-cell");
					game.hideCursor = true;
					game.sceneData.guardAlert = game.now;
				});
			}
		},
		onScene: game => {
			game.delayAction(game => {
				game.startDialog({
					time: game.now,
					index: 0,
					conversation: [
						{
							options: [
								{
									msg: game => game.data.seen.badguards ? "Hey" : game.data.seen["writing"] && game.data.saidHelloToGuard ? "Hello again" : "Hello",
									onSelect: (game, dialog) => {
										game.playSound(SOUNDS.HELLO);
										dialog.guardSpeaking = true;
										game.waitCursor = true;
										game.showTip("...", () => {
											dialog.guardSpeaking = false;
											game.waitCursor = false;
										});
										dialog.index = 1;
										game.data.saidHelloToGuard = game.now;
									}
								},
								{ msg: "LEAVE", onSelect: game => game.gotoScene("jail-cell")},
							],
						},
						{
							options: [
								{
									msg: "Let me out?", 
									onSelect: (game, dialog) => {
										game.playSound(SOUNDS.HAHAHA);
										dialog.guardSpeaking = true;
										game.waitCursor = true;
										game.showTip("... seems like he's laughing at me ...", () => {
											dialog.guardSpeaking = false;
											game.waitCursor = false;
										});
									}
								},
								{
									hidden: game => !game.data.seen.writing,
									msg: "It's my birthday", 
									onSelect: (game, dialog) => {
										if (game.data.seen.badguards) {
											game.showTip("Let's just keep that to myself");
										} else if (DEMO) {
											game.gotoScene("temp-end");
										} else {
											game.playSound(SOUNDS.BIRTHDAY);
											dialog.guardSpeaking = true;
											game.waitCursor = true;
											game.showTip("... did he\nunderstand? ...", game => {
												game.gotoScene("bring-cake");
											});
										}
									}
								},
								{ msg: "LEAVE", onSelect: game => game.gotoScene("jail-cell")},
							],
						},
					],
				});
			}, 50);
		},
		sprites: [
			{
				name: "zoom-guards",
				src: ASSETS.ZOOM_GUARDS,
				index: game => {
					if (game.dialog && game.dialog.guardSpeaking) {
						return Math.floor((game.now - game.sceneTime) / 100) % 4;
					}
					const frame = Math.floor((game.now - game.sceneTime) / 200);
					return frame % 31 === 1 ? 1 : 0;
				},
				combineMessage: (item, game) => `The guard shrugs at my ${item}.`,
			},
			{
				src: ASSETS.ZOOM_GUARD_ALERT,
				hidden: game => game.useItem !== "gun",
			},
			{
				src: ASSETS.SPEECH_OUT,
				hidden: game => game.bagOpening || game.useItem || game.pendingTip,
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