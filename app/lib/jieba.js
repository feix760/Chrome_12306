
var _ = require('lodash'),
  jieba = require('nodejieba');

/**
 * 分词并去除空格空字符
 * @param {String} str
 * @return {Array.<String>}
 */
exports.cut = function(str) {
  return jieba.cut(str || '')
    .map(function(item) {
      return item.trim();
    })
    .filter(function(item) {
      return !!item;
    });
};

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
 * @param {Array.<String>} arg1
 * @param {Array.<String>} arg2
 * @param {?Boolean} rough
 * @return {Boolean}
 */
exports.similar = function(arg1, arg2, rough) {
  return rough ?
    roughSimilar(arg1, arg2) :
    strictSimilar(arg1, arg2);
};

/**
 * 严格地判断关键词相似关系
 * 两个关键词必须一方包含另一方
 * @param {Array.<String>} arg1
 * @param {Array.<String>} arg2
 * @return {Boolean}
 */
function strictSimilar(arg1, arg2) {
  return !arg1.every(function(n) {
    return !n || arg2.every(function(m) {
      return !m || (n.indexOf(m) === -1 && m.indexOf(n) === -1);
    });
  });
}

/**
 * 粗糙地判断关键词相似关系
 * 两个关键词包含同一个字即认为相同
 * @param {Array.<String>} arg1
 * @param {Array.<String>} arg2
 * @return {Boolean}
 */
function roughSimilar(arg1, arg2) {
  arg1 = arg1.join('').replace(/\s/g, '');
  arg2 = arg2.join('').replace(/\s/g, '');
  for (var i = 0; i < arg1.length; i++) {
    for (var j = 0; j < arg2.length; j++) {
      if (arg1[i] === arg2[j]) {
        return true;
      }
    }
  }
  return false;
}
