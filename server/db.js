
var https = require('https'),
    url = require('url'),
    fs = require('fs');

exports.getPassCodeNew = function() {
    return new Promise(function(resolve, reject) {
        var req = https.request({
            hostname: 'kyfw.12306.cn',
            path: '/otn/passcodeNew/getPassCodeNew?module=login&rand=sjrand',
            rejectUnauthorized: false
        }, function(res) {
            var buff = new Buffer(0);
            res.on('data', function(data) {
                buff = Buffer.concat([buff, data]);
            })
            .on('end', function() {
                resolve(buff);
            })
            .on('error', function(e) {
                reject(e);
            });
        }).on('error', function(e) {
            reject(e);
        })
        .end();
    });
};

