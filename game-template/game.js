const Game = (() => {

	const penguin_sprites = [
	    {id:'penguin-down',		src:'assets/penguin-down.png',		scale: [1, .9],	flip:false,	},
	    {id:'penguin-bot-right',src:'assets/penguin-bot-left.png',	scale: [1, .9],	flip:true,	},
	    {id:'penguin-right',	src:'assets/penguin-right.png',		scale: [1, .9],	flip:false, },
	    {id:'penguin-top-right',src:'assets/penguin-top-left.png',	scale: [1, .9],	flip:true,	},
	    {id:'penguin-up',		src:'assets/penguin-up.png',		scale: [1, .9],	flip:false, },
	    {id:'penguin-top-left',	src:'assets/penguin-top-left.png',	scale: [1, .9],	flip:false, },
	    {id:'penguin-left',		src:'assets/penguin-right.png',		scale: [1, .9],	flip:true,	},
	    {id:'penguin-bot-left',	src:'assets/penguin-bot-left.png',	scale: [1, .9],	flip:false, },
	];

	const penguinData = {
		mov: vec3.fromValues(0, 0, -1),
	};

	const waterSize = 20 + 1;

	const cameraDistance = 6;
	const cameraHeight = 1;

	return {
		title: "Penguin Quest",
		settings: {
			size: [ 4096, 2160 ],
			background: "#DDEEFF",
			scale: .5,
			angleStep: Math.PI / 4,
		},
		camera: {
			height: cameraHeight,
			distance: cameraDistance,
		},
		sprites: [
			penguin => {
				const pos = vec3.create();
				let moving = false;

				return {
					process: ({cam}) => {
						const { mov, rotation } = cam;
						moving = vec3.length(mov) > 0;
						if (moving) {
							const directionVector = Utils.getRelativeDirection(rotation, mov);
							penguinData.mov.set(directionVector);
						}
					},
					id: ({cam}) => {
						const { mov, rotation } = cam;
						const turn = Utils.getCameraAngle(penguinData.mov, rotation);
					    const angleIndex = Utils.getAngleIndex(turn, penguin_sprites.length);
					    return penguin_sprites[angleIndex].id;
					},
					pos: ({cam}) => {
						const [ x, y, z ] = cam.pos;

						vec3.set(pos, -x, -y - 1, -z - cameraDistance);
						return pos;
					},
					type: "sprite",
					fps: ({cam}) => {
						return moving ? 10 : 0;
					},
					wave: 0,
				};
			},
			doublewall => {
				const id = "icewall";
				const chunk = [1,0];
				const pos = [-0.5, -1, -6];
				return [
					{
						id,
						chunk,
						pos,
						"type": "left",
					},
					{
						id,
						chunk,
						pos,
						"type": "right",
					}
				];
			},
			{
				"id": "icewall",
				"chunk": [
					1,
					0
				],
				"pos": [
					-0.5,
					-1,
					-6
				],
				"type": "left"
			},
			{
				"id": "icewall",
				"chunk": [
					1,
					0
				],
				"pos": [
					-0.5,
					-1,
					-6
				],
				"type": "right"
			},
			{
				"id": "icewall",
				"chunk": [
					1,
					0
				],
				"pos": [
					0.5,
					-1,
					-6
				],
				"type": "left"
			},
			{
				"id": "icewall",
				"chunk": [
					1,
					0
				],
				"pos": [
					0.5,
					-1,
					-6
				],
				"type": "right"
			},
			{
				"id": "icewall",
				"chunk": [
					0,
					0
				],
				"pos": [
					-0.5,
					-1,
					-5
				],
				"type": "left"
			},
			{
				"id": "icewall",
				"chunk": [
					2,
					0
				],
				"pos": [
					-0.5,
					-1,
					-5
				],
				"type": "right"
			},
			{
				"id": "icewall",
				"chunk": [
					0,
					0
				],
				"pos": [
					0.5,
					-1,
					-5
				],
				"type": "left"
			},
			{
				"id": "icewall",
				"chunk": [
					2,
					0
				],
				"pos": [
					0.5,
					-1,
					-5
				],
				"type": "right"
			},
			{
				"id": "icefloor",
				"chunk": [
					0,
					1
				],
				"pos": [
					0,
					-1,
					-6
				],
				"type": "floor"
			},
			{
				"id": "icefloor",
				"chunk": [
					0,
					1
				],
				"pos": [
					0,
					-1,
					-6
				],
				"type": "ceiling"
			},
			{
				"id": "icefloor",
				"chunk": [
					0,
					1
				],
				"pos": [
					0,
					0,
					-6
				],
				"type": "floor"
			},
			{
				"id": "icefloor",
				"chunk": [
					0,
					1
				],
				"pos": [
					0,
					0,
					-6
				],
				"type": "ceiling"
			},
			{
				"id": "icefloor",
				"chunk": [
					0,
					2
				],
				"pos": [
					0,
					-1,
					-5
				],
				"type": "floor"
			},
			{
				"id": "icefloor",
				"chunk": [
					0,
					0
				],
				"pos": [
					0,
					-1,
					-5
				],
				"type": "ceiling"
			},
			{
				"id": "icefloor",
				"chunk": [
					0,
					2
				],
				"pos": [
					0,
					0,
					-5
				],
				"type": "floor"
			},
			{
				"id": "icefloor",
				"chunk": [
					0,
					0
				],
				"pos": [
					0,
					0,
					-5
				],
				"type": "ceiling"
			},
			{
				"id": "test",
				"pos": [
					0,
					-1,
					-6.5
				],
				"type": "sprite"
			},
			water => {
				return new Array(waterSize * waterSize).fill(null).map((n, index) => {
					const col = index % waterSize;
					const row = Math.floor(index / waterSize);
					const dx = col - waterSize / 2;
					const dy = row - waterSize / 2;
					if (dx * dx + dy * dy > (waterSize / 2) * (waterSize / 2)) {
						return null;
					}

					return {
						id: "water",
						chunk: [ col, row ],
						pos: [ 10 * (col - waterSize/2) / waterSize, -1.5, 10 * (row - waterSize/2) / waterSize ],
						type: "floor",
						timeOffset: Math.floor(Math.random()*10000),
						fps: 3,
						wave: Float32Array.from([1,1,1,1]),
					};
				}).filter(a => a);
			},
		],
		assets: [
			penguin => {
				const spriteSize = [64, 64];
				return penguin_sprites.map(({ id, src, scale, flip }) => {
					return {
						id, src, spriteSize, options: {
							scale, flip,
						},
					};
				});
			},
			{
				id: 'test',
				src: 'assets/32x64.png',
				spriteSize: [32, 64],
				options: {
					scale: 2,
				},
			},
			{
				id: 'icewall',
				src: 'assets/icewall.jpg',
				spriteSize: [800, 800],
				options: {
					chunks: 8,
				},
			},
			{
				id: 'icefloor',
				src: 'assets/icefloor.jpg',
				spriteSize: [800, 800],
				options: {
					chunks: 8,
				},
			},
			{
				id: 'water',
				src: 'assets/water.png',
				spriteSize: [32, 32],
				options: {
					scale: 10 / waterSize,
					chunks: Math.max(1, Math.floor(waterSize / 10)),
				},
			},
		],
	};
})();