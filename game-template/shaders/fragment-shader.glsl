precision mediump float;

uniform float now;
uniform sampler2D uTexture[16];
varying highp vec2 vTextureCoord;
varying highp float zDist;
varying highp float textureIndex;

vec4 getTextureColor(float textureIndexFloat, vec2 vTextureCoord) {
	int textureIndex = int(floor(textureIndexFloat));
	if (textureIndex == 0) {
		return texture2D(uTexture[0], vTextureCoord);
	} else if(textureIndex == 1) {
		return texture2D(uTexture[1], vTextureCoord);
	} else if(textureIndex == 2) {
		return texture2D(uTexture[2], vTextureCoord);
	} else if(textureIndex == 3) {
		return texture2D(uTexture[3], vTextureCoord);
	} else if(textureIndex == 4) {
		return texture2D(uTexture[4], vTextureCoord);
	} else if(textureIndex == 5) {
		return texture2D(uTexture[5], vTextureCoord);				
	} else if(textureIndex == 6) {
		return texture2D(uTexture[6], vTextureCoord);
	} else if(textureIndex == 7) {
		return texture2D(uTexture[7], vTextureCoord);				
	} else if(textureIndex == 8) {
		return texture2D(uTexture[8], vTextureCoord);				
	} else if(textureIndex == 9) {
		return texture2D(uTexture[9], vTextureCoord);				
	} else if(textureIndex == 10) {
		return texture2D(uTexture[10], vTextureCoord);
	} else if(textureIndex == 11) {
		return texture2D(uTexture[11], vTextureCoord);
	} else if(textureIndex == 12) {
		return texture2D(uTexture[12], vTextureCoord);
	} else if(textureIndex == 13) {
		return texture2D(uTexture[13], vTextureCoord);				
	} else if(textureIndex == 14) {
		return texture2D(uTexture[14], vTextureCoord);
	} else if(textureIndex == 15) {
		return texture2D(uTexture[15], vTextureCoord);
	} else {
		return texture2D(uTexture[0], vTextureCoord);
	}
}

vec3 rgb2hsv(vec3 c)
{
    vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
    vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
    vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));

    float d = q.x - min(q.w, q.y);
    float e = 1.0e-10;
    return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
}

vec3 hsv2rgb(vec3 c)
{
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

vec4 alterHueSatLum(vec4 color, vec3 vHSV) {
    vec3 fragRGB = color.rgb;
    vec3 fragHSV = rgb2hsv(fragRGB).xyz;
    fragHSV.x += vHSV.x;
    fragHSV.yz *= vHSV.yz;
//    fragHSV.xyz = mod(fragHSV.xyz, 1.0);
    fragRGB = hsv2rgb(fragHSV);
    return vec4(fragRGB, color.a);
}

void main(void) {
	vec4 color = getTextureColor(textureIndex, vTextureCoord);
	if (color.w <= 0.1) {
		discard;
	}
	color = alterHueSatLum(color, vec3(1.0, 1.0, max(0.0, .8 + zDist * .4)));
//	color = alterHueSatLum(color, vec3(1.0, 1.0, now / 1000.0));
	gl_FragColor = color;
}