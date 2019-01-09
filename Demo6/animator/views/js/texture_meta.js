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
		this.cache = {
			cachedTextureData: {},
			cachedAnimationData: {},
		};
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
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);			
		} else {
			gl.bindTexture(gl.TEXTURE_2D, texture);			
		}
		const { x, y, width, height } = crop;
		const imageData = canvas.getContext('2d').getImageData(x, y, width, height);
		gl.texSubImage2D(gl.TEXTURE_2D, level,
			cellX * TEXTURE_CELL + offset.x,
			cellY * TEXTURE_CELL + offset.y,
			srcFormat, srcType, imageData);
		gl.generateMipmap(gl.TEXTURE_2D);
	};

	function getTextureData(name, animationTag, now) {
		const { meta, canvas } = Meta.getSpriteData(name);
		if (!meta || !canvas) {
			return null;
		}
		const { cachedAnimationData, cachedTextureData } = this.cache;
		const animationFrame = getAnimationFrame(meta, animationTag, now, cachedAnimationData);
		const { frameId } = animationFrame;
		if(!frameId) {
			return null;
		}

		if (cachedTextureData[animationTag] && cachedTextureData[animationTag][frameId]) {
			return cachedTextureData[animationTag][frameId];
		}

		const { crop, hotspot, bigRect } = animationFrame;
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

		const left = (0 - vertexHotspotX);
		const right = (vertexWidth - vertexHotspotX);
		const top = (-vertexHeight - vertexHotspotY);
		const bottom = (0 - vertexHotspotY);

		if (!cachedTextureData[animationTag]) {
			cachedTextureData[animationTag] = {};
		}

		return cachedTextureData[animationTag][frameId] = {
			positions: {
				left, right, top, bottom,
			},
    		coordinates,
			indexBuffer: new Float32Array(VERTICES_PER_SPRITE).fill(tex),
    	};
	}

	function getAnimationFrame(meta, animationTag, now, cachedAnimationData) {
		const animationData = getAnimationData(meta, animationTag, cachedAnimationData) || emptyAnimation;
		const frame = ~~(now * animationData.frameRate / 1000);
		return animationData.frames[frame % animationData.frames.length] || EMPTY;
	}

	const emptyAnimation = { frames: [], frameRate: 60 };
	function getAnimationData(meta, animationTag, cachedAnimationData) {
		if (cachedAnimationData[meta.name] && cachedAnimationData[meta.name][animationTag]) {
		  return cachedAnimationData[meta.name][animationTag];
		}

		function findAnimationForFrame(f, animation, name, bigRect) {
		  const canvasWidth = meta.canvas.width;
		  const canvasHeight = meta.canvas.height;

		  for (let i=0; i<meta.frames.length; i++) {
		    const frame = meta.frames[i];
		    const range = frame.range.split("-");
		    const lowRange = range[0];
		    const highRange = range.length>=2 ? range[1] : lowRange;
		    if (lowRange <= f && f <= highRange) {
		        const { crop, hotspot } = frame;
		        return {
		          frameId: md5(JSON.stringify([meta.name , crop])),
		          crop,
		          hotspot,
		          bigRect,
		        };
		    }
		  }
		  return {};
		}

		function findTag(rows, tag, defaultSelection) {
		  for(let i=0; i<rows.length; i++) {
		    if(rows[i].label===tag) {
		      return i;
		    }
		  }
		  return defaultSelection;
		}

		const rows = meta.animation.rows;
		const selected = findTag(rows, animationTag, 0);
		const animation = rows[selected];

		const range = animation.range.split("-");
		const lowRange = parseInt(range[0]);
		const highRange = range.length>=2 ? parseInt(range[1]) : lowRange;
		if (isNaN(lowRange) || isNaN(highRange) || highRange < lowRange) {
		  return EMPTY;
		}
		//  get dimension of a rectangle that can contain all animations
		const bigRect = { minX: 0, minY: 0, maxX: 0, maxY: 0, width: 0, height: 0 };
		for(let i=0; i<meta.frames.length; i++) {
		  const { crop, hotspot } = meta.frames[i];
		  bigRect.minX = Math.min(bigRect.minX, -hotspot.x);
		  bigRect.minY = Math.min(bigRect.minY, -hotspot.y);
		  bigRect.maxX = Math.max(bigRect.maxX, crop.width-hotspot.x-1);
		  bigRect.maxY = Math.max(bigRect.maxY, crop.height-hotspot.y-1);
		}
		bigRect.width = (bigRect.maxX - bigRect.minX) + 1;
		bigRect.height = (bigRect.maxY - bigRect.minY) + 1;

		const animationFrames = new Array(highRange - lowRange + 1);
		for(let i=0; i<animationFrames.length; i++) {
		  const f = lowRange + i;
		  const frame = findAnimationForFrame(f, animation, meta.name, bigRect);
		  animationFrames[i] = frame;
		}
		if (!cachedAnimationData[meta.name]) {
		  cachedAnimationData[meta.name] = {};
		}

		return cachedAnimationData[meta.name][animationTag] = {
		  frameRate: animation.frameRate,
		  frames: animationFrames,
		}
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