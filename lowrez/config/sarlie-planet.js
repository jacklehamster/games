gameConfig.scenes.push(
	{
		name: "sarlie-planet",
		onScene: game => {
			game.save();
			game.hideCursor = true;
			game.sceneData.hitman = {
				pos: { x: 23, y: 35, },
				goal: { x: 23, y: 35, },
				visible: false,
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
				pos: { x: 23, y: 35, },
				goal: {x: 23, y: 35, },
				visible: false,
				speed: 1/8,
				dist: 10,
				moving: false,
			};


			game.sceneData.script = [
				game => {
					return game.now - game.sceneTime > 3000;
				},
				game => {
					game.sceneData.yupa.visible = true;
					game.sceneData.hitman.visible = true;
					return true;
				},
				game => {
					return game.now - game.sceneData.scriptTime > 1000;
				},
				game => {
					game.sceneData.yupa.goal.x = 23;
					game.sceneData.yupa.goal.y = 44;
					return true;
				},
				game => {
					const { pos, goal } = game.sceneData.yupa;
					return pos.x===goal.x && pos.y===goal.y;
				},
				game => {
					game.sceneData.hitman.goal.x = 23;
					game.sceneData.hitman.goal.y = 44;
					game.sceneData.yupa.goal.x = 70;
					game.sceneData.yupa.goal.y = 44;
					return true;
				},
				game => {
					const { pos, goal } = game.sceneData.hitman;
					return pos.x===goal.x && pos.y===goal.y;
				},
				game => {
					game.sceneData.hitman.goal.x = 65;
					game.sceneData.hitman.goal.y = 44;
					return true;
				},
				game => {
					const { pos, goal } = game.sceneData.hitman;
					return pos.x===goal.x && pos.y===goal.y;
				},
				game => {
					game.gotoScene("sarlie-planet-world");
					return true;
				},
			];
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
					game.sceneData.scriptTime = game.now;
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
				src: ASSETS.SARLIE_PLANET_BG,
			},
			{
				src: ASSETS.SPACESHIP, col: 1, row: 2,
				index: 1,
				alpha: .5,
				scale: .8,
				offsetY: game => {
					const time = Math.max(0, game.now - game.sceneTime) / 2;
					return 25 - Math.round(Math.min(7, Math.sqrt(time) - 30));
				},
				offsetX: 4,
			},
			{
				src: ASSETS.SARLIE_PLANET,
				index: game => {
					const frame = Math.floor(game.now / 100) % 30;
					return frame >= 4 ? 0 : frame;
				},
			},
			{
				src: ASSETS.SPACESHIP_STAIRS, col: 4, row: 4,
				scale: .8,
				index: game => {
					const frame = Math.floor((game.now - game.sceneTime - 2000) / 100);
					return Math.max(5, 15 - Math.min(frame, 15));
				},
				offsetY: game => {
					const time = Math.max(0, game.now - game.sceneTime) / 2;
					return Math.round(Math.min(7, Math.sqrt(time) - 30));
				},
				offsetX: 4,
				hidden: game => game.now - game.sceneTime < 1000,
			},
			{
				src: ASSETS.YUPA_WALK, size:[16, 32], col: 3, row: 2,
				scale: .16,
				offsetX: ({sceneData}) => sceneData.yupa.pos.x - 2,
				offsetY: ({sceneData}) => sceneData.yupa.pos.y - 6,
				index: game => game.sceneData.yupa.moving ? Math.floor(game.now/100) % 4 : 0,
				hidden: game => !game.sceneData.hitman.visible,
			},
			{
				src: ASSETS.HITMAN_WALK, size:[16,32], col: 6, row: 6,
				scale: .16,
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
				scale: .8,
				offsetY: game => {
					const time = Math.max(0, game.now - game.sceneTime) / 2;
					return Math.round(Math.min(7, Math.sqrt(time) - 30));
				},
				offsetX: 4,
			},
			...standardMenu(),
			...standardBag(),		
		],
	},
);