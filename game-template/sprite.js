const FLOAT_PER_VERTEX 			= 3;	//	x,y,z
const VERTICES_PER_SPRITE 		= 4;	//	4 corners

const SpriteTypes = {
	floor: 0,
	ceiling: 1,
	left: 2,
	right: 3,
	sprite: 4,
};

class Sprite {
	constructor() {
		this.pos = vec3.create();
		this.textureCoordinates = new Float32Array(2 * VERTICES_PER_SPRITE);
		this.wave = new Float32Array(VERTICES_PER_SPRITE);
		this.frameData = new Float32Array(4 * VERTICES_PER_SPRITE);
		this.posBuffer = new Float32Array(3 * VERTICES_PER_SPRITE);
		Sprite.initialize(this);
	}

	static initialize(sprite) {
		sprite.options = null;
		vec3.set(sprite.pos, 0, 0, 0);
		sprite.textureData = null;
		sprite.chunkCol = 0;
		sprite.chunkRow = 0;
		sprite.type = 'sprite';
		sprite.typeIndex = SpriteTypes[sprite.type];
		sprite.textureCoordinates.fill(0);
		sprite.wave.fill(0);
		sprite.frameData.fill(0);
		sprite.posBuffer.fill(0);
		sprite.slotIndex = -1;
		sprite.static = false;
	}

	setOptions(options) {
		this.options = options;
		this.slotIndex = -1;
		this.static = !Object.values(options).some(value => typeof(value) === 'function');
		return this;
	}

	needsRefresh() {
		return !this.static || this.slotIndex < 0;
	}

	setPosition(pos) {
		if (!vec3.exactEquals(this.pos, pos)) {
			this.pos.set(pos);
			for (let i = 0; i < VERTICES_PER_SPRITE; i++) {
				this.posBuffer.set(pos, i * 3);
			}
			this.slotIndex = -1;
		}
		return this;
	}

	getPosition() {
		return this.posBuffer;
	}

	getVertices() {
		const { textureData, typeIndex } = this;
		return textureData.verticesMap[typeIndex];
	}
	
	setTextureData(textureData) {
		if (this.textureData !== textureData) {
			this.textureData = textureData;
			this.slotIndex = -1;
		}
		return this;
	}

	setType(type) {
		if (this.type !== type) {
			this.type = type;
			this.typeIndex = SpriteTypes[type];
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
			this.slotIndex = -1;
		}
		return this;
	}

	getChunkIndex() {
		const { chunks } = this.textureData;
		const [ chunkCols, chunkRows ] = chunks;
		return (this.chunkCol % chunkCols) + (this.chunkRow % chunkRows) * chunkCols;
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

	getFrameData() {
		const { texIndex } = this.textureData;
		for (let i = 0; i < VERTICES_PER_SPRITE; i++) {
			this.frameData[i * 4] = texIndex;
		}
		return this.frameData;
	}

	getWave() {
		return this.wave;
	}
}

Recycler.wrap(Sprite, Sprite.initialize);
