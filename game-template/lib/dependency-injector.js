class DependencyInjector {
	constructor() {
		this.registry = {};
		this.cache = {};
	}

	static isClass(v) {
	  return typeof v === 'function' && /^\s*class\s+/.test(v.toString());
	}

	register(name, dependencies) {
		if (Array.isArray(dependencies)) {
			const func = dependencies.pop();
			this.registry[name] = {
				func,
				dependencies,
			};
		} else {
			this.registry[name] = { func: dependencies, dependencies: [] };
		}
		
	}

	get(name) {
		if (this.cache[name]) {
			return this.cache[name];
		}
		if (this.registry[name]) {
			const { func, dependencies } = this.registry[name];
			const args = dependencies.map(arg => this.get(arg));
			let dependency;
			if (DependencyInjector.isClass(func)) {
				dependency = new func(...args);
			} else {
				dependency = func(...args);
			}
			this.cache[name] = dependency;
			return dependency;
		}
		throw new Error(`Unable to get ${name}. Dependcy not registered.`);
	}
}

function identity(classObj) {
	return () => classObj;
}

const injector = new DependencyInjector();