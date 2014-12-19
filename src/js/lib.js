
String.format = function(pattern) {
    var values = [].slice.apply(arguments)
    values.splice(0, 1);
    return pattern.replace(/%(\d+)/g, function(word, i) {
        return i < values.length ? values[i] : word;
    });
};

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
        var iv = match[1],
            fv = match[3];
        var pmatch = pattern.match(/([0-9]*)(\.)?([0-9]*)/);
        var ivp = pmatch[1],
            fvp = pmatch[3];
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
