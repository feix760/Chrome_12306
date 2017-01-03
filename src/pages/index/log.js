
var 
    utils = require('common/utils'),
    $wrap = $('.log_wrapper'),
    $container = $('.log');

var getId = function() {
    var id = 0;
    return () => {
        return ('0000000000' + ++id).match(/[\w]{6}$/)[0];
    };
}();

function log() {
    var args = [].slice.call(arguments);
    if (!args[0]) {
        return;
    }
    if (typeof args[0] !== 'string') {
        args[0] = JSON.stringify(args[0]);
    }
    var text = utils.format.apply(utils, args);
    var id = $('<span></span>')
        .html('&nbsp;&nbsp;&nbsp;' + getId() + '&nbsp;');
    var t = $('<span></span>').text(text);
    $container.append($('<div></div>').append(id).append(t));
    //新增一条再删除一条
    if ($container.find('> div').length > 200) {
        $container.find('> div:first').remove();
    }
    //滚动滚动条至最下面
    setTimeout(() => {
        $wrap.each((i, ele) => {
            var $ele = $(ele);
            var th = $ele.height(),
                lh = $ele.find('.log').height();
            if (lh > th) {
                $ele.scrollTop(lh - th);
            }
        });
    }, 10);
}

function clear() {
    $container.html('');
}

module.exports = {
    log: log,
    clear: clear,
    init: function() {
        $(document).on('click', '.clear_log', clear);

        setInterval(() => {
            $('#time').text(new Date().pattern('HH:mm:ss'));
        }, 1000);
    }
};

