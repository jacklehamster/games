injector.register("game", [
	"utils", "canvas", "texture-manager", "worldmap", "canvas-resizer", "engine",
	(Utils, canvas, textureManager, WorldMap, CanvasResizer, Engine) => {

		function lake(id, size, x, y, z) {
			return () => {
				//	[botleft, botright, topright, topleft]				
				const wave = Float32Array.from([1,1,1,1]);
				const waveLeftShore = Float32Array.from([0,1,1,0]);
				const waveRightShore = Float32Array.from([1,0,0,1]);
				const waveTopShore = Float32Array.from([1,1,0,0]);
				const waveBottomShore = Float32Array.from([0,0,1,1]);

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
						wave: 
							col <= 1 ? waveLeftShore :
							col >= size - 1 ? waveRightShore :
							row <= 1 ? waveTopShore :
							row >= size - 1 ? waveBottomShore :
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
		const horizonRangeSize = 90;
		const areaMapArraySize = horizonRangeSize * 2;

		const worldmap = new WorldMap();

		let count = 0;

		worldmap.add({
			range: WorldMap.makeRange(0, -6.5, 5),
			unique: true,
			onUpdate: null,
			sprite: {
				id: "test",
				pos: [ 0, -1, -6.5 ],
				type: "sprite",
			},
		}, {
			range: WorldMap.makeRange(0, -6.5, 1000),
			map: Utils.makeDoubleArray(areaMapArraySize, areaMapArraySize),
			step: 8,
			onUpdate: (element, type, col, row) => {
				const { map, sprite } = element;
				let mapcol = col % areaMapArraySize; if (mapcol < 0) mapcol += areaMapArraySize;
				let maprow = row % areaMapArraySize; if (maprow < 0) maprow += areaMapArraySize;

				switch(type) {
					case WorldMap.ADD: {
						if (!map[mapcol][maprow]) {
							const { id, type } = sprite;
							const spriteInstance = engine.addSprite({
								id, type, chunk: [ -col, -row ], pos: [ -col, groundLevel, -row ],
							});
							map[mapcol][maprow] = spriteInstance;
						}
						break;
					}
					case WorldMap.REMOVE: {
						const spriteInstance = map[mapcol][maprow];
						if (spriteInstance) {
							engine.removeSprite(spriteInstance);
							delete map[mapcol][maprow];
						}							
						break;
					}
				}
			},
			sprite: {
				id: "icefloor",
				type: "floor",
				chunk: [ 0, 0 ],
				pos: [ 0, groundLevel, 0 ],
			},
		}, {
			range: WorldMap.makeRange(0, -6.5, 1000),
			map: Utils.makeDoubleArray(areaMapArraySize, areaMapArraySize),
			step: 3,
			onUpdate: (element, type, col, row) => {
				const { map, sprite } = element;
				if ((col * 7 ^ row * 13) % 33 !== 0) {
					return;
				}

				let mapcol = col % areaMapArraySize; if (mapcol < 0) mapcol += areaMapArraySize;
				let maprow = row % areaMapArraySize; if (maprow < 0) maprow += areaMapArraySize;

				switch(type) {
					case WorldMap.ADD: {
						if (!map[mapcol][maprow]) {
							const { id, type } = sprite;
							const spriteInstance = engine.addSprite({
								id, type, chunk: [ -col, -row ], pos: [ -col, groundLevel, -row ],
							});
							map[mapcol][maprow] = spriteInstance;
						}
						break;						
					}
					case WorldMap.REMOVE: {
						const spriteInstance = map[mapcol][maprow];
						if (spriteInstance) {
							engine.removeSprite(spriteInstance);
							delete map[mapcol][maprow];
						}							
						break;
					}
				}
			},
			sprite: {
				id: "crystal-wall",
				type: "wall",
				chunk: [ 0, 0 ],
				pos: [ 0, groundLevel, 0 ],
			},
		});
		let area = worldmap.getArea({ left: 0, right: 0, top: 0, bottom: 0 });
		const canvasResizer = new CanvasResizer(canvas);
		const engine = new Engine();

		function setupEngine(engine, game, assets) {
			const sceneIndex = game.firstScene || Object.keys(game.scenes)[0];
			const { title, settings, cameraSettings, moveSettings } = game;
			const [ width, height ] = settings.size;
			
			document.title = title;
			canvas.width = width;
			canvas.height = height;
			canvas.style.background = "#" + (0x1000000 | settings.background).toString(16).substr(1);

			engine.setBackground(settings.background);
			engine.setSize(canvas.width, canvas.height);
			engine.setupAsset(assets);
			engine.refreshScene(game, sceneIndex);	
			engine.setCameraSettings(cameraSettings);
			engine.setMoveSettings(moveSettings);	
			engine.start();	

			area.addCallback((type, element, range, oldRange) => {
				if (element.sprite) {
					switch (type) {
						case WorldMap.ADD:
							if (element.unique) {
								element.spriteInstance = engine.addSprite(element.sprite);
							}
							if (element.onUpdate) {
								Utils.applyCellDiff(range, oldRange, element.step, (x, y) => {
									element.onUpdate(element, WorldMap.ADD, x, y);
								});
							}
							break;
						case WorldMap.REMOVE:
							if (element.spriteInstance) {
								engine.removeSprite(element.spriteInstance);
								delete engine.spriteInstance;							
							}
							break;
						case WorldMap.UPDATE:
							if (element.onUpdate) {	
								Utils.applyCellDiff(range, oldRange, element.step, (x, y) => {
									element.onUpdate(element, WorldMap.ADD, x, y);
								});

								Utils.applyCellDiff(oldRange, range, element.step, (x, y) => {
									element.onUpdate(element, WorldMap.REMOVE, x, y);
								});
							}
							break;
					}
				}
			});

		}

		const assets = [
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
				id: 'crystal-wall',
				src: 'assets/crystal-wall.jpg',
				spriteSize: [512, 512],
				options: {
					chunks: 1,
					scale: 4,
				},
			},
			{
				id: 'icefloor',
				src: 'assets/icefloor.jpg',
				spriteSize: [800, 800],
				options: {
					chunks: 8,
					scale: 8,
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
		];

		const game = {
			start: () => setupEngine(engine, game, assets),
			title: "Penguin Quest",
			settings: {
				size: [ 4096, 2160 ],
				background: 0xE0F0FF,
			},
			moveSettings: {
				scale: .5,
				angleStep: Math.PI / 4,
				onMove: area.makeRangeAutoUpdate(horizonRangeSize),
			},
			cameraSettings: {
				height: cameraHeight,
				distance: cameraDistance,
			},
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
						lake("water", waterSize, 0, groundLevel + .2, 0),
					],
				},
			},
			assets,
		};
		return game;
	}
]);