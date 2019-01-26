const Game = function(document, game) {
	let gameStarted = true;
	const VIEWPORT_SIZE = 512;
	const { scenes, assets } = game;
	const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.!;,'?".split("");
	let canvas;
	let context;
	const stock = {
		'cross-cursor': {
			type: 'cross-cursor',
		},
		'starfield': {
			type: 'starfield',
		},
		'draw-dots': {
			type: 'draw-dots',
		},
	};
	window.stock = stock;
	const loaded = {};
	let scene = {};
	let exitTime = 0;
	let dropTimes = {};
	let newSceneTime = 0;
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
	let soundsPlayed = {};
	let hurry = 1;
	let triggered = {};

	function loadImage(src, width, height, count, option) {
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
						fixColor: option==='fixcolor',
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

	function spritesFromScrollingText(text, time) {
		const x = 2, y = getFrame(180, time);
		return [
			["text", x, canvas.height - 1 - y, text],
		];
	}

	function renderScene(context, scene) {
		clearCanvas(scene.background);
		spriteShown = {};
		const { sprites } = scene;
		if(scene.scroll) {
			renderSprites(context, spritesFromScrollingText(scene.scroll, newSceneTime));			
		}
		if(sprites) {
			renderSprites(context, sprites, 0, 0);
		}
		renderInventory(context);
		if(tip) {
			renderSprites(context, spritesFromRollingText(tip, tipTime));
		}
		applyFade(context,scene);
		handleIdle(scene);
	}

	function handleIdle(scene) {
		if(scene.onIdle) {
			scene.onIdle.forEach(idle => {
				if (!exitTime && (!idle.delay || getFrame(idle.delay) !== 0)) {
					if(idle.ifequal) {
						const [ prop, value ] = idle.ifequal;
						if(getVar(prop) != value) {
							return;
						}
					}
					if(idle.ifgreaterequal) {
						const [ prop, value ] = idle.ifgreaterequal;
						if(getVar(prop) < value) {
							return;
						}
					}
					if(idle.next) {
						moveScene(idle.next, idle.fadeOut);						
					}
					if(idle.setCache) {
						setStorage(idle.setCache, idle.value);
					}
					if(idle.clearCache) {
						setStorage(idle.clearCache, null);
					}
					if(idle.trigger) {
						dispatchTrigger(idle);
					}
				}
			});
		}		
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
		return getStorage(prop);
	}

	function renderSprites(context, sprites, offsetX, offsetY) {
		for(let i=0; i<sprites.length; i++) {
			let [ id, x, y, param, option ] = sprites[i];
			if(i===0) {
				sprites[i];
			}
			if(param==='ifselected') {
				if(itemSelected !== option) {
					continue;
				}
			}
			if(param==='ifvar') {
				if(!getVar(option)) {
					continue;
				}
			}
			if(param==='ifnotvar') {
				if(getVar(option)) {
					continue;
				}
			}
			if(param==='ifequal') {
				const [ prop, value ] = option;
				if(getVar(prop) != value) {
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

	function getRGB(color) {
		const R = Math.floor(color / 256 / 256) % 256;
		const G = Math.floor(color / 256) % 256;
		const B = Math.floor(color) % 256;
		return [R, G, B];
	}

	function randy(value) {
	    const x = Math.sin(value) * 10000;
	    return x - Math.floor(x);
	}

	const fixCanvas = document.createElement('canvas');
	const fixContext = fixCanvas.getContext('2d');
	const FIX_COLORS = [ 0x000000, 0xFFFFFF, 0xd8a184, replaceColor(0xae5e32) ]
		.map(getRGB);
	function fixImage(img, cropX, cropY, cropWidth, cropHeight, time) {
		fixCanvas.width = cropWidth;
		fixCanvas.height = cropHeight;
		fixContext.clearRect(0, 0, cropWidth, cropHeight);
		fixContext.drawImage(img, cropX, cropY, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);
		const imgData = fixContext.getImageData(0, 0, cropWidth, cropHeight);
		const data = imgData.data;
		const now = performance.now();
		for(let i=0; i<data.length; i+=4) {
			if(data[i+3]!==0) {
				let bestColor = 0;
				let bestValue = Number.MAX_SAFE_INTEGER;
				for(let c=0; c<FIX_COLORS.length; c++) {
					let value = 0;
					for(let n=0; n<3; n++) {
						const v = (data[i + n]-FIX_COLORS[c][n]) + Math.random()*randy(i ^ c)* Math.sin(now/100) * 200;
						value += v * v;
					}
					if(value < bestValue) {
						bestColor = c;
						bestValue = value;
					}
				}
				data[i] = 	FIX_COLORS[bestColor][0];
				data[i+1] =  FIX_COLORS[bestColor][1];
				data[i+2] =  FIX_COLORS[bestColor][2];
			}
		}
		fixContext.putImageData(imgData, 0, 0);
		return fixCanvas;
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
						offsetY = Math.min(0, -30 + getFrame(50 * hurry));
					} else if(param==='from-right') {
						offsetX = Math.max(0, 30 - getFrame(50 * hurry));
					}
					let { img } = obj;
					const { imgX, imgY, imgWidth, imgHeight, fixColor } = obj;
					if(fixColor) {
						img = fixImage(img, imgX, imgY, imgWidth, imgHeight);
						context.drawImage(img, x + offsetX, y + offsetY);
					} else {
						context.drawImage(img, imgX, imgY, imgWidth, imgHeight, x + offsetX, y + offsetY, imgWidth, imgHeight);
					}
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
				case 'starfield':
					renderStarfield(context);
					break;
				case 'draw-dots':
					renderDots(context, x, y, param, option);
					break;
				case 'sound':
					renderSound(obj.name, obj.audio, param, option, x);
					break;
				default:
					break;
			}
		}
	}

	function renderDots(ctx, x, y, prop, color) {
		const dots = JSON.parse(getStorage(prop)||"[]");
		ctx.fillStyle = color || black;
		dots.forEach(dot => {
			ctx.fillRect(x + dot.x, y + dot.y, 1, 1);
		});
	}

	function renderSound(name, audio, delay, option, volume) {
		if(!delay || getFrame(delay) !== 0) {
			if(option==="stop") {
				audio.pause();
				audio.currentTime = 0;
			} else if(option==="fade") {
				let n = 0;
				const interval = setInterval(audio => {
					if(n >= 10) {
						audio.pause();
						audio.currentTime = 0;
						audio.volume = 1;
						clearInterval(interval);
					} else {
						n++;
						audio.volume = Math.max(1 - n / 10, 0);
					}
				}, 100, audio);
			} else {
				if(!soundsPlayed[name]) {
					soundsPlayed[name] = true;
					if(option==="loop") {
						audio.loop = true;
					}
					audio.play();
				}
			}
			if(volume) {
				audio.volume = Math.max(0, volume);
			}
		}
	}

	const stars = [];
	function renderStarfield(ctx) {
		const now = new Date().getTime();
		if(!stars.length) {
			for(let i=0; i<100; i++) {
				stars[i] = {
					dx: Math.random()-.5,
					dy: Math.random()-.5,
				};
				stars[i].x = stars[i].dx*64;
				stars[i].y = stars[i].dy*64;
			}
		}
		ctx.fillStyle = 'white';
		for(let i=0; i<stars.length; i++) {
			const { x, y, dx, dy } = stars[i];
			ctx.fillRect(32 + Math.round(x),32 + Math.round(y),1,1);
			if(x*x + y*y > 64*64) {
				stars[i].x = dx*10;
				stars[i].y = dy*10;
			}
			stars[i].x += dx / 2;
			stars[i].y += dy / 2;
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
				? getFrame(50 * hurry) - (typeof(scene.fadeIn)!=='undefined' ? 50 : 0)
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
				if(scene.onFadeOut) {
					scene.onFadeOut.forEach(fade => {
						if(fade.stopSong) {
							const { name, audio } = stock[fade.stopSong];
							if(name && audio) {
								renderSound(name, audio, 0, 'stop');
							}
						}
						if(fade.playSong) {
							const { name, audio } = stock[fade.playSong];
							if(name && audio) {
								renderSound(name, audio, 0);
							}
						}
					});
				}
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
			if(getFrame(400) === 0) {
				hurry = .2;
				return;
			}
			if(!gameStarted) {
				gameStarted = true;
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
								if(action.setCache) {
									setStorage(action.setCache, action.value);
								}
								if(action.clearCache) {
									setStorage(action.clearCache, null);
								}
								if(action.incrementCache) {
									setStorage(action.incrementCache, parseInt(getStorage(action.incrementCache)||0) + 1);
								}
								if(typeof(action.setMission) !== 'undefined') {
									setStorage('mission', action.setMission);
								}
								if(action.dropSprite) {
									replacedSprite[action.dropSprite] = action.dropSprite + "-dropped";
									dropTimes[action.dropSprite + "-dropped"] = new Date().getTime();
								}
								if(action.playSound) {
									const { name, audio } = stock[action.playSound];
									if(name && audio) {
										renderSound(name, audio, 0);
									}
								}
								if(action.stopSong) {
									const { name, audio } = stock[action.stopSong];
									if(name && audio) {
										renderSound(name, audio, 0, 'stop');
									}
								}
								if(action.addDot) {
									const { x, y } = mousePos;
									const dots = JSON.parse(getStorage(action.addDot) || "[]");
									dots.push({ x: Math.floor(x), y: Math.floor(y) });
									if(dots.length > 30) {
										dots.shift();
									}
									setStorage(action.addDot, JSON.stringify(dots));
								}
								if(action.trigger) {
									dispatchTrigger(action);
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
		soundsPlayed = {};
		triggered = {};
		hurry = 1;
		if(scene.incrementCache) {
			setStorage(scene.incrementCache, parseInt(getStorage(scene.incrementCache)||0) + 1);
		}
		if(scene.clearCache) {
			scene.clearCache.forEach(cache => {
				setStorage(cache, null);
			});
		}
		refreshCanvasCursor();
	}

	function refreshCanvasCursor() {
		if (scene.next) {
			canvas.style.cursor = "pointer";
		} else {
			canvas.style.cursor = "";
		}
	}

	function loadSound(src) {
		const name = src.split('/').pop().split('.')[0];
		stock[name] = {
			type: 'sound',
			name,
			src,
			audio: new Audio(src),
		};
	}

	function initAssets() {
		assets.filter(asset => asset[0].split(".").pop()==='png').forEach(asset => loadImage.apply(null, asset));
		assets.filter(asset => asset[0].split(".").pop()==='mp3'||asset[0].split(".").pop()==='wav').forEach(asset => loadSound.apply(null, asset));
	}

	const storage = {};
	function getStorage(prop) {
		try {
			const value = localStorage.getItem(prop);
			return value;
		} catch(e) {
			return storage[prop];
		}
	}

	function setStorage(prop, value) {
		try {
			if(value!==null) {
				localStorage.setItem(prop, value);
			} else {
				localStorage.removeItem(prop, value);
			}
		} catch(e) {
			if(value!==null) {
				storage[prop] = value;
			} else {
				delete storage[prop];
			}
		}
	}

	function initVars() {
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
		if(!triggered[action.trigger]) {
			if(triggers[action.trigger]) {
				triggers[action.trigger].forEach(callback => {
					callback(action);
				});
			}
			triggersOnAll.forEach(callback => {
				callback(action);
			});
			triggered[action.trigger] = true;
		}
	}

	let lastNow = 0;
	function refresh(now) {
//		if(now - lastNow > 10) {
		if(gameStarted)
			renderScene(context, scene);
		// 	lastNow = now;
		// }
		requestAnimationFrame(refresh);
	}


	document.addEventListener("DOMContentLoaded", init);

	return {
		onTrigger,
	};

}(document, game);