const SpriteRenderer = (function() {

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
			position.y -= (position.z * position.z + position.x * position.x) / 1000.0;
			gl_Position = position;
		}
	`;

	const fsSource = `
		precision mediump float;

		uniform sampler2D uTexture[16];
		uniform float uTime;
		uniform vec4 uBackground;
		varying highp vec2 vTextureCoord;
		varying highp float zDist;
		varying highp float textureIndex;

		float rand(vec2 co, float time){
		  return fract(sin(dot(co.xy ,vec2(12.9898 + time,78.233 + time))) * 43758.5453);
		}

		vec4 reduceColor(vec4 color, vec2 co, float amount) {
			vec4 oldColor = color;
			color.x += rand(co, uTime/1000.0) -.5;
			color.y += rand(co, uTime/1000.0) -.5;
			color.z += rand(co, uTime/1000.0) -.5;

			vec4 colors[4];
			colors[0] = vec4(0.0,  0.0, 0.0, 0.0);
			colors[1] = vec4(0.0,  0.0, 0.0, 1.0);
			colors[2] = vec4(0.99, 0.5, 0.5, 1.0);
			colors[3] = vec4(0.3,  0.7, 0.2, 1.0);

			vec4 newColor = colors[0];
			for (int i = 1; i < 4; i++) {
				if (distance(color, colors[i]) < distance(color, newColor)) {
					newColor = colors[i];
				}
			}
			return mix(oldColor, newColor, amount);
		}

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

		vec4 blur(vec4 color, vec2 vTextureCoord, float value) {
			if (color.w > 0.0) {
				vec2 vTex = vTextureCoord;
				vTex.x = vTex.x + (rand(vTextureCoord, uTime + 0.0) - .5) / 100.0;
				vTex.y = vTex.y + (rand(vTextureCoord, uTime + 1.0) - .5) / 100.0;
				vec4 offsetColor = getTextureColor(textureIndex, vTex);
				if (offsetColor.a == 0.0) {
					offsetColor.rgb = uBackground.rgb;
				}
				color.rgb = mix(color, offsetColor, value).rgb;
			}
			return color;			
		}

		vec3 rgb2hsv(vec3 c)
		{
		    vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
		    vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
		    vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));

		    float d = q.x - min(q.w, q.y);
		    float e = 1.0e-10;
		    return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
		}

		vec3 hsv2rgb(vec3 c)
		{
		    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
		    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
		    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
		}

		vec4 alterHueSatLum(vec4 color, vec3 vHSV) {
		    vec3 fragRGB = color.rgb;
		    vec3 fragHSV = rgb2hsv(fragRGB).xyz;
		    fragHSV.x += vHSV.x;
		    fragHSV.yz *= vHSV.yz;
		    fragHSV.xyz = mod(fragHSV.xyz, 1.0);
		    fragRGB = hsv2rgb(fragHSV);
		    return vec4(fragRGB, color.a);
		}

		void main(void) {
			vec4 color = getTextureColor(textureIndex, vTextureCoord);
			color = blur(color, vTextureCoord, min(1.0, (zDist * 1.5)));
//			color = reduceColor(color, vTextureCoord, min(1.0, (zDist * 2.0)));
			color = alterHueSatLum(color, vec3(1.0, max(0.0, 1.0 - zDist * .2), max(0.0, 1.0 - zDist * 1.5)));

			if (color.a == 0.0) {
				discard;
			} 
			gl_FragColor = color;
		}
	`;
	const INDEX_ARRAY_PER_SPRITE = new Uint16Array([
		0,  1,  2,
		0,  2,  3,
	]);

	const FLOAT_PER_VERTEX = 3;			//	x,y,z
	const TEXTURE_FLOAT_PER_VERTEX = 2;	//	x,y
	const VERTICES_PER_SPRITE = 4;		//	4 corners
	const SIZE_INCREASE = 500;
	const ZERO_VEC3 = vec3.create();
	const SCALE_VEC3 = vec3.fromValues(1,1,1);
	const IDENTITY_QUAT = quat.identity(quat.create());

	const CLEAN_FREQUENCY = .01;

	function Renderer(gl) {
		if(!TextureFactory) {
			console.error("texture_meta.js missing.");
		}

		this.gl = gl;
		const shaderProgram = initShaderProgram(gl, vsSource, fsSource);
		gl.useProgram(shaderProgram);

		gl.enable(gl.CULL_FACE);
		gl.cullFace(gl.BACK);		

		this.programInfo = {
	      vertexLocation: 		gl.getAttribLocation(shaderProgram,  'aVertexPosition'),
	      textureCoordLocation: gl.getAttribLocation(shaderProgram,  'aTextureCoord'),
	      textureIndexLocation: gl.getAttribLocation(shaderProgram,  'aTextureIndex'),
	      projectionLocation: 	gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
	      viewLocation: 		gl.getUniformLocation(shaderProgram, 'uViewMatrix'),
	      uTextureLocation: 	gl.getUniformLocation(shaderProgram, 'uTexture'),
	      timeLocation:         gl.getUniformLocation(shaderProgram, 'uTime'),
	      backgroundLocation:   gl.getUniformLocation(shaderProgram, 'uBackground'),
		};

		this.positionBuffer = null;
		this.textureCoordBuffer = null;
		this.textureIndexBuffer = null;
		this.indexBuffer = null;
		this.textureBuffer = new Int32Array();

		this.spriteBufferSize = 0;
		this.camera = View.Camera.create();
		this.cameraQuat = quat.create();

		this.cachedData = {
			indices: [],
		};

		this.tempVariables = {
			viewMatrix: mat4.create(),
			tempPositions: new Float32Array(FLOAT_PER_VERTEX * VERTICES_PER_SPRITE),
			translateVector: vec3.create(),
			tempVec3: vec3.create(),
		};

		this.spriteMap = {};
		this.nextIndex = 0;
		this.recycledIndices = [];
		this.indicesMap = [];
		this.backgroundColor = [ 0.0, 0.0, 0.0, 1.0 ];
		this.lastCleared = 0;
		this.lastCleaned = 0;

		const fieldOfView = 45 * Math.PI / 180;   // in radians
		const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
		const zNear = 0.1;
		const zFar = 1000.0;
		const projectionMatrix = mat4.perspective(mat4.create(), fieldOfView, aspect, zNear, zFar);
		gl.uniformMatrix4fv(this.programInfo.projectionLocation, false, projectionMatrix);
		setCamera(this, View.Camera.create(), true);
		clearRenderer(this, 0);
	}

	function transformPosition(renderer, positions, cameraQuat, translateVector) {
		vec3.forEach(positions, 0, 0, 0, vec3.transformQuat, cameraQuat);
		for(let i=0; i<positions.length; i+=3) {
			positions[i]   += translateVector[0];
			positions[i+1] += translateVector[1];
			positions[i+2] += translateVector[2];
		}
	}

	function copyPositions(positions, points) {
		for(let i=0; i<positions.length; i+=3) {
			positions[i]   = points[i];
			positions[i+1] = points[i+1];
			positions[i+2] = points[i+2];
		}		
	}

	function getFramePositions(renderer, texture, sprite) {
		const positions = renderer.tempVariables.tempPositions;
		switch(sprite.type) {
			case 'surface':
				{
					copyPositions(positions, sprite.points);
				}
				break;
			case 'sprite':
				{
					const left = texture.positions.left * sprite.scale;
					const right = texture.positions.right * sprite.scale;
					const top = texture.positions.top * sprite.scale;
					const bottom = texture.positions.bottom * sprite.scale;
					positions[0] = left;
					positions[1] = top;
					positions[2] = 0;
					positions[3] = right;
					positions[4] = top;
					positions[5] = 0;
					positions[6] = right;
					positions[7] = bottom;
					positions[8] = 0;
					positions[9] = left;
					positions[10] = bottom;
					positions[11] = 0;
					transformPosition(renderer, positions, renderer.cameraQuat, sprite.position);
				}
				break;
		}
		return positions;
	};

	function ensureBuffer(renderer, size) {
		if (size > renderer.spriteBufferSize) {
			allocateBuffer(renderer, size + SIZE_INCREASE);			
		}
	}

	function getSpriteCache(renderer, id) {
		const spriteMap = renderer.spriteMap;
		if (spriteMap[id]) {
			return spriteMap[id];
		}
		if (renderer.recycledIndices.length) {
			const recycledData = renderer.recycledIndices.pop();
			spriteMap[id] = recycledData;
			return recycledData;
		}
		const slotIndex = renderer.nextIndex++;
		return spriteMap[id] = {
			slotIndex,
			spritePositions: new Float32Array(FLOAT_PER_VERTEX * VERTICES_PER_SPRITE),
			spriteTextureCoordinates: new Float32Array(TEXTURE_FLOAT_PER_VERTEX * VERTICES_PER_SPRITE),
			spriteTextureIndex: -1,
			time: 0,
		};
	}

	function cleanSpriteMap(renderer, time) {
		const { spriteMap, recycledIndices } = renderer;
		for(let s in spriteMap) {
			const spriteData = spriteMap[s];
			if (spriteData.time !== time) {
				recycledIndices.push(spriteData);
				spriteData.time = 0;
				delete spriteMap[s];
			}
		}
	}

	function clearRenderer(renderer, now) {
		const gl = renderer.gl;
		if (now===0) {
			gl.clearColor.apply(gl, renderer.backgroundColor);  // Clear to black, fully opaque
			gl.clearDepth(1.0);                 // Clear everything
			gl.enable(gl.DEPTH_TEST);           // Enable depth testing
			gl.depthFunc(gl.LEQUAL);            // Near things obscure far things
		} else if(renderer.lastCleared !== now) {
			gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		} else {
			gl.clear(gl.DEPTH_BUFFER_BIT);
		}
		renderer.lastCleared = now;
	};

	Renderer.prototype.drawSprites = function(sprites, camera, now) {
		const gl = this.gl;
		clearRenderer(this, now);
		if(now!==this.lastCleaned) {
			if(Math.random() < CLEAN_FREQUENCY) {
				cleanSpriteMap(this, this.lastCleaned);
			}
			this.lastCleaned = now;
		}

		if(now) {
			setTime(gl, this.programInfo, now);
		}
		if(camera) {
			setCamera(this, camera);
		}
		ensureBuffer(this, sprites.length + this.nextIndex);

		const textureFactory = gl.getTextureFactory();
		let count = 0;
		for(let i = 0; i < sprites.length; i++) {
			const sprite = sprites[i];
			const textureData = textureFactory.getTextureData(sprite.name, sprite.label, sprite.frozen ? 0 : now);
			if (textureData) {
				addFrame(this, textureData, count, sprite, now);
				count ++;
			}
		}
		draw(gl, count);
	};

	function setTime(gl, programInfo, now) {
		gl.uniform1f(programInfo.timeLocation, now);
	}

	Renderer.prototype.setBackgroundColor = function(color) {
		const { gl, programInfo } = this;
		this.backgroundColor = [
			(color >> 16) % 256 / 256,
			(color >> 8) % 256 / 256,
			(color >> 0) % 256 / 256,
			1.0,
		];
		gl.uniform4f(programInfo.backgroundLocation,
			this.backgroundColor[0],
			this.backgroundColor[1],
			this.backgroundColor[2],
			this.backgroundColor[3],
		);
		clearRenderer(this, 0);
	};

	function setCamera(renderer, camera, forceRefresh) {
		if (!renderer.camera.equals(camera) || forceRefresh) {
			const { gl, programInfo, cachedData, tempVariables, cameraQuat } = renderer;
			const { viewMatrix, translateVector, tempVec3 } = tempVariables;
			const turn = camera.turn;
			const tilt = camera.getTilt();
			quat.rotateY(cameraQuat, quat.rotateX(cameraQuat, IDENTITY_QUAT, tilt), turn);
			tempVec3[2] = camera.zOffset || 0;
			mat4.fromRotationTranslationScaleOrigin(viewMatrix, cameraQuat, ZERO_VEC3, SCALE_VEC3, tempVec3);			
			quat.conjugate(cameraQuat, cameraQuat);	//	conjugate for sprites

			const [ x, y, z ] = camera.position;
			mat4.translate(viewMatrix, viewMatrix, vec3.set(translateVector, -x, -y - .5, -z));
			gl.uniformMatrix4fv(programInfo.viewLocation, false, viewMatrix);
			vec3.set(renderer.camera.position, x, y, z);
			renderer.camera.tilt = tilt;
			renderer.camera.turn = turn;
			return true;
		}
		return false;
	}

	function resizeBuffer(gl, bufferType, buffer, newBufferSize) {
		gl.bindBuffer(bufferType, buffer);
		const bufferSize = gl.getBufferParameter(bufferType, gl.BUFFER_SIZE);
		gl.bufferData(bufferType, newBufferSize, gl.STATIC_DRAW);
		return buffer;
	}

	function createVertexAttributeBuffer(gl, location, numComponents) {
		const buffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
		const type = gl.FLOAT;
		const normalize = false;
		const stride = 0;
		const offset = 0;
		gl.vertexAttribPointer(location,
		    numComponents,
		    type,
		    normalize,
		    stride,
		    offset);
		gl.enableVertexAttribArray(location);
		return buffer;
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
		cleanSpriteMap(renderer, -1);
	}

	function floatArrayEqual(a, b) {
	  	for (let i=0; i < a.length; i++) {
	    	if (a[i] !== b[i]) return false;
	  	}
	  	return true;
	}

	function addFrame(renderer, texture, frameIndex, sprite, now) {
		const { gl, programInfo, cachedData, indicesMap } = renderer;
		const spriteData = getSpriteCache(renderer, sprite.id + texture.frameId);
		const { slotIndex, spritePositions, spriteTextureCoordinates, spriteTextureIndex, time } = spriteData;

		if (!time || indicesMap[frameIndex] !== slotIndex) {
			let slotIndices = cachedData.indices[slotIndex];
			if (!slotIndices) {
				slotIndices = INDEX_ARRAY_PER_SPRITE.map(value => value + slotIndex * VERTICES_PER_SPRITE);
				cachedData.indices[slotIndex] = slotIndices;
			}
			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, renderer.indexBuffer);
			gl.bufferSubData(gl.ELEMENT_ARRAY_BUFFER, frameIndex * slotIndices.length * Uint16Array.BYTES_PER_ELEMENT, slotIndices);
			indicesMap[frameIndex] = slotIndex;
		}

		const positions = getFramePositions(renderer, texture, sprite);
		if (!time || !floatArrayEqual(positions, spritePositions)) {
			gl.bindBuffer(gl.ARRAY_BUFFER, renderer.positionBuffer);
			gl.bufferSubData(gl.ARRAY_BUFFER, slotIndex * VERTICES_PER_SPRITE * FLOAT_PER_VERTEX * Float32Array.BYTES_PER_ELEMENT, positions);
			spritePositions.set(positions);
		}

		if (!time || !floatArrayEqual(texture.coordinates, spriteTextureCoordinates)) {
			gl.bindBuffer(gl.ARRAY_BUFFER, renderer.textureCoordBuffer);
			gl.bufferSubData(gl.ARRAY_BUFFER, slotIndex * VERTICES_PER_SPRITE * TEXTURE_FLOAT_PER_VERTEX * Float32Array.BYTES_PER_ELEMENT, texture.coordinates);
			spriteTextureCoordinates.set(texture.coordinates);
		}

		const textureIndex = texture.indexBuffer[0];
		if (!time || textureIndex != spriteTextureIndex) {
			if (textureIndex >= renderer.textureBuffer.length) {
				renderer.textureBuffer = new Int32Array(textureIndex + 1).map((a, index) => index);
				gl.uniform1iv(programInfo.uTextureLocation, renderer.textureBuffer);
			}
		    gl.bindBuffer(gl.ARRAY_BUFFER, renderer.textureIndexBuffer);
			gl.bufferSubData(gl.ARRAY_BUFFER, slotIndex * VERTICES_PER_SPRITE * Float32Array.BYTES_PER_ELEMENT, texture.indexBuffer);
			spriteData.spriteTextureIndex = textureIndex;
		}
		spriteData.time = now;
	};

	function draw(gl, count) {
		if (count > 0) {
			gl.drawElements(gl.TRIANGLES, count * INDEX_ARRAY_PER_SPRITE.length, gl.UNSIGNED_SHORT, 0);
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

	WebGLRenderingContext.prototype.getSpriteRenderer = function() {
		if(!this.spriteRenderer) {
			this.spriteRenderer = new SpriteRenderer.Renderer(this);
		}
		return this.spriteRenderer;
	};

	return {
		Renderer,
	};
})();
