const FLOAT_PER_VERTEX 			= 3;	//	x,y,z
const VERTICES_PER_SPRITE 		= 4;	//	4 corners

class Sprite {
	constructor() {
		Sprite.initialize(this);
	}

	static initialize(sprite) {
		sprite.recycled = false;
		sprite.pos = [ 0, 0, 0 ];
		sprite.textureData = {};
		sprite.chunkCol = 0;
		sprite.chunkRow = 0;
		sprite.type = 'sprite';
		sprite.animated = true;

		sprite.vertices = new Float32Array(FLOAT_PER_VERTEX * VERTICES_PER_SPRITE);
		sprite.textureCoordinates = new Float32Array(2 * 4);
	}

	setPosition(x, y, z) {
		this.pos[0] = x;
		this.pos[1] = y;
		this.pos[2] = z;
		return this;
	}

	setAnimated(animated) {
		this.animated = animated;
		return this;
	}

	getChunk(textureCoordinates, chunkCol, chunkRow, chunks) {
		const [ chunkCols, chunkRows ] = chunks;
		const [ textureLeft, textureRight, textureTop, textureBottom ] = textureCoordinates;
		const texWidth = textureRight - textureLeft;
		const texHeight = textureBottom - textureTop;
		chunkCol = ((chunkCol % chunkCols) + chunkCols) % chunkCols;
		chunkRow = ((chunkRow % chunkRows) + chunkRows) % chunkRows;

		const chunkLeft = textureLeft + texWidth * chunkCol / chunkCols,
			  chunkRight = textureLeft + texWidth * (chunkCol+1) / chunkCols,
			  chunkTop = textureTop + texHeight * chunkRow / chunkRows,
			  chunkBottom = textureTop + texHeight * (chunkRow + 1) / chunkRows;
		this.textureCoordinates.set([
			chunkLeft,   chunkBottom,
			chunkRight,  chunkBottom,
			chunkRight,  chunkTop,
			chunkLeft,   chunkTop,
		]);
		return this.textureCoordinates;
	}

	getVertices(cameraQuat) {
		const { vertices, type, pos } = this;
		const { verticesMap } = this.textureData;
		vertices.set(verticesMap[type] || verticesMap.default);
		this.transformVertices(vertices, type === 'sprite' ? cameraQuat : null, pos);
		return vertices;
	}

	transformVertices(vertices, cameraQuat, translateVector) {
		if (cameraQuat) {
			vec3.forEach(vertices, 0, 0, 0, vec3.transformQuat, cameraQuat);
		}
		for(let i = 0; i < vertices.length; i++) {
			vertices[i] += translateVector[i%3];
		}
	}	
	
	setTextureData(textureData) {
		this.textureData = textureData;
		return this;
	}

	setType(type) {
		this.type = type;
		return this;
	}

	setChunk(chunk) {
		const [ chunkCol, chunkRow ] = chunk ? chunk : [ 0, 0 ];
		this.chunkCol = chunkCol;
		this.chunkRow = chunkRow;
		return this;
	}

	getTextureIndex(frame) {
		const currentFrame = this.animated ? frame : 0;
		const { textures } = this.textureData;
		const { index } = textures[currentFrame % textures.length];
		return index;
	}

	getTextureCoordinates(frame) {
		const currentFrame = this.animated ? frame : 0;
		const { textures } = this.textureData;
		const { coordinates, chunks } = textures[currentFrame % textures.length];

		return this.getChunk(coordinates, this.chunkCol, this.chunkRow, chunks);
	}
}

Recycler.wrap(Sprite, Sprite.initialize);
