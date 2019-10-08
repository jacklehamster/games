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
				if (pos.y >= 80 && !game.waitCursor) {
					game.waitCursor = true;
				}
			} else {
				pos.x = goal.x;
				pos.y = goal.y;
				if (pos.y >= 120 && !game.fade) {
					game.fadeToScene("landscape");
				}
			}
			const { yupa, hitman } = game.sceneData;
			if (hitman && yupa) {
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
				onClick: game => {
					const { pos, goal, visible } = game.sceneData.hitman;
					if (game.mouseDown && visible) {
						goal.x = Math.round(game.mouse.x);
						goal.y = Math.max(45, Math.round(game.mouse.y));
					}
				},
			},
			{
				src: ASSETS.SPACESHIP,
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
			...standardMenu(),
			...standardBag(),
		],
	},
);