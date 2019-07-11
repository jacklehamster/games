precision mediump float;

uniform float now;
attribute vec4 aVertexPosition;
attribute vec3 aPosition;
attribute float aWave;
attribute vec4 aFrame;
attribute float aIsSprite;
attribute float aCorner;

uniform mat4 uProjectionMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uCameraRotation;
varying highp vec2 vTextureCoord;
varying highp float zDist;
varying highp float textureIndex;

uniform vec2 uTextures[800];
uniform float uTextureId[200];

void main(void) {
	float texIndex = aFrame[0];
	float totalFrames = aFrame[1];
	float fps = aFrame[2];
	float timeOffset = aFrame[3];

//	if (0.0 == mod(floor((now + timeOffset) * fps / 1000.0) - frame, totalFrames)) {
		vec4 vPos = aVertexPosition;
		if (aIsSprite == 1.0) {
			vPos = uCameraRotation * vPos;
		}
		vPos.xyz += aPosition;

		if (aWave > 0.0) {
			if (aIsSprite == 1.0) {
				vPos.y += sin(now / 100.0 + aPosition.x * 1.0 + aPosition.z * 2.0) / 8.0 * aWave;
			} else {
				vPos.y += sin(now / 100.0 + vPos.x * 1.0 + vPos.z * 2.0) / 8.0 * aWave;
			}
		}
		vec4 position = uProjectionMatrix * uViewMatrix * vPos;

//		zDist = position.z / 50.0 + abs(position.x / 30.0);
		zDist = abs(position.z / 12.0) + abs(position.y / 10.0);
	//	position.y -= (position.z * position.z + position.x * position.x) / 50.0;

		float frame = (texIndex + mod(floor((now + timeOffset) * fps / 1000.0), totalFrames));
		vTextureCoord = uTextures[int(float(aCorner + frame * 4.0))];
		textureIndex = uTextureId[int(frame)];
		gl_Position = position;
//	}
}
