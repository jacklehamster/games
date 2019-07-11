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
	const vec3temp = vec3.create();

	const CORNERS = Float32Array.from([0, 1, 2, 3 ]);

	const SIZE_INCREASE = 500;

	const stock = {};

	let mainCanvas, gl, mainGame, renderer;

	const X_POS = 0, Y_POS = 1, Z_POS = 2;
	const acceleration = .1;

	const cam = {
		rotation: 0,
		mov: vec3.create(),
		pos: vec3.create(),
	};

	let imageCount = 0;
	const sprites = [];

	let texIndex = 0;
	const textureCoordinates = new Float32Array(VERTICES_PER_SPRITE * TEXTURE_FLOAT_PER_VERTEX);


	function refresh(now) {
		if (mainGame) {
			globalData.now = now;

			refreshMove(mainGame);

			imageCount = 0;
			sprites.forEach(refreshSprite);

			if (renderer && renderer.shaderProgram && imageCount > 0) {
				gl.uniform1f(renderer.programInfo.nowLocation, now);
				refreshMatrices(renderer);				
				const bufferResized = ensureBuffer(renderer, imageCount);
				drawSprites(renderer, sprites, bufferResized);
			}
		}

		if (Utils.debug) {
			showDebugLog();
		}
	}

	function refreshSprite(sprite) {
		resolve(sprite.options.process);
		const { id } = sprite.options;
		const { textureData } = stock[resolve(id)];

		if (textureData) {
			imageCount += textureData.textures.length;

			if (sprite.needsRefresh()) {
				const { followcam, chunk, pos, type, fps, timeOffset, wave, process } = sprite.options;
				sprite.setTextureData(textureData)
					.setChunk(resolve(chunk))
					.setType(resolve(type))
					.setPosition(resolve(pos))
					.setWave(resolve(wave) || 0)
					.setFrameData(resolve(fps) || 0, resolve(timeOffset) || 0);
			}
		}
	}

	let lastRot = 0;
	function refreshMove(game) {
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
			const { angleStep } = game.settings;
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
			const { settings, camera } = game;
			const { scale } = settings;
			const h = camera.height || 0;
			const { cameraQuat } = renderer;
			const turn = cam.rotation;
			const tilt = h/2;
			const zOffset = -camera.distance || 0;
			quat.rotateY(cameraQuat, quat.rotateX(cameraQuat, IDENTITY_QUAT, tilt), turn);
			vec3.set(vec3temp, 0, h, zOffset);
			mat4.fromRotationTranslationScaleOrigin(viewMatrix, cameraQuat, ZERO_VEC3, vec3.fromValues(scale, scale, scale), vec3temp);			
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

	function refreshMatrices(renderer) {
		const { cache, programInfo, cameraQuat } = renderer;
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

	function resolve(value) {
		return value && value.constructor === Function ? value(globalData) : value;
	}

	const globalData = {
		now: 0, cam,
	};

	function initialize() {
		let lastFrame = 0;
		function step(timestamp) {
			refresh(performance.now());
		    requestAnimationFrame(step);
		}
		requestAnimationFrame(step);
	}

	function setCanvas(canvas) {
		mainCanvas = canvas;
		gl = canvas.getContext('webgl', {antialias: false});
		Engine.gl = gl;
		renderer = getRenderer(gl);
		initGL(gl);
	}

	function initGL(gl) {
		gl.enable(gl.BLEND);
		gl.enable(gl.DEPTH_TEST);

		gl.depthFunc(gl.LEQUAL);
		gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);	
	}

	const textureSlots = [
		{ index: 0, x: 0, y: 0, width: TEXTURE_SIZE, height: TEXTURE_SIZE, last: true, },
	];

	function splitTex(tex, splitSquareHorizontally) {
		const { index, x, y, width, height } = tex;
		if (width > height || width === height && !splitSquareHorizontally) {
			return [
				{ index, x, y, width: width/2, height },
				{ index, x: x + width/2, y, width: width/2, height },
			];
		} else if(width < height || width === height && splitSquareHorizontally) {
			return [
				{ index, x, y, width, height: height/2 },
				{ index, x, y: y + height/2, width, height: height/2 },
			];
		}
	}

	function fit(w,h,texture) {
		return w<=texture.width && h<=texture.height;
	}

	function compareTexture(texInfo1, texInfo2) {
		const area1 = texInfo1.width * texInfo1.height;
		const area2 = texInfo2.width * texInfo2.height;
		return area1 - area2;
	}

	function getTextureCell(w, h) {
		textureSlots.sort(compareTexture);
		for (let i = 0; i < textureSlots.length; i++) {
			let tex = textureSlots[i];
			if (fit(w, h, tex)) {
				if (tex.last) {
					textureSlots.push({
						index: tex.index+1,
						x: tex.x, y: tex.y,
						width: tex.width, height: tex.height,
						last: true,
					});
				}

				textureSlots[i] = textureSlots[textureSlots.length-1];
				textureSlots.pop();
				while(true) {
					const [ tex1, tex2 ] = splitTex(tex, w > h);

					if (!fit(w, h, tex1)) {
						return tex;
					} else {
						textureSlots.push(tex2);
						tex = tex1;
					}
				}
				break;
			}
		}
		return null;
	};

	const glTextures = [];
	const glTextureIndexBuffers = [];

	function getRenderer(gl) {
		const renderer = {
			gl,
			spriteBufferSize: 0,
			cache: {},
			canvas: document.createElement('canvas'),
			cameraQuat: quat.create(),
			textureBuffer: new Int32Array(16).map((a, index) => index),
		};

		Promise.all(Utils.load(["shaders/vertex-shader.glsl", "shaders/fragment-shader.glsl"])).then(([vsSource, fsSource]) => {
			const shaderProgram = initShaderProgram(gl, vsSource, fsSource);
			gl.useProgram(shaderProgram);
			renderer.shaderProgram = shaderProgram;
			renderer.programInfo = {
				vertexLocation: 			gl.getAttribLocation(shaderProgram,  'aVertexPosition'),
				frameLocation:              gl.getAttribLocation(shaderProgram,  'aFrame'),
				waveLocation: 				gl.getAttribLocation(shaderProgram,  'aWave'),
				posLocation:                gl.getAttribLocation(shaderProgram,  'aPosition'),
				isSpriteLocation: 			gl.getAttribLocation(shaderProgram,  'aIsSprite'),
				cornerLocation:             gl.getAttribLocation(shaderProgram,  'aCorner'),
				projectionLocation: 		gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
				viewLocation: 				gl.getUniformLocation(shaderProgram, 'uViewMatrix'),
				cameraRotationLocation:     gl.getUniformLocation(shaderProgram, 'uCameraRotation'),
				uTextureLocation: 			gl.getUniformLocation(shaderProgram, 'uTexture'),
				nowLocation: 				gl.getUniformLocation(shaderProgram, "now"),
			};
			gl.uniform1iv(renderer.programInfo.uTextureLocation, renderer.textureBuffer);
		});

		gl.enable(gl.CULL_FACE);
		gl.cullFace(gl.BACK);
		return renderer;
	}

	const cellCache = {	};

	function turnImageIntoTexture(id, img, spriteSize, options, gl) {
		if (!glTextures.length) {
			const textureIds = [
				gl.TEXTURE0,
				gl.TEXTURE1,
				gl.TEXTURE2,
				gl.TEXTURE3,
				gl.TEXTURE4,
				gl.TEXTURE5,
				gl.TEXTURE6,
				gl.TEXTURE7,
				gl.TEXTURE8,
				gl.TEXTURE9,
				gl.TEXTURE10,
				gl.TEXTURE11,
				gl.TEXTURE12,
				gl.TEXTURE13,
				gl.TEXTURE14,
				gl.TEXTURE15,
			];

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
			const { naturalWidth, naturalHeight } = img;
			const cols = Math.ceil(naturalWidth / spriteWidth);
			const rows = Math.ceil(naturalHeight / spriteHeight)
			const { canvas } = renderer;
			canvas.width = spriteWidth; canvas.height = spriteHeight;
			const ctx = canvas.getContext('2d');
			const { chunks, scale, flip } = options;

			let textures = [];
			for (let r = 0; r < rows; r++) {
				for (let c = 0; c < cols; c++) {
					let cell = cellCache[`${img.src}_${c}_${r}`];
					if (!cell) {
						cell = getTextureCell(spriteWidth, spriteHeight);
						ctx.clearRect(0, 0, canvas.width, canvas.height);
						ctx.drawImage(img, -c * spriteWidth, -r * spriteHeight);

						const glTexture = glTextures[cell.index];
						if (!glTexture) {
							console.warn("No more texture slots available.");
							continue;
						}
						if (glTexture.width < TEXTURE_SIZE || glTexture.height < TEXTURE_SIZE) {
							glTexture.width = TEXTURE_SIZE;
							glTexture.height = TEXTURE_SIZE;
							gl.bindTexture(gl.TEXTURE_2D, glTexture);
							gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, glTexture.width, glTexture.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
						}

						gl.texSubImage2D(gl.TEXTURE_2D, 0, cell.x, cell.y, gl.RGBA, gl.UNSIGNED_BYTE, canvas);
						cellCache[`${img.src}_${c}_${r}`] = cell;
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

			stock[id].textureData = {
				flip,
				textures,
				chunks: typeof(chunks) == 'number' ? [chunks,chunks] : Array.isArray(chunks) ? chunks : [1, 1],
				verticesMap: makeVerticesMap(spriteWidth, spriteHeight, scale),
				uploaded: false,
			};

			gl.generateMipmap(gl.TEXTURE_2D);
		}
	}

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

		return {
			'floor': new Float32Array([
				left, 0, top - .5,
				right, 0, top - .5,
				right, 0, bottom - .5,
				left, 0, bottom - .5,
			]),
			'ceiling': new Float32Array([
				left, 0, bottom - .5,
				right, 0, bottom - .5,
				right, 0, top - .5,
				left, 0, top - .5,
			]),
			'left': new Float32Array([
				0, bottom, right,
				0, bottom, left,
				0, top, left,
				0, top, right,
			]),
			'right': new Float32Array([
				0, bottom, left,
				0, bottom, right,
				0, top, right,
				0, top, left,
			]),
			'sprite': new Float32Array([
				left, 	bottom, 0,
				right, 	bottom, 0,
				right, 	top, 0,
				left, 	top, 0,
			]),
			'default': new Float32Array([
				left, 	bottom, 0,
				right, 	bottom, 0,
				right, 	top, 0,
				left, 	top, 0,
			]),
		};
	}

	function getSlotIndices(slotIndex) {
		return INDEX_ARRAY_PER_SPRITE.map(value => value + slotIndex * VERTICES_PER_SPRITE);		
	}

	function drawSprites(renderer, sprites, forceRedraw) {
		if (sprites.length <= 0) {
			return;
		}
		let count = 0;
		const { 
			indexBuffer, vertexBuffer, positionBuffer, waveBuffer, frameBuffer,
			cameraQuat, isSpriteBuffer, cornerBuffer, shaderProgram,
		} = renderer;

		sprites.forEach(sprite => {
			const { textureData } = sprite;
			if (!textureData) {
				return;
			}
			if (!textureData.uploaded) {
				const { textures, flip } = textureData;
				
				textureData.uploaded = true;

				textureData.texIndex = texIndex;

				textures.forEach(({ index, coordinates }, frameIndex) => {
					let [ left, right, top, bottom ] = coordinates;
					const texWidth = right - left;
					const texHeight = bottom - top;

			  		if (flip) {
			  			const temp = left;
			  			left = right;
			  			right = temp;
			  		}

					textureCoordinates.set([
						left,   bottom,
						right,  bottom,
						right,  top,
						left,   top,
					]);

					const glTexturesLocation = gl.getUniformLocation(shaderProgram, `uTextures[${(texIndex + frameIndex) * VERTICES_PER_SPRITE}]`);
					gl.uniform2fv(glTexturesLocation, textureCoordinates);
					const glTextureIdLocation = gl.getUniformLocation(shaderProgram, `uTextureId[${texIndex + frameIndex}]`);
					gl.uniform1f(glTextureIdLocation, index);
				});
				texIndex += textures.length;
			}

			const needsUpdate = forceRedraw || sprite.slotIndex !== count;
			sprite.slotIndex = count;

			if (needsUpdate) {
				const slotIndex = count;

				const vertices = sprite.getVertices();
				gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
				gl.bufferSubData(gl.ARRAY_BUFFER, slotIndex * VERTICES_PER_SPRITE * FLOAT_PER_VERTEX * Float32Array.BYTES_PER_ELEMENT, vertices);

				const position = sprite.getPosition();
				gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
				gl.bufferSubData(gl.ARRAY_BUFFER, slotIndex * VERTICES_PER_SPRITE * FLOAT_PER_VERTEX * Float32Array.BYTES_PER_ELEMENT, position);					

				const wave = sprite.getWave();
				gl.bindBuffer(gl.ARRAY_BUFFER, waveBuffer);
				gl.bufferSubData(gl.ARRAY_BUFFER, slotIndex * VERTICES_PER_SPRITE * Float32Array.BYTES_PER_ELEMENT, wave);

				const frameData = sprite.getFrameData(textureData.texIndex);
				gl.bindBuffer(gl.ARRAY_BUFFER, frameBuffer);
				gl.bufferSubData(gl.ARRAY_BUFFER, slotIndex * VERTICES_PER_SPRITE * 4 * Float32Array.BYTES_PER_ELEMENT, frameData);

				const isSprite = sprite.type === "sprite" ? 1 : 0;
				gl.bindBuffer(gl.ARRAY_BUFFER, isSpriteBuffer);
				gl.bufferSubData(gl.ARRAY_BUFFER, slotIndex * VERTICES_PER_SPRITE * Float32Array.BYTES_PER_ELEMENT, Float32Array.from([isSprite,isSprite,isSprite,isSprite]));

				gl.bindBuffer(gl.ARRAY_BUFFER, cornerBuffer);
				gl.bufferSubData(gl.ARRAY_BUFFER, slotIndex * VERTICES_PER_SPRITE * Float32Array.BYTES_PER_ELEMENT, CORNERS);

				Engine.debug.draws = (Engine.debug.draws || 0) + 1;
			}
			count++;
		});

		Engine.debug.sprites = count;
		Engine.debug.vertices = count * VERTICES_PER_SPRITE;
		gl.drawElements(gl.TRIANGLES, count * INDEX_ARRAY_PER_SPRITE.length, gl.UNSIGNED_SHORT, 0);
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
		const { gl, programInfo } = renderer;

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

		if (!renderer.cornerBuffer) {
			renderer.cornerBuffer = createVertexAttributeBuffer(gl, programInfo.cornerLocation, 1);
		}
		resizeBuffer(gl, gl.ARRAY_BUFFER, renderer.cornerBuffer, size * VERTICES_PER_SPRITE * Float32Array.BYTES_PER_ELEMENT);

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

		Utils.load(src).then(img => turnImageIntoTexture(id, img, spriteSize, options, gl));
	}

	function loadGame(game) {
		mainGame = game;
		const { assets, title, settings } = game;
		const { background, size } = settings;
		const [ width, height ] = size;
		
		document.title = title;
		mainCanvas.width = width;
		mainCanvas.height = height;
		mainCanvas.style.background = background;
		resizeCanvas(mainCanvas);
		
		assets.forEach(setupAsset);

		sprites.length = 0;
		mainGame.sprites.forEach(setupSprite);		
	}

	function setupAsset(asset) {
		asset = resolve(asset);
		if (Array.isArray(asset)) {
			asset.forEach(setupAsset);
		} else {
			const {id, src, spriteSize, options} = asset;
			loadImage(id, src, spriteSize, options || {});
		}
	}

	function setupSprite(options) {
		options = resolve(options);
		if (Array.isArray(options)) {
			options.forEach(setupSprite);
		} else {
			sprites.push(Sprite.create().setOptions(options));
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
		resolve,
		debug : {
			cam,
		},
	};
})(document);
