function Recycler(classObj) {
	const bin = [];
	classObj.create = function() {
		const obj = bin.length ? bin.pop() : new classObj();
		obj.init.apply(obj, arguments);
		return obj;
	};

	classObj.recycle = function(obj) {
		bin.push(obj);
	}
}

Recycler.wrap = function(classObj) {
	classObj.recycler = new Recycler(classObj);
}
