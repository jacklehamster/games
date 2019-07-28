injector.register("canvas-resizer", () => {

	class CanvasResizer {
		constructor(canvas) {
			this.canvas = canvas;
			addEventListener("resize", () => this.resizeCanvas());
			this.resizeCanvas();
		}

		resizeCanvas() {
			const { canvas } = this;
			const { offsetWidth, offsetHeight } = canvas.parentElement.parentElement;
			const { width, height } = canvas;
			let ratio = Math.floor(Math.min(offsetWidth / width, offsetHeight / height));
			if (ratio < 1) {
				let div = 1;
				while (1/div * width > offsetWidth || 1/div * height > offsetHeight) {
					div+= .5;
				}
				ratio = 1/div;
			}
			canvas.style.width = `${width * ratio}px`;
			canvas.style.height = `${height * ratio}px`;
		}
	}

	return CanvasResizer;
});
