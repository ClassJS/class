(function(global, undefined) {

	if (global.classjs) {
		return
	}

	var ArraySlice = Array.prototype.slice,
		ObjectPrototype = Object.prototype,
		FunctionPrototype = Function.prototype,
		ObjectHasOwnProperty = ObjectPrototype.hasOwnProperty,
		emptyFunction = function() {},
		__IS_CREATE_CLASS__ = '__IS_CREATE_CLASS__';

	FunctionPrototype.__isFunction__ = true;
	ObjectPrototype.__isObject__ = true;
	// Array.prototype.__isArray__ = true;
	// String.prototype.__isString__ = true;
	// Boolean.prototype.__isBoolean__ = true;
	// Date.prototype.__isDate__ = true;
	// Number.prototype.__isNumber__ = true;


	var removeOwnProperty = FunctionPrototype.removeOwnProperty = ObjectPrototype.removeOwnProperty = function() {
		iterator(this, function(key, value) {
			if (value && value.__isFunction__) {
				removeOwnProperty.call(value);
			}
			this[key] = null;
			delete this[key];
		}, this);
		return this;
	};

	function each(array, handle, scope) {
		if (!array || !handle) {
			return;
		}
		if (array.length >= 0) {
			for (var i = 0, size = array.length; i < size; i++) {
				if (scope == null) {
					scope = array[i];
				}
				if (handle.call(scope, i, array[i], size) === false) {
					return false;
				}
			}
		}
	};

	function iterator(array, handle, scope) {
		if (!array || !handle) {
			return;
		}
		scope = scope || null;
		for (var key in array) {
			if (scope == null) {
				scope = array[key];
			}
			if (ObjectHasOwnProperty.call(array, key) && handle.call(scope, key, array[key]) === false) {
				return false;
			}
		}
	};

	function mergerAndApply(isApply, isDeep, target, list) {
		each(list, function(index, copy) {
			iterator(copy, function(key, copyItem) {
				var targetItem = target[key];
				if (isApply && targetItem) {

				} else if (isDeep && copyItem && copyItem.__isObject__ && targetItem) {
					if (!targetItem.__isObject__) {
						targetItem = {};
					}
					target[key] = mergerAndApply(isApply, isDeep, targetItem, [copyItem]);
				} else {
					target[key] = copyItem;
				}
			});
		});
		return target;
	};


	function getArgs() {
		var args = arguments,
			target,
			isDeep = false,
			index;
		if (args[0] === true || args[0] === false) {
			isDeep = args[0];
			target = args[1] || {};
			index = 2;
		} else {
			target = args[0] || {};
			index = 1;
		}
		return {
			isDeep: isDeep,
			target: target,
			list: ArraySlice.call(args, index)
		};
	};

	function merger(isDeep, target, config1, configN) {
		var arg = getArgs.apply({}, arguments);
		return mergerAndApply(false, arg.isDeep, arg.target, arg.list);
	};

	function apply(isDeep, target, config1, configN) {
		var arg = getArgs.apply({}, arguments);
		mergerAndApply(true, arg.isDeep, arg.target, arg.list);
	};


	function getNameSpace(className) {
		var parent = global,
			ref,
			pack = [],
			refNS;
		each(className.split('\.'), function(i, NS, size) {
			refNS = NS;
			parent[NS] = parent[NS] || {};
			ref = parent[NS];
			if (i < size - 1) {
				parent = ref;
				pack.push(NS);
			}
		});
		return {
			parent: parent,
			ref: ref,
			pack: pack.join('.'),
			refNS: refNS
		};
	};


	function getClassConstructor() {
		return function(config) {
			if (config != __IS_CREATE_CLASS__ && this.init) {
				var result = this.init.apply(this, arguments);
				this.ready();
				return result;
			}
		};
	};

	function setOwner(clazz, name, fn, isOverride) {
		if (fn && fn.__isFunction__ && !fn.__owner__) {
			fn.__owner__ = clazz;
			fn.__name__ = name;
			if (isOverride) {
				fn.__isOverride__ = true;
			}
		}
	};

	function setThisOwner(isOverride) {
		iterator(this, function(key, value) {
			setOwner(this, key, value, isOverride);
		}, this);
	};

	function initClass(clazz) {
		var NS = getNameSpace(clazz.className),
			superClass = classjs.getClass(clazz.extend),
			prototype = clazz;

		$fn.trigger('initClassBefore', clazz);

		clazz = getClassConstructor();

		apply(clazz, prototype.statics);

		merger(clazz, {
			__isClass__: true,
			__package__: NS.pack,
			__name__: NS.refNS,
			__className__: prototype.className,
			__prototype__: prototype
		});

		if (superClass) {
			clazz.__super__ = superClass;

			delete prototype.extend;

			clazz.prototype = superClass.prototype;

			clazz.prototype = new clazz(__IS_CREATE_CLASS__);
		}

		NS.parent[NS.refNS] = clazz;

		setThisOwner.call(clazz);
		$fn.trigger('initClassAfter', clazz);
		return clazz;
	};

	function callSuper() {
		var caller = arguments.callee.caller,
			method,
			arg,
			superClass,
			result,
			superPrototype;

		method = caller.__name__;
		arg = caller.arguments;
		superClass = caller.__owner__.getSuperClass();
		superPrototype = superClass.prototype;

		if (superPrototype && superPrototype[method]) {
			result = superPrototype[method].apply(this, arg);
		} else if (superClass[method]) {
			result = superClass[method].apply(this, arg);
		}
		return result;
	};

	function initPrototype(clazz) {
		var prototype = clazz.__prototype__;

		$fn.trigger('initPrototypeBefore', clazz);

		delete prototype.statics;

		delete clazz.__prototype__;

		if (clazz.__super__) {
			prototype.callSuper = callSuper;
		}


		merger(clazz.prototype, {
			__isPrototype__: true,
			__class__: clazz,
			package: clazz.__package__,
			name: clazz.__name__,
			init: function(config) {
				classjs.log();
				this.override(config);
			},
			ready: emptyFunction,
			destroy: function() {
				classjs.log();
				removeOwnProperty.call(this);
			},
			override: function(config) {
				merger(this, config);
				setThisOwner.call(this, true);
			},
			callPrototype: function() {
				var caller = arguments.callee.caller,
					method,
					arg;
				method = caller.__name__;
				arg = caller.arguments;
				return this.getPrototype()[method].apply(this, arg);
			},
			getClass: function() {
				return this.__class__;
			},
			getSuperClass: function() {
				return this.__class__.__super__;
			},
			getPrototype: function() {
				return this.__class__.prototype;
			}
		}, prototype);

		$fn.trigger('initPrototypeAfter', clazz);

		setThisOwner.call(clazz.prototype);

		return clazz.prototype;
	};


	function addClass(clazz) {
		classMap[clazz.__className__] = clazz;
	};

	function getClass(className) {
		return classMap[className];
	};


	var classMap = {},
		$fn = {
			on: emptyFunction,
				trigger: emptyFunction
		},
		classjs = global.classjs = function(clazz) {

			$fn.trigger('createClassBefore', clazz);

			clazz = initClass(clazz);

			initPrototype(clazz);

			addClass(clazz);

			$fn.trigger('createClassAfter', clazz);

		};


	merger(classjs, {
		version: "1.0",
		getClass: getClass,
		merger: merger,
		apply: apply,
		each: each,
		it: iterator,
		log: emptyFunction,
		$fn: $fn
	});

})(this);