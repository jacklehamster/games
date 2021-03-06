const Engine = function(document, Game) {
	const DEBUG = false;
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
		'text': {
			type: 'text',
		},
		'rect': {
			type: 'rect',
		},
		'line': {
			type: 'line',
		},
	};

	let skipOneFrame = false;
	function onNewScene(scene) {
		sceneData = {};
		sceneTime = new Date().getTime();
		if(scene.init) {
			scene.init.forEach(a => {
				if (typeof(a) === 'function') {
					a(0);
				} else {
					evaluate(a, null);
				}
			});
		}
		skipOneFrame = true;
	}

	function onNewFrame(now) {
	}

	function setCanvas(canvas) {
		mainCanvas = initCanvas(canvas);
		ctx = canvas.getContext('2d');
	}

	function loadImage(src, width, height, option) {
		const img = new Image();
		const { pingpong, offset, animOffset, static } = option;
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
				if(static) {
					applyEffect(static, ctx);
				}

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
			loadInfo.count++;
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

	function loadSound(src, vol, loop, autoStart) {
		const audio = new Audio();
		audio.addEventListener('canplaythrough', e => {
			const tag = src.split("/").pop().split(".").slice(0, -1).join("");
            if(!loop) {
                loop = false;
            }
            if(!vol) {
                vol = 0.5;
            }
            audio.volume = vol;
            audio.loop = loop;
			addStock(tag, {
				tag,
				type: 'audio',
				audio,
			});
			if(autoStart && Keyboard.action.pressedOnce) {
				audio.play();
			}
			loadInfo.count++;
		});
		audio.src = src;
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
				case 'setMusic':
					{
						const song = evaluate(action[1], context);
						const loop = action[2];
						setMusic(song ? stock[song] : null, loop);
//						console.log(action, evaluate(action[1], context));
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

	const playingMusic = {};

	function setMusic(music, loop) {
		for(let m in playingMusic) {
			if(!music || m !== music.tag) {
				if(playingMusic[m]) {
					playingMusic[m].audio.pause();
					delete playingMusic[m];
				}
			}
		}
		if(!music) {
			return;
		}

		if(Keyboard.action.pressedOnce) {
			if(!playingMusic[music.tag]) {
				playingMusic[music.tag] = music;
				music.audio.play();
			}
		}
		if(loop===true || loop===false) {
			//console.log(music.tag, loop);
			music.audio.loop = loop;
		}
	}

	function playSound(sound) {
		const sfx = sound ? stock[sound] : null;
		if (sfx) {
			sfx.audio.play();
		}
	}

	let loadInfo = {
		count: 0,
		total: 0,
	};
	function loadAssets(assets) {
		assets.filter(asset => asset[0].split(".").pop()==='png')
			.forEach(asset => {
				loadInfo.total++;
				const [ src, width, height, option ] = asset;
				loadImage(src, width || 0, height || 0, option || {});
			});
		assets.filter(asset => asset[0].split(".").pop()==='mp3')
			.forEach(asset => {
				loadInfo.total++;
				const [ src, vol, loop, autoStart ] = asset;
				loadSound(src, vol, loop, autoStart);
			});
		assets.filter(asset => asset[0].split(".").pop()==='ogg')
			.forEach(asset => {
				loadInfo.total++;
				const [ src, vol, loop, autoStart ] = asset;
				loadSound(src, vol, loop, autoStart);
			});
		assets.filter(asset => asset[0].split(".").pop()==='wav')
			.forEach(asset => {
				loadInfo.total++;
				const [ src, vol, loop, autoStart ] = asset;
				loadSound(src, vol, loop, autoStart);
			});
	}

	function resizeCanvas(canvas) {
		pixelSize = Math.min(
			Math.max(1, 2 * Math.floor(window.innerWidth / canvas.width)),
			Math.max(1, 2 * Math.floor(window.innerHeight / canvas.height)),
		) / 2;
		// pixelSize = 2;
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

	function nextScene() {
		const { scenes } = Game;
		setScene(getScene() + 1);
	}

	function previousScene() {
		const { scenes } = Game;
		setScene(getScene() - 1);
	}

	function getScene() {
		const { scenes } = Game;
		return scenes.indexOf(scene);
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
		if(skipOneFrame) {
			skipOneFrame = false;
			requestAnimationFrame(refresh);
			return;
		}
		const now = new Date().getTime() - sceneTime;
		renderScene(scene, now);
		const fadeTime = evaluate(scene.fadeStart, null);
		// if(!fadeTime && now < 100) {
		// 	console.log(now, scene);
		// }
		if(fadeTime) {
			applyEffect((now - fadeTime) / 1000, ctx);
		}
		requestAnimationFrame(refresh);
	}

		// 	const imgData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
		// const data = imgData.data;
		// for(let i=0; i<data.length; i+=4) {
		// 	if(data[i].toString(16)=='ae') {
		// 		data[i+1] = parseInt(0x3e);
		// 	}
		// }
		// ctx.putImageData(imgData, 0, 0);


	function applyEffect(fade, ctx) {
		const { width, height } = ctx.canvas;
		const imgData = ctx.getImageData(0, 0, width, height);
		const data = imgData.data;
		for (let i=0; i < data.length; i++) {
			if(Math.random()< fade) {
				data[i] = 0;//0xFF;
			}			
		}
		ctx.putImageData(imgData, 0, 0);
	}

	function setDebug(div) {
		debugDiv = div;
		if(debugDiv) {
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
			return list;
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

	function clearCanvas(scene) {
		const backgroundColor = scene.backgroundColor ||  Game.settings.backgroundColor;
		if (backgroundColor) {
			canvas.style.backgroundColor = backgroundColor;
//			ctx.fillStyle = backgroundColor;
		}
		ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
	}

	function renderScene(scene, now) {
		onNewFrame(now);
		clearCanvas(scene);
		if (scene.actions) {
			scene.actions.forEach(a => {
				if(typeof(a)==='function') 
					a(now); 
				else 
					evaluate(a, null);
			});
		}
		const sprites = typeof(scene.sprites)==='function' ? scene.sprites(now) : scene.sprites;
		const renderedSprites = getRendered(sprites);
		renderedSprites.sort(compareSprites);
		renderSprites(renderedSprites, 0, 0, now, {});
		if (DEBUG) {
			renderDebug(now);

		}
	}

	function compareSprites(sprite1, sprite2) {
		const [ , , y1, option1 ] = sprite1;
		const [ , , y2, option2 ] = sprite2;
		if (option1.zOrder !== option2.zOrder) {
			return (option1.zOrder||0) - (option2.zOrder||0);
		}
		return evaluate(y1, sprite1) - evaluate(y2, sprite2);
	}

	function renderSprites(sprites, groupX, groupY, now, option) {
		sprites.forEach(spriteFormula => {
			let sprite = evaluate(spriteFormula, option);
			if (!sprite) {
				return;
			}
			window.lastSprite = sprite;
			const [ name ] = sprite;
			let nameCheck = evaluate(name, option);
			if (scene.objects && scene.objects[nameCheck]) {
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
					case 'text':
						{
							const [ , xFormula, yFormula, option ] = sprite;
							const x = evaluate(xFormula, option);
							const y = evaluate(yFormula, option);
							renderText(sprite, definition, groupX + x, groupY + y, now, option || {});
						}
						break;
					case 'rect':
						{
							const [ , xFormula, yFormula, option ] = sprite;
							const x = evaluate(xFormula, option);
							const y = evaluate(yFormula, option);
							renderRect(sprite, definition, groupX + x, groupY + y, now, option || {});
						}
						break;
					case 'line':
						{
							const [ , xFormula, yFormula, option ] = sprite;
							const x = evaluate(xFormula, option);
							const y = evaluate(yFormula, option);
							renderLine(sprite, definition, groupX + x, groupY + y, now, option || {});
						}
						break;
				}
			}
		});
	}

	function renderLine(sprite, definition, x, y, now, option) {
		const { xMove, yMove, color} = option;
		//console.log(x, y, xMove, yMove);
		ctx.strokeStyle = evaluate(color, sprite) || 'black';
		ctx.lineWidth = evaluate(option.lineWidth, sprite) || 3;
		ctx.beginPath();
		ctx.moveTo(x, y);
		ctx.lineTo(x + xMove, y + yMove);
		ctx.stroke();
	}

	function renderRect(sprite, definition, x, y, now, option) {
		const { width, height, color } = option;
		ctx.fillStyle = evaluate(color, sprite) || 'black';
		ctx.fillRect(x, y, width, height);
	}

	function renderText(sprite, definition, x, y, now, option) {
		let text = "" + evaluate(option.text);
		const speechSpeed = option.speechSpeed || 30;
		if(option.talkTime) {
			const dt = now - option.talkTime;
			text = text.substr(0, Math.floor(dt / speechSpeed));
		}
		const { alpha, color, outline } = option;
		if(text) {
			ctx.translate(0.5, 0.5);
			ctx.fillStyle = evaluate(color, sprite) || 'black';
			if(option.alpha) {
				ctx.globalAlpha = option.alpha;
			}
			const lines = text.split('\n');
			const fontSize = option.fontSize || 14;
			ctx.font = fontSize + "px Arial";
			const LINE_HEIGHT = option.lineHeight || 12;
			const centerLine = option.noCenter ? 0 : 1;
			const baseLine = - (centerLine * lines.length/2) * LINE_HEIGHT + y;
			if(outline) {
			    ctx.fillStyle = evaluate(outline, sprite) || 'black';
				for(let l=0; l<lines.length; l++) {
					ctx.fillText(lines[l], +0 + x, -1 + l*LINE_HEIGHT + baseLine);
					ctx.fillText(lines[l], +0 + x, +1 + l*LINE_HEIGHT + baseLine);
					ctx.fillText(lines[l], -1 + x, +0 + l*LINE_HEIGHT + baseLine);
					ctx.fillText(lines[l], +1 + x, +0 + l*LINE_HEIGHT + baseLine);

					// ctx.fillText(lines[l], -1 + x, -1 + l*10 - (lines.length/2) * 10 + y);
					// ctx.fillText(lines[l], -1 + x, +1 + l*10 - (lines.length/2) * 10 + y);
					// ctx.fillText(lines[l], +1 + x, -1 + l*10 - (lines.length/2) * 10 + y);
					// ctx.fillText(lines[l], +1 + x, +1 + l*10 - (lines.length/2) * 10 + y);

					// // ctx.fillText(lines[l], +0 + x, -2 + l*10 - (lines.length/2) * 10 + y);
					// // ctx.fillText(lines[l], +0 + x, +2 + l*10 - (lines.length/2) * 10 + y);
					// // ctx.fillText(lines[l], -2 + x, +0 + l*10 - (lines.length/2) * 10 + y);
					// // ctx.fillText(lines[l], +2 + x, +0 + l*10 - (lines.length/2) * 10 + y);
				}
			}

			ctx.fillStyle = evaluate(color, sprite) || 'black';
			for(let l=0; l<lines.length; l++) {
				ctx.fillText(lines[l], x, l*LINE_HEIGHT + baseLine);
			}			

			if(option.alpha) {
				ctx.globalAlpha = 1;
			}
			ctx.translate(-0.5, -0.5);
		}
	}

	function renderImage(sprite, definition, x, y, now, option) {
		if(option.after) {
			const after = evaluate(option.after);
			//console.log(now, after);
			if(now < after) {
				return;
			}
		}
		let images = (definition.coloredImages ? definition.coloredImages[option.color] : null) || definition.images;
		const { offset } = definition;
		const spriteFrameRate = option.frameRate || definition.option.frameRate || Game.settings.spriteFrameRate || 10;
		const timeStart = option.animationStart ? evaluate(option.animationStart, option) : 0;
		const timeFrame = Math.floor((now - timeStart) / 1000 * spriteFrameRate);
		let frame = evaluate(option.animated, option) ? timeFrame : (option.frame || 0);
		const repeat = option.repeat || definition.option.repeat || 0;
		if (repeat && frame >= repeat * images.length) {
			frame = images.length-1;
		}
		let frameOffset = frame;
		if(typeof(option.animMove) !== 'undefined') {
			frameOffset = evaluate(option.animMove, option) ? timeFrame : (option.frame || 0);
			if (option.repeat && frameOffset >= option.repeat * images.length) {
				frame = images.length-1;
			}
		}
		const img = images[(frame % images.length + images.length) % images.length];
		const [oX, oY] = offset[(frameOffset % images.length + images.length) % images.length];
		const xx = Math.floor(x + oX);
		const yy = Math.floor(y + oY);
		const { canvas, flipCanvas } = img;
		const shouldFlip = evaluate(option.flip, option);
		if(option.alpha) {
			ctx.globalAlpha = option.alpha;				
		}
		if(option.size) {
			ctx.drawImage(shouldFlip ? flipCanvas : canvas, xx, yy, option.size[0], option.size[1]);
		} else {
			ctx.drawImage(shouldFlip ? flipCanvas : canvas, xx, yy);
		}
		if(option.alpha) {
			ctx.globalAlpha = 1;
		}

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

	function setData(prop, data) {
		evaluate(['set', prop, data]);
	}

	document.addEventListener("DOMContentLoaded", init);

	let triggered = {};
	const triggers = {};
	const triggersOnAll = [];
	function onTrigger(trigger, callback) {
		if(typeof(trigger)==='function') {
			triggersOnAll.push(trigger);
		} else {
			if(!triggers[trigger]) {
				triggers[trigger] = [];
			}
			triggers[trigger].push(callback);
		}
	}

	function dispatchTrigger(action) {
		if(!action.trigger || !triggered[action.trigger]) {
			if(action.trigger && triggers[action.trigger]) {
				triggers[action.trigger].forEach(callback => {
					callback(action);
				});
			}
			triggersOnAll.forEach(callback => {
				console.log(action);
				callback(action);
			});
			if(action.trigger) {
				triggered[action.trigger] = true;
			}
		}
	}	



	return {
		setCanvas,
		setDebug,
		evaluate,
		stock,
		setData,
		nextScene,
		playSound,
		previousScene,
		getScene,
		loadInfo,
		onTrigger,
		dispatchTrigger,
	};
}(document, Game);
