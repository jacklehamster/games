const KeyboardHandler = (() => {
	const actions = { ax:0, ay:0, a:0 };
	const LEFT = 37;
	const RIGHT = 39;
	const UP = 38;
	const DOWN = 40;
	const A = 65;
	const D = 68;
	const W = 87;
	const S = 83;
	const Q = 81;
	const E = 69;

	function makeKeys() {
		const callback = this.callback;
		const keys = new Array(256).fill(false);
		document.addEventListener('keydown', e => {
			const { keyCode } = e;
			if (!keys[keyCode]) {
				keys[keyCode] = true;
				KeyboardHandler.callback(keyCode, true, keys);
			}
			e.preventDefault();
		});

		document.addEventListener('keyup', e => {
			const { keyCode } = e;
			if (keys[keyCode]) {
				keys[keyCode] = false;
				KeyboardHandler.callback(keyCode, false, keys);
			}
			e.preventDefault();
		});
		return keys;
	}

	class KeyboardHandler {
		static setOnKey(fun) {
			KeyboardHandler.callback = fun;
		}

		static getActions() {
			let ax = 0, ay = 0, rot = 0;
			const { keys } = KeyboardHandler;
			if(keys[DOWN] || keys[S]) {
				ay--;
			}
			if(keys[UP] || keys[W]) {
				ay++;
			}
			if(keys[LEFT] || keys[A]) {
				ax--;
			}
			if(keys[RIGHT] || keys[D]) {
				ax++;
			}
			if(keys[Q]) {
				rot--;
			}
			if(keys[E]) {
				rot++;
			}
			actions.ax = ax;
			actions.ay = ay;
			actions.rot = rot;
			return actions;
		}

		static clear() {
			KeyboardHandler.keys.forEach((dummy,index,keys) => keys[index] = false);
		}
	}

	KeyboardHandler.keys = makeKeys();
	KeyboardHandler.callback = (code, down, keys) => {};

	injector.register("keyboard", identity(KeyboardHandler));
	return KeyboardHandler;
})();
