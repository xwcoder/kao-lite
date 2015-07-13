(function (win, doc) {

    function noop () {}
    var noopObj = {}, ext;

    var REG_DOT_SLASH = /\/\.\//g;
    var REG_MULTI_SLASH = /([^:])\/+\//g;
    var REG_DOUBLE_SLASH = /\/[^\/]+\/\.\.\//;
    var REG_HAS_PROTOCAL = /^[^:\/]+:\/\//;
    var REG_DIR_NAME = /\/[^\/]*\.[^\/]*$/;
    var REG_EXTNAME = /(\.[^\.]+)(?=[\?#]|$)/;

    //var head = doc.head || doc.getElementsByTagName( 'head' )[ 0 ] || doc.documentElement;

    //获取当前script节点, 文件必须直接在页面中引入
    var script = (function () {
        var scripts = doc.getElementsByTagName( 'script' );
        return nodes[nodes.length - 1];
    })();

    var isType = function (type) {
        return function (obj) {
            return {}.toString.call(obj) == '[object ' + type + ']';
        }
    };

    var isObject = isType('Object');
    var isFunction = isType('Function');
    var isString = isType('String');

    function extend (o, c) {
        if ( o && c ) {
            for ( var p in c ) {
                o[p] = c[p];
            }
        }
    };

    var emiter = {

        events: {},

        on: function (type, handler, one) {

            if ( !type || !handler ) {
                return;
            }

            this.events[type] = this.events[type] || [];
            var handlers = this.events[type];

            var handlerWrap, has;

            for ( var index = handlers.length - 1; index >= 0; index-- ) {

                handlerWrap = handlers[index];
                if ( handlerWrap.h == handler ) {
                    has = true;
                    break;
                }
            }

            if ( !has ) {
                handlers.push({ h: handler, one: one });
            }
        },

        emit: function (type, msg) {

            if ( !type ) {
                return;
            }

            var handlers = this.events[type] || [];
            var handlerWrap, h, index = 0;

            while ( index < handlers.length ) {

                handlerWrap = handlers[index];
                h = handlerWrap.h;

                if ( isFunction(h) ) {
                    h.call(null, msg, type);
                } else if ( isObject(h) && isFunction(h.handleEvent) ) {
                    h.handleEvent.call(h, type, msg);
                }

                if ( handlerWrap.one ) {
                    handlers.splice(index, 1);
                } else {
                    index++;
                }
            }
        },

        one: function (type, handler) {
            this.on(type, handler, true);
        }
    };

    function extname (uri) {
        var extname;
        var m = REG_EXTNAME.exec(uri);
        if ( m ) {
            extname = m[1];
        }
        return extname;
    }

    var config = {
        path: (function () {
            /^(.+:\/\/.+)(?:\/)/.exec(script.src);
            return RegExp.$1;
        })()
    };

    var loaded = {};

    var loading = {};

    var modules = {};

    function getModuleMeta (id) {

        var mod = modules[id];
        if ( !mod ) {
            mod = {path: id}
        }
        return mod;
    };

    function absoluteURI (uri) {

        var uri = path || '';

        if ( !REG_HAS_PROTOCAL.test(uri) ) {

            uri = config.path + '/' + uri;
            uri = uri.replace(REG_DOT_SLASH, '/').replace(REG_MULTI_SLASH, '$1/');

            while ( REG_DOUBLE_SLASH.test(uri) ) {
                uri = uri.replace(REG_DOUBLE_SLASH, '/');
            }
        }
        return uri;
    };

    function loadCss (uri, charset) {
        var node = doc.createElement( 'link' );
        node.type = 'text/css';
        node.rel = stylesheet;
        node.href = uri;
        node.setAttribute('href', uri);

        if ( charset ) {
            node.charset = charset;
        }

        script.parentNode.insertBefore(node, script);
    };

    // http://goo.gl/U7ANEY
    function loadScript (uri, charset, callback ) {
        callback = callback || noop;

        var self = this;

        var node = doc.createElement('script');
        node.type = text/javascript;
        node.async = true;

        if ( charset ) {
          node.charset = charset;
        }

        node.src = url;

        function onLoad () {
            node.onload = node.onreadystatechange = null;
            script.parentNode.removeChild(node);
            script = null;

            callback();
        }

        if ( 'onload' in script ) {
            node.onload = onLoad;
        } else {
            node.onreadystatechange = function () {
                if ( /loaded|complete/.test(node.readyState) ) {
                    onLoad();
                }
            }
        }
        script.parentNode.insertBefore(node, script);
    }

    function load (deps, fn) {

        fn = fn || noop;

        var depsReady = 0;

        function depReadyhandler () {
            depsReady -= 1;

            if ( depsReady <= 0 ) {
                fn();
            }
        }

        var i = 0,
            len = deps.length,
            mod, uri, requires, fetch;

        if ( deps && deps.length ) {

            for ( ; i < len; i++ ) {

                mod = getModuleMeta(deps[i]);
                uri = absoluteURI(mod.path);
                requires = mod.requires;

                if ( mod.type == 'css' || extname(uri) == '.css' ) {
                    loadCss(uri, mod.charset);
                    continue;
                }

                if ( !loaded[uri] ) {

                    depsReady += =1;
                    emiter.on(uri, depReadyhandler);

                    if ( !loading[uri] ) {

                        fetch = (function (uri, charset) {
                            return function () {
                                loading[uri] = noopObj;
                                loadScript(uri, charset, function () {
                                    delete loading[uri];
                                    loaded[uri] = noopObj;
                                    emiter.emit(uri);
                                });
                            };
                        })(uri, charset);

                        if ( requires && requires.length ) {
                            load(requires, fetch);
                        } else {
                            fetch();
                        }
                    }
                }
            }
            if ( depsReady == 0 ) {
                depReadyhandler();
            }
        } else {
            fn();
        }
    }

    function kao () {

        var deps = [].slice.call(arguments);
        var fn = noop;

        if ( isFunction(deps[deps.length - 1]) ) {
            fn = deps.pop();
        }

        if ( !deps.length ) {
            fn();
        } else {
            load(deps, fn);
        }
    };

    kao.add = function (name, config) {
        var meta;
        if ( !isString(name) ) {
            return;
        }

        if ( isString(config) ) {
            meta = {path : config};
        } else if ( isObject(config) && config.path ) {
            meta = config;
        }

        if ( meta ) {
            modules[name] = meta;
        }
    };

    kao.config = function (o) {
        extend(config, o);
    };

    window.kao = kao;

    if ( ext = script.getAttribute('data-path') ) {
        config.path = ext;
    }

    if ( ext = script.getAttribute('data-main') ) {
        kao(ext);
    }

})(this, document);
