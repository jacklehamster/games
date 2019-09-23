/*
    Object pooling - Allow creation and reusability of objects without instantiation.

    Usage:
		Recycler.wrap(<Class>, <initFunction>);
		<Class>.create(...);	<= create a class
		<obj>.recycle();		<= recycle object for reuse
		<obj>.recycled = true 	<= indicates that an object has been recycled

	Example:
		Recycler.wrap(Sprite, (x, y) => {
			this.x = x;
			this.y = y;
		});

		const sprite = Recycler.create(x, y);
		//	use sprite
		sprite.recycle();

		if (sprite.recycled) {
			//	sprite is not valid
		}
 */
class Recycler {
	static wrap(classObj, initFunction) {
		const bin = [];
		if (!initFunction) {
			initFunction = () => {};
		}
		classObj.create = function() {
			const isNew = !bin.length;
			const obj = !isNew ? bin.pop() : new classObj();
			initFunction(obj, ... arguments);
			obj.recycled = false;
			obj.isNew = isNew;
			return obj;
		};	

		classObj.prototype.recycle = function() {
			bin.push(this);
			this.recycled = true;
			if (this.onRecycle) {
				this.onRecycle();
			}
		};
	}

	static isRecycled(element) {
		return element.recycled;
	}
}

injector.register("recycler", [identity(Recycler)]);
