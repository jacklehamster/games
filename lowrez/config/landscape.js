gameConfig.scenes.push(
	{
		name: "landscape",
		onScene: game => {
			game.sceneData.hitman = {
				pos: { x: 55, y: 50, },
				goal: { x: 55, y: 50, },
				visible: true,
				speed: 1/8,
				direction: 4,
				anim: [
					[12,13,14,15],	//	N
					[16,17,18,19],	//	NW
					[24,25,26,27],	//	W
					[4,5,6,7],		//	SW
					[0,1,2,3],		//	S
					[8,9,10,11],	//	SE
					[28,29,30,31],	//	E
					[20,21,22,23],	//	NE
				],
			};
			game.sceneData.yupa = {
				pos: { x: 60, y: 50, },
				visible: true,
				speed: 1/8,
				dist: 10,
				moving: false,
				goal: null,
			};
		},
		onSceneRefresh: game => {
			const { pos, goal, speed } = game.sceneData.hitman;
			const dx = pos.x > goal.x ? -1 : pos.x < goal.x ? 1 : 0;
			const dy = pos.y > goal.y ? -1 : pos.y < goal.y ? 1 : 0;
			if (Math.abs(pos.x-goal.x) >= 1 || Math.abs(pos.y-goal.y) >= 1) {
				const dist = Math.sqrt(dx*dx + dy*dy);
				pos.x += dx * Math.min(Math.abs(pos.x - goal.x), speed / dist);
				pos.y += dy * Math.min(Math.abs(pos.y - goal.y), speed / dist);
			} else {
				pos.x = goal.x;
				pos.y = goal.y;
			}
			const { yupa, hitman } = game.sceneData;
			if (hitman && yupa) {
				if (yupa.goal) {
					const dx = yupa.pos.x > yupa.goal.x ? -1 : yupa.pos.x < yupa.goal.x ? 1 : 0;
					const dy = yupa.pos.y > yupa.goal.y ? -1 : yupa.pos.y < yupa.goal.y ? 1 : 0;
					if (Math.abs(yupa.pos.x-yupa.goal.x) >= 1 || Math.abs(yupa.pos.y-yupa.goal.y) >= 1) {
						const dist = Math.sqrt(dx*dx + dy*dy);
						yupa.pos.x += dx * Math.min(Math.abs(yupa.pos.x - yupa.goal.x), speed / dist);
						yupa.pos.y += dy * Math.min(Math.abs(yupa.pos.y - yupa.goal.y), speed / dist);
					} else {
						yupa.pos.x = yupa.goal.x;
						yupa.pos.y = yupa.goal.y;
					}
				} else {
					const dx = hitman.pos.x - yupa.pos.x;
					const dy = hitman.pos.y - yupa.pos.y;
					const dist = Math.sqrt(dx*dx + dy*dy);
					if (dist > yupa.dist) {
						yupa.pos.x += dx / dist * yupa.speed;
						yupa.pos.y += dy / dist * yupa.speed;
						yupa.moving = true;
					} else {
						yupa.moving = false;
					}
				}
			}

			if (game.sceneData.script && game.sceneData.script.length) {
				while (game.sceneData.script.length && game.sceneData.script[0](game)) {
					if (!game.sceneTime) {
						break;
					}
					game.sceneData.script.shift();
				}
			}
		},
		arrowGrid: [
			[ null, null, MENU,  null, null ],
			[],
			[],
			[],
			[ null, null, BAG, null, null ],
		],
		sprites: [
			{
				src: ASSETS.LANDSCAPE,
				noHighlight: true,
				onClick: game => {
					const { pos, goal, visible } = game.sceneData.hitman;
					if (game.mouseDown && visible) {
						goal.x = Math.round(game.mouse.x);
						goal.y = Math.max(45, Math.round(game.mouse.y));
						game.sceneData.script = null;						
					}
				},
			},
			{
				src: ASSETS.SPACESHIP_STAIRS, col: 4, row: 4,
				index: game => {
					if (game.sceneData.ladderDown) {
						return Math.min(5, Math.floor((game.now - game.sceneData.ladderDown) / 200));
					}
					if (game.sceneData.ladderUp) {
						return Math.min(10, 5 + Math.floor((game.now - game.sceneData.ladderUp) / 200));						
					}
					if (game.sceneData.liftShip) {
						return Math.min(14, 10 + Math.floor((game.now - game.sceneData.liftShip) / 100));	
					}
					return 0;
				},
				offsetY: game => {
					if (game.sceneData.liftShip) {
						const time = (game.now - game.sceneData.liftShip) / 500;
						return - time * time;
					}
					return 0;
				},
			},
			{
				src: ASSETS.YUPA_WALK, size:[16, 32], col: 3, row: 2,
				scale: .2,
				offsetX: ({sceneData}) => sceneData.yupa.pos.x - 2,
				offsetY: ({sceneData}) => sceneData.yupa.pos.y - 6,
				index: game => game.sceneData.yupa.moving ? Math.floor(game.now/100) % 4 : 0,
				hidden: game => !game.sceneData.hitman.visible,
			},
			{
				src: ASSETS.HITMAN_WALK, size:[16,32], col: 6, row: 6,
				scale: .2,
				offsetX: ({sceneData}) => sceneData.hitman.pos.x - 2,
				offsetY: ({sceneData}) => sceneData.hitman.pos.y - 6,
				index: game => {
					const { pos, goal, anim } = game.sceneData.hitman;
					const dx = pos.x > goal.x ? -1 : pos.x < goal.x ? 1 : 0;
					const dy = pos.y > goal.y ? -1 : pos.y < goal.y ? 1 : 0;
					const moving = Math.abs(pos.x-goal.x) >= 1 || Math.abs(pos.y-goal.y) >= 1;
					const animation = game.getAnimation(dx, dy);
					const frame = moving ? Math.floor(game.now/100) % 4 : 0;
					return anim[animation][frame];
				},
				hidden: game => !game.sceneData.hitman.visible,
			},
			{
				src: ASSETS.HITMAN_BEARD_WALK, size:[16,32], col: 6, row: 6,
				scale: .2,
				offsetX: ({sceneData}) => sceneData.hitman.pos.x - 2,
				offsetY: ({sceneData}) => sceneData.hitman.pos.y - 6,
				index: game => {
					const { pos, goal, anim } = game.sceneData.hitman;
					const dx = pos.x > goal.x ? -1 : pos.x < goal.x ? 1 : 0;
					const dy = pos.y > goal.y ? -1 : pos.y < goal.y ? 1 : 0;
					const moving = Math.abs(pos.x-goal.x) >= 1 || Math.abs(pos.y-goal.y) >= 1;
					const animation = game.getAnimation(dx, dy);
					const frame = moving ? Math.floor(game.now/100) % 4 : 0;
					return anim[animation][frame];
				},
				hidden: game => !game.sceneData.hitman.visible,
			},
			{
				src: ASSETS.SPACESHIP, col: 1, row: 2,
				offsetY: game => {
					if (game.sceneData.liftShip) {
						const time = (game.now - game.sceneData.liftShip) / 500;
						return - time * time;
					}
					return 0;
				},
				onClick: game => {
					const { pos, goal, visible } = game.sceneData.hitman;
					game.sceneData.script = [
						game => {
							game.sceneData.hitman.goal.x = 15;
							game.sceneData.hitman.goal.y = 45;
							return true;
						},
						game => {
							const { pos, goal } = game.sceneData.hitman;
							return pos.x===goal.x && pos.y===goal.y;
						},
						game => {
							game.hideCursor = true;
							game.sceneData.ladderDown = game.now;
							return true;
						},
						game => {
							return game.now - game.sceneData.ladderDown > 1000;
						},
						game => {
							game.sceneData.yupa.goal = {};
							game.sceneData.yupa.goal.x = 20;
							game.sceneData.yupa.goal.y = 45;
							return true;
						},
						game => {
							const { pos, goal } = game.sceneData.yupa;
							return pos.x===goal.x && pos.y===goal.y;
						},
						game => {
							game.sceneData.showForegroundShip = true;
							game.sceneData.yupa.goal.x = 23;
							game.sceneData.yupa.goal.y = 30;
							game.sceneData.hitman.goal.x = 23;
							game.sceneData.hitman.goal.y = 45;
							return true;
						},
						game => {
							const { pos, goal } = game.sceneData.hitman;
							return pos.x===goal.x && pos.y===goal.y;
						},
						game => {
							game.sceneData.hitman.goal.x = 23;
							game.sceneData.hitman.goal.y = 30;
							return true;
						},
						game => {
							const { pos, goal } = game.sceneData.hitman;
							return pos.x===goal.x && pos.y===goal.y;
						},
						game => {
							game.sceneData.hitman.visible = false;
							game.sceneData.yupa.visible = false;
							game.sceneData.ladderDown = 0;
							game.sceneData.ladderUp = game.now;
							game.sceneData.showForegroundShip = false;
							return true;
						},
						game => {
							return game.now - game.sceneData.ladderUp > 1000;
						},
						game => {
							game.playSound(SOUNDS.DIVING);
							game.sceneData.liftShip = game.now;
							game.sceneData.ladderUp = 0;
							return true;
						},
						game => {
							return game.now - game.sceneData.liftShip > 4000;
						},
						game => {
							game.gotoScene("stars");
							return true;
						},
					];
				},
			},
			...standardMenu(),
			...standardBag(),		
		],
	},
);