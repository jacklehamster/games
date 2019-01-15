const TextureFactory = (function() {
	const TEXTURE_SIZE = 4096;
	const TEXTURE_CELL = 64;
	const CELL_SIDE = TEXTURE_SIZE / TEXTURE_CELL;
	const VERTICES_PER_SPRITE = 4;
	const EMPTY = {};
	const DEFAULT = 'default';
	const EMPTY_ANIMATION = { frames: [], frameRate: 60 };

	function Factory(gl) {
		if(!Meta) {
			console.error("image_meta.js missing.");
		}

		this.gl = gl;
		this.cache = {
			cachedTextureData: {},
			cachedAnimationData: {},
		};
		this.createdTextureData = {};
		this.textures = [];
		this.textureSlots = [];
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

	function TextureData() {}
	Recycler.wrap(TextureData, function(positions, textureCoordinates, index, fit, factory) {
		const { textureLeft, textureTop, textureRight, textureBottom } = textureCoordinates;
		this.positions = positions;
		this.coordinates = new Float32Array([
			textureLeft,   textureBottom,
			textureRight,  textureBottom,
			textureRight,  textureTop,
			textureLeft,   textureTop,
		]);
		this.index = index;
		this.indexBuffer = new Float32Array(VERTICES_PER_SPRITE).fill(this.index);
		this.fit = fit;
		this.factory = factory;
	});

	TextureData.prototype.remove = function() {
		const slot = this.factory.textureSlots[this.index];
		const { cellX, cellY, cellWidth, cellHeight } = this.fit;
		clearTextureSlot(slot, cellX, cellY, cellWidth, cellHeight);
		this.recycle();
	};

	TextureData.prototype.update = function(source, offsetX, offsetY) {
		const { cellX, cellY, cellWidth, cellHeight } = this.fit;
		updateTexture(this.factory, source, this.index,
			cellX * TEXTURE_CELL + (offsetX || 0),
			cellY * TEXTURE_CELL + (offsetY || 0)
		);
	};

	TextureData.prototype.attachVideo = function(video) {
		this.video = video;
		const textureData = this;
		let lastTime = -1;
		function refreshVideo() {
		    if(textureData.video) {
		    	const { video } = textureData;
			    if(lastTime !== video.currentTime) {
			      	textureData.update(video, 0, 0);
					lastTime = video.currentTime;
				}
			    requestAnimationFrame(refreshVideo);
		    }
		}
	    requestAnimationFrame(refreshVideo);
	};

	TextureData.prototype.detachVideo = function() {
		this.video = null;
	};

	function doesFit(slot, cellX, cellY, cellWidth, cellHeight) {
		if (!slot) return true;
		for (let yy=0; yy<cellHeight; yy++) {
			for (let xx=0; xx<cellWidth; xx++) {
				if (slot[cellX + xx][cellY + yy]) return false;
			}
		}
		return true;
	}

	function getFit(textureSlots, textureIndex, width, height) {
		const cellWidth = Math.ceil(width / TEXTURE_CELL), cellHeight = Math.ceil(height / TEXTURE_CELL);
		const slot = textureSlots[textureIndex];
		for (let cellY=0; cellY<CELL_SIDE - cellHeight + 1; cellY++) {
			for (let cellX=0; cellX<CELL_SIDE - cellWidth + 1; cellX++) {
				if (doesFit(slot, cellX, cellY, cellWidth, cellHeight)) {
					return { cellX, cellY, cellWidth, cellHeight };
				}
			}
		}
		return null;
	};

	function clearTextureSlot(slot, cellX, cellY, cellWidth, cellHeight) {
		for(let yy=0; yy<cellHeight; yy++) {
			for(let xx=0; xx<cellWidth; xx++) {
				slot[cellX + xx][cellY + yy] = null;
			}
		}
	}

	function fillTextureSlot(factory, texIndex, cellX, cellY, cellWidth, cellHeight) {
		if(!factory.textureSlots[texIndex]) {
			factory.textureSlots[texIndex] = new Array(TEXTURE_SIZE).fill(0).map(elem => new Array(TEXTURE_SIZE));
		}
		const slot = factory.textureSlots[texIndex];
		for(let yy=0; yy<cellHeight; yy++) {
			for(let xx=0; xx<cellWidth; xx++) {
				if(slot[cellX + xx][cellY + yy]) {
					console.error("texture update over existing texture.");
				}
				slot[cellX + xx][cellY + yy] = true;
			}
		}
	}

	function updateTexture(factory, source, texIndex, textureX, textureY) {
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
			texture.width = TEXTURE_SIZE;
			texture.height = TEXTURE_SIZE;
			gl.bindTexture(gl.TEXTURE_2D, texture);
		  	gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, texture.width, texture.height, border, srcFormat, srcType, null);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
		} else {
			gl.bindTexture(gl.TEXTURE_2D, texture);			
		}
		gl.texSubImage2D(gl.TEXTURE_2D, level, textureX, textureY, srcFormat, srcType, source);
		gl.generateMipmap(gl.TEXTURE_2D);
	};

	function allocateTextureData(factory, x, y, width, height) {
		let fit = null, tex = 0;
		const len = Math.min(factory.textures.length, factory.textureUnits.length);
		for(tex = 0; tex <= len; tex++) {
			fit = getFit(factory.textureSlots, tex, width, height);
			if(fit) {
				break;
			}
		}
		if(!fit) {
			console.error("no fit for texture");
			return null;
		}
		const { cellX, cellY, cellWidth, cellHeight } = fit;
		fillTextureSlot(factory, tex, cellX, cellY, cellWidth, cellHeight);

		const minSize = Math.max(width, height);
		const vertexWidth = width / minSize, vertexHeight = height / minSize;
		const vertexHotspotX = vertexWidth * -x / width;
		const vertexHotspotY = -vertexHeight * -y / height;
		const left = - vertexHotspotX;
		const right = vertexWidth - vertexHotspotX;
		const top = -vertexHeight - vertexHotspotY;
		const bottom = - vertexHotspotY;
		const positions = { left, right, top, bottom };

        const textureLeft = cellX * TEXTURE_CELL / TEXTURE_SIZE;
        const textureRight = (cellX * TEXTURE_CELL + width-1) / TEXTURE_SIZE;
        const textureTop = cellY * TEXTURE_CELL / TEXTURE_SIZE;
        const textureBottom = (cellY * TEXTURE_CELL + height-1) / TEXTURE_SIZE;
        const textureCoordinates = { textureLeft, textureRight, textureTop, textureBottom, };

        return TextureData.create(positions, textureCoordinates, tex, fit, factory);
	}

	Factory.prototype.createTextureData = function(name, width, height) {
		const { createdTextureData } = this;
		createdTextureData[name];
		if (createdTextureData[name] && !createdTextureData[name].recycled) {
			createdTextureData[name].recycle();
		}
		return createdTextureData[name] = allocateTextureData(this, -width/2, -height, width, height);
	};

	Factory.prototype.getTextureData = function(name, animationTag, now) {
		const { createdTextureData } = this;
		if (createdTextureData[name]) {
			return createdTextureData[name];
		}
		const { meta, canvas } = Meta.getSpriteData(name);
		if (!meta || !canvas) {
			return null;
		}
		if (!animationTag) {
			animationTag = DEFAULT;
		}
		const { cachedAnimationData, cachedTextureData } = this.cache;
		const animationFrame = getAnimationFrame(meta, animationTag, now, cachedAnimationData);
		const frameId = animationFrame.frameId;
		if(!frameId) {
			return null;
		}

		if (cachedTextureData[animationTag] && cachedTextureData[animationTag][frameId] && !cachedTextureData[animationTag][frameId].recycled) {
			return cachedTextureData[animationTag][frameId];
		}

		const bigRect = animationFrame.bigRect;
		const textureData = allocateTextureData(this, bigRect.x, bigRect.y, bigRect.width, bigRect.height);

		const { crop, hotspot } = animationFrame;
		const imageData = canvas.getContext('2d').getImageData(crop.x, crop.y, crop.width, crop.height);

		const offsetX = hotspot ? -bigRect.x - hotspot.x : 0;
		const offsetY = hotspot ? -bigRect.y - hotspot.y : 0;
		textureData.update(imageData, offsetX, offsetY);

		if (!cachedTextureData[animationTag]) {
			cachedTextureData[animationTag] = {};
		}
		return cachedTextureData[animationTag][frameId] = textureData;
	};

	function getAnimationFrame(meta, animationTag, now, cachedAnimationData) {
		const animationData = getAnimationData(meta, animationTag, cachedAnimationData) || EMPTY_ANIMATION;
		const frame = ~~(now * animationData.frameRate / 1000);
		return animationData.frames[frame % animationData.frames.length] || EMPTY;
	}

	function getAnimationData(meta, animationTag, cachedAnimationData) {
		const metaName = meta.name;
		if (cachedAnimationData[metaName] && cachedAnimationData[metaName][animationTag]) {
		  return cachedAnimationData[metaName][animationTag];
		}

		function findAnimationForFrame(f, animation, name, bigRect) {
		  const canvasWidth = meta.canvas.width;
		  const canvasHeight = meta.canvas.height;

		  for (let i = 0; i < meta.frames.length; i++) {
		    const frame = meta.frames[i];
		    const range = frame.range.split("-");
		    const lowRange = range[0];
		    const highRange = range.length>=2 ? range[1] : lowRange;
		    if (lowRange <= f && f <= highRange) {
		        const { crop, hotspot } = frame;
		        return {
		          frameId: md5(JSON.stringify([metaName, crop])),
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

		//  get dimension of a rectangle that can contain all animations
		let minX = 0, minY = 0, maxX = 0, maxY = 0;
		for (let i=0; i<meta.frames.length; i++) {
		  const { crop, hotspot } = meta.frames[i];
		  const { x, y } = hotspot ? hotspot : {};
		  minX = Math.min(minX, - (x||0));
		  minY = Math.min(minY, - (y||0));
		  maxX = Math.max(maxX, crop.width - (x||0) - 1);
		  maxY = Math.max(maxY, crop.height - (y||0) - 1);
		}
		const bigRect = { 
			x: minX, y: minY, width: (maxX - minX) + 1, height: (maxY - minY) + 1,
		};

		const range = animation.range.split("-");
		const lowRange = parseInt(range[0]);
		const highRange = range.length>=2 ? parseInt(range[1]) : lowRange;
		if (isNaN(lowRange) || isNaN(highRange) || highRange < lowRange) {
		  return EMPTY;
		}
		const animationFrames = new Array(highRange - lowRange + 1);
		for (let i=0; i<animationFrames.length; i++) {
		  const frame = findAnimationForFrame(lowRange + i, animation, metaName, bigRect);
		  animationFrames[i] = frame;
		}
		if (!cachedAnimationData[metaName]) {
		  cachedAnimationData[metaName] = {};
		}
		return cachedAnimationData[metaName][animationTag] = {
		  frameRate: animation.frameRate,
		  frames: animationFrames,
		}
	}	

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