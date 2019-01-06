const TextureFactory = (function() {
	const TEXTURE_SIZE = 4096;
	const TEXTURE_CELL = 64;
	const CELL_SIDE = TEXTURE_SIZE / TEXTURE_CELL;
	const VERTICES_PER_SPRITE = 4;

	function Factory(gl) {
		if(!Meta) {
			console.error("image_meta.js missing.");
		}

		this.gl = gl;
		this.cachedFrameData = {};
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

	function getFit(textureMap, textureIndex, width, height) {
		const cellWidth = Math.ceil(width / TEXTURE_CELL),
			cellHeight = Math.ceil(height / TEXTURE_CELL);
		const map = textureMap[textureIndex];
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

	function updateTexture(factory, canvas, crop, hotspot, texIndex, cellX, cellY, cellWidth, cellHeight, offset) {
		if(!factory.textureMap[texIndex]) {
			factory.textureMap[texIndex] = new Array(TEXTURE_SIZE).fill(0).map(elem => new Array(TEXTURE_SIZE));
		}
		const map = factory.textureMap[texIndex];
		for(let yy=0; yy<cellHeight; yy++) {
			for(let xx=0; xx<cellWidth; xx++) {
				if(map[cellX + xx][cellY + yy]) {
					console.error("texture update over existing texture.");
				}
				map[cellX + xx][cellY + yy] = true;
			}
		}

		const gl = factory.gl;
		let texture = factory.textures[texIndex];
		const level = 0;
		const internalFormat = gl.RGBA;
		const border = 0;
		const srcFormat = gl.RGBA;
		const srcType = gl.UNSIGNED_BYTE;
		if(!texture) {
			gl.activeTexture(factory.textureUnits[texIndex]);
			texture = factory.textures[texIndex] = gl.createTexture();
			const textureWidth = TEXTURE_SIZE, textureHeight = TEXTURE_SIZE;
			texture.width = textureWidth;
			texture.height = textureHeight;
			gl.bindTexture(gl.TEXTURE_2D, texture);
		  	gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, textureWidth, textureHeight, border, srcFormat, srcType, null);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		} else {
			gl.bindTexture(gl.TEXTURE_2D, texture);			
		}
		const { x, y, width, height} = crop;
		const imageData = canvas.getContext('2d').getImageData(x, y, width, height);
		gl.texSubImage2D(gl.TEXTURE_2D, level,
			cellX * TEXTURE_CELL + offset.x,
			cellY * TEXTURE_CELL + offset.y,
			srcFormat, srcType, imageData);
	};

	function getTextureData(name, animationTag, now) {
		const animationFrame = Meta.getAnimationFrame(name, animationTag, now);
		const { frameId } = animationFrame;
		if(!frameId) {
			return null;
		}

		if (this.cachedTextureData[animationTag] && this.cachedTextureData[animationTag][frameId]) {
			return this.cachedTextureData[animationTag][frameId];
		}

		const { crop, hotspot, scale, bigRect } = animationFrame;
		let fit = null, tex = 0;
		const len = Math.min(this.textures.length, this.textureUnits.length);
		const { width, height } = bigRect;
		for(tex = 0; tex <= len; tex++) {
			fit = getFit(this.textureMap, tex, width, height);
			if(fit) {
				break;
			}
		}
		if(!fit) {
			console.error("no fit for texture");
			return null;
		}
		const { cellX, cellY, cellWidth, cellHeight } = fit;
		const { meta, canvas } = Meta.getSpriteData(name);
		if (!meta) {
			return null;
		}

		const offset = {
			x: -bigRect.minX - hotspot.x,
			y: -bigRect.minY - hotspot.y,
		};
		updateTexture(this, canvas, crop, hotspot, tex, cellX, cellY, cellWidth, cellHeight, offset);

        const textureLeft = cellX * TEXTURE_CELL / TEXTURE_SIZE;
        const textureRight = (cellX * TEXTURE_CELL + bigRect.width-1) / TEXTURE_SIZE;
        const textureTop = cellY * TEXTURE_CELL / TEXTURE_SIZE;
        const textureBottom = (cellY * TEXTURE_CELL + bigRect.height-1) / TEXTURE_SIZE;

        const coordinates = new Float32Array([
			textureLeft,   textureBottom,
			textureRight,  textureBottom,
			textureRight,  textureTop,
			textureLeft,   textureTop,
		]);

		const textureHotSpotX = -bigRect.minX;
		const textureHotSpotY = -bigRect.minY;

		const minSize = Math.max(bigRect.width, bigRect.height);
		const vertexWidth = bigRect.width / minSize, vertexHeight = bigRect.height / minSize;
		const vertexHotspotX = vertexWidth * textureHotSpotX / bigRect.width;
		const vertexHotspotY = -vertexHeight * textureHotSpotY / bigRect.height;

		const left = (0 - vertexHotspotX) * scale;
		const right = (vertexWidth - vertexHotspotX) * scale;
		const top = (-vertexHeight - vertexHotspotY) * scale;
		const bottom = (0 - vertexHotspotY) * scale;

		if (!this.cachedTextureData[animationTag]) {
			this.cachedTextureData[animationTag] = {};
		}

		return this.cachedTextureData[animationTag][frameId] = {
			positions: {
				left, right, top, bottom,
			},
    		coordinates,
			indexBuffer: new Float32Array(VERTICES_PER_SPRITE).fill(tex),
    	};
	}

	WebGL2RenderingContext.prototype.getTextureFactory = function() {
		if(!this.textureFactory) {
			this.textureFactory = new TextureFactory.Factory(this);
		}
		return this.textureFactory;
	};

	Factory.prototype.getTextureData = getTextureData;

	return {
		Factory,
	};
})();