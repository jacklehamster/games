const View = (function() {
	const SLOWDOWN = .75;
	const SPEED_FACTOR = .02;
	const MOVE_MULTIPLIER = 2;
	const ROTATION_STEP = 45 * Math.PI / 180;
	const ROTATION_SPEED = .02;

	function Camera() {};
	Recycler.wrap(Camera, function(x, y, z, turn, tilt) {
		this.position = vec3.fromValues(x||0,y||0,z||0);
		this.turn = turn||0;
		this.tilt = tilt||0;
		this.autoTilt = false;
		this.motion = vec3.create();
		this.turnMotion = 0;
		this.mov = {
			dx: 0, dy: 0, dz: 0, rot: 0,
		};
		this.scene = null;
	});

	Utils.createAccessors(Camera, ['scene', 'autoTilt']);

	Camera.prototype.getTilt = function() {
		return this.autoTilt ? this.position[1] / 2 : this.tilt;
	}

	Camera.prototype.equals = function(camera) {
		if(!vec3.equals(this.position, camera.position)) {
			return false;
		}
		if(this.turn !== camera.turn || this.getTilt() !== camera.getTilt()) {
			return false;
		}
		return true;
	}

	Camera.prototype.move = function(dx, dy, dz) {
		this.mov.dx += dx;
		this.mov.dy += dy;
		this.mov.dz += dz;
	};

	Camera.prototype.rotate = function(rot) {
		this.mov.rot += rot;
	};

	Camera.prototype.step = function() {
		const { dx, dy, dz, rot } = this.mov;
	    if (rot) {
	      this.turnMotion = (this.turnMotion + rot * ROTATION_SPEED) * SLOWDOWN;
		  this.mov.rot = 0;
	    } else if(this.turnMotion) {
	      const closestRotation = this.turnMotion > 0 
	        ? Math.ceil(this.turn / ROTATION_STEP) * ROTATION_STEP
	        : Math.floor(this.turn / ROTATION_STEP) * ROTATION_STEP;
	      this.turnMotion = (closestRotation - this.turn) * .25;
	      if(Math.abs(this.turnMotion) < .001) {
	        this.turn = closestRotation;
	        this.turnMotion = 0;
	      }
	    }

	    const sin = Math.sin(this.turn);
	    const cos = Math.cos(this.turn);
	    const rdx = (cos * dx - sin * dz) * MOVE_MULTIPLIER;
	    const rdz = (sin * dx + cos * dz) * MOVE_MULTIPLIER;
	    this.motion[0] = (this.motion[0] + rdx) * SLOWDOWN;
	    this.motion[2] = (this.motion[2] + rdz) * SLOWDOWN;
		this.mov.dx = 0;
		this.mov.dy = 0;
		this.mov.dz = 0;

	    const [ x, y, z ] = this.position;
	    const xDest = x + this.motion[0] * SPEED_FACTOR;
	    const zDest = z + this.motion[2] * SPEED_FACTOR;
	    if(!this.scene || this.scene.canGo(x, z, xDest, zDest)) {
	      this.position[0] = xDest;
	      this.position[2] = zDest;
	    } else if(this.scene.canGo(x, z, x, zDest)) {
	      this.position[2] = zDest;
	    } else if(this.scene.canGo(x, z, xDest, z)) {
	      this.position[0] = xDest;
	    }

	    if (this.turnMotion) {
	      this.turn += this.turnMotion;
	    }
	};

	return {
		Camera,
	};
})();
