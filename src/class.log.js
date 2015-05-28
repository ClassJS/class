(function(global, undefined) {

    var ArraySlice = Array.prototype.slice;

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

    //重写并实现log方法
    var data = {
            arg: true,
            time: true,
            type: true,
            method: true
        },
        log = classjs.log = (function() {

            var index = 1;
            return function() {
                if (!this.debug) {
                    this.log = function() {};
                    return;
                }
                var callerInfo = log.getCallerInfo(arguments.callee.caller),
                    info,
                    time,
                    type;
                if (!callerInfo) {
                    return;
                }
                if (log.timeformat) {
                    time = dateFormat(new Date(), log.timeformat);
                }
                type = '[INFO-' + (index++) + ']';

                method = callerInfo.className + '.' + (callerInfo.isOverride ? '$' : '') + (callerInfo.isEventHandle ? '#' : '') + callerInfo.method;

                info = {
                    time: time,
                    type: type,
                    method: method,
                    arg: callerInfo.arg,
                    msg: {
                        info: [time || '', type, method].join(' '),
                        arg: callerInfo.arg
                    }
                };

                if (data) {
                    if (data.time == false) {
                        delete info.time;
                    }
                    if (data.type == false) {
                        delete info.type;
                    }
                    if (data.method == false) {
                        delete info.method;
                    }
                    if (data.arg == false) {
                        delete info.arg;
                    }
                }

                log.print(info);
            };
        })();

    classjs.merger(log, {
        maxLength: 100,
        setConfig: function(config) {
            classjs.merger(data, config);
        },
        timeformat: 'hh:mm:ss',
        getCallerInfo: function(caller) {
            var clazz = caller.__owner__,
                method = caller.__name__,
                arg = ArraySlice.call(caller.arguments, 0);

            if (!clazz && arg && arg[0] && arg[0].__isEvent__) {
                clazz = {
                    className: 'classjs.eventDispatch'
                };
                method = arg[0].__type__;
            }

            if (clazz) {
                return {
                    'class': clazz,
                    className: clazz.className,
                    method: method,
                    isOverride: caller.__isOverride__,
                    isEventHandle: caller.__isEventHandle__,
                    arg: arg
                };
            }
            return false;
        },
        print: (function() {
            if (!window.console || !window.console.info || /mobile/gi.test(navigator.userAgent)) {
                var DOC = document,
                    index = 0,
                    styleText = [
                        '.classjs-log-box {',
                        '    position: absolute;',
                        '    right: 0px;',
                        '    bottom: 0px;',
                        '    height: 200px;',
                        '    left: 0px;',
                        '    font-size: 14px;',
                        '    font-family: Verdana, Arial;',
                        '    overflow-y: auto;',
                        '    overflow-x: hidden;',
                        '    margin: 5px;',
                        '    text-shadow: 0px 0px 0px #000000;',
                        '    overflow-y: auto;',
                        '    overflow-x: hidden;',
                        '}',
                        '.classjs-log-item {',
                        '    white-space: nowrap;',
                        '}',
                        '.classjs-log-item .time {',
                        '    color: #555;',
                        '    padding-right: 3px;',
                        '}',
                        '.classjs-log-item .type {',
                        '    color: #091;',
                        '    padding-right: 3px;',
                        '}',
                        '.classjs-log-item .method {',
                        '    color: #08F;',
                        '}',
                        '.classjs-log-item .arg {',
                        '    color: #aaa;',
                        '    max-width: 70%;',
                        '    text-overflow: ellipsis;',
                        '    display: inline-block;',
                        '    overflow: hidden;',
                        '    vertical-align: bottom;',
                        '}',
                        '.classjs-log-item .arg .key {',
                        '    color: #CD3DC3;',
                        '}',
                        '.classjs-log-item .arg .value {',
                        '    color: #C86D6B;',
                        '}'
                    ].join('').replace(/\s\s/g, ''),

                    styleElem = DOC.createElement("style"),

                    logBox = DOC.createElement("div");

                styleElem.innerText = styleText;

                DOC.body.insertBefore(styleElem, DOC.body.lastChild);


                logBox.className = "classjs-log-box";

                DOC.body.insertBefore(logBox, DOC.body.lastChild);

                function getInfo(info) {
                    var arg = null,
                        result = [];
                    if (info.time) {
                        result.push('<span class="time">', info.time, '</span>');
                    }

                    if (info.type) {
                        result.push('<span class="type">', info.type, '</span>');
                    }

                    if (info.method) {
                        result.push('<span class="method">', info.method, '(</span>');
                    }

                    if (info.arg) {
                        arg = getArg(info.arg);
                        if (arg) {
                            result.push('<span class="arg">', arg, '</span>');
                        }
                    }
                    return result.join('') + '<span class="method">)</span>';
                };

                function getArg(arg) {
                    var args = [];
                    classjs.each(arg, function(i, item) {
                        if (classjs.isObject(item)) {
                            var o = [];
                            classjs.it(item, function(k, v) {
                                o.push('"<span class="key">' + k + '</span>" : <span class="value">"' + v + '</span>"');
                            });
                            args.push('{' + o.join(', ') + '}');
                        } else {
                            args.push(item);
                        }
                    });
                    return args.join(',');
                };

                return function(info) {
                    if (index >= this.maxLength) {
                        logBox.innerHTML = '';
                        index = 0;
                    }
                    var div = DOC.createElement("div");
                    div.className = "classjs-log-item";
                    div.innerHTML = getInfo(info);
                    logBox.appendChild(div);
                    logBox.scrollTop = logBox.scrollHeight;

                    index++;
                };
            } else {
                return function(info) {
                    console.info(info.msg.info + '()', info.msg.arg);
                };
            }
        })()
    });


})(this);
