
String.format = function(pattern) {
    var values = [].slice.apply(arguments)
    values.splice(0, 1);
    return pattern.replace(/%(\d+)/g, function(word, i) {
        return i < values.length ? values[i] : word;
    });
};

Date.prototype.pattern = function(fmt) {
    var week = {
        0: '星期日',
        1: '星期一',
        2: '星期二',
        3: '星期三',
        4: '星期四',
        5: '星期五',
        6: '星期六'
    };
    var o = {
        E: week[this.getDay() + ''],
        y: this.getFullYear(), //年
        M: this.getMonth() + 1, //月份
        d: this.getDate(), //日
        h: this.getHours() % 12 === 0 ? 12 : this.getHours() % 12, //小时
        H: this.getHours(), //小时
        m: this.getMinutes(), //分
        s: this.getSeconds(), //秒
        q: Math.floor((this.getMonth() + 3) / 3), //季度
        S: this.getMilliseconds() //毫秒
    };

    for (var k in o) {
        fmt = fmt.replace(new RegExp(k + '+', 'g'), function(w) {
            var value = (k != 'E') ? '000' + o[k] : o[k];
            return value.substr(value.length - w.length >= 0 ? value.length - w.length : 0);
        });
    }
    return fmt;
};

