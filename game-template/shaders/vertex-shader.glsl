precision mediump float;

const int MAX_CHUNKS = 400;
const float SECOND_TO_MILLIS = 1000.0;

uniform float now;
attribute vec4 aVertexPosition;
attribute vec3 aPosition;
attribute float aWave;
attribute vec4 aFrame;
attribute float aIsSprite;
attribute float aCorner;
attribute float aChunk;

uniform mat4 uProjectionMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uCameraRotation;

varying highp vec2 vTextureCoord;
varying highp float zDist;
varying highp float textureSlot;

uniform vec4 uTextureCell[MAX_CHUNKS];
uniform vec3 uTextureInfo[MAX_CHUNKS];

vec4 getChunkCell(vec4 textureCell, float chunk, float chunkCols, float chunkRows) {
	float col = mod(chunk, chunkCols);
	float row = floor(chunk / chunkCols);

    float left = textureCell.x;
    float right = textureCell.y;
    float top = textureCell.z;
    float bottom = textureCell.w;

    float leftChunk = left + (right - left) * col / chunkCols;
    float rightChunk = left + (right - left) * (col + 1.0) / chunkCols;
    float topChunk = top + (bottom - top) * row / chunkRows;
    float bottomChunk = top + (bottom - top) * (row + 1.0) / chunkRows;

    return vec4(leftChunk, rightChunk, topChunk, bottomChunk);
}

float getSinWaveOffset(float now, vec3 pos, float wave) {
	return sin(now / 100.0 + pos.x * 1.0 + pos.z * 2.0) / 8.0 * aWave;
}

float getFrame(float time, float fps, float totalFrames) {
	return mod(time * fps / SECOND_TO_MILLIS, totalFrames);
}

void main(void) {
	float texIndex = aFrame[0];
	float totalFrames = aFrame[1];
	float fps = aFrame[2];
	float timeOffset = aFrame[3];
	float frame = texIndex + getFrame(now + timeOffset, fps, totalFrames);

	vec4 vPos = aVertexPosition;

	//	Make sprite face camera
	if (aIsSprite == 1.0) {
		vPos = uCameraRotation * vPos;
	}
	vPos.xyz += aPosition;

	//	Apply sin wave
	if (aWave > 0.0) {
		vPos.y += getSinWaveOffset(now, aIsSprite == 1.0 ? aPosition : vPos.xyz, aWave);
	}

	vec4 position = uProjectionMatrix * uViewMatrix * vPos;
	position.y -= (position.z * position.z + position.x * position.x) / 1000.0;

	vec3 textureInfo = uTextureInfo[int(frame)];
	textureSlot = textureInfo[0];
	
	vec4 chunkCell = getChunkCell(uTextureCell[int(frame)], aChunk, textureInfo[1], textureInfo[2]);
    float left = chunkCell.x;
    float right = chunkCell.y;
    float top = chunkCell.z;
    float bottom = chunkCell.w;

    if (aCorner == 0.0) {
    	vTextureCoord = vec2(left, bottom);
	} else if (aCorner == 1.0) {
    	vTextureCoord = vec2(right, bottom);
	} else if (aCorner == 2.0) {
    	vTextureCoord = vec2(right, top);
	} else if (aCorner == 3.0) {
    	vTextureCoord = vec2(left, top);
	}

	zDist = abs(position.z / 12.0) + abs(position.y / 10.0);
	gl_Position = position;
}
