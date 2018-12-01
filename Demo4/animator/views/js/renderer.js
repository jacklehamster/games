const SpriteRenderer = (function() {
	const TEXTURE_SIZE = 4096;
	const TEXTURE_CELL = 64;
	const CELL_SIDE = TEXTURE_SIZE / TEXTURE_CELL;
	const POSITIONS = new Float32Array([
		0, -2, -2,
		2, -2, -2,
		2,  0, -2,
		0,  0, -2,
	]);
	const INDICES = new Uint16Array([
		0,  1,  2,
		0,  2,  3,
	]);

	function Factory(gl) {
		if(!Meta) {
			console.error("image_meta.js missing.");
		}

		this.gl = gl;
		this.cachedTextureData = {};
		this.textures = [];
		this.textureMap = [];
		this.textureUnits = [
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

		gl.enable(gl.BLEND);
		gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

		this.positionBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, POSITIONS, gl.STATIC_DRAW);

		this.indexBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, INDICES, gl.STATIC_DRAW);

		this.vertexCount = INDICES.length;
	}

	function doesFit(map, cellWidth, cellHeight, cellX, cellY) {
		if (!map) return true;
		for(let yy=0; yy<cellHeight; yy++) {
			for(let xx=0; xx<cellWidth; xx++) {
				if(map[cellX + xx][cellY + yy]) return false;
			}
		}
		return true;
	}

	Factory.prototype.getFit = function(textureIndex, width, height) {
		const cellWidth = Math.ceil(width / TEXTURE_CELL),
			cellHeight = Math.ceil(height / TEXTURE_CELL);
		const map = this.textureMap[textureIndex];
		for(let cellY=0; cellY<CELL_SIDE - cellHeight + 1; cellY++) {
			for(let cellX=0; cellX<CELL_SIDE - cellWidth + 1; cellX++) {
				if(doesFit(map, cellWidth, cellHeight, cellX, cellY)) {
					return { cellX, cellY, cellWidth, cellHeight };
				}
			}
		}
		return null;
	};

	function clearTexture(map, cellX, cellY, cellWidth, cellHeight) {
		for(let yy=0; yy<cellHeight; yy++) {
			for(let xx=0; xx<cellWidth; xx++) {
				map[cellX + xx][cellY + yy] = null;
			}
		}
	}

	Factory.prototype.updateTexture = function(canvas, animationFrame, texIndex, cellX, cellY, cellWidth, cellHeight) {
		if(!this.textureMap[texIndex]) {
			this.textureMap[texIndex] = new Array(TEXTURE_SIZE).fill(0).map(elem => new Array(TEXTURE_SIZE));
		}
		const map = this.textureMap[texIndex];
		for(let yy=0; yy<cellHeight; yy++) {
			for(let xx=0; xx<cellWidth; xx++) {
				if(map[cellX + xx][cellY + yy]) {
					console.error("texture update over existing texture.");
				}
				map[cellX + xx][cellY + yy] = true;
			}
		}

		const gl = this.gl;
		let texture = this.textures[texIndex];
		const level = 0;
		const internalFormat = gl.RGBA;
		const border = 0;
		const srcFormat = gl.RGBA;
		const srcType = gl.UNSIGNED_BYTE;
		const textureWidth = TEXTURE_SIZE, textureHeight = TEXTURE_SIZE;
		gl.activeTexture(this.textureUnits[texIndex]);
		if(!texture) {
			texture = this.textures[texIndex] = gl.createTexture();
			texture.width = textureWidth;
			texture.height = textureHeight;
			gl.bindTexture(gl.TEXTURE_2D, texture);
		  	gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, textureWidth, textureHeight, border, srcFormat, srcType, null);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		} else {
			gl.bindTexture(gl.TEXTURE_2D, texture);			
		}
		const { x, y, width, height} = animationFrame.crop;
		const imageData = canvas.getContext('2d').getImageData(x, y, width, height);
		gl.texSubImage2D(gl.TEXTURE_2D, level, cellX * TEXTURE_CELL, cellY * TEXTURE_CELL, srcFormat, srcType, imageData);
	};

	Factory.prototype.getFrame = function(name, animationTag, now) {
		const animationFrame = Meta.getAnimationFrame(name, animationTag, now);
		const tag = `${animationFrame.spriteId}_${animationTag}_${animationFrame.textureCoord.join(",")}`;

		let textureData = this.cachedTextureData[tag];
		if(!textureData) {
			let fit = null, tex = 0;
			const len = Math.min(this.textures.length, this.textureUnits.length);
			let t = performance.now();
			for(tex = 0; tex <= len; tex++) {
				const { width, height } = animationFrame.crop;
				fit = this.getFit(tex, width, height);
				if(fit) {
					break;
				}
			}
			if(!fit) {
				console.error("no fit for texture");
				return {};
			}
			const { cellX, cellY, cellWidth, cellHeight } = fit;
			const { meta, canvas } = Meta.getSpriteData(name);
			if (!meta) {
				return {};
			}

			this.updateTexture(canvas, animationFrame, tex, cellX, cellY, cellWidth, cellHeight);

	        const left = cellX * TEXTURE_CELL / TEXTURE_SIZE;
	        const right = (cellX * TEXTURE_CELL + animationFrame.crop.width-1) / TEXTURE_SIZE;
	        const top = cellY * TEXTURE_CELL / TEXTURE_SIZE;
	        const bottom = (cellY * TEXTURE_CELL + animationFrame.crop.height-1) / TEXTURE_SIZE;
  
	        const coordinates = new Float32Array([
				left,   bottom,
				right,  bottom,
				right,  top,
				left,   top,
			]);

  			const textureCoordBuffer = gl.createBuffer();
			gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);
			gl.bufferData(gl.ARRAY_BUFFER, coordinates, gl.STATIC_DRAW);

	        textureData = this.cachedTextureData[tag] = {
	        	texture: {
	        		coordinateBuffer: textureCoordBuffer,
					index: tex,
	        	},
				time: new Date().getTime(),				
	        };
		}

		return {
			texture: textureData.texture,
			modelViewMatrix: animationFrame.modelViewMatrix,
		};
	};

	WebGLRenderingContext.prototype.getTextureFactory = function() {
		if(!this.textureFactory) {
			this.textureFactory = new TextureFactory.Factory(this);
		}
		return this.textureFactory;
	};

	return {
		Factory,
	};
})();