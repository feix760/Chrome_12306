/**
 * @file 百度云ocr接口
 *  http://bce.baidu.com/doc/OCR/API.html
 * @date 2015-12-22
 */
var 
    request = require('request'),
    utils = require('../lib/utils');
    auth = require('./auth');

/**
 * 识别一行文字
 * @param {Buffer} buf 图片
 * @return {Promise.resolve(String)}
 */
exports.recognizeLine = function(buf, ak, sk) {
    var post = JSON.stringify({
            base64: buf.toString('base64')
        }),
        opt = {
            ak: ak || '',
            sk: sk || '',
            url: 'http://ocr.bj.baidubce.com/v1/recognize/line',
            method: 'POST',
            headers: {
                'content-length': post.length,
                'content-type': 'application/json'
            }
        },
        headers = auth.authorization(opt);

    return new Promise(function(resolve, reject) {
        request(
            {
                url: opt.url,
                method: opt.method,
                headers: headers,
                timeout: 5000,
                //json: true, // 有点问题
                body: post
            }, 
            function (err, res, body) {
                var data = utils.parse(body);
                if (!err && res.statusCode === 200) {
                    if (data && data.results && data.results.length) {
                        resolve(data.results[0].word); 
                    } else {
                        reject('recognize failed');
                    }
                } else {
                    reject(err || res.statusCode);
                }
            }
        );
    });
};

