const MAX_TEXTURES = 16;

class TextureManager {
	constructor(gl, gridSlot, Utils, ImageSplitter, TEXTURE_SIZE) {
		this.gl = gl;
		this.glTextures = new Array(MAX_TEXTURES).fill(null).map((a, index) => {
			const glTexture = gl.createTexture();
			glTexture.width = glTexture.height = 1;
			gl.bindTexture(gl.TEXTURE_2D, glTexture);
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, glTexture.width, glTexture.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
			gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
			return glTexture;
		});
		this.gridSlot = gridSlot;
		this.textureData = {};
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
		];
	}

	turnImageIntoTexture(id, src, spriteSize, options) {
		const { gl, gridSlot, glTextures, Utils, ImageSplitter, TEXTURE_SIZE, cellCache } = this;
		if (!this.textureData[id]) {
			const [ spriteWidth, spriteHeight ] = spriteSize;
			const { chunks, scale, flip } = options;
			this.textureData[id]= {
				flip,
				textures : null,
				chunks: typeof(chunks) == 'number' ? [chunks,chunks] : Array.isArray(chunks) ? chunks : [ 1, 1 ],
				verticesMap: TextureManager.makeVerticesMap(spriteWidth, spriteHeight, scale),
				sentToGPU: false,
			};

			Utils.load(src).then(img => {
				const { naturalWidth, naturalHeight } = img;
				const cols = Math.ceil(naturalWidth / spriteWidth);
				const rows = Math.ceil(naturalHeight / spriteHeight);

				const textures = [];
				ImageSplitter.splitImage(img, spriteWidth, spriteHeight, (img, col, row, canvas) => {
					const cellTag = `${img.src}_${col}_${row}`;
					let cell = cellCache[cellTag];
					if (!cell) {
						cell = gridSlot.getSlot(spriteWidth, spriteHeight);

						const glTexture = glTextures[cell.index];
						if (!glTexture) {
							console.warn("No more texture slots available.");
							gridSlot.putBackSlot(cell);
							return;
						}
						gl.bindTexture(gl.TEXTURE_2D, glTexture);
						if (glTexture.width < TEXTURE_SIZE || glTexture.height < TEXTURE_SIZE) {
							gl.activeTexture(gl[`TEXTURE${cell.index}`]);
							glTexture.width = glTexture.height = TEXTURE_SIZE;
							gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, glTexture.width, glTexture.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
						}

						gl.texSubImage2D(gl.TEXTURE_2D, 0, cell.x, cell.y, gl.RGBA, gl.UNSIGNED_BYTE, canvas);
						gl.generateMipmap(gl.TEXTURE_2D);
						cellCache[cellTag] = cell;
					}
					textures.push(cell);
				});

				this.textureData[id].textures = textures.map(({ x, y, index }) => {
					const textureLeft = 	x / TEXTURE_SIZE;
					const textureRight = 	x / TEXTURE_SIZE + spriteWidth / TEXTURE_SIZE;
					const textureTop = 		y / TEXTURE_SIZE;
					const textureBottom = 	y / TEXTURE_SIZE + spriteHeight / TEXTURE_SIZE;
					return {
						index,
						coordinates: [
							textureLeft, textureRight, textureTop, textureBottom,
						],
					};
				});;
			});
		}		
	}

	getTextureData(id) {
		return this.textureData[id];
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
			  			const temp = coordinates[0];
			  			coordinates[0] = coordinates[1];
			  			coordinates[1] = temp;
			  		}

			  		const glTextureCellLocation = gl.getUniformLocation(shaderProgram, `uTextureCell[${this.texIndex + frameIndex}]`);
			  		gl.uniform4fv(glTextureCellLocation, new Float32Array(coordinates));
					const glTextureIdLocation = gl.getUniformLocation(shaderProgram, `uTextureInfo[${this.texIndex + frameIndex}]`);
					gl.uniform3fv(glTextureIdLocation, new Float32Array([index,...chunks]));
				});
				this.texIndex += textures.length;
			}
		}
	}
}

injector.register("texture-manager", [ "gl", "grid-slot", "utils", "image-splitter", "texture-size", TextureManager ]);
