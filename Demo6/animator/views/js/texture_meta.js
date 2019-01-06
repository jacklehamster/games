const TextureFactory = (function() {
	const TEXTURE_SIZE = 4096;
	const TEXTURE_CELL = 64;
	const CELL_SIDE = TEXTURE_SIZE / TEXTURE_CELL;
	const VERTICES_PER_SPRITE = 4;
	const EMPTY = {};

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

	function updateTexture(factory, canvas, animationFrame, texIndex, cellX, cellY, cellWidth, cellHeight, offset) {
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
		const { x, y, width, height} = animationFrame.crop;
		const hotspot = animationFrame.hotspot;
		const imageData = canvas.getContext('2d').getImageData(x, y, width, height);
		gl.texSubImage2D(gl.TEXTURE_2D, level,
			cellX * TEXTURE_CELL + offset.x,
			cellY * TEXTURE_CELL + offset.y,
			srcFormat, srcType, imageData);
	};

	function getFrame(name, animationTag, type, now) {
		const animationFrame = Meta.getAnimationFrame(name, animationTag, now);
		const { frameId, crop, hotspot, scale, bigRect } = animationFrame;
		if(!frameId) {
			return EMPTY;
		}

		const frameTag = `${frameId}_${type}`;

		let frameData = this.cachedFrameData[frameTag];
		if(!frameData) {
			const textureTag = `${frameId}_${animationTag}`;
			let texture = this.cachedTextureData[textureTag];
			if (!texture) {
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
					return EMPTY;
				}
				const { cellX, cellY, cellWidth, cellHeight } = fit;
				const { meta, canvas } = Meta.getSpriteData(name);
				if (!meta) {
					return EMPTY;
				}

				const offset = {
					x: -bigRect.minX - hotspot.x,
					y: -bigRect.minY - hotspot.y,
				};
				updateTexture(this, canvas, animationFrame, tex, cellX, cellY, cellWidth, cellHeight, offset);

		        const left = cellX * TEXTURE_CELL / TEXTURE_SIZE;
		        const right = (cellX * TEXTURE_CELL + bigRect.width-1) / TEXTURE_SIZE;
		        const top = cellY * TEXTURE_CELL / TEXTURE_SIZE;
		        const bottom = (cellY * TEXTURE_CELL + bigRect.height-1) / TEXTURE_SIZE;
	  
		        const coordinates = new Float32Array([
					left,   bottom,
					right,  bottom,
					right,  top,
					left,   top,
				]);

				texture = {
	        		coordinates,
					indexBuffer: new Float32Array(VERTICES_PER_SPRITE).fill(tex),
	        	};
			}

			let positions;
			const baseZ = -4;
			if (type === 'sprite') {
				const textureHotSpotX = -bigRect.minX;
				const textureHotSpotY = -bigRect.minY;
				const { width, height } = bigRect;

				const minSize = Math.max(width, height);
				const vertexWidth = width / minSize, vertexHeight = height / minSize;
				const vertexHotspotX = vertexWidth * textureHotSpotX / width;
				const vertexHotspotY = -vertexHeight * textureHotSpotY / height;

				const left = (0 - vertexHotspotX) * scale;
				const right = (vertexWidth - vertexHotspotX) * scale;
				const top = (-vertexHeight - vertexHotspotY) * scale;
				const bottom = (0 - vertexHotspotY) * scale;

				positions = new Float32Array([
					left, top, baseZ,
					right, top, baseZ,
					right, bottom, baseZ,
					left, bottom, baseZ,
				]);
			} else if(type === "floor") {
				positions = new Float32Array([
					0, 	0, 0 + baseZ,
					1, 	0, 0 + baseZ,
					1, 	0, -1 + baseZ,
					0,  0, -1 + baseZ,
				]);
			} else if(type === "ceiling") {
				positions = new Float32Array([
					0,  0, -1 + baseZ,
					1, 	0, -1 + baseZ,
					1, 	0, 0 + baseZ,
					0, 	0, 0 + baseZ,
				]);
			} else if(type === "leftwall") {
				positions = new Float32Array([
					0, 	0, 0 + baseZ,
					0,  0, -1 + baseZ,
					0, 	1, -1 + baseZ,
					0, 	1, 0 + baseZ,
				]);
			} else if(type === "rightwall") {
				positions = new Float32Array([
					0,  0, -1 + baseZ,
					0, 	0, 0 + baseZ,
					0, 	1, 0 + baseZ,
					0, 	1, -1 + baseZ,
				]);

			} else if(type === "wall") {
				// const textureHotSpotX = -bigRect.minX;
				// const textureHotSpotY = -bigRect.minY;
				// const { width, height } = bigRect;

				// const minSize = Math.max(width, height);
				// const vertexWidth = width / minSize, vertexHeight = height / minSize;
				// const vertexHotspotX = vertexWidth * textureHotSpotX / width;
				// const vertexHotspotY = -vertexHeight * textureHotSpotY / height;

				// const left = (0 - vertexHotspotX) * scale;
				// const right = (vertexWidth - vertexHotspotX) * scale;
				// const top = (-vertexHeight - vertexHotspotY) * scale;
				// const bottom = (0 - vertexHotspotY) * scale;

				// positions = new Float32Array([
				// 	left, top + .5, baseZ,
				// 	right, top + .5, baseZ,
				// 	right, bottom + .5, baseZ,
				// 	left, bottom + .5, baseZ,
				// ]);
				// window.ppp = positions;

				positions = new Float32Array([
					0, 	0, -1 + baseZ,
					1, 	0, -1 + baseZ,
					1, 	1, -1 + baseZ,
					0, 	1, -1 + baseZ,
				]);

			} else {
				return EMPTY;
			}
			const hash = md5(JSON.stringify({texture, positions}));
	        frameData = this.cachedFrameData[frameTag] = { texture, positions, hash };
		}

		return frameData;
	};

	WebGL2RenderingContext.prototype.getTextureFactory = function() {
		if(!this.textureFactory) {
			this.textureFactory = new TextureFactory.Factory(this);
		}
		return this.textureFactory;
	};

	Factory.prototype.getFrame = getFrame;

	return {
		Factory,
	};
})();