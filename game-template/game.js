injector.register("game", [
	"utils", "canvas", "texture-manager", "worldmap", "canvas-resizer",
	(Utils, canvas, textureManager, WorldMap, CanvasResizer) => {

		function lake(id, size, x, y, z) {
			return () => {
				const wave = Float32Array.from([1,1,1,1]);
				return new Array(size * size).fill(null).map((n, index) => {
					const col = index % size;
					const row = Math.floor(index / size);
					const midSize = size / 2;
					const dx = col - midSize;
					const dy = row - midSize;
					if (dx * dx + dy * dy > midSize * midSize) {
						return null;
					}

					return {
						id,
						chunk: [ col, row ],
						pos: [ x + 10 * (col - midSize) / size, y, z + 10 * (row - midSize) / size ],
						type: "floor",
						timeOffset: Math.floor(Math.random()*10000),
						fps: 3,
						wave,
					};
				}).filter(a => a);
			};
		}

		const penguinScale = [1, .9];
		const penguin_sprites = [
		    {id:'penguin-down',		src:'assets/penguin-down.png',		scale: penguinScale,	flip:false,	},
		    {id:'penguin-bot-right',src:'assets/penguin-bot-left.png',	scale: penguinScale,	flip:true,	},
		    {id:'penguin-right',	src:'assets/penguin-right.png',		scale: penguinScale,	flip:false, },
		    {id:'penguin-top-right',src:'assets/penguin-top-left.png',	scale: penguinScale,	flip:true,	},
		    {id:'penguin-up',		src:'assets/penguin-up.png',		scale: penguinScale,	flip:false, },
		    {id:'penguin-top-left',	src:'assets/penguin-top-left.png',	scale: penguinScale,	flip:false, },
		    {id:'penguin-left',		src:'assets/penguin-right.png',		scale: penguinScale,	flip:true,	},
		    {id:'penguin-bot-left',	src:'assets/penguin-bot-left.png',	scale: penguinScale,	flip:false, },
		];

		const waterSize = 30 + 1;
		const groundSize = 10;
		const groundLevel = -1;

		const cameraDistance = 6;
		const cameraHeight = 1;
		const rangeSize = 5;

		const worldmap = new WorldMap();

		worldmap.add({
			id: "center",
			range: { left: -5, right: 5, top: -5, bottom: 5 },
		});
		let area = worldmap.getArea({ left: 0, right: 0, top: 0, bottom: 0 });
		area.addCallback((type, element, range, oldRange) => {
//			console.log(type, element, range, oldRange);
		});

		const canvasResizer = new CanvasResizer(canvas);

		return {
			title: "Penguin Quest",
			settings: {
				size: [ 4096, 2160 ],
				background: "#DDEEFF",
				scale: .5,
				angleStep: Math.PI / 4,
			},
			cameraSettings: {
				height: cameraHeight,
				distance: cameraDistance,
			},
			onMove: area.makeRangeAutoUpdate(rangeSize),
			scenes: {
				"demo": {
					spriteDefinitions: [
						penguin => {
							const pos = vec3.create();
							let movDirection = Utils.getDirectionAngle(vec3.fromValues(0, 0, -1));
							let previousMoveDirection = -Number.MAX_VALUE;
							let previousCamRotation = -Number.MAX_VALUE;
							let textureIndex = -1;

							const angleToTextureIndex = penguin_sprites.map(({id}) => {
								return textureManager.getTextureData(id).index;
							});

							return {
								textureIndex: ({cam}) => {
									if (cam.moving) {
										movDirection = cam.getMovDirection();
									}
									if (movDirection !== previousMoveDirection || previousCamRotation !== cam.rotation) {
										const turn = Utils.getCameraAngle(movDirection, cam.rotation);
									    const angleIndex = Utils.getAngleIndex(turn, angleToTextureIndex.length);
									    textureIndex = angleToTextureIndex[angleIndex];
										previousMoveDirection = movDirection;
										previousCamRotation = cam.rotation;
									}
									return textureIndex;
								},
								pos: ({cam}) => {
									const [ x, y, z ] = cam.pos;
									return Utils.set3(pos, -x, -y + groundLevel, -z - cameraDistance);
								},
								type: "sprite",
								fps: ({cam}) => {
									return cam.moving ? 10 : 0;
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
						landscape => {
							const pos = vec3.create();
							return {
								id: "background",
								chunk: [
									0, 0,
								],
								pos: ({cam}) => {
									const [ x, y, z ] = cam.pos;
									return Utils.set3(pos, -x, -y + groundLevel + 60, -z - cameraDistance - 300);
								},
								type: "sprite",
							};
						},
						{
							id: "test",
							pos: [
								0,
								-1,
								-6.5
							],
							type: "sprite",
							hidden: ({cam}, sprite) => {
								const { definition } = sprite;
								const [ x0, y0, z0 ] = cam.pos;
								const [ x1, y1, z1 ] = definition.pos;
								const dx = x0 - x1;
								const dz = z0 - z1;
								const hidden = dx*dx + dz*dz > 1000;
								return hidden;
							},
						},
						lake("water", waterSize, 0, groundLevel + .2, 0),
						iceground => {
							return new Array(groundSize * groundSize).fill(null).map((n, index) => {
								const col = index % groundSize;
								const row = Math.floor(index / groundSize);
								const dx = col - groundSize / 2;
								const dy = row - groundSize / 2;
								return {
									id: "icefloor",
									chunk: [ col, row ],
									pos: [ (col - groundSize / 2) * 4, groundLevel, (row - groundSize / 2) * 4 ],
									type: "floor",
								};
							}).filter(a => a);;
						},
					],
				},
			},
			assets: [
				penguin => {
					const spriteSize = [64, 64];
					return penguin_sprites.map(({ id, src, scale, flip }) => {
						return {
							id, src, spriteSize,
							options: {
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
						scale: 4,
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
				{
					id: 'background',
					src: 'assets/landscape.jpg',
					spriteSize: [2560, 978],
					options: {
						chunks: 8,
						scale: 80,
					},
				},
			],
		};
	}
]);