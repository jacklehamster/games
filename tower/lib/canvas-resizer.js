injector.register("canvas-resizer", () => {

	function gcd(a, b) {
	    if ( ! b) {
	        return a;
	    }
	    return gcd(b, a % b);
	};

	class CanvasResizer {
		constructor(canvas) {
			this.canvas = canvas;
			this.callback = () => {};
			addEventListener("resize", this.resize.bind(this));
			this.resize();
		}

		resize() {
			const pixelRatio = window.devicePixelRatio;
			const { canvas } = this;
			const { width, height } = canvas;
			const { offsetWidth, offsetHeight } = canvas.parentElement.parentElement;
			const divisor = gcd(width, height);
			let screenWidth = width / divisor / pixelRatio, screenHeight = height / divisor / pixelRatio;
			let mul = 1;
			while (screenWidth * mul < offsetWidth && screenHeight * mul < offsetHeight) {
				mul ++;
			}
			mul--;

			canvas.width = mul * screenWidth * pixelRatio;
			canvas.height = mul * screenHeight * pixelRatio;
			canvas.style.width = `${canvas.width / pixelRatio}px`;
			canvas.style.height = `${canvas.height / pixelRatio}px`;

			this.callback(canvas.width, canvas.height);
		}

		setCallback(callback) {
			this.callback = callback;
		}
	}

	return CanvasResizer;
});
