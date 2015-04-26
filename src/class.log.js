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