const Keyboard = (() => {
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

	class Keyboard {
		static makeKeys() {
			const callback = this.callback;
			const keys = [];
			document.addEventListener('keydown', e => {
				if (!keys[e.keyCode]) {
					keys[e.keyCode] = true;
					Keyboard.callback(e.keyCode, true, keys);
				}
				e.preventDefault();
			});

			document.addEventListener('keyup', e => {
				if (keys[e.keyCode]) {
					keys[e.keyCode] = false;
					Keyboard.callback(e.keyCode, false, keys);
				}
				e.preventDefault();
			});
			return keys;
		}

		static setOnKey(fun) {
			Keyboard.callback = fun;
		}

		static getActions() {
			let ax = 0, ay = 0, rot = 0;
			const { keys } = Keyboard;
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
	}

	Keyboard.keys = Keyboard.makeKeys();
	Keyboard.callback = (code, down, keys) => {
	//	console.log(code, down);
	};

	injector.register("keyboard", identity(Keyboard));
	return Keyboard;
})();

