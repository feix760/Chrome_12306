var 
    async = require('async'),
    utils = require('./lib/utils'),
    jiebaUtils = require('./lib/jieba'),
    ocrdb = require('./baiduocr/db'),
    imgdb = require('./baiduimg/db');

/**
 * 分析结果
 * @param {Buffer} buf 图片
 * @return {Array.<String|Array>}
 */
exports.result = function(buf, ak, sk) {
    var info = utils.cutImg(buf);

    if (!info) {
        return Promise.reject('bad image');
    }

    var ocr = ocrdb.recognizeLine(info.questionBuf, ak, sk)
            .catch(function(err) {
                console.log('ocr failed: %s', err || '');
                return Promise.reject(err);
            }),
        keywords = new Promise(function(resolve, reject) {
            async.timesLimit(info.elementsBuf.length, 8, function(n, next) {
                imgdb.keyword(info.elementsBuf[n])
                    .then(function(words) {
                        next(null, words);
                    }).catch(function(err) {
                        console.log('get keyword failed: %s msg: %s', n, err || '');
                        next(null, []);
                    });
            }, function(err, datas) {
                resolve(datas);
            });
        });

    return Promise.all([ocr, keywords]).then(function(data) {
        var q = data[0],
            qwords = jiebaUtils.cut(q),
            keywords = data[1],
            result = [];
        keywords.forEach(function(words, i) {
            if (jiebaUtils.similar(qwords, words, true)) {
                result.push(i);
            }
        });
        return {
            question: q,
            keywords: keywords,
            result: result,
        };
    });
};

