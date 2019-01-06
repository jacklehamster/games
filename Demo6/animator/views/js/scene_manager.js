const SceneManager = (function() {

	let nextID = 0;
	function generateUID() {
		return nextID++;
	}

	function Scene() {
		this.sprites = [];
	}

	Scene.prototype.clear = function() {
		this.sprites.length = 0;
	}

	Scene.prototype.add = function(nameAndLabel, type, x, y, z) {
		const [ name, label ] = nameAndLabel.split('.');
		this.sprites.push({
			name, label: label || "default", type, x, y, z, id: generateUID(),
		});
	};

	Scene.prototype.getAllSprites = function() {
		return this.sprites;
	};

	return {
		Scene,
	};
})();