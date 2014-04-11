
/* 标记锁 boolean $(obj).lock()    $(obj).free()  */
(function() {
    function lock() {
        if (this.length < 1)
            return;
        var obj = $(this.get(0));
        if (obj.attr('locking') != null && obj.attr('locking') == 'true') {
            return false;
        } else {
            obj.attr('locking', 'true');
            return true;
        }
    }
    function free() {
        if (this.length < 1)
            return;
        var obj = $(this.get(0));
        obj.attr('locking', 'false');
        return true;
    }
    $.fn.extend({
        lock: lock,
        free: free
    });
})();

/* ajax 提交表单 返回json  $(form).jsonSubmit([ url ,] function callback(data){}) */
(function() {
    function jsonSubmit(url, callback) {
        var theForm = this;
        if (typeof url != 'string') {
            callback = url;
            url = theForm.attr('action');
        }

        $.ajax(url, {
            data: theForm.serialize() + "&t=" + new Date().getTime(),
            type: 'post',
            dataType: 'json',
            success: function(data) {
                if (typeof callback == 'function')
                    callback(data);
            },
            error: function() {
                if (typeof callback == 'function')
                    callback({
                        success: false,
                        info: '网络错误！'
                    });
            }
        });
    }
    $.fn.extend({
        jsonSubmit: jsonSubmit
    });
})();



/* 返回url查询参数
 * getParameter (url, name, all)
 * 如果url==null将使用当前页的url
 * 如果没有指定name则以对象的形式返回所有参数(例如 ?name=1&name=2&age=23 返回{name:['1','2'],age:'23'})
 * 如果指定name并且指定all=true则以数组形式返回name对应的所有值,否则只返回第一个值，空时返回''
 * */
(function() {
    function getParameterObj(search) {
        var param = {},
                p = search.split('&'),
                i;
        var name, val, temp;
        for (i in p) {
            if (p[i].indexOf('=') == -1)
                continue;
            name = p[i].split('=')[0];
            val = p[i].split('=')[1];
            if (/^\s*$/.test(name))
                continue;
            if (typeof param[name] == 'undefined') {
                param[name] = val;
            } else if (typeof param[name] == 'string') {
                temp = param[name];
                param[name] = [];
                param[name].push(temp);
                param[name].push(val);
            } else {
                param[name].push(val);
            }
        }
        return param;
    }
    window.getParameter = function(url, name, all) {
        var search;
        if (url == null)
            search = window.location.search.replace(/^[\s\S]*\?/, '');
        else
            search = url.replace(/^[\s\S]*\?/, '');
        var decodedSearch = decodeURIComponent(search);
        var param = getParameterObj(decodedSearch);

        if (typeof name != 'string')
            return param;
        else {
            if (typeof all != 'undefined' && all) {
                if (typeof param[name] == 'undefined')
                    return [];
                else if (typeof param[name] == 'string')
                    return [param[name]];
                else
                    return param[name];
            } else {
                if (typeof param[name] == 'undefined')
                    return '';
                else if (typeof param[name] == 'string')
                    return param[name];
                else
                    return param[name][0];
            }
        }
    };
})();
/*  extend String  */
(function() {
    String.prototype.trim = function() {
        return $.trim(this);
    };
    String.prototype.empty = function() {
        return this == null || $.trim(this) == '';
    };
})();

//task queue
(function() {
    window.Queue = function() {
        if (this.constructor != Queue) {
            return new Queue();
        }
        this._init();
    };
    $.extend(Queue.prototype, {
        _init: function() {
            this.stack = [];
            this.waitCalls = [];
        },
        clear: function() {
            this._init();
        },
        next: function() {
            if (this.stack.length > 0) {
                this.stack.shift().apply(window, arguments);
            } else {
                this.waitCalls.push(arguments);
            }
        },
        step: function(call) {
            this.stack.push(call);
            if (this.waitCalls.length > 0) {
                this.next.apply(this, this.waitCalls.shift());
            }
        }
    });
})();


Date.prototype.pattern = function(fmt) {
    var week = {
        "0": "星期日",
        "1": "星期一",
        "2": "星期二",
        "3": "星期三",
        "4": "星期四",
        "5": "星期五",
        "6": "星期六"
    };
    var o = {
        'E': week[this.getDay() + ""],
        'y': this.getFullYear(), //年
        "M": this.getMonth() + 1, //月份
        "d": this.getDate(), //日
        "h": this.getHours() % 12 === 0 ? 12 : this.getHours() % 12, //小时
        "H": this.getHours(), //小时
        "m": this.getMinutes(), //分
        "s": this.getSeconds(), //秒
        "q": Math.floor((this.getMonth() + 3) / 3), //季度
        "S": this.getMilliseconds() //毫秒
    };

    for (var k in o) {
        fmt = fmt.replace(new RegExp(k + '+', 'g'), function(w) {
            var value = (k != 'E') ? '000' + o[k] : o[k];
            return value.substr(value.length - w.length >= 0 ? value.length - w.length : 0);
        });
    }
    return fmt;
};

(function() {
    // formatFloat(23.3,'3.2') '023.30'
    // formatFloat(23.3,'.2')  '23.30'
    // formatFloat(23.3,'3')  '023.3'
    window.formatFloat = function(v, pattern) {
        var match = ('' + v).match(/([0-9]*)(\.)?([0-9]*)/);
        var iv = match[1], fv = match[3];
        var pmatch = pattern.match(/([0-9]*)(\.)?([0-9]*)/);
        var ivp = pmatch[1], fvp = pmatch[3];
        var j, len;
        if (ivp) {
            ivp = parseInt(ivp);
            iv = iv ? iv : '0';
            len = ivp - iv.length;
            for (j = 0; j < len; j++) {
                iv = '0' + iv;
            }
        }
        if (fvp) {
            fvp = parseInt(fvp);
            fv = fv ? fv : '';
            len = fvp - fv.length;
            for (j = 0; j < len; j++) {
                fv = fv + '0';
            }
            fv = fv.substr(0, fvp);
        }

        var ans;
        if (fv) {
            ans = iv + '.' + fv;
        } else {
            ans = iv;
        }
        return ans;
    };
})();