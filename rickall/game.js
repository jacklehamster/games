const Game = function() {
	const SPEED = 1;
	const characters = {
		'npc': {
			'body-up': 'npc-body-up',
			'body-left': 'npc-body-left',
			'body-right': 'npc-body-left',
			'body-down': 'npc-body',
			'head': 'npc-head',
			'face': 'npc-face',
		},
	};

	let hero = { x: 100, y: 100 };

	const FACE_COLORS = ['default', 'pink', 'yellow', 'black', 'halfblack', "blue"];
	let npcs = new Array(100).fill(null).map(
		a => {
			return { 
				color: getRandom(FACE_COLORS),
				x: Math.random()*500, 
				y: Math.random()*500,
				move: {
					dx: Math.round(2*(Math.random()-.5)),
					dy: Math.round(2*(Math.random()-.5)),
				},
			};
		}
	);

	function initScene() {
	}

	function performActions() {
		const { dx, dy } = Keyboard.move;
		const dist = Math.sqrt(dx * dx + dy * dy);
		if (dist) {
			hero.x += SPEED * dx / dist;
			hero.y += SPEED * dy / dist;
		}
		npcs.forEach(npc => {
			const { dx, dy } = npc.move;
			const dist = Math.sqrt(dx * dx + dy * dy);
			if (dist) {
				npc.x += SPEED * dx / dist;
				npc.y += SPEED * dy / dist;
				if(npc.x < 0 && dx < 0) {
					npc.move.dx = -dx;
				}
				if(npc.x > 500 && dx > 0) {
					npc.move.dx = -dx;
				}
				if(npc.y < 0 && dy < 0) {
					npc.move.dy = -dy;
				}
				if(npc.y > 500 && dy > 0) {
					npc.move.dy = -dy;
				}		
			}
		});
	}

	function getSprite(name, x, y, dx, dy, option) {
		const OFFSET_X = -32, OFFSET_Y = -16;
		const moveDist = Math.sqrt(dx*dx + dy*dy);
		const character = characters[name];
		let face = null;
		let body = null;
		let head = [character['head'], OFFSET_X, OFFSET_Y +-26, {animated: moveDist, color:option.color}];
		if (!dx) {
			if (dy < 0) {
				body = [character['body-up'], OFFSET_X, OFFSET_Y, {animated: true, color:option.color}];
			} else if(dy > 0) {
				body = [character['body-down'], OFFSET_X, OFFSET_Y, {animated: true, color:option.color}];
			} else {
				body = [character['body-down'], OFFSET_X, OFFSET_Y, {animated: false, color:option.color}];
			}
		} else {
			body = [character['body-left'], OFFSET_X, OFFSET_Y, {animated: true, flip: dx>0, color:option.color}];
		}

		if (dy >= 0) {
			const faceOffsetX = dy===0 ? 5 : 2;
			face = [character['face'], OFFSET_X + dx * faceOffsetX, OFFSET_Y -26 + dy, {animated: moveDist, flip: dx>0, color:option.color}];
		}
		return [
			'group', x, y, {}, [
				body,
				head,
				face,
			],
		];
	}


				// objects: {
				// 	npc: [
				// 		// ['if', ['and', ['=', 0, ['hero.move.dx']], ['not', ['moveDist']]], [['.body-down'], 0, 0, { animated: ['moveDist'] }]],
				// 		// ['if', ['and', ['=', 0, ['hero.move.dx']], ['<', 0, ['hero.move.dy']]], [['.body-down'], 0, 0, { animated: ['moveDist'] }]],
				// 		// ['if', ['and', ['=', 0, ['hero.move.dx']], ['<', ['hero.move.dy'], 0]], [['.body-up'], 0, 0, { animated: ['moveDist'] }]],						
				// 		// ['if', ['<', ['hero.move.dx'], 0], [['.body-left'], 0, 0, { animated: ['moveDist'] }]],
				// 		// ['if', ['<', 0, ['hero.move.dx']], [['.body-right'], 0, 0, { animated: ['moveDist'], flip: true }]],
				// 		// [['.head'], 0, -26, { animated: ['moveDist']}],						
				// 		// ['if', ['<=', 0, ['hero.move.dy']],
				// 		// 	[['.face'], ['*', ['if',['=',0,['hero.move.dy']],5,'else',2], ['hero.move.dx']], ['+', -26, ['hero.move.dy']], { 
				// 		// 		animated: ['moveDist'],
				// 		// 		flip: ['<', 0, ['hero.move.dx']],
				// 		// 	},
				// 		// ]],
				// 	],
				// },

	function getRandom(array) {
		return array[Math.floor(Math.random() * array.length)];
	}

	const sprites = [];
	function getSprites() {
		sprites.length = 0;
		sprites.push(getSprite('npc', hero.x, hero.y, Keyboard.move.dx, Keyboard.move.dy, {}));
		npcs.forEach(npc => {
			sprites.push(getSprite('npc', npc.x, npc.y, npc.move.dx, npc.move.dy, {
				color: npc.color,
			}));
		});
		return sprites;
	}


	return {
		settings: {
			size: [ 500, 500 ],
		},
		assets: [
			['npc-body-left.png', 32, 32, {
				colors: [
					{ name: 'default' },
					{ name: "pink", 0xFFFFFF: 0xFFEEEE },
					{ name: "yellow", 0xFFFFFF: 0xFFFFCC },
					{ name: "black", 0xFFFFFF: 0x994444 },
					{ name: "halfblack", 0xFFFFFF: 0xEE9966 },
					{ name: "blue", 0xFFFFFF: 0x88EEDD },
				],				
			}],
			['npc-body-up.png', 32, 32, {
				colors: [
					{ name: 'default' },
					{ name: "pink", 0xFFFFFF: 0xFFEEEE },
					{ name: "yellow", 0xFFFFFF: 0xFFFFCC },
					{ name: "black", 0xFFFFFF: 0x994444 },
					{ name: "halfblack", 0xFFFFFF: 0xEE9966 },
					{ name: "blue", 0xFFFFFF: 0x88EEDD },
				],
			}],
			['npc-body.png', 32, 32, {
				colors: [
					{ name: 'default' },
					{ name: "pink", 0xFFFFFF: 0xFFEEEE },
					{ name: "yellow", 0xFFFFFF: 0xFFFFCC },
					{ name: "black", 0xFFFFFF: 0x994444 },
					{ name: "halfblack", 0xFFFFFF: 0xEE9966 },
					{ name: "blue", 0xFFFFFF: 0x88EEDD },
				],
			}],
			['npc-face.png', 32, 32, {
				animOffset: [
					[0, 0],
					[1, -1],
					[0, 0],
					[-1, -1],
				],
			}],
			['npc-head.png', 32, 32, {
				animOffset: [
					[0, 0],
					[1, -1],
					[0, 0],
					[-1, -1],
				],
				colors: [
					{ name: 'default' },
					{ name: "pink", 0xFFFFFF: 0xFFEEEE },
					{ name: "yellow", 0xFFFFFF: 0xFFFFCC },
					{ name: "black", 0xFFFFFF: 0x994444 },
					{ name: "halfblack", 0xFFFFFF: 0xEE9966 },
					{ name: "blue", 0xFFFFFF: 0x88EEDD },
				],
			}],
		],
		scenes: [
			{
				objects: {

				},
				// objects: {
				// 	npc: [
				// 		// ['if', ['and', ['=', 0, ['hero.move.dx']], ['not', ['moveDist']]], [['.body-down'], 0, 0, { animated: ['moveDist'] }]],
				// 		// ['if', ['and', ['=', 0, ['hero.move.dx']], ['<', 0, ['hero.move.dy']]], [['.body-down'], 0, 0, { animated: ['moveDist'] }]],
				// 		// ['if', ['and', ['=', 0, ['hero.move.dx']], ['<', ['hero.move.dy'], 0]], [['.body-up'], 0, 0, { animated: ['moveDist'] }]],						
				// 		// ['if', ['<', ['hero.move.dx'], 0], [['.body-left'], 0, 0, { animated: ['moveDist'] }]],
				// 		// ['if', ['<', 0, ['hero.move.dx']], [['.body-right'], 0, 0, { animated: ['moveDist'], flip: true }]],
				// 		// [['.head'], 0, -26, { animated: ['moveDist']}],						
				// 		// ['if', ['<=', 0, ['hero.move.dy']],
				// 		// 	[['.face'], ['*', ['if',['=',0,['hero.move.dy']],5,'else',2], ['hero.move.dx']], ['+', -26, ['hero.move.dy']], { 
				// 		// 		animated: ['moveDist'],
				// 		// 		flip: ['<', 0, ['hero.move.dx']],
				// 		// 	},
				// 		// ]],
				// 	],
				// },
				init: [
					initScene,
					// ['=>', 'hero.x', 100],
					// ['=>', 'hero.y', 100],
					// ['=>', 'hero.move', ['keyboardMovement']],
				],
				actions: [
					performActions,
					// ['=>', 'moveDist', ['normalize', ['hero.move.dx'], ['hero.move.dy']]],
					// ['if', ['moveDist'],
					// 	['do',
					// 		['+>', 'hero.x', ['*', 2, ['div', ['hero.move.dx'], ['moveDist']]]],
					// 		['+>', 'hero.y', ['*', 2, ['div', ['hero.move.dy'], ['moveDist']]]],
					// 	],
					// ],
				],
				sprites: getSprites,
				// [
				// 	['npc', ['hero.x'], ['hero.y'], {
				// 		'body-up': 'npc-body-up',
				// 		'body-left': 'npc-body-left',
				// 		'body-right': 'npc-body-left',
				// 		'body-down': 'npc-body',
				// 		'head': 'npc-head',
				// 		'face': 'npc-face',
				// 	}],
				// ],
			},
		],
	};
}();
