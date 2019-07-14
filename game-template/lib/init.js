//	Texture size
const TEXTURE_SIZE = 4096;
injector.register("texture-size", [ () => TEXTURE_SIZE ]);

//	WebGL
injector.register("gl", [ "canvas", canvas => {
	const gl = canvas.getContext('webgl', {antialias: false});
	gl.enable(gl.BLEND);
	gl.enable(gl.DEPTH_TEST);
	gl.enable(gl.CULL_FACE);

	gl.cullFace(gl.BACK);
	gl.depthFunc(gl.LEQUAL);
	gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);	

	return gl;
}]);

//	Document
injector.register("document", [identity(document)]);
