(function(){

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
(function(global, undefined) {

	var ArraySlice = Array.prototype.slice,
		classjs = global.classjs,
		it = classjs.it,
		each = classjs.each,
		merger = classjs.merger,
		apply = classjs.apply,
		$fn = classjs.$fn,
		__NO_FUNCTION__ = '__NO_FUNCTION__';

	function toFirstUpperCase(str) {
		return str.replace(/^./g, function(match) {
			return match.toUpperCase();
		});
	};

	function extendEvent(obj) {
		merger(obj, {
			/**
			 *trigger('createClassAfter',clazz1,clazzN);
			 *addListener('createClassAfter', function(event, clazz1,clazzN) {
			 *});
			 */
			addListener: function(type, handle) {
				var events = this.__events__,
					event;
				if (!events) {
					events = this.__events__ = {};
				}
				event = {
					eventType: type
				};

				each(type.split(" "), function(i, type) {
					if (type) {
						var array = events[type];
						if (!array) {
							events[type] = array = [];
						}
						array.push(handle);

						this.on('addListener', event, handle);
					}
				}, this);
				return this;
			},
			onAddListener: function(event, handle) {
				classjs.log();
			},
			removeListener: function(type, handle) {
				var typeArray = type.split(" "),
					l = 0,
					m = 0,
					array,
					event,
					events = this.__events__;
				if (!events) {
					return;
				}

				event = {
					eventType: type
				};
				while (typeArray[l]) {
					type = typeArray[l];
					array = events[type];
					m = 0;
					if (array) {
						if (handle) {
							while (array[m]) {
								if (array[m] == handle) {
									array.splice(m, 1);
									this.on('removeListener', event, handle);
								} else {
									m++;
								}
							}
						}
						if (!handle || array.length == 0) {
							delete this.__events__[type];
							array = null;
						}
					}
					l++;
				}
			},
			onRemoveListener: function(event, handle) {
				classjs.log();
			},
			hasListener: function(type, handle) {
				var events = this.__events__;
				if (events && events[type]) {
					var result = each(events[type], function(i, fn) {
						if (fn == handle) {
							return false;
						}
					});
					return result == false;
				}
				return false;
			},
			trigger: function(type, arg1, argN) {
				var args,
					events = this.__events__,
					event;
				if (!events) {
					return;
				}
				args = ArraySlice.call(arguments, 0);

				event = {
					eventType: type
				};

				args[0] = event;

				each(events[type], function(i, handle) {
					if (handle.apply(this, args) == false) {
						return false;
					}
				}, this);

			},
			on: function(type, arg1, argN) {
				var args = ArraySlice.call(arguments, 1),
					methodName = "on" + toFirstUpperCase(type),
					scope = this,
					handle;
				handle = scope[methodName + "Before"];
				if (handle && handle.apply(scope, args) == false) {
					return false;
				}
				handle = scope[methodName];
				if (handle && handle.apply(scope, args) == false) {
					return false;
				}
				handle = scope[methodName + "After"];
				if (handle && handle.apply(scope, args) == false) {
					return false;
				}
				return true;
			}
		});
	};

	extendEvent($fn);

	$fn.addListener('initPrototypeAfter', function(event, clazz) {
		var prototype = clazz.prototype;
		if (prototype.extendEvent == true) {
			extendEvent(prototype);
			delete prototype.extendEvent;
		}
	});

})(this);
(function(global, undefined) {

	function dateFormat(date, f) {
		var format = f || 'yyyy-MM-dd hh:mm:ss',
			o = {
				"M+": date.getMonth() + 1,
				"d+": date.getDate(),
				"h+": date.getHours(),
				"m+": date.getMinutes(),
				"s+": date.getSeconds(),
				"q+": Math.floor((date.getMonth() + 3) / 3),
				"S": date.getMilliseconds()
			};
		if (/(y+)/.test(format)) {
			format = format.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
		}
		for (var k in o) {
			if (new RegExp("(" + k + ")").test(format)) {
				format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length));
			}
		}
		return format;
	};


	classjs.log = (function() {

		var index = 1;
		return function() {
			if (!this.debug) {
				this.log = emptyFunction;
			}
			var callerInfo = this.log.getCallerInfo(arguments.callee.caller);

			this.log.print({
				msg: dateFormat(new Date(),this.log.timeformat) + ' [INFO-' + (index++) + '] ' + callerInfo.className + '::' + (callerInfo.isOverride ? '$' : '') + callerInfo.method + '()',
				arg: callerInfo.arg
			});
		};
	})();

	classjs.merger(classjs.log, {
		timeformat: 'yyyy-MM-dd hh:mm:ss',
		getCallerInfo: function(caller) {
			var clazz = caller.__owner__,
				method = caller.__name__;
			return {
				'class': clazz,
				className: clazz.className,
				method: method,
				isOverride: caller.__isOverride__,
				arg: caller.arguments
			};
		},
		print: (function() {
			if (window.console && window.console.info) {
				return function(info) {
					console.info(info.msg, info.arg);
				};
			} else {
				var DOC = document,
					logBox;
				logBox = DOC.createElement("div");
				logBox.style.cssText = 'position: absolute; right: 0px; bottom: 0px; height: 230px; width: 500px; font-size: 14px; font-family: Verdana, Arial;overflow: auto;';
				DOC.body.insertBefore(logBox, DOC.body.lastChild);
				return function(info) {
					var div = DOC.createElement("div");
					div.innerHTML = info.msg.replace(/\s/g, '&nbsp;');
					logBox.appendChild(div);
				};
			}
		})()
	});


})(this);

})()