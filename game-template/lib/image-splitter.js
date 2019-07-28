const ImageSplitter = (() => {
	const canvas = document.createElement('canvas');
	class ImageSplitter {
		static splitImage(img, spriteWidth, spriteHeight, callback) {
			const { naturalWidth, naturalHeight } = img;
			const cols = Math.ceil(naturalWidth / spriteWidth);
			const rows = Math.ceil(naturalHeight / spriteHeight);

			canvas.width = spriteWidth;
			canvas.height = spriteHeight;
			const ctx = canvas.getContext('2d');
			for (let r = 0; r < rows; r++) {
				for (let c = 0; c < cols; c++) {
					ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
					ctx.drawImage(img, -c * spriteWidth, -r * spriteHeight);
					if (!Utils.isImageEmpty(ctx)) {	//	image transparent
						callback(img, c, r, canvas);
					}
				}
			}		
		}
	};
	injector.register("image-splitter", identity(ImageSplitter));

	return ImageSplitter;
})();
