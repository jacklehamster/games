precision mediump float;

uniform float now;
uniform sampler2D uTexture[16];
varying highp vec2 vTextureCoord;
varying highp float zDist;
varying highp float textureIndex;

vec4 getTextureColor(float textureIndexFloat, vec2 vTextureCoord) {
	int textureIndex = int(floor(textureIndexFloat));
	for (int i = 0; i < 16; ++i) {
		if (textureIndex == i) {
			return texture2D(uTexture[i], vTextureCoord);
		}
	}
	return texture2D(uTexture[0], vTextureCoord);
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
    fragRGB = hsv2rgb(fragHSV);
    return vec4(fragRGB, color.a);
}

void main(void) {
	vec4 color = getTextureColor(textureIndex, vTextureCoord);
	if (color.w <= 0.1) {
		discard;
	}
	color = alterHueSatLum(color, vec3(1.0, 1.0, max(0.0, .8 + zDist * .4)));
	gl_FragColor = color;
}