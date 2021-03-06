/*
	Dungeon Open World Game Engine

*/

const Dowge = (function(document) {
	const scenes = {};
	const cameras = {};
	const renderings = [];
	const keyboard = [];
	function onKey(e) {
		keyboard[e.keyCode] = e.type !== "keyup";
		updateMove();
		e.preventDefault();
	}

	function setScene(name, scene) {
		scenes[name] = scene;
		renderings.forEach(rendering => {
			if(rendering.sceneName === name) {
				rendering.scene = scene;
			}
		});
	}

	function setCamera(name, camera) {
		cameras[name] = camera;
		renderings.forEach(rendering => {
			if(rendering.cameraName === name) {
				rendering.camera = camera;
			}
		});
	}

	function getScene(name) {
		return scenes[name] || null;
	}

	function getCamera(name) {
		return cameras[name] || null;
	}

	function renderCanvas(canvas, sceneName, cameraName, refreshCallback) {
		const gl = canvas.getContext('webgl');
		if (!gl) {
			alert('Unable to initialize WebGL. Your browser or machine may not support it.');
			return;
		}
		const renderer = gl.getSpriteRenderer();
		const scene = getScene(sceneName), camera = getCamera(cameraName);
		renderings.push({ canvas, cameraName, sceneName, renderer, scene, camera, refreshCallback });
	}

	let frameTime = 1000 / 60;
	let active = true, throttled = false, frameCount = 0, lastNow = 0;
	function render(now) {
		if (now - lastNow > frameTime && active) {
			for (let i=0; i < renderings.length; i++) {
				const { renderer, camera, scene, refreshCallback } = renderings[i];
				if (camera && scene && renderer) {
					if (refreshCallback) {
						refreshCallback(scene, camera, renderer, now);
					}
				    scene.refreshView(camera, now);
					renderer.drawSprites(scene.getSprites(), camera, now);
				}
			}
			lastNow = now;
		}
		requestAnimationFrame(render);
	}
	requestAnimationFrame(render);

	function onBlurChange(e) {
		const fps = e.type === 'blur' ? 24 : 60;
		frameTime = 1000 / fps;
	}

	function onVisibilityChange(e) {
		active = !document.hidden;
	}

    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("blur", onBlurChange);
    window.addEventListener("focus", onBlurChange);

	return {
		renderCanvas,
		getScene,
		getCamera,
		setScene,
		setCamera,
	};
})(document);