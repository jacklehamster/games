(() => {


	const tests = {
		"texture-size": textureSize => {
			console.assert(textureSize === 4096, "Invalid texture size.");
		},
		"antialias": antialias => {
			console.assert(!antialias, "Should have no antialias.");
		},
		"gl": gl => {
			console.assert(gl.constructor === WebGLRenderingContext, "gl is unexpected type.");
		},
		"document": document => {
			console.assert(document === window.document, "document refers to window.document.");
		},
		"utils": Utils => {
			console.assert(Utils.delay(1000).constructor === Promise);
		},
		"worldmap": WorldMap => {
			const worldmap = new WorldMap();
			worldmap.add({id:"dummy", range:{ left:0, right:15, top:0, bottom:10}});
			worldmap.add({id:"dummy2", range:{ left:-3, right:-2, top:-3, bottom:-2}});
			worldmap.add({id:"dummy3", range:{ left:1, right:1000, top:1, bottom:2}});
			console.assert(`["dummy2"]`, JSON.stringify(Object.keys(worldmap.getArea(
				{left:-2,right:-1,top:-2,bottom:-1}
			).getElements())));
			console.assert(`["dummy","dummy3"]`, JSON.stringify(Object.keys(worldmap.getArea(
				{left:0,right:1,top:0,bottom:1}
			).getElements())));
		},
		"canvas": canvas => {
			console.assert(canvas.constructor===HTMLCanvasElement);
		},
	};





	for (const t in injector.registry) {
		if (!tests[t]) {
			console.warn(`🤨dependency: "${t}" does not have a test.`);
		}
	}

	for (const test in tests) {
		tests[test].apply(null, injector.get(test));
	}

})();