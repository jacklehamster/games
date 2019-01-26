const View = (function() {
	const SLOWDOWN = .75;
	const SPEED_FACTOR = .01;
	const MOVE_MULTIPLIER = 1.5;
	const ROTATION_STEP = Math.PI / 8;
	const ROTATION_SPEED = .02;
	const Z_OFFSET = -1.5;

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
		this.temp = {
			position: vec3.create(),
		};
		this.moveDirection = { x: 0, z: 0 };
		this.zOffset = Z_OFFSET;
	});

	Utils.createAccessors(Camera, ['autoTilt', 'zOffset']);

	Camera.prototype.getTilt = function() {
		return this.autoTilt ? this.position[1] : this.tilt;
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

	Camera.prototype.getRelativePosition = function(offsetX, offsetY, offsetZ) {
	    const sin = Math.sin(this.turn);
	    const cos = Math.cos(this.turn);
	    const rdx = (cos * offsetX - sin * offsetZ);
	    const rdz = (sin * offsetX + cos * offsetZ);
	    const position = this.temp.position;
	    position[0] = this.position[0] + rdx;
	    position[1] = this.position[1] + offsetY;
	    position[2] = this.position[2] + this.zOffset + rdz;
	    return position;
	};

	Camera.prototype.getCameraAngle = function(direction) {
		const angle = Math.atan2(direction.z, direction.x);
		return angle - this.turn;
	};

	Camera.prototype.isMoving = function() {
		const { x, z } = this.moveDirection;
		const dist = Math.sqrt(x * x + z * z);
		return dist > .01;
	};

	Camera.prototype.step = function(scene) {
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
	    const dist = Math.sqrt(rdx * rdx + rdz * rdz);
	    if (dist) {
		    this.motion[0] += rdx / dist;
		    this.motion[2] += rdz / dist;
	    }
    	this.motion[0] *= SLOWDOWN;
    	this.motion[2] *= SLOWDOWN;
		this.mov.dx = 0;
		this.mov.dy = 0;
		this.mov.dz = 0;

	    const [ x, y, z ] = this.position;
	    if(Math.abs(this.motion[0])>.01 || Math.abs(this.motion[2])>.01) {
		    const xDest = x + this.motion[0] * SPEED_FACTOR;
		    const zDest = z + this.motion[2] * SPEED_FACTOR;
		    if(!scene || scene.canGo(x, z + this.zOffset, xDest, zDest + this.zOffset)) {
			    this.position[0] = xDest;
			    this.position[2] = zDest;
		    } else if(scene.canGo(x, z + this.zOffset, x, zDest + this.zOffset)) {
			    this.position[2] = zDest;
		    } else if(scene.canGo(x, z + this.zOffset, xDest, z + this.zOffset)) {
		    	this.position[0] = xDest;
		    }
		    this.moveDirection.x = (x - xDest);
		    this.moveDirection.z = (z - zDest);
	    }

	    if (this.turnMotion) {
	    	this.turn += this.turnMotion;
	    }
	};

	return {
		Camera,
	};
})();
