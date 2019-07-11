const cache = {};
const canDebug = location.search.indexOf("debug") >= 0;
const tempVec3 = vec3.create();

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
		const angleRange = Math.PI * 2;
		rad = ((rad % angleRange) + angleRange) % angleRange;
      	return Math.floor(rad * range / angleRange + .5) % range;
	}

    static getCameraAngle(direction, rotation) {
    	const [ x,,z ] = direction;
		const angle = Math.atan2(-z, x) - Math.PI / 2;
		return angle + rotation;
	}

	static getRelativeDirection (turn, mov) {
		const [dx, dy, dz] = mov;
	    const sin = Math.sin(turn);
	    const cos = Math.cos(turn);
	    const rdx = (cos * dx - sin * dz);
	    const rdz = (sin * dx + cos * dz);
	    vec3.set(tempVec3, rdx, dy, rdz);
	    return tempVec3;
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
}