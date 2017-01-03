
var db = require('./db');

var recognize = function(url, base64, ak, sk) {
    return new Promise((resolve, reject) => {
        $.ajax(url, {
            type: 'post',
            data: {
                ak: ak,
                sk: sk,
                img: base64
            },
            success: (data) => {
                if (data && data.retCode === 0 && data.result.length) {
                    resolve(data.result);
                } else {
                    reject(data);
                }
            },
            error: () => {
                reject();
            }
        });
    });
};

exports.bind = function(checkcode) {
    checkcode.on('load', () => {
        if (!checkcode.waiting) {
            return;
        }
        var src = checkcode.src,
            base64 = checkcode.toBase64(),
            url = $('#baiduyun-url').val(),
            ak = $('#baiduyun-ak').val(),
            sk = $('#baiduyun-sk').val();
        if (!$('#baiduyun-enable')[0].checked || !url || !ak || !sk) {
            return;
        }
        var result = null;
        recognize(url, base64, ak, sk)
            .then((data) => {
                result = data;
                return db.checkRandCode(
                    checkcode.type === 'order' ? 2 : 1, result.join(',')
                );
            })
            .then((data) => {
                if (src === checkcode.src) {
                    checkcode.emit('recognize_succ', result, src);
                }
            })
            .catch((err) => {
                if (src === checkcode.src) {
                    checkcode.emit('recognize_err', src);
                }
            });
    });
};

