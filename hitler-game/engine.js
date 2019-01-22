const Game = function(document, game) {
	const VIEWPORT_SIZE = 480;
	const { scenes, assets } = game;
	const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.!;,'?".split("");
	let canvas;
	let context;
	const stock = {
		'cross-cursor': {
			type: 'cross-cursor',
		},
	};
	window.stock = stock;
	const loaded = {};
	let scene = {};
	let exitTime = 0;
	let dropTimes = {};
	let newSceneTime = 0;
	const vars = {};
	let openInventory = 0;
	let closeInventory = 0;
	let needInventoryExit = false;
	let inventory = [];
	let itemSelected = null;
	let mousePos = { x: 0, y: 0 };
	let fadeColor = null;
	let replacedSprite = {};
	let tipTime = 0;
	let tip = "";
	let spriteShown = {};
	let tipsViewed = {};

	function loadImage(src, width, height, count) {
		const img = new Image();
		img.addEventListener('load', e => {
			let img = e.currentTarget;
			const { naturalWidth, naturalHeight } = img;


			const canvas = document.createElement('canvas');
			const ctx = canvas.getContext('2d');
			canvas.width = naturalWidth;
			canvas.height = naturalHeight;
			ctx.drawImage(img, 0, 0);
			replaceCanvasColor(ctx);
			img = canvas;


			if(!width) {
				width = naturalWidth;
			}
			if(!height) {
				height = naturalHeight;
			}
			const cols = Math.ceil(naturalWidth / width), rows = Math.ceil(naturalHeight / height);
			const name = src.split('/').pop().split('.')[0];
			for (let y=0; y<rows; y++) {
				for (let x=0; x<cols; x++) {
					const index = y * cols + x;
					if(count && index >= count) {
						continue;
					}
					const tag = `${name}.${index}`;
					stock[tag] = {
						type: 'img',
						name,
						img,
						index,
						total: count || cols * rows,
						imgX: x * width,
						imgY: y * height,
						imgWidth: width,
						imgHeight: height,
					};
				}
			}
			stock[name] = {
				img,
				type: 'animation',
				name,
				count: count || cols * rows,
			};
		});
		img.src = src;		
	}

	function spritesFromRollingText(text, time) {
		const x = getFrame(24, time), y = 2;
		return [
			["text", canvas.width - 1 - x, y, text],
		];
	}

	function renderScene(context, scene) {
		clearCanvas(scene.background);
		spriteShown = {};
		const { sprites } = scene;
		if(sprites) {
			renderSprites(context, sprites, 0, 0);
		}
		renderInventory(context);
		if(tip) {
			renderSprites(context, spritesFromRollingText(tip, tipTime));
		}
		applyFade(context,scene);
//		replaceColor(context);
	}

	function replaceCanvasColor(ctx) {
		const imgData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
		const data = imgData.data;
		for(let i=0; i<data.length; i+=4) {
			if(data[i].toString(16)=='ae') {
				data[i+1] = parseInt(0x3e);
			}
		}
		ctx.putImageData(imgData, 0, 0);
	}

	function replaceColor(color) {
		if(color===0xae5e32) {
			return 0xae3e32;
		} else if(color==='#ae5e32') {
			return '#ae3e32';
		}
		return color
	}

	function getInventorySprites() {
		const sprites = [
			["inventory"],
		];
		inventory.forEach(item => {
			const itemTag = item + "-inventory";
			if(itemSelected !== item && (needInventoryExit || getFrame(50) % 4 !== 0 || !coverImage(stock[itemTag].img, mousePos.x, mousePos.y))) {
				sprites.push([itemTag]);
			}
		});
		return sprites;
	}

	function renderInventory(context) {
		if (openInventory) {
			const frame = getFrame(10, openInventory);
			const offsetY = Math.max(0, 12-frame);
			renderSprites(context, getInventorySprites(), 0, offsetY);
		} else if(closeInventory) {
			const frame = getFrame(10, closeInventory);
			const offsetY = Math.max(0, frame);
			renderSprites(context, getInventorySprites(), 0, offsetY);
			if(frame > 12) {
				closeInventory = 0;
			}
		}
	}

	function applyOverlay(ctx, color, alpha) {
		if(alpha > 0.0) {
			const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
			const data = imgData.data;
			color = replaceColor(color);
			const R = Math.floor(color / 256 / 256) % 256;
			const G = Math.floor(color / 256) % 256;
			const B = Math.floor(color) % 256;
			for(let i=0; i<data.length; i+=4) {
				if(Math.random() < alpha) {
					data[i] = R;
					data[i+1] = G;
					data[i+2] = B;
				}
			}
			ctx.putImageData(imgData, 0, 0);
		}
	}

	function applyFade(context, scene) {
		if(typeof(scene.fadeIn) !== 'undefined') {
			const frame = getFrame(18);
			if(frame < 100) {
				// context.fillStyle = scene.fadeIn;
				const alpha = (1 - frame / 100);
				// if(Math.random()<alpha) {
				//     context.fillRect(0,0,canvas.width,canvas.height);
				// }
				applyOverlay(context, scene.fadeIn, alpha);
			}
		}
		if(fadeColor !== null) {			
			const frame = getFrame(18, exitTime);
			const alpha = frame / 100;
			applyOverlay(context, fadeColor, alpha);				
			if(frame >= 200 && exitTime) {
				setScene(getSceneIndex(nextScene));
				exitTime = 0;
			}
		}
	}

	function getSceneIndex(nextScene) {
		if(typeof(nextScene) === 'string') {
			const targetScene = scenes.filter(scene => scene.name === nextScene)[0];
			return targetScene ? scenes.indexOf(targetScene) : 0;
		} else if(typeof(nextScene) === 'number') {
			return scenes.indexOf(scene) + nextScene;
		} else {
			return 0;
		}
	}

	function getVar(prop) {
		return vars[prop];
	}

	function renderSprites(context, sprites, offsetX, offsetY) {
		for(let i=0; i<sprites.length; i++) {
			let [ id, x, y, param, option ] = sprites[i];
			if(param==='ifselected') {
				if(itemSelected !== option) {
					continue;
				}
			}
			if(param==='ifvar') {
				if(!vars[option]) {
					continue;
				}
			}
			if(replacedSprite[id]) {
				id = replacedSprite[id];
			}
			if(param==='appendvar') {
				const val = option;
				id += '.' + (getVar(val) || 0);
			}
			const [ baseId, extra ] = id.split("/");
			if(extra === 'cursor') {
				x += Math.floor(mousePos.x);
				y += Math.floor(mousePos.y);
				id = baseId;
			}
			spriteShown[id] = true;
			renderObj(context, stock[id] || id, (x||0) + (offsetX||0), (y||0) + (offsetY||0), param, option);
		}
	}

	function renderObj(context, obj, x, y, param, option) {
		if(obj) {
			const type = obj.type || obj;
			switch(type) {
				case 'animation':
					renderAnimation(context, obj.name, obj.count, x, y, param, option);
					break;
				case 'img':
					let offsetX = 0, offsetY = 0;
					if(param === "from-top") {
						offsetY = Math.min(0, -30 + getFrame(50));
					} else if(param==='from-right') {
						offsetX = Math.max(0, 30 - getFrame(50));
					}
					const { img, imgX, imgY, imgWidth, imgHeight } = obj;
					context.drawImage(img, imgX, imgY, imgWidth, imgHeight, x + offsetX, y + offsetY, imgWidth, imgHeight);
					break;
				case 'group':
					renderSprites(context, param, x, y);
					break;
				case 'text':
					renderSprites(context, spritesFromText(param, option), x, y);
					break;
				case 'cross-cursor':
					renderCrossCursor(context, mousePos.x, mousePos.y);
					break;
				default:
					break;
			}
		}
	}

	function renderCrossCursor(ctx, x, y) {
		if(!onInventory()) {
			x = Math.floor(x);
			y = Math.floor(y);
			const COLORS = ['white', 'black', null];
			const color = COLORS[Math.floor(Math.random() * COLORS.length)];
			if(color) {
				ctx.fillStyle = color;
				ctx.fillRect( x, 0, 1, canvas.height-1);
				ctx.fillRect( 0, y, canvas.width-1, 1);
			}
		}
	}

	function getFrame(period, firstTime) {
		if(typeof(firstTime)==='undefined') {
			firstTime = newSceneTime;
		}
		const time = (new Date().getTime() - firstTime);
		const frame = Math.floor(time / period);
		return frame;
	}

	function renderAnimation(context, name, count, x, y, param, option) {
		let frame = 0;
		if(dropTimes[name]) {
			frame = getFrame(10, dropTimes[name]);
		} else {
			frame = getFrame(scene.frameRate ? 1000 / scene.frameRate : 150);			
		}
		if(param==='loop') {
			frame = frame % count;
		} else {
			frame = Math.min(frame, count-1);
		}


		const tag = `${name}.${frame}`;
		if(stock[tag]) {
			renderObj(context, stock[tag], x, y, param, option);
		}
	}

	function spritesFromText(text, option) {
		const sprites = [];
		let x = 0, y = 0;
		let upperText = text.toUpperCase();
		if(option === 'progressive' || option === 'progressive-next') {
			const frame = option === 'progressive' 
				? getFrame(50) - (typeof(scene.fadeIn)!=='undefined' ? 50 : 0)
				: option === 'progressive-next' && exitTime
				? getFrame(20, exitTime)
				: 0;
			upperText = frame < 0 ? "" : upperText.slice(0, frame);
		}
		for(let i=0; i<upperText.length; i++) {
			const char = upperText.charAt(i);
			switch(char) {
				case '\n':
					y += 9;
					x = 0;
					break;
				case ' ':
					x += 6;
					break;
				default:
					const index = LETTERS.indexOf(char);
					if (index >= 0) {
						sprites.push([`alphabet.${index}`, x, y]);
					}
					x += 6;
					break;
			}
		}
		return sprites;
	}

	function moveScene(next, fadeOut) {
		if(typeof(fadeOut)!=='undefined') {
			if(!exitTime) {
				fadeColor = typeof(fadeOut) !== 'undefined' ? fadeOut : null;
				nextScene = next;
				exitTime = new Date().getTime();
			}
		} else {
			setScene(getSceneIndex(next));
		}
	}

	function initCanvas() {
		canvas = document.getElementById('canvas');
		context = canvas.getContext('2d', {alpha: false});
		canvas.width = 64;
		canvas.height = 64;
		canvas.style.width = `${VIEWPORT_SIZE}px`;
		canvas.style.height = `${VIEWPORT_SIZE}px`;
		canvas.style.background = 'black';
		canvas.style.imageRendering = 'pixelated';

		canvas.addEventListener("mousedown", e => {
			if(getFrame(500) === 0) {
				return;
			}
			if (scene.next) {
				moveScene(scene.next, scene.fadeOut);
			}
			if(onInventory()) {
				if(itemSelected) {
					itemSelected = null;
					needInventoryExit = true;
					openInventory = 0;
					closeInventory = new Date().getTime() + 300;
				} else {
					inventory.forEach(item => {
						const itemTag = item + "-inventory";
						if(coverImage(stock[itemTag].img, mousePos.x, mousePos.y)) {
							itemSelected = item;
							needInventoryExit = true;
							openInventory = 0;
							closeInventory = new Date().getTime() + 300;
						}
					});
				}
			} else {
				if(scene.onClick) {
					for(let i=0; i<scene.onClick.length; i++) {
						const entry = scene.onClick[i];
						if(typeof(entry.ifselected) !== 'undefined') {
							if(itemSelected !== entry.ifselected) {
								continue;
							}
						}
						if(typeof(entry.ifvisible) !== 'undefined') {
							if(!spriteShown[entry.ifvisible]) {
								continue;
							}
						}
						if(stock[entry.name] && coverImage(stock[entry.name].img, mousePos.x, mousePos.y)) {
							const { actions } = entry;
							actions.forEach(action => {
								if(action.next) {
									moveScene(action.next, action.fadeOut);
								}
								if(action.removeSprite) {
									replacedSprite[action.removeSprite] = "none";
								}
								if(action.replaceSprite) {
									replacedSprite[action.replaceSprite[0]] = action.replaceSprite[1];									
								}
								if(action.tip) {
									tip = findTip(action.tip);
									tipTime = new Date().getTime();
									tipsViewed[tip] = true;
								}
								if(action.addInventory) {
									inventory.push(action.addInventory);
									openInventory = new Date().getTime();
								}
								if(action.removeInventory) {
									const index = inventory.indexOf(action.removeInventory);
									if(index >= 0) {
										inventory.splice(index, 1);
									}
									openInventory = new Date().getTime();
								}
								if(typeof(action.selectItem) !== 'undefined') {
									itemSelected = action.selectItem;
								}
								if(action.setVar) {
									vars[action.setVar] = action.value;
								}
								if(typeof(action.setMission) !== 'undefined') {
									localStorage.setItem('mission', action.setMission);
								}
								if(action.dropSprite) {
									replacedSprite[action.dropSprite] = action.dropSprite + "-dropped";
									dropTimes[action.dropSprite + "-dropped"] = new Date().getTime();
								}
							});
							break;
						}
					}
				}
			}
		});

		canvas.addEventListener("mousemove", e => {
			mousePos.x = canvas.width * e.clientX / VIEWPORT_SIZE;
			mousePos.y = canvas.height * e.clientY / VIEWPORT_SIZE;
			if(onInventory()) {
				if(!openInventory && !needInventoryExit) {
					openInventory = new Date().getTime();
				}
			} else {
				if(openInventory) {
					closeInventory = new Date().getTime();
					openInventory = 0;
				}
				if(needInventoryExit) {
					needInventoryExit = false;
				}
			}
			refreshCanvasCursor();
		});
	}

	function findTip(tips) {
		for(let i=0; i<tips.length; i++) {
			if(!tipsViewed[tips[i]]) {
				return tips[i];
			}
		}
		return tips[tips.length-1];
	}

	function onInventory() {
		return getFrame(2500)!==0 && stock.inventory && scene.enableInventory && coverImage(stock.inventory.img, mousePos.x, mousePos.y) && fadeColor === null;
	}

	const tempCanvas = document.createElement('canvas');
	function coverImage(img, x, y) {
		tempCanvas.width = 64;
		tempCanvas.height = 64;
		const ctx = tempCanvas.getContext('2d');
		ctx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
		ctx.drawImage(img, 0, 0);
		return ctx.getImageData(Math.floor(x), Math.floor(y), 1, 1).data[3] !== 0;
	}

	function clearCanvas(color) {
		context.fillStyle = replaceColor(color) || "#000000";
		context.fillRect(0, 0, canvas.width, canvas.height);		
	}

	function setScene(index) {
		newSceneTime = new Date().getTime();
		exitTime = 0;
		itemSelected = null;
		scene = game.scenes[index];
		needInventoryExit = true;
		fadeColor = null;
		nextScene = 0;
		tipTime = 0;
		tip = "";
		replacedSprite = {};
		spriteShown = {};
		tipsViewed = {};
		dropTimes = {};
		refreshCanvasCursor();
	}

	function refreshCanvasCursor() {
		if (scene.next) {
			canvas.style.cursor = "pointer";
		} else {
			canvas.style.cursor = "";
		}
	}

	function initAssets() {
		assets.forEach(asset => loadImage.apply(null, asset));
	}

	function initVars() {
		const mission = localStorage.getItem('mission') || 0;
		vars.mission = mission;
		localStorage.setItem('mission', Math.min(9, mission + 1));

		inventory = game.inventory || [];
	}

	function init() {
		initVars();
		initAssets();
		initCanvas();
		setScene(getSceneIndex(game.firstScene));
//		setScene(scenes.length-10);

		requestAnimationFrame(refresh);
	}

	let lastNow = 0;
	function refresh(now) {
//		if(now - lastNow > 10) {
			renderScene(context, scene);
		// 	lastNow = now;
		// }
		requestAnimationFrame(refresh);
	}


	document.addEventListener("DOMContentLoaded", init);


}(document, game);