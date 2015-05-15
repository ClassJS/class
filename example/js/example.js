(function() {
	classjs.debug = true;

	classjs({
		className: 'ui.widget',
		//当引入class.event.js时才能继承事件机制
		extendEvent: true,
		//给类增加静态属性或方法，可通用ui.widget.css访问
		statics: {
			css: {
				px: 'x-ui'
			}, //ui.widget.applyCSS(config);
			applyCSS: function(config) {
				classjs.log();
			}
		},
		ready: function() {
			//当引入class.log.js时console会输出2015-05-15 16:33:18 [INFO-1] ui.widget::ready() Arguments[0]
			//打包发布产品的时候可以清除classjs.log();
			classjs.log();
		}
	});


	classjs({
		className: 'ui.window',
		extend: 'ui.widget',
		statics: {
			css: {
				px: 'x-ui'
			}, //ui.window.show(win);
			show: function(win) {

			},
			close: function() {

			}
		},
		init: function(config) {
			classjs.log();
			this.callSuper();
		},
		ready: function() {
			classjs.log();
			this.callSuper();
		},
		show: function() {
			classjs.log();
			//触发通过this.addListener('show'……的侦听
			this.trigger('show');
		},
		onShowBefore: function() {
			classjs.log();
		},
		onShow: function() {
			classjs.log();
		},
		onShowAfter: function() {
			classjs.log();
		},
		close: function() {
			classjs.log();
			this.trigger('close');
		},
		onCloseBefore: function() {
			classjs.log();
		},
		onClose: function() {
			classjs.log();
		},
		onCloseAfter: function() {
			classjs.log();
		},
		destroy: function() {
			classjs.log();
			//调用父类的destroy方法
			this.callSuper();
		}
	});

	var win = new ui.window({
		title: 'window1',
		onShow: function() {
			classjs.log();
			this.callPrototype();
			return false;
		},
		destroy: function() {
			classjs.log();
			//调用原型的destroy方法
			this.callPrototype();
		}
	});

	setTimeout(function() {
		//侦听win的show事件
		win.addListener('show', function() {
			//依次调用win对象的onShowBefore、onShow、onShowAfter方法
			this.on('show');
		});

		win.addListener('close', function() {
			this.on('close');
		});

		win.show();

		win.close();

		win.destroy();

	}, 1000);

	setTimeout(function() {

		var win2 = new ui.window({
			title: 'window2',
			show: function() {
				classjs.log();
			}
		});

	}, 1500);
})();
