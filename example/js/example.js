(function(classjs) {
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
            //当引入class.log.js时console会输出2015-05-15 16:33:18 [INFO-1] ui.widget.ready() Arguments[0]
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
            //依次调用win对象的onShowBefore、onShow、onShowAfter方法
            this.trigger('show', {
                x: 1,
                y: 2
            });
        },
        onShowBefore: function(event) {
            classjs.log();
        },
        onShow: function(event) {
            classjs.log();
            //触发通过this.on('show'……的侦听
            this.emit('show', event);
        },
        onShowAfter: function(event) {
            classjs.log();
        },
        close: function() {
            classjs.log();
            this.trigger('close', {
                x: 1,
                y: 2
            });
        },
        onCloseBefore: function() {
            classjs.log();
        },
        onClose: function() {
            classjs.log();
            this.emit('close');
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
        win.on('show', function(event) {
            //#开始的方法为事件   13:39:37 [INFO-10] ui.window.#show()
            classjs.log();
        });

        win.on('close', function(event) {
            classjs.log();
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



    classjs({
        className: 'ui.form.field',
        extendEvent: true,
        //单例
        singleton: true,
        show: function() {
            classjs.log();
        }
    });



    classjs({
        className: 'ui.form.text',
        //单例对象，继承无效
        extend: 'ui.form.field',
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
        }
    });

    ui.form.field.show();

    setTimeout(function() {
        ui.form.field.destroy();
    }, 1000);
})(classjs);
