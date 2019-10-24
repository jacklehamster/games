gameConfig.scenes.push(
	{
		name: "zoom-hottub",
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
							return Math.floor(now / 100) % 2 + 13;
						}
						if (pendingTip.talker === "alexa") {
							return (Math.floor(now / 100) % 2) * 2 + 13;						
						}
						if (pendingTip.talker === "human2") {
							return (Math.floor(now / 100) % 3) + 20;
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
					} else if (talker === "yupa") {
						x = 3;
						y = 23;
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
					sceneData.script = [
						({now, sceneTime, sceneData}) => {
							sceneData.frame = Math.floor((now - sceneTime)/100)  % 2;
							return now - sceneTime >= 500;
						},
						({now, sceneTime, sceneData}) => {
							sceneData.frame = Math.min(13, Math.floor((now - game.sceneData.scriptTime)/100));
							if (sceneData.frame >= 4 && !sceneData.alexaTurned) {
								game.playSound(SOUNDS.DIVING, {volume: .3});
								sceneData.alexaTurned = game.now;
							}
							return sceneData.frame >= 13;
						},
						game => {
							sprite.startTalk(game, "human", `Thanks Alectra! I love ${game.getSituation("stars").drink||"it"}!`, game => {
								sprite.startTalk(game, "alexa", "Okay");
							});
							return true;
						},			
						({pendingTip}) => {
							return !pendingTip;
						},
						({now, sceneTime, sceneData}) => {
							sceneData.frame = 15 + Math.floor((now - sceneData.scriptTime)/300);
							if (sceneData.frame > 19) {
								sceneData.frame = 18 + (sceneData.frame) % 2;
							}							
							return now - sceneData.scriptTime > 3000;
						},
						({now, sceneTime, sceneData}) => {
							sceneData.frame = 18 + Math.floor((now - sceneData.scriptTime)/100) % 2;
							return now - sceneData.scriptTime > 1000;
						},
						({now, sceneTime, sceneData}) => {
							sceneData.frame = 20 + Math.floor((now - sceneData.scriptTime)/100) % 3;
							sprite.startTalk(game, "human2", "How come they make these so hard to open?");
							return true;
						},
						({pendingTip}) => {
							return !pendingTip;
						},
						({now, sceneTime, sceneData}) => {
							sceneData.frame = 23 + Math.floor((now - sceneData.scriptTime)/100) % 2;
							return now - sceneData.scriptTime > 2000;
						},
						({now, sceneTime, sceneData}) => {
							sceneData.frame = 23;
							return now - sceneData.scriptTime > 500;
						},
						({now}) => {
							sceneData.frame = 25
							return now - sceneData.scriptTime > 1000;
						},
						game => {
							game.gotoScene("i-have-no-hand");
							return true;
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