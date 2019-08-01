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
		"keyboard": Keyboard => {
			const Keyboard_W = 87;
			let lastCall = null;
			Keyboard.setOnKey((keyCode, isDown, keys) => {
				lastCall = [keyCode, isDown, keys];
			});
			document.dispatchEvent(new KeyboardEvent('keydown',{keyCode:Keyboard_W}));
			console.assert(lastCall[0] === 87);
			console.assert(lastCall[1]);
			console.assert(Keyboard.keys[87]);
			console.assert(Keyboard.keys.filter(a=>a).length === 1);
			Keyboard.clear();
		},
		"image-splitter": ImageSplitter => {
			const img = new Image();
			img.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAADCAIAAAA7ljmRAAAAGElEQVQIW2P4DwcMDAxAfBvMAhEQMYgcACEHG8ELxtbPAAAAAElFTkSuQmCC";
			img.addEventListener("load", e => {
				const calls = [];
				ImageSplitter.splitImage(img, 2, 1, (img, c, r, canvas) => {
					calls.push([img, c, r, canvas]);
				});
				console.assert(calls.length === 6);
				console.assert(calls.every(([img, c, r, canvas]) => canvas.width === 2 && canvas.height === 1));
			});
		},
		"recycler": Recycler => {
			class TempClass {
				static initialize(item, value) {
					item.initializeValue = value;
				}
			}

			Recycler.wrap(TempClass, TempClass.initialize);
			const item = TempClass.create("test");
			console.assert(item.constructor === TempClass);
			console.assert(item.initializeValue === "test");
		},
		"canvas-resizer": CanvasResizer => {

		},
		"grid-slot": GridSlot => {

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