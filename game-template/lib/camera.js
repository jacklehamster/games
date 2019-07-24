const Camera = (() => {
	const X_POS = 0, Y_POS = 1, Z_POS = 2;
	const EMPTY_VEC3 = vec3.create();

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
			if (mov[X_POS] !== x || mov[Y_POS] !== y || mov[Z_POS] !== z) {
				mov[X_POS] = x;
				mov[Y_POS] = y;
				mov[Z_POS] = z;
				this.relativeDirectionDirty = true;
				this.moving = true;
			}
		}

		addMove(x, y, z) {
			const { mov } = this;
			this.setMove(mov[X_POS] + x, mov[Y_POS] + y, mov[Z_POS] + z);
		}

		decelerate() {
			const { mov } = this;
			if (this.moving) {
				mov[X_POS] /= 2;
				mov[Y_POS] /= 2;
				mov[Z_POS] /= 2;
				if (Math.abs(mov[X_POS]) < .005 && Math.abs(mov[Y_POS]) < .005 && Math.abs(mov[Z_POS]) < .005) {
					mov[X_POS] = 0;
					mov[Y_POS] = 0;
					mov[Z_POS] = 0;
					this.relativeDirection = EMPTY_VEC3;
					this.moving = false;
				}
			}
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

		getRelativeDirection() {
			if (this.relativeDirectionDirty) {
				this.relativeDirection = Utils.getRelativeDirection(this.rotation, this.mov, true);
				this.movDirection = Utils.getDirectionAngle(this.relativeDirection);
				this.relativeDirectionDirty = false;
			}
			return this.relativeDirection;
		}

		getMovDirection() {
			this.getRelativeDirection();
			return this.movDirection;
		}
	}

	injector.register("camera", identity(Camera));
	return Camera;
})();
