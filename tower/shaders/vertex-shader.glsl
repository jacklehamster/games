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
varying highp float isOpaque;

uniform vec4 uTextureCell[MAX_CHUNKS];
uniform vec4 uTextureInfo[MAX_CHUNKS];

vec4 getChunkCell(vec4 textureCell, float chunk, float chunkCols, float chunkRows) {
	if (chunkCols == 1.0 && chunkRows == 1.0) {
		return textureCell;
	}
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

float rand(vec2 co){
    return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}

void main(void) {
	float frameStart = 	aFrame[0];
	float totalFrames = aFrame[1];
	float fps = 		aFrame[2];
	float timeOffset = 	aFrame[3];
	int frame = int(frameStart + getFrame(now + timeOffset, fps, totalFrames));

	vec4 vPos = aVertexPosition;

	//	Make sprite face camera
	bool isSprite = aIsSprite == 1.0;
	if (isSprite) {
		vPos = uCameraRotation * vPos;
	}
	vPos.xyz += aPosition;

	//	Apply sin wave
	if (aWave > 0.0) {
		vPos.y += getSinWaveOffset(now, isSprite ? aPosition : vPos.xyz, aWave);
	}

	//	curvature of the earth
	vec4 position = uProjectionMatrix * uViewMatrix * vPos;
//	position.y -= (position.x * position.x) * 30.0 / 100.0 - position.z/3.0;
	position.y += (position.x * position.x) * 30.0 / 100.0 - position.z/3.0;
//	position.y -= (position.x * position.x) / 100.0 * 5.0;

	vec4 textureInfo = uTextureInfo[frame];
	textureSlot = floor(textureInfo[0]);
	
	vec4 chunkCell = getChunkCell(uTextureCell[frame], aChunk, textureInfo[1], textureInfo[2]);
	isOpaque = textureInfo[3];
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

	zDist = max(abs(position.x * 1.2), (abs(position.z / 12.0) + abs(position.y / 10.0)) * 1.4);
	gl_Position = position;
}
