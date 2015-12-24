/**
 * @file 图库
 * @date 2015-12-22
 */
var fs = require('fs'),
    md5 = require('md5'),
    path = require('path'),
    Canvas = require('canvas'),
    async = require('async'),
    Image = Canvas.Image,
    utils = require('../lib/utils'),
    PATH = __dirname + '/.img';
    cachePool = [];

/**
 * 加载缓存的图片至cachePool
 */
exports.init = function() {
    var ctx = null,
        dir = PATH;
    fs.existsSync(dir) && fs.readdirSync(dir).forEach(function(subpath) {
        if (subpath.match(/(\w+)\.png/)) {
            var name = RegExp.$1,
                img = new Image();
            img.src = fs.readFileSync(path.join(dir, subpath));
            if (!ctx) {
                ctx = new Canvas(img.width, img.height).getContext('2d');
            }
            ctx.drawImage(img, 0, 0);
            var iData = ctx.getImageData(0, 0, img.width, img.height);
            // 信息
            var jPath = path.join(dir, name + '.json');
            if (fs.existsSync(jPath)) {
                iData.json = JSON.parse(fs.readFileSync(jPath).toString());
            }
            cachePool.push(iData);
        }
    });
    console.log('loaded cache count: ' + cachePool.length);
};

/**
 * 保存之缓存
 * @param {ImageData} data
 * @return {Boolean} 是否新增
 */
exports.add = function(data) {
    var st = Date.now();
    if (!exists(data)) {
        console.log(Date.now() - st);

        var buf = utils.data2Buf(data),
            uri = path.join(PATH, md5(buf).slice(0, 8) + '.png');

        !fs.existsSync(path.dirname(uri)) 
            && fs.mkdirSync(path.dirname(uri));

        fs.writeFileSync(uri, buf);

        cachePool.push(data);
        return true;
    } else {
        console.log('exists in cache, cache size: ' + cachePool.length);
        return false;
    }
};

/**
 * 判断池中是否存在相似的图片
 * @param {ImageData} data
 */
function exists(data) {
    return !cachePool.every(function(item) {
        return !utils.isSame(data, item);
    });
}

