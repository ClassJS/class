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

	classjs.extendEvent = function(obj) {
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

	classjs.extendEvent($fn);

	$fn.addListener('initPrototypeAfter', function(event, clazz) {
		var prototype = clazz.prototype;
		if (prototype.extendEvent == true) {
			classjs.extendEvent(prototype);
			delete prototype.extendEvent;
		}
	});

})(this);