const Camera = (() => {
	const X_POS = 0, Y_POS = 1, Z_POS = 2;
	const EMPTY_VEC3 = vec3.create();
	const MAX_SPEED = 2;

	function clamp(num, min, max) {
		return num < min ? min : num > max ? max : num;
	}

	function almostZero(num) {
		return Math.abs(num) < 0.005;
	}

	class Camera {
		constructor() {
			this.rotation = 0;
			this.mov = vec3.create();
			this.pos = vec3.create();
			this.relativeDirection = EMPTY_VEC3;
			this.movDirection = 0;
			this.relativeDirectionDirty = true;
			this.moving = false;
		}

		setMove(x, y, z) {
			const { mov } = this;
			x = clamp(x, -MAX_SPEED, MAX_SPEED);
			y = clamp(y, -MAX_SPEED, MAX_SPEED);
			z = clamp(z, -MAX_SPEED, MAX_SPEED);
			if (mov[X_POS] !== x || mov[Y_POS] !== y || mov[Z_POS] !== z) {
				mov[X_POS] = x;
				mov[Y_POS] = y;
				mov[Z_POS] = z;
				if (almostZero(mov[X_POS])) {
					mov[X_POS] = 0;
				}
				if (almostZero(mov[Y_POS])) {
					mov[Y_POS] = 0;
				}
				if (almostZero(mov[Z_POS])) {
					mov[Z_POS] = 0;
				}

				this.relativeDirectionDirty = true;
				if (mov[X_POS] === 0 && mov[Y_POS] === 0 && mov[Z_POS] === 0) {
					this.moving = false;
				} else {
					this.moving = true;
				}
			}
		}

		addMove(x, y, z) {
			const { mov } = this;
			this.setMove(
				x ? mov[X_POS] + x : mov[X_POS] / 2,
				y ? mov[Y_POS] + y : mov[Y_POS] / 2,
				z ? mov[Z_POS] + z : mov[Z_POS] / 2,
			);
		}

		setRotation(value) {
			if (this.rotation !== value) {
				this.rotation = value;
				this.relativeDirectionDirty = true;
			}
		}

		rotate(value) {
			this.setRotation(this.rotation + value);
		}

		getRelativeDirection(vec3temp) {
			if (this.relativeDirectionDirty) {
				this.relativeDirection = Utils.getRelativeDirection(this.rotation, this.mov, true, vec3temp);
				this.movDirection = Utils.getDirectionAngle(this.relativeDirection);
				this.relativeDirectionDirty = false;
			}
			return this.relativeDirection;
		}

		getMovDirection(vec3temp) {
			this.getRelativeDirection(vec3temp);
			return this.movDirection;
		}
	}

	injector.register("camera", identity(Camera));
	return Camera;
})();
