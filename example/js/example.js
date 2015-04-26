classjs.debug = true;

classjs({
	className: 'ui.widget',
	extendEvent: true,
	statics: {
		css: {
			px: 'x-ui'
		}, //ui.widget.applyCSS(config);
		applyCSS: function(config) {
			classjs.log();
		}
	},
	ready: function() {
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
		this.callPrototype();
	}
});

setTimeout(function() {
	win.addListener('show', function() {
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