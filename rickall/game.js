const Game = function() {
	const WORLD_SIZE = [1000, 1000];

	const MODES = [
		'normal', 'panic',
	];

	let mode = 'normal';

	const settings = {
		size: [ 250, 250 ],
		backgroundColor: 'black',
	};

	const gameAudio = new Audio();
	gameAudio.src = "spring_sprinkle.mp3";
	gameAudio.loop = true;
	let gameStarted = false;

	function startGameMusic() {
		gameAudio.play();
	}

	function stopGameMusic() {
		gameAudio.stop();
	}

	const SPEED = 1;
	const characters = {
		'npc': {
			'body-up': 'npc-body-up',
			'body-left': 'npc-body-left',
			'body-right': 'npc-body-left',
			'body-down': 'npc-body',
			'head': 'npc-head',
			'face': 'npc-face',
			'mouth': 'npc-mouth',
		},
		'mad': {
			'body-up': 'npc-body-up',
			'body-left': 'npc-body-left',
			'body-right': 'npc-body-left',
			'body-down': 'npc-body',
			'head': 'npc-head',
			'face': 'mad-face',
			'mouth': 'npc-mouth',
		},
		'smart': {
			'body-up': 'npc-body-up',
			'body-left': 'npc-body-left',
			'body-right': 'npc-body-left',
			'body-down': 'npc-body',
			'head': 'npc-head',
			'face': 'smart-face',
			'mouth': 'npc-mouth',
		},
		'pixie': {
			'body-up': 'npc-body-up',
			'body-left': 'npc-body-left',
			'body-right': 'npc-body-left',
			'body-down': 'npc-body',
			'head': 'round-head',
			'face': 'pixie-face',
			'mouth': 'npc-mouth',
			'skinColor': 'pink',
		},
	};

	const HEADS = ['v-head', 'npc-head', 'round-head'];

	let scroll = { x: 0, y: 0 };
	let hero = { 
		x: settings.size[0] / 2, 
		y: settings.size[1] / 2, 
		move: { dx: 0, dy: 0 }, 
		face: { dx: 0, dy: 0 },
		// bodyColor: 'nude',
		// gender: 'penis',
	 };

	const FACE_COLORS = [
		{ name: 'default' },
		{ name: "pink", 0xFFFFFF: 0xFFEEEE },
		{ name: "yellow", 0xFFFFFF: 0xFFFFCC },
		{ name: "black", 0xFFFFFF: 0x994444 },
		{ name: "halfblack", 0xFFFFFF: 0xEE9966 },
		{ name: "blue", 0xFFFFFF: 0x88EEDD },
	];
	const BODY_COLORS = [
		{ name: 'default' },
		{ name: 'jeans', 0x4b4a4a: 0x2e1cca, 0xa7a4a4: 0xb21818, 0x1c1c1c: 0xFFFFFE },
		{ name: 'nude', 0x4b4a4a: 'nude', 0xa7a4a4: 'nude', 0x1c1c1c: 'nude' },
	];
	let npcs = new Array(100).fill(null).map(
		a => {
			return { 
				head: getRandom(HEADS),
				skinColor: getRandom(FACE_COLORS).name,
				bodyColor: getRandom(BODY_COLORS).name,
				x: Math.random()*WORLD_SIZE[0], 
				y: Math.random()*WORLD_SIZE[1],
				move: {
					dx: Math.round(2*(Math.random()-.5)),
					dy: Math.round(2*(Math.random()-.5)),
				},
				type: getRandom(['npc', 'pixie', 'mad', 'smart']),
				gender: Math.random() < .5 ? 'penis' : 'vagina',
			};
		}
	);

	const tiles = [], cols = Math.floor(WORLD_SIZE[0] / 32), rows = Math.floor(WORLD_SIZE[1] / 32);
	for (let r = 0; r < rows; r++) {
		for (let c = 0; c < cols; c++) {
			const isWall = c===0 || r===0 || c===cols-1 || r===rows-1;
			const type = !isWall ? 'floor-tile' : 'bricks';
			const frame = type==='floor-tile' ? getRandom([0, 1, 2, 3, 3, 3, 3, 3, 3, 3, 3]) : 
				getRandom([0, 1, 2, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0])
			tiles.push({ type, x: c * 32, y: r * 32, frame });
		}
	}

	function initScene() {
		startGameMusic();
	}

	function performActions() {
		const scrollGx = (settings.size[0] / 2 - hero.x);
		const scrollGy = (settings.size[1] / 2 - hero.y);
		if (Math.abs(scrollGx - scroll.x) < 1) {
			scroll.x = scrollGx;
		} else {
			scroll.x += (scrollGx - scroll.x) / 10;
		}
		if (Math.abs(scrollGy - scroll.y) < 1) {
			scroll.y = scrollGy;
		} else {
			scroll.y += (scrollGy - scroll.y) / 10;
		}

		if (Keyboard.move.dx != hero.move.dx || Keyboard.move.dy != hero.move.dy) {
			const { dx, dy } = Keyboard.move;
			hero.move.dx = dx;
			hero.move.dy = dy;
		}

		const { dx, dy } = hero.move;
		const { face } = hero;
		if (dx === -face.dx) {
			if (face.dy === 0) {
				face.dy = Math.random()<.5 ? -1 : 1;
			} else {
				face.dx = 0;
			}
		} else if(dy === -face.dy) {
			if (face.dx === 0) {
				face.dx = Math.random()<.5 ? -1 : 1;
			} else {
				face.dy = 0;
			}
		} else {
			face.dx = dx;
			face.dy = dy;
		}

		const dist = Math.sqrt(dx * dx + dy * dy);
		if (dist) {
			hero.x += SPEED * dx / dist;
			hero.y += SPEED * dy / dist;
		}

		hero.talking = Keyboard.action.down;

		npcs.forEach(npc => {
			//	avoid hero
			if (mode==='panic')
			{
				const dx = hero.x - npc.x;
				const dy = hero.y - npc.y;
				const distHero = Math.sqrt(dx * dx + dy * dy);
				if (distHero < 100) {
					if (dx * npc.move.dx >= 0 && dy * npc.move.dy >= 0) {
						npc.move.dx = Math.floor(Math.random() * 3) - 1;
						npc.move.dy = Math.floor(Math.random() * 3) - 1;
					}
					if (dx * npc.move.dx > 0 && dy * npc.move.dy > 0) {
						npc.move.dx *= -1;
						npc.move.dy *= -1;
					}
				} else if (distHero > 400) {
					npc.move.dx = 0;
					npc.move.dy = 0;					
				}
			}

			//	move
			{
				const { dx, dy } = npc.move;
				const dist = Math.sqrt(dx * dx + dy * dy);
				if (dist) {
					npc.x += SPEED * dx / dist;
					npc.y += SPEED * dy / dist;
					if(npc.x < 0 && dx < 0) {
						npc.x = 0;
						npc.move.dx = -dx;
					}
					if(npc.x > WORLD_SIZE[0] && dx > 0) {
						npc.x = WORLD_SIZE[0];
						npc.move.dx = -dx;
					}
					if(npc.y < 0 && dy < 0) {
						npc.y = 0;
						npc.move.dy = -dy;
					}
					if(npc.y > WORLD_SIZE[1] && dy > 0) {
						npc.y = WORLD_SIZE[1];
						npc.move.dy = -dy;
					}		
				}
			}

			// if(Math.random() < .01) {
			// 	npc.talking = !npc.talking;
			// }
		});
	}

	function getSprite(name, x, y, dx, dy, npc) {
		const OFFSET_X = -16, OFFSET_Y = -32;
		const moveDist = Math.sqrt(dx*dx + dy*dy);
		const character = characters[name];
		const headSprite = npc.head || character.head;

		const faceDx = npc.face ? npc.face.dx : dx;
		const faceDy = npc.face ? npc.face.dy : dy;
		const skinColor = npc.skinColor || character.skinColor || 'default';
		const bodyColor = npc.bodyColor || character.bodyColor || 'default';
		const comboColor = skinColor + '-' + bodyColor;
		let face = null;
		let body = null;
		let mouth = null;
		let downThere = null;
		let head = [headSprite, OFFSET_X, OFFSET_Y +-26, {animated: moveDist, color: skinColor}];

		if (!dx) {
			if (dy < 0) {
				body = [character['body-up'], OFFSET_X, OFFSET_Y, {animated: true, color: comboColor}];
			} else if(dy > 0) {
				body = [character['body-down'], OFFSET_X, OFFSET_Y, {animated: true, color: comboColor}];
			} else {
				body = [character['body-down'], OFFSET_X, OFFSET_Y, {animated: false, color: comboColor}];
			}
		} else {
			body = [character['body-left'], OFFSET_X, OFFSET_Y, {animated: true, flip: dx>0, color: comboColor}];
		}

		if (dy >= 0) {
			const faceOffsetX = dy===0 ? (faceDx < 0 ? 4 : 5) : (faceDx < 0 ? 1 : 2);
			face = [character['face'], OFFSET_X + faceDx * faceOffsetX, OFFSET_Y -26 + faceDy, {animated: true, animMove: moveDist, flip: faceDx>0}];
			mouth = [character['mouth'], OFFSET_X + faceDx * faceOffsetX, OFFSET_Y -26 + faceDy, {animated: npc.talking, flip: faceDx>0, animMove: moveDist}];
		}

		if (bodyColor==='nude' && body[0]===character['body-down']) {
			downThere = [npc.gender || 'penis', OFFSET_X, OFFSET_Y, {animated: moveDist}];
		}

		return [
			'group', x, y, {}, [
				body,
				head,
				face,
				mouth,
				downThere,
			],
		];
	}

	function getRandom(array) {
		return array[Math.floor(Math.random() * array.length)];
	}

	const SPRITE_SIZE = 32;
	function onScreen(object) {
		const [ width, height ] = settings.size;
		return object.x + scroll.x > -SPRITE_SIZE && object.x + scroll.x < width + SPRITE_SIZE && object.y + scroll.y > -SPRITE_SIZE && object.y + scroll.y < height + SPRITE_SIZE * 2;
	}

	const sprites = [];
	function getSprites() {
		sprites.length = 0;
		sprites.push(getSprite('pixie', scroll.x + hero.x, scroll.y + hero.y, hero.move.dx, hero.move.dy, hero));

		npcs.forEach(npc => {
			if (onScreen(npc)) {
				sprites.push(getSprite(npc.type, scroll.x + npc.x, scroll.y + npc.y, npc.move.dx, npc.move.dy, npc));
			}
		});

		tiles.forEach(tile => {
			if (onScreen(tile)) {
				sprites.push([tile.type, scroll.x + tile.x, scroll.y + tile.y, {animated: false, frame: tile.frame}]);
			}
		});
		return sprites;
	}


	// const FACE_COLORS = [
	// 	{ name: 'default' },
	// 	{ name: "pink", 0xFFFFFF: 0xFFEEEE },
	// 	{ name: "yellow", 0xFFFFFF: 0xFFFFCC },
	// 	{ name: "black", 0xFFFFFF: 0x994444 },
	// 	{ name: "halfblack", 0xFFFFFF: 0xEE9966 },
	// 	{ name: "blue", 0xFFFFFF: 0x88EEDD },
	// ];
	// const BODY_COLORS = [
	// 	{ name: 'default' },
	// 	{ name: 'jeans', 0x4b4a4a: 0x2e1cca, 0xa7a4a4: 0xb21818, 0x000000: 0xFFFFFE },
	// ];

	function comboColors(faceColors, bodyColors) {
		const colors = [];
		faceColors.forEach(faceColor => {
			bodyColors.forEach(bodyColor => {
				const newColor = {};
				for (let p in faceColor) {
					if (p !== 'name') {
						newColor[p] = faceColor[p];
					}
				}
				for (let p in bodyColor) {
					if (p !== 'name') {
						if (bodyColor[p] === 'nude') {
							newColor[p] = faceColor[0xFFFFFF];
						} else {
							newColor[p] = bodyColor[p];
						}
					}
				}
				newColor.name = faceColor.name + '-' + bodyColor.name;
				colors.push(newColor);
			});
		});
		return colors;
	}

	const WALK_ANIM_OFFSET = [
		[0, 0],
		[1, -1],
		[0, 0],
		[-1, -1],
	];

	return {
		settings,
		assets: [
			['npc-body-left.png', 32, 32, {
				colors: comboColors(FACE_COLORS, BODY_COLORS),				
			}],
			['npc-body-up.png', 32, 32, {
				colors: comboColors(FACE_COLORS, BODY_COLORS),				
			}],
			['npc-body.png', 32, 32, {
				colors: comboColors(FACE_COLORS, BODY_COLORS),				
			}],
			['penis.png', 32, 32, {
			}],
			['vagina.png', 32, 32, {
			}],
			['npc-face.png', 32, 32, {
				animOffset: WALK_ANIM_OFFSET,
			}],
			['mad-face.png', 32, 32, {
				count: 20,
				animOffset: WALK_ANIM_OFFSET,
			}],
			['smart-face.png', 32, 32, {
				count: 20,
				animOffset: WALK_ANIM_OFFSET,
			}],
			['pixie-face.png', 32, 32, {
				count: 20,
				animOffset: WALK_ANIM_OFFSET,
			}],
			['npc-head.png', 32, 32, {
				animOffset: WALK_ANIM_OFFSET,
				colors: FACE_COLORS,
			}],
			['round-head.png', 32, 32, {
				animOffset: WALK_ANIM_OFFSET,
				colors: FACE_COLORS,
			}],
			['v-head.png', 32, 32, {
				animOffset: WALK_ANIM_OFFSET,
				colors: FACE_COLORS,
			}],
			['npc-mouth.png', 32, 32, {
				animOffset: WALK_ANIM_OFFSET,				
			}],
			['floor-tile.png', 32, 32, {
			}],
			['bricks.png', 32, 32, {
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
