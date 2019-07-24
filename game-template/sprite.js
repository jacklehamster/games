injector.register("sprite", [ 
	"utils", "recycler", "texture-manager",
	(Utils, Recycler, textureManager) => {
		const FLOAT_PER_VERTEX 			= 3;	//	x,y,z
		const VERTICES_PER_SPRITE 		= 4;	//	4 corners

		const SpriteTypes = {
			floor: 		0,
			ceiling: 	1,
			left: 		2,
			right: 		3,
			wall:       4,
			sprite: 	5,
		};

		class Sprite {
			constructor() {
				this.wave = new Float32Array(VERTICES_PER_SPRITE);
				this.frameData = new Float32Array(4 * VERTICES_PER_SPRITE);
				this.posBuffer = new Float32Array(3 * VERTICES_PER_SPRITE);
				Sprite.initialize(this);
			}

			static initialize(sprite) {
				sprite.type = 'sprite';
				sprite.definition = null;
				sprite.textureData = null;
				sprite.chunkCol = 0;
				sprite.chunkRow = 0;
				sprite.chunkIndex = Utils.get4Floats(0);
				sprite.wave.fill(0);
				sprite.frameData.fill(0);
				sprite.posBuffer.fill(0);
				sprite.slotIndex = -1;
				sprite.static = false;
				sprite.vertices = null;
				sprite.isSprite = Utils.get4Floats(1);
				sprite.hidden = false;
			}

			setDefinition(definition) {
				this.definition = definition;
				this.slotIndex = -1;
				this.static = typeof(definition.static) !== 'undefined' ? definition.static :
					!Object.values(definition).some(value => typeof(value) === 'function');
				this.setType(definition.type);
				return this;
			}

			needsRefresh() {
				return !this.static || this.slotIndex < 0;
			}

			setPosition(pos) {
				if (!vec3.exactEquals(this.posBuffer, pos)) {
					for (let i = 0; i < VERTICES_PER_SPRITE; i++) {
						this.posBuffer.set(pos, i * 3);
					}
					this.slotIndex = -1;
				}
				return this;
			}

			setTextureData(textureData) {
				if (this.textureData !== textureData) {
					this.textureData = textureData;
					this.updateChunkIndex();
					this.updateVertices();
					this.slotIndex = -1;
				}
				return this;
			}

			setHidden(hidden) {
				if (this.hidden !== hidden) {
					this.hidden = hidden;
					this.slotIndex = -1;
				}
				return this;
			}

			updateChunkIndex() {
				const { chunks } = this.textureData;
				const [ chunkCols, chunkRows ] = chunks;
				const chunk = (this.chunkCol % chunkCols) + (this.chunkRow % chunkRows) * chunkCols;
				this.chunkIndex = Utils.get4Floats(chunk);				
			}

			updateVertices() {
				const { textureData, type } = this;
				if (textureData) {
					this.vertices = textureData.verticesMap[SpriteTypes[type]];
				}
			}

			setType(type) {
				if (this.type !== type) {
					this.type = type;
					this.isSprite = Utils.get4Floats(type === 'sprite' ? 1 : 0);
					this.updateVertices();
					this.slotIndex = -1;
				}
				return this;
			}

			setChunk(chunk) {
				let chunkCol, chunkRow;
				if (!chunk) {
					chunkCol = chunkRow = 1;
				} else if (chunk.constructor === Array) {
					chunkCol = chunk[0];
					chunkRow = chunk[1];
				} else {
					chunkCol = chunkRow = chunk;
				}
				if (chunkCol != this.chunkCol || chunkRow != this.chunkRow) {
					this.chunkCol = chunkCol;
					this.chunkRow = chunkRow;
					this.updateChunkIndex();
					this.slotIndex = -1;
				}
				return this;
			}

			setWave(wave) {
				if (wave.constructor === Number) {
					if (this.wave[0] != wave) {
						this.wave.fill(wave);
						this.slotIndex = -1;
					}
				} else {
					if (!Utils.arrayEqual(this.wave, wave)) {
						this.wave.set(wave);
						this.slotIndex = -1;
					}
				}
				return this;
			}

			setFrameData(fps, timeOffset) {
				const { textures } = this.textureData;
				if (this.frameData[1] !== textures.length || this.frameData[2] !== fps || this.frameData[3] !== timeOffset) {
					const data = new Float32Array([ 0, textures.length, fps, timeOffset ]);
					for (let i = 0; i < VERTICES_PER_SPRITE; i++) {
						this.frameData.set(data, i * 4);
					}
					this.slotIndex = -1;
				}
				return this;
			}

			isVisible() {
				return !this.hidden;
			}

			static getPosition(sprite) {
				return sprite.posBuffer;
			}

			static getVertices(sprite) {
				return sprite.vertices;
			}
			
			static getChunkIndex(sprite) {
				return sprite.chunkIndex;
			}

			static getFrameData(sprite) {
				const { texIndex } = sprite.textureData;
				for (let i = 0; i < VERTICES_PER_SPRITE; i++) {
					sprite.frameData[i * 4] = texIndex;
				}
				return sprite.frameData;
			}

			static getWave(sprite) {
				return sprite.wave;
			}

			static isSprite(sprite) {
				return sprite.isSprite;
			}
		}

		Sprite.SpriteTypes = SpriteTypes;

		Recycler.wrap(Sprite, Sprite.initialize);		
		return Sprite;
	}
]);
