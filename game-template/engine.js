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

	const SIZE_INCREASE = 500;

	const stock = {};

	let mainCanvas, gl, mainGame, renderer;

	const X_POS = 0, Y_POS = 1, Z_POS = 2;
	const tempVec3 = vec3.create();
	const acceleration = .1;

	const cam = {
		rotation: 0,
		mov: vec3.create(),
		pos: vec3.create(),
	};

	function refreshMove() {
		const { ax, ay, rot } = Keyboard.getActions();
		const { mov, pos } = cam;
		mov[X_POS] = (mov[X_POS] - ax * acceleration) * .5;
//		mov[Y_POS] = (mov[Y_POS] + ay * acceleration) * .5;
		mov[Z_POS] = (mov[Z_POS] + ay * acceleration) * .5;
		if (Math.abs(mov[X_POS]) < .001) {
			mov[X_POS] = 0;
		}
		if (Math.abs(mov[Z_POS]) < .001) {
			mov[Z_POS] = 0;
		}

		cam.rotation += rot * acceleration / 2;

		const [ mx, my, mz ] = mov;
		const directionVector = getRelativeDirection(cam.rotation, mx, my, mz);

		vec3.add(pos, pos, directionVector);

		if (viewMatrix) {
			const { cameraQuat } = renderer;
			const turn = cam.rotation;//Math.PI / 10;
			const tilt = 0;//y/2;//-.5;//-Math.PI / 30;
			const zOffset = -6;
			quat.rotateY(cameraQuat, quat.rotateX(cameraQuat, IDENTITY_QUAT, tilt), turn);
			directionVector[0] = 0;
			directionVector[1] = 0;
			directionVector[2] = zOffset;
			mat4.fromRotationTranslationScaleOrigin(viewMatrix, cameraQuat, ZERO_VEC3, SCALE_VEC3, directionVector);			
			quat.conjugate(cameraQuat, cameraQuat);	//	conjugate for sprites			

			mat4.translate(viewMatrix, viewMatrix, pos);
		}

		showDebugLog();
	}

	function showDebugLog() {
		document.getElementById("log").innerText = JSON.stringify(Engine.debug, null, '  ');
	}

	function getRelativeDirection (turn, dx, dy, dz) {
	    const sin = Math.sin(turn);
	    const cos = Math.cos(turn);
	    const rdx = (cos * dx - sin * dz);
	    const rdz = (sin * dx + cos * dz);
	    tempVec3[0] = rdx;
	    tempVec3[1] = dy;
	    tempVec3[2] = rdz;
	    return tempVec3;
	}

	let viewMatrix = null;
	let projectionMatrix = null;

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

			const translateVector = vec3.create();
			mat4.translate(viewMatrix, viewMatrix, vec3.set(translateVector, -x, -y, -z));
			gl.uniformMatrix4fv(programInfo.viewLocation, false, viewMatrix);
			cache.viewMatrix = mat4.create();
		}

		if (!mat4.exactEquals(viewMatrix, cache.viewMatrix)) {
			gl.uniformMatrix4fv(programInfo.viewLocation, false, viewMatrix);
			mat4.copy(cache.viewMatrix, viewMatrix);
		}
	}
	
	function refresh(now) {
		if (mainGame) {
			refreshMove();

			const frame = Math.floor(now / 100);
			const { pos, mov } = cam;

			const sprites = Game.getSprites(now)
				.map(([id, x, y, z, type, options]) => {
					const { textureData } = stock[id];
					const { chunk, followcam } = options;

					if (!textureData) {
						return null;
					}

					if (followcam) {
						x = -pos[0];
						y = -pos[1] - 1;
						z = -pos[2] - 6;
					}

					return Sprite.create()
						.setPosition(x, y, z)
						.setTextureData(textureData)
						.setChunk(chunk)
						.setType(type)
						.setAnimated(followcam ? vec3.length(mov) > 0 : false);
				})
				.filter(a => a);


			if (renderer) {
				refreshMatrices(renderer);				
				ensureBuffer(renderer, sprites.length);
				drawSprites(renderer, frame, sprites);
			}
			sprites.forEach(sprite => sprite.recycle());
		}
	}

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

		initGL(gl);
	}

	function initGL(gl) {
		gl.enable(gl.BLEND);
		gl.enable(gl.DEPTH_TEST);

		gl.depthFunc(gl.LEQUAL);
		gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);	
	}

	const vsSource = `
		precision mediump float;

		attribute vec4 aVertexPosition;
		attribute vec2 aTextureCoord;
		attribute float aTextureIndex;
		uniform mat4 uProjectionMatrix;
		uniform mat4 uViewMatrix;
		varying highp vec2 vTextureCoord;
		varying highp float zDist;
		varying highp float textureIndex;

		void main(void) {
			vec4 position = uProjectionMatrix * uViewMatrix * aVertexPosition;
			vTextureCoord = aTextureCoord;
			textureIndex = aTextureIndex;
			zDist = position.z / 50.0 + abs(position.x / 30.0);
//			position.y -= (position.z * position.z + position.x * position.x) / 50.0;
			gl_Position = position;
		}
	`;

	const fsSource = `
		precision mediump float;

		uniform sampler2D uTexture[16];
		varying highp vec2 vTextureCoord;
		varying highp float zDist;
		varying highp float textureIndex;

		vec4 getTextureColor(float textureIndexFloat, vec2 vTextureCoord) {
			int textureIndex = int(floor(textureIndexFloat));
			if (textureIndex == 0) {
				return texture2D(uTexture[0], vTextureCoord);
			} else if(textureIndex == 1) {
				return texture2D(uTexture[1], vTextureCoord);
			} else if(textureIndex == 2) {
				return texture2D(uTexture[2], vTextureCoord);
			} else if(textureIndex == 3) {
				return texture2D(uTexture[3], vTextureCoord);
			} else if(textureIndex == 4) {
				return texture2D(uTexture[4], vTextureCoord);
			} else if(textureIndex == 5) {
				return texture2D(uTexture[5], vTextureCoord);				
			} else if(textureIndex == 6) {
				return texture2D(uTexture[6], vTextureCoord);
			} else if(textureIndex == 7) {
				return texture2D(uTexture[7], vTextureCoord);				
			} else if(textureIndex == 8) {
				return texture2D(uTexture[8], vTextureCoord);				
			} else if(textureIndex == 9) {
				return texture2D(uTexture[9], vTextureCoord);				
			} else if(textureIndex == 10) {
				return texture2D(uTexture[10], vTextureCoord);
			} else if(textureIndex == 11) {
				return texture2D(uTexture[11], vTextureCoord);
			} else if(textureIndex == 12) {
				return texture2D(uTexture[12], vTextureCoord);
			} else if(textureIndex == 13) {
				return texture2D(uTexture[13], vTextureCoord);				
			} else if(textureIndex == 14) {
				return texture2D(uTexture[14], vTextureCoord);
			} else if(textureIndex == 15) {
				return texture2D(uTexture[15], vTextureCoord);
			} else {
				return texture2D(uTexture[0], vTextureCoord);
			}
		}

		void main(void) {
			vec4 color = getTextureColor(textureIndex, vTextureCoord);
			if (color.w <= 0.1) {
				discard;
			}
			gl_FragColor = color;
		}
	`;

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

	function loadImageAsTexture(id, img, spriteSize, options, gl) {
		if (!renderer) {
			const shaderProgram = initShaderProgram(gl, vsSource, fsSource);
			gl.useProgram(shaderProgram);

			gl.enable(gl.CULL_FACE);
			gl.cullFace(gl.BACK);

			const programInfo = {
				vertexLocation: 			gl.getAttribLocation(shaderProgram,  'aVertexPosition'),
				textureCoordLocation: 		gl.getAttribLocation(shaderProgram,  'aTextureCoord'),
				textureIndexLocation: 		gl.getAttribLocation(shaderProgram,  'aTextureIndex'),
				projectionLocation: 		gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
				viewLocation: 				gl.getUniformLocation(shaderProgram, 'uViewMatrix'),
				uTextureLocation: 			gl.getUniformLocation(shaderProgram, 'uTexture'),
			};	

			renderer = {
				gl,
				programInfo,
				spriteBufferSize: 0,
				cache: {},
				canvas: document.createElement('canvas'),
				cameraQuat: quat.create(),
			};

			renderer.textureBuffer = new Int32Array(16).map((a, index) => index);
			gl.uniform1iv(renderer.programInfo.uTextureLocation, renderer.textureBuffer);
		}

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

			let textures = [];
			for (let r = 0; r < rows; r++) {
				for (let c = 0; c < cols; c++) {
					ctx.clearRect(0, 0, canvas.width, canvas.height);
					ctx.drawImage(img, -c * spriteWidth, -r * spriteHeight);

					const cell = getTextureCell(spriteWidth, spriteHeight);

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
					textures.push(cell);
				}
			}

			const { chunks } = options;
			textures = textures.map(cell => {
				const textureLeft = cell.x/TEXTURE_SIZE;// + 1/TEXTURE_SIZE/2;
				const textureRight = cell.x/TEXTURE_SIZE + spriteWidth/TEXTURE_SIZE;// - 1/TEXTURE_SIZE/2;
				const textureTop = cell.y/TEXTURE_SIZE;// + 1/TEXTURE_SIZE/2;
				const textureBottom = cell.y/TEXTURE_SIZE + spriteHeight/TEXTURE_SIZE;// - 1/TEXTURE_SIZE/2;
				return { 
					index: cell.index,
					coordinates: [textureLeft, textureRight, textureTop, textureBottom],
					chunks: typeof(chunks) == 'number' ? [chunks,chunks] : Array.isArray(chunks) ? chunks : [1, 1],
				};
			});

			stock[id].textureData = {
				textures,
				size: [ spriteWidth, spriteHeight ],
				verticesMap: makeVerticesMap(spriteWidth, spriteHeight),
			};

			gl.generateMipmap(gl.TEXTURE_2D);
		}
	}

	function makeVerticesMap(width, height) {
		const left = 	-.5;
		const right = 	 .5;
		const top = 	height / width;
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
		if (slotIndicesArray)
		return INDEX_ARRAY_PER_SPRITE.map(value => value + slotIndex * VERTICES_PER_SPRITE);		
	}

	function drawSprites(renderer, frame, sprites) {
		if (sprites.length <= 0) {
			return;
		}
		const { indexBuffer, cameraQuat, positionBuffer, textureCoordBuffer, textureIndexBuffer } = renderer;
		sprites.forEach((sprite, slotIndex) => {
			const slotIndices = slotIndicesArray[slotIndex];
			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
			gl.bufferSubData(gl.ELEMENT_ARRAY_BUFFER, slotIndex * slotIndices.length * Uint16Array.BYTES_PER_ELEMENT, slotIndices);

			const vertices = sprite.getVertices(cameraQuat);
			gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
			gl.bufferSubData(gl.ARRAY_BUFFER, slotIndex * VERTICES_PER_SPRITE * FLOAT_PER_VERTEX * Float32Array.BYTES_PER_ELEMENT, vertices);

			const textureCoordinates = sprite.getTextureCoordinates(frame);
			gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);
			gl.bufferSubData(gl.ARRAY_BUFFER, slotIndex * VERTICES_PER_SPRITE * TEXTURE_FLOAT_PER_VERTEX * Float32Array.BYTES_PER_ELEMENT, textureCoordinates);

			const index = sprite.getTextureIndex(frame);
			gl.bindBuffer(gl.ARRAY_BUFFER, textureIndexBuffer);
			gl.bufferSubData(gl.ARRAY_BUFFER, slotIndex * VERTICES_PER_SPRITE * Float32Array.BYTES_PER_ELEMENT, glTextureIndexBuffers[index]);
		});
		gl.drawElements(gl.TRIANGLES, sprites.length * INDEX_ARRAY_PER_SPRITE.length, gl.UNSIGNED_SHORT, 0);
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

	const slotIndicesArray = [];

	function ensureBuffer(renderer, size) {
		if (size > renderer.spriteBufferSize) {
			allocateBuffer(renderer, size + SIZE_INCREASE);			
		}
		for (let i = 0; i < size; i++) {
			slotIndicesArray[i] = INDEX_ARRAY_PER_SPRITE.map(value => value + i * VERTICES_PER_SPRITE);
		}
	}

	function allocateBuffer(renderer, size) {
		const { gl, programInfo } = renderer;
		if (!renderer.positionBuffer) {
			renderer.positionBuffer = createVertexAttributeBuffer(gl, programInfo.vertexLocation, FLOAT_PER_VERTEX);
		}
		resizeBuffer(gl, gl.ARRAY_BUFFER, renderer.positionBuffer, size * VERTICES_PER_SPRITE * FLOAT_PER_VERTEX * Float32Array.BYTES_PER_ELEMENT);

		if (!renderer.textureCoordBuffer) {
			renderer.textureCoordBuffer = createVertexAttributeBuffer(gl, programInfo.textureCoordLocation, TEXTURE_FLOAT_PER_VERTEX);
		}
		resizeBuffer(gl, gl.ARRAY_BUFFER, renderer.textureCoordBuffer, size * VERTICES_PER_SPRITE * TEXTURE_FLOAT_PER_VERTEX * Float32Array.BYTES_PER_ELEMENT);

		if (!renderer.textureIndexBuffer) {
			renderer.textureIndexBuffer = createVertexAttributeBuffer(gl, programInfo.textureIndexLocation, 1);
		}
		resizeBuffer(gl, gl.ARRAY_BUFFER, renderer.textureIndexBuffer, size * VERTICES_PER_SPRITE * Float32Array.BYTES_PER_ELEMENT);

		if (!renderer.indexBuffer) {
			renderer.indexBuffer = gl.createBuffer();
		}
		resizeBuffer(gl, gl.ELEMENT_ARRAY_BUFFER, renderer.indexBuffer, size * INDEX_ARRAY_PER_SPRITE.length * Uint16Array.BYTES_PER_ELEMENT);
		
		renderer.spriteBufferSize = size;
	}

	function resizeBuffer(gl, bufferType, buffer, newBufferSize) {
		gl.bindBuffer(bufferType, buffer);
		const bufferSize = gl.getBufferParameter(bufferType, gl.BUFFER_SIZE);
		gl.bufferData(bufferType, newBufferSize, gl.STATIC_DRAW);
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
		stock[id] = {};
		const img = new Image();
		img.crossOrigin = "anonymous";
		img.addEventListener('load', e => {
			if (!options) {
				options = {};
			}
			const img = e.currentTarget;
			loadImageAsTexture(id, img, spriteSize, options, gl);
		});
		img.src = src;
	}

	function loadGame(game) {
		mainGame = game;
		const { assets, title, size } = game;
		const [ width, height ] = size;
		
		document.title = title;
		mainCanvas.width = width;
		mainCanvas.height = height;
		mainCanvas.style.background = game.background;
		resizeCanvas(mainCanvas);
		
		assets.forEach(({id, src, spriteSize, options}) => {
			loadImage(id, src, spriteSize, options || {})
		});
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
