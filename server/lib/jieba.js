
var 
    _ = require('lodash'),
    jieba = require('nodejieba');

/**
 * 分词取唯一词
 * @param {String} str
 * @return {Array.<Object>}
 */
exports.uniq = function(str) {
    return _.uniq(jieba.tag(str).sort())
        .filter(function(item) {
            return !item.match(/\s/);
        })
        .map(function(item) {
            item = item.split(':');
            return {
                name: item[0],
                type: item[1]
            }
        });
};

/**
 * similar
 * @param {String|Array.<String>} arg1 
 * @param {Array.<String>} arg2 
 */
exports.similar = function(arg1, arg2) {
    if (!arg1) {
        return false;
    }
    return !(typeof arg1 === 'string' ? jieba.cut(arg1) : arg1)
        .filter(function(item) {
            return !!item;
        })
        .every(function(n) {
            return !n || arg2.every(function(m) {
                return !m || (n.indexOf(m) === -1 && m.indexOf(n) === -1);
            });
        });
};

