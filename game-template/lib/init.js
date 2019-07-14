//	Texture size
const TEXTURE_SIZE = 4096;
injector.register("texture-size", [ () => TEXTURE_SIZE ]);

//	Anti-alias
injector.register("antialias", identity(false));

//	WebGL
injector.register("gl", [ "canvas", "antialias",
	(canvas, antialias) => {
		return canvas.getContext('webgl', {antialias});
	}
]);

//	Document
injector.register("document", identity(document));
