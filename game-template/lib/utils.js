const cache = {};
const canDebug = location.search.indexOf("debug") >= 0;
const tempVec3 = vec3.create(), temp2Vec3 = vec3.create();
const temp4Float = new Float32Array(4);
const FLOAT_NUMS = new Array(100).fill(null).map((a, index) => {
	return Float32Array.from([index, index, index, index]);
});
const ANGLE_RANGE = Math.PI * 2;
const DEG_90 = Math.PI / 2;

class Utils {
	static get debug() {
		return canDebug;
	}

	static delay(ms) {
	  return new Promise(resolve => setTimeout(resolve, ms));
	}

	static load(url) {
		if (Array.isArray(url)) {
			return url.map(Utils.load);
		}
		return new Promise((resolve, reject) => {
			if (cache[url] && cache[url].result) {
				if (cache[url].result) {
					resolve(cache[url].result);
				} else {
					reject(cache[url].error);
				}
				return;
			}

			const shouldLoad = !cache[url];
			if (url.match(/.(jpg|jpeg|png|gif)$/i)) {
				const img = cache[url] ? cache[url].img : new Image();
				img.crossOrigin = "anonymous";
				if (!cache[url]) {
					cache[url] = { img };					
				}
				img.addEventListener('load', e => {
					cache[url].result = e.currentTarget;
					resolve(cache[url].result);
				});
			    img.addEventListener('error', e => {
			    	cache[url].error = Error("Image Error");
			      	reject(cache[url].error);
			    });
			    if (shouldLoad) {
					img.src = url;
			    }
			} else {
			    const req = cache[url] ? cache[url].req : new XMLHttpRequest();
			    if (!cache[url]) {
			    	cache[url] = { req };
			    }
			    req.open('GET', url);
			    req.addEventListener('load', e => {
			      if (req.status === 200) {
			      	cache[url].result = req.response;
			        resolve(cache[url].result);
			      }
			      else {
			      	cache[url].error = Error(req.statusText);
			        reject(cache[url].error);
			      }
			    });
			    req.addEventListener('error', e => {
			    	cache[url].error = Error("Network Error");
			    	reject(cache[url].error);
			    });
			    if (shouldLoad) {
				    req.send();
			    }
			}
		});
	}

	static getAngleIndex(rad, range) {
		rad %= ANGLE_RANGE;
		if (rad < 0) {
			rad += ANGLE_RANGE;
		}
      	return Math.floor(rad * range / ANGLE_RANGE + .5) % range;
	}

	static getDirectionAngle(mov) {
    	const [ x,,z ] = mov;
		return Math.atan2(-z, x);
	}

    static getCameraAngle(directionAngle, rotation) {
		return directionAngle - DEG_90 + rotation;
	}

	static getRelativeDirection (turn, mov, normalizeValue) {
		const [dx, dy, dz] = mov;
	    const sin = Math.sin(turn);
	    const cos = Math.cos(turn);
	    tempVec3[0] = cos * dx - sin * dz;
	    tempVec3[1] = dy;
	    tempVec3[2] = sin * dx + cos * dz;
	    if (normalizeValue) {
	    	vec3.normalize(tempVec3, tempVec3);
	    }
	    return tempVec3;
	}

	static set3(vector, x, y, z) {
		vector[0] = x;
		vector[1] = y;
		vector[2] = z;
		return vector;
	}

	static arrayEqual(arr1, arr2) {
		if (arr1.length !== arr2.length) {
			return false;
		}
		for (let i = 0; i < arr1.length; i++) {
			if (arr1[i] !== arr2[i]) {
				return false;
			}
		}
		return true;
	}

	static get4Floats(num) {
		return FLOAT_NUMS[num] || temp4Float.fill(num);
	}

	static isImageEmpty(ctx) {
		if (ctx.constructor === HTMLCanvasElement) {
			ctx = ctx.getContext('2d');
		}
		const { data } = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
		let empty = true;
		for (let p = 0; p < data.length; p += 4) {
			if (data[p + 3] !== 0) {
				empty = false;
				break;
			}
		}
		return empty;
	}

	static getCell(pos) {
		return Utils.set3(temp2Vec3,
			Math.floor(pos[0]),
			Math.floor(pos[1]),
			Math.floor(pos[2]),
		);		
	}

	static checkNewCell(pre, pos) {
		let newCell = null;
		for (let i = 0; i < 3; i++) {
			if (Math.floor(pre[i]) !== Math.floor(pos[i])) {
				newCell = Utils.getCell(pos);
				break;
			}
		}
		return newCell;
	}
}

injector.register("utils", [identity(Utils)]);
