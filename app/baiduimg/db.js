/**
 * @file 百度图片接口
 *  http://image.baidu.com/
 * @date 2015-12-22
 */
var utils = require('../lib/utils');
  jiebaUtils = require('../lib/jieba'),
  request = require('request');

/**
 * 获取图片关键字
 * @param {Buffer} buf 图片
 * @return {Promise.resolve(Array.<String>)}
 */
exports.keyword = function(buf) {
  return upload(buf)
    .then(function(url) {
      return getKeyword(url);
    });
};

function upload(buf) {
  return new Promise(function(resolve, reject) {
    request.post({
        url: 'http://image.baidu.com/pictureup/uploadshitu?fr=flash&fm=index&pos=upload',
        timeout: 5000,
        formData: {
          filesize: buf.length,
          newfilesize: buf.length,
          fileheight: 0,
          filewidth: 0,
          Filename: 'tmp.png',
          filetype: '.png',
          Upload: 'Submit Query',
          filedata: {
            value: buf,
            options: {
              filename: 'tmp.png',
              contentType: 'application/octet-stream'
            }
          }
        }
      },
      function(err, res, body) {
        if (!err && res.statusCode === 200 && body) {
          resolve('http://image.baidu.com' + body);
        } else {
          reject(err || res.statusCode);
        }
      }
    );
  });
}

function getKeyword(url) {
  return new Promise(function(resolve, reject) {
    request({
        timeout: 5000,
        url: url
      },
      function(err, res, body) {
        if (!err && body) {
          resolve(_getKeyword(body));
        } else {
          reject(err || res.statusCode);
        }
      }
    );
  });
}

/**
 * _getKeyword
 * @param {String} str
 * @return {Array.<String>}
 */
function _getKeyword(str) {
  var words = [];
  str.replace(/<a [^>]*guess-info-word-link[^>]*>([^<]*)</g, function(str) {
    words.push(RegExp.$1.trim());
    return str;
  });
  // 网页图片关键词
  if (!words.length) {
    var similarData = str.match(/similarData\s*:\s*('[^']+')/) &&
      utils.parse(utils.parse(RegExp.$1, true)) || [];
    var infos = [];
    similarData.forEach(function(item) {
      if (item.simid_info && item.simid_info.tags) {
        var words2 = (item.simid_info.tags['keyword-cont2'] || [])
          .map(function(n) {
            return n.keyword || '';
          }),
          words = (item.simid_info.tags['keyword-cont'] || [])
          .map(function(n) {
            return (n.candidates || []).map(function(m) {
              return m.candi_word || '';
            }).join(' ');
          });
        words = words.concat(words2);
        infos = infos.concat(
          jiebaUtils.uniq(words.join(' '))
          .filter(function(item) {
            return item.type === 'n';
          })
          .map(function(item) {
            return item.name;
          })
        );
      }
    });
    words = words.concat(infos);
  }
  return words;
}
