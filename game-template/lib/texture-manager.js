const MAX_TEXTURES = 16;

class TextureManager {
	constructor(gl, gridSlot) {
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
	}
}

injector.register("texture-manager", [ "gl", "grid-slot", TextureManager ]);
