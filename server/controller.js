/**
 * @file 控制器
 * @date 2015-12-22
 */
var
    ocrauth = require('./baiduocr/auth'),
    recognize = require('./recognize');

/**
 * @post
 */
exports.recognize = function(req, res) {
    var sk = req.body.sk,
        ak = req.body.ak,
        img = req.body.img,
        st = Date.now();
    console.log('req ak: %s, sk: %s, len: %s', ak, sk, img && img.length);
    if (!ak || !sk || !img) {
        return res.send({retCode: 300, msg: 'param err'});
    }
    img = img.replace(/^[^,]*,\s*/, '');
    recognize.result(new Buffer(img, 'base64'), ak, sk)
        .then(function(data) {
            var result = [];
            data.result.forEach(function(index) {
                result.push((index % 4) * 70 + 30);
                result.push(parseInt(index / 4) * 70 + 30);
            });
            console.log(data.question);
            console.log(data.keywords.map(function(item) {
                return item.join(' ');
            }));
            console.log(data.result);
            console.log('done. time used: %s', Date.now() - st);
            res.send({retCode: 0, result: result});
        })
        .catch(function(err) {
            res.send({retCode: 500, msg: (err || '').toString()});
        });
};

