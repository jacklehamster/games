class DependencyInjector {
	constructor() {
		this.registry = {};
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
		if (this.registry[name]) {
			const { func, dependencies } = this.registry[name];
			const args = dependencies.map(arg => this.get(arg));
			if (DependencyInjector.isClass(func)) {
				return new func(...args);
			} else {
				return func(...args);
			}
		}
		throw new Error(`Unable to get ${name}. Dependcy not registered.`);
	}
}

function identity(classObj) {
	return () => classObj;
}

const injector = new DependencyInjector();