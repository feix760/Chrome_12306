/*
 *  chrome除沙箱不能执行eval，所以编一个简单的template处理组件
 *  接口名类似artTemplate的，但只提供变量替换的功能
 */
(function(global) {
    var T = {
        render: function(id, data) {
            var document = global.document,
                    templateCode = document.getElementById(id).innerHTML;
            // script id 编译缓存
            if (!T._compliedIdCache[id]
                    || T._compliedIdCache[id].code != templateCode) {
                T._compliedIdCache[id] = {
                    code: templateCode,
                    cache: T.complie(templateCode)
                };
            }
            return T._compliedIdCache[id].cache(data);
        },
        _compliedIdCache: {},
        complie: function(templateCode) {
            var names = [],
                    expr = /\{\{([^}]+)\}\}/g,
                    s = templateCode.split(/\{\{[^}]+\}\}/);
            while (expr.exec(templateCode)) {
                names.push(RegExp.$1);
            }
            return function(data) {
                var out = s[0];
                for (var i = 0; i < names.length; i++) {
                    var name = names[i];
                    if (name == '{') {
                        out += '{';
                    } else if (data[name]) {
                        out += data[name];
                    } else {
                        out += '{{' + name + '}}';
                    }
                    out += s[i + 1];
                }
                return out;
            };
        },
        utils: {
            exprEscape: function(str) {
                return str.replace(/[\\\^$*+?{}[\](),.!\-|]/g, '\\$&');
            },
            extend: function(o1, o2) {
                for (var k in o2) {
                    o1[k] = o2[k];
                }
                return o1;
            }
        }
    };

    T.utils.extend(T.render, T);
    global.T = global.template = T.render;

})(this);