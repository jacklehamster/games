const ImageSplitter = (() => {
	const canvas = document.createElement('canvas');
	class ImageSplitter {
		static splitImage(img, spriteWidth, spriteHeight, options, callback) {
			const { rotateCC90 } = options || {};
			const { naturalWidth, naturalHeight } = img;
			const cols = Math.ceil(naturalWidth / spriteWidth);
			const rows = Math.ceil(naturalHeight / spriteHeight);

			canvas.width = rotateCC90 ? spriteHeight : spriteWidth;
			canvas.height = rotateCC90 ? spriteWidth : spriteHeight;

			const ctx = canvas.getContext('2d');

			for (let r = 0; r < rows; r++) {
				for (let c = 0; c < cols; c++) {

					ctx.save();
					if (rotateCC90) {
						ctx.translate(0, spriteWidth);
						ctx.rotate(-90 * Math.PI / 180);
					}		
					ctx.clearRect(0, 0, spriteWidth, spriteHeight);
					ctx.drawImage(img, -c * spriteWidth, -r * spriteHeight);
					ctx.restore();
					const { opaque, empty } = Utils.getImagePixelInfo(ctx);
					if (!empty) {	//	image transparent
						callback(img, c, r, canvas, { opaque });
					}
				}
			}		
		}
	};
	injector.register("image-splitter", identity(ImageSplitter));

	return ImageSplitter;
})();
