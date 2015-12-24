/**
 * @file 抓取验证码,并存之cache中
 * @date 2015-12-22
 */
var 
    async = require('async'),
    utils = require('../lib/utils'),
    db = require('./db'),
    cache = require('./cache');

/**
 * 拉取n张验证码处理
 * @param {Number} n
 * @return {Promise}
 */
exports.times = function(n, limit, delay) {
    limit = limit || 1;
    delay = !isNaN(delay) ? delay : 2000;
    return new Promise(function(resolve, reject) {
        // 暂时1个1个的拉
        async.timesLimit(n, limit, function(n, next) {
            console.log('fetch: ' + n);
            function _next() {
                var args = [].slice.call(arguments);
                setTimeout(function() {
                    next.apply(null, args);
                }, delay);
            }
            once()
                .then(function() {
                    _next(null);
                }).catch(function(err) {
                    console.log(err);
                    // continue when err
                    _next(null);
                });
        }, function(err) {
            err ? reject(err) : resolve();
        });
    });
};

/**
 * 拉取一张验证码，并处理
 */
function once() {
    return db.getPassCodeNew()
        .then(function(img) {
            return utils.cutImg(img).elements;
        })
        .then(function(datas) {
            datas.forEach(function(data) {
                cache.add(data);
            });
        });
};

