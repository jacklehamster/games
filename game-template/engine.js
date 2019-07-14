const Engine = ((document) => {
	const TEXTURE_SIZE = 4096;
	const INDEX_ARRAY_PER_SPRITE = new Uint16Array([
		0,  1,  2,
		0,  2,  3,
	]);

	const FLOAT_PER_VERTEX 			= 3;	//	x,y,z
	const TEXTURE_FLOAT_PER_VERTEX 	= 2;	//	x,y
	const VERTICES_PER_SPRITE 		= 4;	//	4 corners

	const IDENTITY_QUAT = quat.identity(quat.create());
	const ZERO_VEC3 = vec3.create();
	const SCALE_VEC3 = vec3.fromValues(1, 1, 1);
	const vec3temp = vec3.create(), vec3temp2 = vec3.create();

	const CORNERS = Float32Array.from([0, 1, 2, 3 ]);

	const SIZE_INCREASE = 500;

	const stock = {};

	let mainCanvas, gl, mainGame, renderer, sceneIndex;

	const X_POS = 0, Y_POS = 1, Z_POS = 2;
	const acceleration = .1;

	const cam = {
		rotation: 0,
		mov: vec3.create(),
		pos: vec3.create(),
	};

	const sprites = [];
	const activeSprites = [];
	const dirtySprites = [];

	const tempCanvas = document.createElement('canvas');
				
	function refresh(now) {
		if (mainGame && renderer) {
			globalData.now = now;

			refreshMove(mainGame);

			let imageCount = 0;
			activeSprites.length = 0;
			sprites.forEach(sprite => {
				const definition = evaluate(sprite.definition.preProcess, globalData) || sprite.definition;

				const { textureData } = stock[evaluate(definition.id, globalData)];

				if (textureData && textureData.textures) {
					imageCount += textureData.textures.length;

					if (sprite.needsRefresh()) {
						const { chunk, pos, type, fps, timeOffset, wave } = definition;
						sprite.setTextureData(textureData)
							.setType(evaluate(type, globalData))
							.setPosition(evaluate(pos, globalData))
							.setChunk(evaluate(chunk, globalData))
							.setWave(evaluate(wave, globalData) || 0)
							.setFrameData(evaluate(fps, globalData) || 0, evaluate(timeOffset, globalData) || 0);
					}
					evaluate(definition.postProcess, globalData);
					activeSprites.push(sprite);
				}
			});

			if (activeSprites.length) {
				gl.uniform1f(renderer.programInfo.nowLocation, now);
				refreshMatrices(renderer);			
				const bufferResized = ensureBuffer(renderer, imageCount);
				sendTexturesToGPU(renderer);
				drawSprites(renderer, activeSprites, bufferResized);
			}
		}

		if (Utils.debug) {
			showDebugLog();
		}
	}

	let texIndex = 0;
	function sendTexturesToGPU({ gl, shaderProgram }) {
		for (let id in stock) {
			const { textureData } = stock[id];
			if (textureData && textureData.textures && !textureData.sentToGPU) {
				textureData.sentToGPU = true;

				const { textures, flip, chunks } = textureData;
				textureData.texIndex = texIndex;

				textures.forEach(({ index, coordinates }, frameIndex) => {
			  		if (flip) {
			  			const temp = coordinates[0];
			  			coordinates[0] = coordinates[1];
			  			coordinates[1] = temp;
			  		}

			  		const glTextureCellLocation = gl.getUniformLocation(shaderProgram, `uTextureCell[${texIndex + frameIndex}]`);
			  		gl.uniform4fv(glTextureCellLocation, new Float32Array(coordinates));
					const glTextureIdLocation = gl.getUniformLocation(shaderProgram, `uTextureInfo[${texIndex + frameIndex}]`);
					gl.uniform3fv(glTextureIdLocation, new Float32Array([index,...chunks]));
				});
				texIndex += textures.length;
			}
		}
	}

	let lastRot = 0;
	function refreshMove({ settings, camera }) {
		const { ax, ay, rot } = Keyboard.getActions();
		const { mov, pos } = cam;
		mov[X_POS] = (mov[X_POS] - ax * acceleration) * .5;
		mov[Z_POS] = (mov[Z_POS] + ay * acceleration) * .5;
		if (Math.abs(mov[X_POS]) < .001) {
			mov[X_POS] = 0;
		}
		if (Math.abs(mov[Z_POS]) < .001) {
			mov[Z_POS] = 0;
		}

		if (rot) {
			cam.rotation += rot * acceleration * .5;
			lastRot = rot;
		} else if (lastRot) {
			const { angleStep } = settings;
			const goal = lastRot < 0 ? Math.floor(cam.rotation / angleStep) * angleStep :
				Math.ceil(cam.rotation / angleStep) * angleStep;
			cam.rotation += (goal - cam.rotation) /8;
			if (Math.abs(cam.rotation - goal) < .01) {
				lastRot = 0;
			}
		}

		const directionVector = Utils.getRelativeDirection(cam.rotation, mov);
		vec3.add(pos, pos, directionVector);

		if (viewMatrix) {
			const { scale } = settings;
			const h = camera.height || 0;
			const { cameraQuat } = renderer;
			const turn = cam.rotation;
			const tilt = h/2;
			const zOffset = -camera.distance || 0;
			quat.rotateY(cameraQuat, quat.rotateX(cameraQuat, IDENTITY_QUAT, tilt), turn);
			mat4.fromRotationTranslationScaleOrigin(viewMatrix, cameraQuat, ZERO_VEC3,
				vec3.set(vec3temp2, scale, scale, scale), vec3.set(vec3temp, 0, h, zOffset));			
			quat.conjugate(cameraQuat, cameraQuat);	//	conjugate for sprites			
			mat4.translate(viewMatrix, viewMatrix, pos);

			if (cameraRotationMatrix) {
				mat4.fromQuat(cameraRotationMatrix, cameraQuat);
			}
		}
	}

	function showDebugLog() {
		document.getElementById("debug").style.display = "";
		document.getElementById("log").innerText = JSON.stringify(Engine.debug, null, '  ');
	}

	let viewMatrix = null;
	let projectionMatrix = null;
	let cameraRotationMatrix = null;

	function refreshMatrices({ cache, programInfo, cameraQuat }) {
		if (!projectionMatrix) {
			projectionMatrix = mat4.create();
			const fieldOfView = 45 * Math.PI / 180;   // in radians
			const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
			const zNear = 0.1, zFar = 1000.0;
			mat4.perspective(projectionMatrix, fieldOfView, aspect, zNear, zFar);
			gl.uniformMatrix4fv(programInfo.projectionLocation, false, projectionMatrix);
			cache.projectionMatrix = mat4.create();
		}
		if (!mat4.exactEquals(projectionMatrix, cache.projectionMatrix)) {
			gl.uniformMatrix4fv(programInfo.projectionLocation, false, projectionMatrix);
			mat4.copy(cache.projectionMatrix, projectionMatrix);
		}

		if (!viewMatrix) {
			const [ x, y, z ] = vec3.fromValues(0, 0, 0);
			viewMatrix = mat4.create();
			mat4.translate(viewMatrix, viewMatrix, vec3.fromValues(-x, -y, -z));
			gl.uniformMatrix4fv(programInfo.viewLocation, false, viewMatrix);
			cache.viewMatrix = mat4.create();
		}
		if (!mat4.exactEquals(viewMatrix, cache.viewMatrix)) {
			gl.uniformMatrix4fv(programInfo.viewLocation, false, viewMatrix);
			mat4.copy(cache.viewMatrix, viewMatrix);
		}

		if (!cameraRotationMatrix) {
			cameraRotationMatrix = mat4.create();
			gl.uniformMatrix4fv(programInfo.cameraRotationLocation, false, cameraRotationMatrix);
			cache.cameraRotationMatrix = mat4.create();
		}
		if (!mat4.exactEquals(cameraRotationMatrix, cache.cameraRotationMatrix)) {
			gl.uniformMatrix4fv(programInfo.cameraRotationLocation, false, cameraRotationMatrix);
			mat4.copy(cache.cameraRotationMatrix, cameraRotationMatrix);
		}
	}

	const globalData = {
		now: 0, cam,
	};

	function initialize() {
		function step(timestamp) {
			refresh(performance.now());
		    requestAnimationFrame(step);
		}
		requestAnimationFrame(step);
	}

	function setCanvas(canvas) {
		mainCanvas = canvas;
		gl = canvas.getContext('webgl', {antialias: false});
		fetchRenderer(gl).then(r => renderer = r);
		initGL(gl);
	}

	function initGL(gl) {
		gl.enable(gl.BLEND);
		gl.enable(gl.DEPTH_TEST);

		gl.depthFunc(gl.LEQUAL);
		gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);	

		gl.enable(gl.SAMPLE_COVERAGE);
	}

	const gridSlot = new GridSlot(TEXTURE_SIZE, TEXTURE_SIZE);

	const glTextures = [];
	const glTextureIndexBuffers = [];

	function fetchRenderer(gl) {
		return new Promise((resolve, reject) => {
			const renderer = {
				gl,
				spriteBufferSize: 0,
				cache: {},
				cameraQuat: quat.create(),
			};

			Promise.all(Utils.load(["shaders/vertex-shader.glsl", "shaders/fragment-shader.glsl"]))
				.then(([vsSource, fsSource]) => {
					const shaderProgram = initShaderProgram(gl, vsSource, fsSource);
					gl.useProgram(shaderProgram);
					renderer.shaderProgram = shaderProgram;
					renderer.programInfo = {
						vertexLocation: 			gl.getAttribLocation(shaderProgram,  'aVertexPosition'),
						frameLocation:              gl.getAttribLocation(shaderProgram,  'aFrame'),
						waveLocation: 				gl.getAttribLocation(shaderProgram,  'aWave'),
						posLocation:                gl.getAttribLocation(shaderProgram,  'aPosition'),
						isSpriteLocation: 			gl.getAttribLocation(shaderProgram,  'aIsSprite'),
						chunkLocation:              gl.getAttribLocation(shaderProgram,  'aChunk'),
						cornerLocation:             gl.getAttribLocation(shaderProgram,  'aCorner'),
						projectionLocation: 		gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
						viewLocation: 				gl.getUniformLocation(shaderProgram, 'uViewMatrix'),
						cameraRotationLocation:     gl.getUniformLocation(shaderProgram, 'uCameraRotation'),
						nowLocation: 				gl.getUniformLocation(shaderProgram, 'now'),
					};
				}).then(() => {
					resolve(renderer);
				});

			gl.enable(gl.CULL_FACE);
			gl.cullFace(gl.BACK);
		});
	}

	const cellCache = {	};

	function turnImageIntoTexture(id, src, spriteSize, options, gl) {
		if (!glTextures.length) {
			const textureIds =  new Array(16).fill(null).map((a, index) => {
				return gl["TEXTURE" + index];
			});

			textureIds.forEach((tex, index) => {
				gl.activeTexture(tex);
				const glTexture = gl.createTexture();
				glTextures[index] = glTexture;
				glTextureIndexBuffers[index] = new Float32Array(VERTICES_PER_SPRITE);
				glTextureIndexBuffers[index].fill(index);

				glTexture.width = 1;
				glTexture.height = 1;
				gl.bindTexture(gl.TEXTURE_2D, glTexture);
				gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, glTexture.width, glTexture.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
				gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
			});
		}

		if (!stock[id].textureData) {
			const [ spriteWidth, spriteHeight ] = spriteSize;
			const { chunks, scale, flip } = options;
			stock[id].textureData = {
				flip,
				textures : null,
				chunks: typeof(chunks) == 'number' ? [chunks,chunks] : Array.isArray(chunks) ? chunks : [1, 1],
				verticesMap: makeVerticesMap(spriteWidth, spriteHeight, scale),
				sentToGPU: false,
			};

			Utils.load(src).then(img => {
				let textures = [];
				const { naturalWidth, naturalHeight } = img;
				const cols = Math.ceil(naturalWidth / spriteWidth);
				const rows = Math.ceil(naturalHeight / spriteHeight)
				const ctx = tempCanvas.getContext('2d');
				tempCanvas.width = spriteWidth; tempCanvas.height = spriteHeight;
				for (let r = 0; r < rows; r++) {
					for (let c = 0; c < cols; c++) {
						const cellTag = `${img.src}_${c}_${r}`;
						let cell = cellCache[cellTag];
						if (!cell) {
							cell = gridSlot.getSlot(spriteWidth, spriteHeight);
							ctx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
							ctx.drawImage(img, -c * spriteWidth, -r * spriteHeight);
							const { data } = ctx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
							if (Utils.isImageEmpty(ctx)) {	//	image transparent
								gridSlot.putBackSlot(cell);
								continue;
							}

							const glTexture = glTextures[cell.index];
							if (!glTexture) {
								console.warn("No more texture slots available.");
								putBackTextureCell(cell);
								continue;
							}
							gl.bindTexture(gl.TEXTURE_2D, glTexture);
							if (glTexture.width < TEXTURE_SIZE || glTexture.height < TEXTURE_SIZE) {
								glTexture.width = TEXTURE_SIZE;
								glTexture.height = TEXTURE_SIZE;
								gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, glTexture.width, glTexture.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
							}

							gl.texSubImage2D(gl.TEXTURE_2D, 0, cell.x, cell.y, gl.RGBA, gl.UNSIGNED_BYTE, tempCanvas);
							gl.generateMipmap(gl.TEXTURE_2D);
							cellCache[cellTag] = cell;
						}
						textures.push(cell);
					}
				}

				textures = textures.map(({ x, y, index }) => {
					const textureLeft = x / TEXTURE_SIZE;
					const textureRight = x / TEXTURE_SIZE + spriteWidth / TEXTURE_SIZE;
					const textureTop = y / TEXTURE_SIZE;
					const textureBottom = y/ TEXTURE_SIZE + spriteHeight / TEXTURE_SIZE;
					return {
						index,
						coordinates: [
							textureLeft, textureRight, textureTop, textureBottom,
						],
					};
				});
				stock[id].textureData.textures = textures;
			});
		}
	}

	const SpriteTypes = {
		floor: 0,
		ceiling: 1,
		left: 2,
		right: 3,
		sprite: 4,
	};

	function makeVerticesMap(width, height, scale) {
		if (!scale) {
			scale = [ 1, 1 ];
		} else if (!Array.isArray(scale)) {
			scale = [ scale, scale ];
		}
		const left = 	-.5 * scale[0];
		const right = 	 .5 * scale[0];
		const top = 	height / width * scale[1];
		const bottom = 	0;

		return [
			new Float32Array([
				left, 	0, top - .5,
				right, 	0, top - .5,
				right, 	0, bottom - .5,
				left, 	0, bottom - .5,
			]),
			new Float32Array([
				left, 	0, bottom - .5,
				right, 	0, bottom - .5,
				right, 	0, top - .5,
				left, 	0, top - .5,
			]),
			new Float32Array([
				0, bottom, right,
				0, bottom, left,
				0, top, left,
				0, top, right,
			]),
			new Float32Array([
				0, bottom, left,
				0, bottom, right,
				0, top, right,
				0, top, left,
			]),
			new Float32Array([
				left, 	bottom, 0,
				right, 	bottom, 0,
				right, 	top, 	0,
				left, 	top, 	0,
			]),
		];
	}

	function getSlotIndices(slotIndex) {
		return INDEX_ARRAY_PER_SPRITE.map(value => value + slotIndex * VERTICES_PER_SPRITE);		
	}

	function bufferSprites(renderer, sprites, elementSize, spriteFunction) {
		const { gl, bigFloatArray } = renderer;
		const byteSize = elementSize * Float32Array.BYTES_PER_ELEMENT;

		let byteIndex = 0;
		let slotStart = sprites[0].slotIndex;
		let previousSlot = sprites[0].slotIndex - 1;

		for (let i = 0; i < sprites.length; i++) {
			const sprite = sprites[i];
			const floatArray = spriteFunction(sprite);
			if (previousSlot !== sprite.slotIndex - 1) {
				gl.bufferSubData(gl.ARRAY_BUFFER, slotStart * byteSize, bigFloatArray.subarray(0, byteIndex));
				byteIndex = 0;
				slotStart = sprite.slotIndex;
			}
			bigFloatArray.set(floatArray, byteIndex);
			byteIndex += floatArray.length;
			previousSlot = sprite.slotIndex;
		}
		gl.bufferSubData(gl.ARRAY_BUFFER, slotStart * byteSize, bigFloatArray.subarray(0, byteIndex));
	}

	function drawSprites(renderer, activeSprites, forceRedraw) {
		const { 
			gl, cameraQuat, shaderProgram,
			indexBuffer, vertexBuffer, positionBuffer, waveBuffer,
			frameBuffer, chunkBuffer, isSpriteBuffer, cornerBuffer,
		} = renderer;

		dirtySprites.length = 0;
		activeSprites.forEach((sprite, slotIndex) => {
			const needsUpdate = forceRedraw || sprite.slotIndex !== slotIndex;
			if (needsUpdate) {
				sprite.slotIndex = slotIndex;
				dirtySprites.push(sprite);
			}
		});

		if (dirtySprites.length) {
			gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
			bufferSprites(renderer, dirtySprites, VERTICES_PER_SPRITE * FLOAT_PER_VERTEX, sprite => sprite.getVertices());

			gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
			bufferSprites(renderer, dirtySprites, VERTICES_PER_SPRITE * FLOAT_PER_VERTEX, sprite => sprite.getPosition());

			gl.bindBuffer(gl.ARRAY_BUFFER, waveBuffer);
			bufferSprites(renderer, dirtySprites, VERTICES_PER_SPRITE, sprite => sprite.getWave());

			gl.bindBuffer(gl.ARRAY_BUFFER, frameBuffer);
			bufferSprites(renderer, dirtySprites, VERTICES_PER_SPRITE * 4, sprite => sprite.getFrameData());

			gl.bindBuffer(gl.ARRAY_BUFFER, isSpriteBuffer);
			bufferSprites(renderer, dirtySprites, VERTICES_PER_SPRITE, sprite => Utils.get4Floats(sprite.typeIndex === SpriteTypes.sprite ? 1 : 0));

			gl.bindBuffer(gl.ARRAY_BUFFER, chunkBuffer);
			bufferSprites(renderer, dirtySprites, VERTICES_PER_SPRITE, sprite => Utils.get4Floats(sprite.getChunkIndex()));

			gl.bindBuffer(gl.ARRAY_BUFFER, cornerBuffer);
			bufferSprites(renderer, dirtySprites, VERTICES_PER_SPRITE, () => CORNERS);
		}

		Engine.debug.draws = (Engine.debug.draws || 0) + dirtySprites.length;
		Engine.debug.sprites = activeSprites.length;
		Engine.debug.vertices = activeSprites.length * VERTICES_PER_SPRITE;
		gl.drawElements(gl.TRIANGLES, activeSprites.length * INDEX_ARRAY_PER_SPRITE.length, gl.UNSIGNED_SHORT, 0);
	}

	function createVertexAttributeBuffer(gl, location, numComponents) {
		const buffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
		const type = gl.FLOAT;
		const normalize = false;
		const stride = 0;
		const offset = 0;
		gl.vertexAttribPointer(location, numComponents, type, normalize, stride, offset);
		gl.enableVertexAttribArray(location);
		return buffer;
	}

	function ensureBuffer(renderer, size) {
		if (size > renderer.spriteBufferSize) {
			allocateBuffer(renderer, size + SIZE_INCREASE);
			return true;
		}
		return false;
	}

	function allocateBuffer(renderer, size) {
		console.log("Reallocate", size);
		const { gl, programInfo, cache } = renderer;

		if (!renderer.vertexBuffer) {
			renderer.vertexBuffer = createVertexAttributeBuffer(gl, programInfo.vertexLocation, FLOAT_PER_VERTEX);
		}
		resizeBuffer(gl, gl.ARRAY_BUFFER, renderer.vertexBuffer, size * VERTICES_PER_SPRITE * FLOAT_PER_VERTEX * Float32Array.BYTES_PER_ELEMENT);

		if (!renderer.positionBuffer) {
			renderer.positionBuffer = createVertexAttributeBuffer(gl, programInfo.posLocation, 3);
		}
		resizeBuffer(gl, gl.ARRAY_BUFFER, renderer.positionBuffer, size * VERTICES_PER_SPRITE * 3 * Float32Array.BYTES_PER_ELEMENT);

		if (!renderer.indexBuffer) {
			renderer.indexBuffer = gl.createBuffer();
		}
		resizeBuffer(gl, gl.ELEMENT_ARRAY_BUFFER, renderer.indexBuffer, size * INDEX_ARRAY_PER_SPRITE.length * Uint16Array.BYTES_PER_ELEMENT,
			buffer => {
				for (let i = 0; i < size; i++) {
					const slotIndices = INDEX_ARRAY_PER_SPRITE.map(value => value + i * VERTICES_PER_SPRITE);
					gl.bufferSubData(gl.ELEMENT_ARRAY_BUFFER, i * slotIndices.length * Uint16Array.BYTES_PER_ELEMENT, slotIndices);
				}
			}
		);
		
		if (!renderer.waveBuffer) {
			renderer.waveBuffer = createVertexAttributeBuffer(gl, programInfo.waveLocation, 1);
		}
		resizeBuffer(gl, gl.ARRAY_BUFFER, renderer.waveBuffer, size * VERTICES_PER_SPRITE * Float32Array.BYTES_PER_ELEMENT);

		if (!renderer.frameBuffer) {
			renderer.frameBuffer = createVertexAttributeBuffer(gl, programInfo.frameLocation, 4);
		}
		resizeBuffer(gl, gl.ARRAY_BUFFER, renderer.frameBuffer, size * VERTICES_PER_SPRITE * 4 * Float32Array.BYTES_PER_ELEMENT);

		if (!renderer.isSpriteBuffer) {
			renderer.isSpriteBuffer = createVertexAttributeBuffer(gl, programInfo.isSpriteLocation, 1);
		}
		resizeBuffer(gl, gl.ARRAY_BUFFER, renderer.isSpriteBuffer, size * VERTICES_PER_SPRITE * Float32Array.BYTES_PER_ELEMENT);

		if (!renderer.chunkBuffer) {
			renderer.chunkBuffer = createVertexAttributeBuffer(gl, programInfo.chunkLocation, 1);
		}
		resizeBuffer(gl, gl.ARRAY_BUFFER, renderer.chunkBuffer, size * VERTICES_PER_SPRITE * Float32Array.BYTES_PER_ELEMENT);

		if (!renderer.cornerBuffer) {
			renderer.cornerBuffer = createVertexAttributeBuffer(gl, programInfo.cornerLocation, 1);
		}
		resizeBuffer(gl, gl.ARRAY_BUFFER, renderer.cornerBuffer, size * VERTICES_PER_SPRITE * Float32Array.BYTES_PER_ELEMENT);

		// biggest size
		renderer.bigFloatArray = new Float32Array(size * VERTICES_PER_SPRITE * 4 * Float32Array.BYTES_PER_ELEMENT);
		renderer.spriteBufferSize = size;
	}

	function resizeBuffer(gl, bufferType, buffer, newBufferSize, initFunction) {
		gl.bindBuffer(bufferType, buffer);
		const bufferSize = gl.getBufferParameter(bufferType, gl.BUFFER_SIZE);
		gl.bufferData(bufferType, newBufferSize, gl.STATIC_DRAW);
		if (initFunction) {
			initFunction(buffer);
		}
		return buffer;
	}

	function resizeCanvas(canvas) {
		if (canvas) {
			const { offsetWidth, offsetHeight } = canvas.parentElement.parentElement;
			const { width, height } = canvas;
			let ratio = Math.floor(Math.min(offsetWidth / width, offsetHeight / height));
			if (ratio < 1) {
				let div = 1;
				while (1/div * width > offsetWidth || 1/div * height > offsetHeight) {
					div+= .5;
				}
				ratio = 1/div;
			}
			canvas.style.width = width * ratio + 'px';
			canvas.style.height = height * ratio + 'px';	
			gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
		}
	}

	function loadImage(id, src, spriteSize, options) {
		if (stock[id]) {
			return;
		}
		if (!options) {
			options = {};
		}
		stock[id] = {};

		turnImageIntoTexture(id, src, spriteSize, options, gl)
	}

	function loadGame(game) {
		mainGame = game;
		sceneIndex = game.firstScene || Object.keys(game.scenes)[0];
		const { assets, title, settings } = game;
		const { background, size } = settings;
		const [ width, height ] = size;
		
		document.title = title;
		mainCanvas.width = width;
		mainCanvas.height = height;
		mainCanvas.style.background = background;
		resizeCanvas(mainCanvas);
		
		assets.forEach(setupAsset);
		refreshScene(game, sceneIndex);
	}

	function refreshScene(game, sceneIndex) {
		setupScene(game.scenes[sceneIndex]);
	}

	function setupScene(scene) {
		sprites.length = 0;
		scene.definitions.forEach(setupSprite);
	}

	function evaluate(object, param) {
		return object && object.constructor === Function ? object(param) : object;		
	}

	function setupAsset(asset) {
		asset = evaluate(asset);
		if (Array.isArray(asset)) {
			asset.forEach(setupAsset);
		} else {
			const {id, src, spriteSize, options} = asset;
			loadImage(id, src, spriteSize, options || {});
		}
	}

	function setupSprite(definition) {
		definition = evaluate(definition);
		if (Array.isArray(definition)) {
			definition.forEach(setupSprite);
		} else {
			sprites.push(Sprite.create().setDefinition(definition));
		}
	}

	function initShaderProgram(gl, vsSource, fsSource) {
		const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
		const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);
  
		const shaderProgram = gl.createProgram();
		gl.attachShader(shaderProgram, vertexShader);
		gl.attachShader(shaderProgram, fragmentShader);
		gl.linkProgram(shaderProgram);
  
		if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
		  console.error('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
		  return null;
		}
  
		return shaderProgram;
	}
    
	function loadShader(gl, type, source) {
		const shader = gl.createShader(type);
		gl.shaderSource(shader, source);
		gl.compileShader(shader);
  
		if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		  console.error('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
		  gl.deleteShader(shader);
		  return null;
		}
		return shader;
	}
	
	window.addEventListener("resize", e => {
		resizeCanvas(mainCanvas);
	});

	return {
		setCanvas,
		loadGame,
		stock,
		initialize,
		debug : {
			cam,
		},
	};
})(document);
