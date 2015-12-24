/**
 * @file 请求服务
 * @date 2015-12-22
 */
var request = require('request');

exports.getPassCodeNew = function() {
    return new Promise(function(resolve, reject) {
        request(
            {
                uri: 'https://kyfw.12306.cn/otn/passcodeNew/getPassCodeNew' 
                    + '?module=login&rand=sjrand', 
                timeout: 5000,
                encoding: null, // set res to buffer
                strictSSL: false // accept 12306's ssl
            },
            function (err, res, body) {
                if (!err && res.statusCode == 200) {
                    resolve(body);
                } else {
                    reject(err);
                }
            }
        );
    });
};

