const Utils = (function() {
    function getCrop(canvas) {
    	const context = canvas.getContext('2d');
		const { width, height } = canvas;
		const data = context.getImageData(0, 0, width, height).data;

		let minX, minY, maxX, maxY;
		for(minY=0; minY<height; minY++) {
			if(!emptyRow(data, width, height, minY)) {
				break;
			}
		}
		for(minX=0; minX<width; minX++) {
			if(!emptyCol(data, width, height, minX)) {
			  break;
			}
		}
		for(maxY=height-1; maxY>=0; maxY--) {
			if(!emptyRow(data, width, height, maxY)) {
			  break;
			}
		}
		for(maxX=width-1; maxX>=0; maxX--) {
			if(!emptyCol(data, width, height, maxX)) {
			  break;
			}
		}
		return { minX, minY, maxX, maxY, };
	}

	function camelCase(property) {
		return property.charAt(0).toUpperCase() + property.slice(1);
	}

	function createAccessors(classObj, properties) {
		properties.forEach(property => {
			classObj.prototype[`set${camelCase(property)}`] = function(value) {
				this[property] = value;
				return this;
			};

			classObj.prototype[`get${camelCase(property)}`] = function() {
				return this[property];
			};
		});
	}

	return {
		getCrop,
		createAccessors,
	};
})();
