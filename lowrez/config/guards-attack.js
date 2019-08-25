gameConfig.scenes.push(
	{
		name: "guards-attack",
		onScene: game => {
			game.hideCursor = true;
			game.fadeColor = "#000000";
			game.see("badguards");
		},
		onSceneRefresh: game => {
			const frame = Math.floor((game.now - game.sceneTime) / 100);
			game.fade = Math.max(0, Math.min(1, (frame - 50) / 10));

			if (frame > 70) {
				if (!game.sceneData.beatsound) {
					game.sceneData.beatsound = game.now;
					game.playSound(SOUNDS.HIT);
					game.delayAction(game => game.playSound(SOUNDS.PLAYER_HURT), 300);
					game.delayAction(game => game.playSound(SOUNDS.HIT), 500);
				}
			}
			if (frame > 80) {
				game.gotoScene("jail-cell");
				game.see("intro");
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
);