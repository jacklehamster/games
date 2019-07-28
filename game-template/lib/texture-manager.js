const TextureManager = (() => {
	const MAX_TEXTURES = 16;

	class TextureManager {
		constructor(gl, gridSlot, Utils, ImageSplitter, TEXTURE_SIZE) {
			this.gl = gl;
			this.glTextures = new Array(MAX_TEXTURES).fill(null).map((a, index) => {
				const glTexture = gl.createTexture();
				glTexture.width = glTexture.height = 1;
				gl.activeTexture(gl[`TEXTURE${index}`]);
				gl.bindTexture(gl.TEXTURE_2D, glTexture);
				gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, glTexture.width, glTexture.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
				return glTexture;
			});
			this.gridSlot = gridSlot;
			this.textureData = {};
			this.textureDataArray = [];
			this.Utils = Utils;
			this.ImageSplitter = ImageSplitter;
			this.TEXTURE_SIZE = TEXTURE_SIZE;
			this.cellCache = {};
			this.texIndex = 0;
		}

		static makeVerticesMap(width, height, scale) {
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
				new Float32Array([
					left, 	bottom, 0,
					right, 	bottom, 0,
					right, 	top, 	0,
					left, 	top, 	0,
				]),
			];
		}

		turnImageIntoTexture(id, src, spriteSize, options) {
			const { gl, gridSlot, glTextures, Utils, ImageSplitter, TEXTURE_SIZE, cellCache } = this;
			const data = this.getTextureData(id);

			if (!data.initialized) {
				const [ spriteWidth, spriteHeight ] = spriteSize;
				const { chunks, scale, flip } = options;

				data.initialized = true;
				data.flip = flip;
				data.textures = null;
				data.chunks = typeof(chunks) == 'number' ? [chunks,chunks] : Array.isArray(chunks) ? chunks : [ 1, 1 ];
				data.verticesMap = TextureManager.makeVerticesMap(spriteWidth, spriteHeight, scale);
				data.sentToGPU = false;

				Utils.load(src).then(img => {
					const { naturalWidth, naturalHeight } = img;
					const cols = Math.ceil(naturalWidth / spriteWidth);
					const rows = Math.ceil(naturalHeight / spriteHeight);

					const textures = [];
					ImageSplitter.splitImage(img, spriteWidth, spriteHeight, (img, col, row, canvas) => {
						const cellTag = `${img.src}_${col}_${row}`;
						let cell = cellCache[cellTag];
						if (!cell) {
							const slot = gridSlot.getSlot(spriteWidth, spriteHeight);
							const { x, y, index } = slot;

							const glTexture = glTextures[index];
							if (!glTexture) {
								console.warn("No more texture slots available.");
								gridSlot.putBackSlot(slot);
								return;
							}
							gl.activeTexture(gl[`TEXTURE${index}`]);
							gl.bindTexture(gl.TEXTURE_2D, glTexture);
							if (glTexture.width < TEXTURE_SIZE || glTexture.height < TEXTURE_SIZE) {
								glTexture.width = glTexture.height = TEXTURE_SIZE;
								gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, glTexture.width, glTexture.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
							}

							gl.texSubImage2D(gl.TEXTURE_2D, 0, x, y, gl.RGBA, gl.UNSIGNED_BYTE, canvas);
							gl.generateMipmap(gl.TEXTURE_2D);
							const textureLeft = 	x / TEXTURE_SIZE;
							const textureRight = 	x / TEXTURE_SIZE + spriteWidth / TEXTURE_SIZE;
							const textureTop = 		y / TEXTURE_SIZE;
							const textureBottom = 	y / TEXTURE_SIZE + spriteHeight / TEXTURE_SIZE;
							cellCache[cellTag] = cell = {
								index,
								coordinates: [
									textureLeft, textureRight, textureTop, textureBottom,
								],
							};
						}
						textures.push(cell);
					});

					data.textures = textures;
				});
			}		
		}

		getTextureData(id) {
			if (!this.textureData[id]) {
				this.textureDataArray.push(this.textureData[id] = {
					index: this.textureDataArray.length,
					textures: null,
				});
			}
			return this.textureData[id];
		}

		getTextureDataByIndex(index) {
			if (index === undefined) {
				return null;
			}
			return this.textureDataArray[index];
		}

		sendTexturesToGPU(shaderProgram) {
			const { gl } = this;
			for (let id in this.textureData) {
				const data = this.textureData[id];
				if (data && data.textures && !data.sentToGPU) {
					data.sentToGPU = true;

					const { textures, flip, chunks } = data;
					data.texIndex = this.texIndex;

					textures.forEach(({ index, coordinates }, frameIndex) => {
				  		if (flip) {
				  			coordinates = [
				  				coordinates[1], coordinates[0], coordinates[2], coordinates[3],
				  			];
				  		}
			  			const framePosition = this.texIndex + frameIndex;
				  		const glTextureCellLocation = gl.getUniformLocation(shaderProgram, `uTextureCell[${framePosition}]`);
				  		gl.uniform4fv(glTextureCellLocation, new Float32Array(coordinates));
						const glTextureIdLocation = gl.getUniformLocation(shaderProgram, `uTextureInfo[${framePosition}]`);
						gl.uniform3fv(glTextureIdLocation, new Float32Array([index,...chunks]));
					});
					this.texIndex += textures.length;
				}
			}
		}
	}

	injector.register("texture-manager", [ "gl", "grid-slot", "utils", "image-splitter", "texture-size", TextureManager ]);

	return TextureManager;
})();