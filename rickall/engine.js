const Engine = function(document, Game) {

	let mainCanvas, ctx;
	let pixelSize = 1;
	let scene = null;
	let sceneTime = 0;
	let sceneData = {};
	const stock = {
		'group': {
			type: 'group',
		},
		'actions': {
			type: 'actions',
		},
	};

	function onNewScene(scene) {
		sceneData = {};
		scene.init.forEach(a => {
			if (typeof(a) === 'function') {
				a();
			} else {
				evaluate(a, null);
			}
		});
	}

	function onNewFrame(now) {
	}

	function setCanvas(canvas) {
		mainCanvas = initCanvas(canvas);
		ctx = canvas.getContext('2d');
	}

	function loadImage(src, width, height, option) {
		const img = new Image();
		const { pingpong, offset, animOffset } = option;
		const offsetX = offset ? offset.x || 0 : 0;
		const offsetY = offset ? offset.y || 0 : 0;
		let { count } = option;
		img.addEventListener('load', e => {
			const { naturalWidth, naturalHeight } = img;
			if(!width) {
				width = naturalWidth;
			}
			if(!height) {
				height = naturalHeight;
			}
			const cols = Math.ceil(naturalWidth / width);
			const rows = Math.ceil(naturalHeight / height);
			if(!count) {
				count = Math.max(cols * rows, animOffset ? animOffset.length||0 : 0);
			}
			const tag = src.split("/").pop().split(".").slice(0, -1).join("");
			const sprites = [];
			for(let index = 0; index < count; index++) {
				const x = index % cols;
				const y = Math.floor(index / cols) % rows;

				const animOffsetX = animOffset && animOffset[index%animOffset.length] ? animOffset[index%animOffset.length][0] || 0 : 0;
				const animOffsetY = animOffset && animOffset[index%animOffset.length] ? animOffset[index%animOffset.length][1] || 0 : 0;

				const cropWidth = Math.min(width, naturalWidth - x * width + 1);
				const cropHeight = Math.min(height, naturalHeight - y * height + 1);
				const canvas = document.createElement('canvas');
				canvas.width = cropWidth;
				canvas.height = cropHeight;
				const ctx = canvas.getContext('2d');
				ctx.drawImage(
					img, x * width, y * height, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight,
				);
				const flipCanvas = document.createElement('canvas');
				flipCanvas.width = cropWidth;
				flipCanvas.height = cropHeight;
				const flipCtx = flipCanvas.getContext('2d');
				flipCtx.translate(flipCanvas.width, 0);
				flipCtx.scale(-1, 1);
				flipCtx.drawImage(
					img, x * width, y * height, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight,
				);
				flipCtx.setTransform(1, 0, 0, 1, 0, 0);
				sprite = {
					type: 'img',
					images: [{
						canvas,
						flipCanvas,
					}],
					offset: [ [offsetX + animOffsetX, offsetY + animOffsetY] ],
					option,
				};
				sprites.push(addStock(`${tag}.${index}`, sprite));
			}
			const mainSprite = {
				type: 'img',
				images: sprites.map(sprite => sprite.images[0]),
				offset: sprites.map(sprite => sprite.offset[0]),
				option,
			};
			if(option.colors) {
				mainSprite.coloredImages = {};
				for (let c in option.colors) {
					const colorSwap = option.colors[c];
					mainSprite.coloredImages[colorSwap.name] = mainSprite
						.images.map(image => {
							return {
								canvas: swapColors(image.canvas, colorSwap),
								flipCanvas: swapColors(image.flipCanvas, colorSwap),
							};
						});
				}
			}
			addStock(tag, mainSprite);
		});
		img.src = src;
	}

	function swapColors(canvas, colorSwap) {
		const colorCanvas = document.createElement('canvas');
		colorCanvas.width = canvas.width;
		colorCanvas.height = canvas.height;
		const ctx = colorCanvas.getContext('2d');
		ctx.drawImage(canvas, 0, 0);
		const imgData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
		const data = imgData.data;
		for(let i=0; i<data.length; i+=4) {
			const color = (data[i] << 16) + (data[i + 1] << 8) + (data[i + 2]);
			if(colorSwap[color]) {
				const newColor = colorSwap[color];
				data[i + 0] = (newColor >> 16) % 256;
				data[i + 1] = (newColor >> 8) % 256;
				data[i + 2] = (newColor) % 256;
			}
		}
		ctx.putImageData(imgData, 0, 0);
		return colorCanvas;
	}

	function loadSound(src, vol, loop) {
	}

	function addStock(tag, sprite) {
		sprite.tag = tag;
		stock[tag] = sprite;
		return sprite;
	}

	function processSet(properties, value, root, index, context) {
		if(properties.length === 0) {
			return;
		}
		const prop = properties[index];
		if(prop==='') {
			processSet(properties, value, context, index + 1, context);
		} else if(properties.length-1 === index) {
			root[prop] = value;
		} else {
			if (!root[prop]) {
				root[prop] = {};
			}
			processSet(properties, value, root[prop], index + 1, context);
		}
	}

	function processGet(properties, root, index, context) {
		if(properties.length === 0 || !root) {
			return 0;
		}
		const prop = properties[index];
		if(prop==='') {
			return processGet(properties, context, index + 1, context);
		} else if(properties.length-1 === index) {
			return root[prop] || 0;
		} else {
			return processGet(properties, root[prop], index + 1, context);
		}
	}

	function splitProp(property) {
		return property ? property.split('.') : [];
	}

	function normalize(numbers) {
		let sumSquare = 0;
		numbers.forEach(num => sumSquare += num * num);
		return Math.sqrt(sumSquare);
	}

	function processNumbers(numbers, callback, context) {
		let total = evaluate(numbers[0], context);
		numbers.slice(1).forEach(num => total = callback(total, evaluate(num, context)));
		return total;
	}

	function ordered(numbers, canEqual, context) {
		for(let i = 1; i < numbers.length; i++) {
			const numLeft = evaluate(numbers[i-1], context);
			const numRight = evaluate(numbers[i], context);
			if(numLeft > numRight || !canEqual && numLeft==numRight) {
				return false;
			}
		}
		return true;
	}

	function disordered(numbers, canEqual, context) {
		for(let i = 1; i < numbers.length; i++) {
			const numLeft = evaluate(numbers[i-1], context);
			const numRight = evaluate(numbers[i], context);
			if(numLeft < numRight || !canEqual && numLeft==numRight) {
				return false;
			}
		}
		return true;
	}

	function checkEqual(numbers, context) {
		for(let i = 1; i < numbers.length; i++) {
			const numLeft = evaluate(numbers[i-1], context);
			const numRight = evaluate(numbers[i], context);
			if(numLeft!=numRight) {
				return false;
			}
		}
		return true;		
	}

	function evaluate(action, context) {
		if(!context) {
			context = sceneData;
		}
		let returnValue = null;
		if (typeof(action) != 'object') {
			returnValue = action;
		} else if(action && action.length) {
			const [ type ] = action;
			switch(type) {
				case 'do':
					{
						const actions = action.slice(1);
						actions.forEach(a => evaluate(a, null));
					}
					break;
				case 'if':
					{
						const [, condition, ifAction, elseCondition, elseAction ] = action;
						if (evaluate(condition, context)) {
							returnValue = evaluate(ifAction, context);
						} else if(evaluate(elseCondition, context)) {
							returnValue = evaluate(elseAction, context);
						}
					}
					break;
				case '=>':
				case 'set':
					{
						const [, property, value] = action;
						processSet(splitProp(evaluate(property, context)), evaluate(value, context), sceneData, 0, context);

					}
					break;
				case 'get':
					{
						const [, property] = action;
						returnValue = processGet(splitProp(evaluate(property, context)), sceneData, 0, context);
					}
					break;
				case '+>':
				case 'inc':
					{
						const [, property, value] = action;
						const originalValue = processGet(splitProp(evaluate(property, context)), sceneData, 0, context);
						returnValue = processSet(splitProp(evaluate(property, context)), originalValue + evaluate(value, context), sceneData, 0, context);
					}
					break;
				case 'keyboardMovement':
					{
						returnValue = Keyboard.move;
					}
					break;
				case 'normalize':
					{
						returnValue = normalize(action.slice(1).map(a => evaluate(a, context)));
					}
					break;
				case 'div':
					{
						const [, value1, value2] = action;
						returnValue = evaluate(value1, context) / evaluate(value2, context);
					}
					break;
				case '+':
				case 'add':
					{
						returnValue = processNumbers(action.slice(1).map(a => evaluate(a, context)), (a, b) => a + b, context);
					}
					break;
				case '*':
				case 'mul':
					{
						returnValue = processNumbers(action.slice(1).map(a => evaluate(a, context)), (a, b) => a * b, context);
					}
					break;
				case 'and':
					{
						returnValue = processNumbers(action.slice(1).map(a => evaluate(a, context)), (a, b) => a && b, context);
					}
					break;
				case 'or':
					{
						returnValue = processNumbers(action.slice(1).map(a => evaluate(a, context)), (a, b) => a || b, context);
					}
					break;
				case 'asc':
				case '<=':
					{
						returnValue = ordered(action.slice(1).map(a => evaluate(a, context)), true, context);
					}
					break;
				case 'desc':
				case '>=':
					{
						returnValue = disordered(action.slice(1).map(a => evaluate(a, context)), true, context);
					}
					break;
				case '<':
					{
						returnValue = ordered(action.slice(1).map(a => evaluate(a, context)), false, context);
					}
					break;
				case '=':
					{
						returnValue = checkEqual(action.slice(1).map(a => evaluate(a, context)), context);
					}
					break;
				case 'not':
					{
						returnValue = !evaluate(action[1], context);
					}
					break;
				default:
					{
						if (action.length === 1) {
							const prop = splitProp(evaluate(action[0], context));
							returnValue = processGet(prop, sceneData, 0, context);
						} else {
							returnValue = action;
						}
						return returnValue;
					}
					break;
			}
		}
		return returnValue;
	}

	function loadAssets(assets) {
		assets.filter(asset => asset[0].split(".").pop()==='png')
			.forEach(asset => {
				const [ src, width, height, option ] = asset;
				loadImage(src, width || 0, height || 0, option || {});
			});
		assets.filter(asset => asset[0].split(".").pop()==='mp3')
			.forEach(asset => {
				const [ src, vol, loop ] = asset;
				loadSound(src, vol, loop);
			});
		assets.filter(asset => asset[0].split(".").pop()==='ogg')
			.forEach(asset => {
				const [ src, vol, loop ] = asset;
				loadSound(src, vol, loop);
			});
		assets.filter(asset => asset[0].split(".").pop()==='wav')
			.forEach(asset => {
				const [ src, vol, loop ] = asset;
				loadSound(src, vol, loop);
			});
	}

	function resizeCanvas(canvas) {
		pixelSize = Math.min(
			Math.max(1, 2 * Math.floor(window.innerWidth / canvas.width)),
			Math.max(1, 2 * Math.floor(window.innerHeight / canvas.height)),
		) / 2;
		canvas.style.width = `${canvas.width * pixelSize}px`;
		canvas.style.height = `${canvas.height * pixelSize}px`;
		return canvas;
	}

	function initCanvas(canvas) {
		const { settings } = Game;
		const [ width, height ] = settings.size;
		canvas.width = width;
		canvas.height = height;
		canvas.style.backgroundColor = settings.backgroundColor;
		resizeCanvas(canvas);
	}

	function setScene(index) {
		const { scenes } = Game;
		let newScene;
		if(typeof(index) === 'string') {
			newScene = scenes.filter(s => s.name = index)[0];
		} else {
			newScene = scenes[index];
		}
		if(scene !== newScene) {
			scene = newScene;
			onNewScene(scene);
		}

		if(!scene) {
			error("No scene", index);
		}
	}

	function refresh() {
		const now = new Date().getTime() - sceneTime;
		renderScene(scene, now);
		requestAnimationFrame(refresh);
	}

	function setDebug(div) {
		debugDiv = div;
		if(!debug) {
			debugDiv.style.display = "none";
		}
	}

	function renderDebug(now) {
		if(debugDiv) {
			debugDiv.innerText = JSON.stringify([
				sceneData,
			], null, ' ');
		}
	}

	const renderList = [];
	function getRendered(sprites, list) {
		if(!list) {
			list = renderList;
			list.length = 0;
		}
		if (!sprites || !sprites.length) {
			return;
		}
		sprites.forEach(sprite => {
			sprite = evaluate(sprite, null);
			// if (sprite[0] === 'group') {
			// 	getRendered(sprite.slice(1), list);
			// }
			list.push(sprite);
		});
		return list;
	}

	function clearCanvas() {
		const { backgroundColor } = Game.settings;
		if (backgroundColor) {
			ctx.fillStyle = backgroundColor;
		}
		ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
	}

	function renderScene(scene, now) {
		onNewFrame(now);
		clearCanvas();
		if (scene.actions) {
			scene.actions.forEach(a => {
				if(typeof(a)==='function') 
					a(); 
				else 
					evaluate(a, null);
			});
		}
		const sprites = typeof(scene.sprites)==='function' ? scene.sprites() : scene.sprites;
		const renderedSprites = getRendered(sprites);
		renderedSprites.sort(compareSprites);
		renderSprites(renderedSprites, 0, 0, now, {});
		renderDebug(now);
	}

	function compareSprites(sprite1, sprite2) {
		const [ , , y1 ] = sprite1;
		const [ , , y2 ] = sprite2;
		return evaluate(y1, sprite1) - evaluate(y2, sprite2);
	}

	function renderSprites(sprites, groupX, groupY, now, option) {
		sprites.forEach(spriteFormula => {
			let sprite = evaluate(spriteFormula, option);
			if (!sprite) {
				return;
			}
			const [ name ] = sprite;
			let nameCheck = evaluate(name, option);
			if (scene.objects[nameCheck]) {
				const [ , xFormula, yFormula, option ] = sprite;
				const x = evaluate(xFormula, option);
				const y = evaluate(yFormula, option);
				renderSprites(scene.objects[nameCheck], groupX + x, groupY + y, now, option || {});
				return;
			}
			let definition = nameCheck ? stock[nameCheck] : sprite;
			if (definition) {
				switch (definition.type) {
					case 'group':
						{
							const [ , xFormula, yFormula, option, sprites ] = sprite;
							const x = evaluate(xFormula, option);
							const y = evaluate(yFormula, option);
							renderSprites(sprites, x, y, now, option);
						}
						break;
					case 'actions':
						{
							evaluate(sprite.slice(1), option);
						}
						break;
					case 'img':
						{
							const [ , xFormula, yFormula, option ] = sprite;
							const x = evaluate(xFormula, option);
							const y = evaluate(yFormula, option);
							renderImage(sprite, definition, groupX + x, groupY + y, now, option || {});
						}
						break;
				}
			}
		});
	}

	function renderImage(sprite, definition, x, y, now, option) {
		let images = (definition.coloredImages ? definition.coloredImages[option.color] : null) || definition.images;
		const { offset } = definition;
		const { spriteFrameRate } = Game.settings;
		const timeStart = option.animationStart ? evaluate(option.animationStart, option) : 0;
		const timeFrame = Math.floor((now - timeStart) / 1000 * (spriteFrameRate|| 10));
		let frame = evaluate(option.animated, option) ? timeFrame : (option.frame || 0);
		if (option.repeat && frame >= option.repeat * images.length) {
			frame = images.length-1;
		}
		let frameOffset = frame;
		if(typeof(option.animMove) !== 'undefined') {
			frameOffset = evaluate(option.animMove, option) ? timeFrame : (option.frame || 0);
			if (option.repeat && frameOffset >= option.repeat * images.length) {
				frame = images.length-1;
			}
		}
		const img = images[frame % images.length];
		const [oX, oY] = offset[frameOffset % images.length];
		const xx = Math.floor(x + oX);
		const yy = Math.floor(y + oY);
		const { canvas, flipCanvas } = img;
		const shouldFlip = evaluate(option.flip, option);
		ctx.drawImage(shouldFlip ? flipCanvas : canvas, xx, yy);
	}

	function init() {
		window.addEventListener("resize", e => resizeCanvas(canvas));
		loadAssets(Game.assets);
		initGame();
		requestAnimationFrame(refresh);
	}

	function initGame() {
		const { settings } = Game;
		setScene(settings.firstScene || 0);
	}

	document.addEventListener("DOMContentLoaded", init);

	return {
		setCanvas,
		setDebug,
		evaluate,
		stock,
	};
}(document, Game);
