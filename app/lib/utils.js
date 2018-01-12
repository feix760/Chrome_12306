/**
 * @file utils
 * @date 2015-12-22
 */
var fs = require('fs'),
  Canvas = require('canvas'),
  Image = Canvas.Image,
  cvsContext = new Canvas(293, 190).getContext('2d'),
  SIZE = 67,
  positions = function() {
    var list = [];
    for (var i = 0; i < 2; i++) {
      for (var j = 0; j < 4; j++) {
        list.push([5 + j * (SIZE + 5), 40 + i * (SIZE + 5)]);
      }
    }
    return list;
  }();

/**
 * 将ImageData转化成png buff
 * @param {ImageData} data
 * @return {Buffer}
 */
exports.data2Buf = function(data) {
  var cvs = new Canvas(data.width, data.height);
  cvs.getContext('2d').putImageData(data, 0, 0);
  return cvs.toBuffer();
}

/**
 * 判断是否是一张坏的验证码, 例如`你的操作过于频繁..`
 * @param {ImageData} data
 * @return {Boolean}
 */
exports.isBadImg = function(data) {
  var i, j, k,
    diff,
    totalCount = data.width * data.height,
    diffCount = 0,
    sameCount = 0,
    maxDiffCount = totalCount * 0.3,
    maxSameCount = totalCount - maxDiffCount;

  for (i = 0; i < data.height; i++) {
    for (j = 0; j < data.width; j++) {
      k = (data.width * i + j) * 3;
      diff = Math.abs(data.data[k] - 255) +
        Math.abs(data.data[k + 1] - 255) +
        Math.abs(data.data[k + 2] - 255);
      if (diff > 20) {
        diffCount++;
      } else {
        sameCount++;
      }
      if (diffCount > maxDiffCount) {
        return false;
      }
      if (sameCount > maxSameCount) {
        return true;
      }
    }
  }
  return false;
};

/**
 * 判断两张图片是否相同
 * @param {ImageData} data1
 * @param {ImageData} data2
 * @return {Boolean}
 */
exports.isSame = function(data1, data2) {
  var i, j, k,
    diff,
    totalCount = data1.width * data1.height,
    diffCount = 0,
    sameCount = 0,
    maxDiffCount = totalCount * 0.3,
    maxSameCount = totalCount - maxDiffCount;

  for (i = 0; i < data1.height; i++) {
    for (j = 0; j < data1.width; j++) {
      k = (data1.width * i + j) * 3;
      diffNull = Math.abs(data1.data[k] - 255) +
        Math.abs(data1.data[k + 1] - 255) +
        Math.abs(data1.data[k + 2] - 255);
      if (diffNull < 20) {
        maxDiffCount--;
        maxSameCount--;
        continue;
      }
      diff = Math.abs(data1.data[k] - data2.data[k]) +
        Math.abs(data1.data[k + 1] - data2.data[k + 1]) +
        Math.abs(data1.data[k + 2] - data2.data[k + 2]);
      if (diff > 20) {
        diffCount++;
      } else {
        sameCount++;
      }
      if (diffCount > maxDiffCount) {
        return false;
      }
      if (sameCount > maxSameCount) {
        return true;
      }
    }
  }
  return true;
};

/**
 * 裁剪一张4*2的验证码
 * @param {Buffer} data
 * @return {Object}
 *     {
 *          elements: {Array.<ImageData>},
 *          elementsBuf: {Array.<Buffer>},
 *          question: {ImageData}，
 *          questionBuf: {Buffer}
 *     }
 */
exports.cutImg = function(data) {
  var img = new Image();
  img.src = data;
  cvsContext.drawImage(img, 0, 0);

  if (exports.isBadImg(cvsContext.getImageData(0, 0, img.width, img.height))) {
    return null;
  }

  var all = {
    elements: positions.map(function(item, i) {
      return cvsContext.getImageData(item[0], item[1], SIZE, SIZE);
    }),
    question: cvsContext.getImageData(120, 0, 100, 30)
  }
  all.questionBuf = exports.data2Buf(all.question);
  all.elementsBuf = all.elements.map(exports.data2Buf);
  return all;
};

exports.parse = function(str, useEval) {
  try {
    return useEval ? eval('(' + str + ')') : JSON.parse(str);
  } catch (ex) {
    console.log(ex);
    return null;
  }
};

exports.random = function() {
  return (new Date().toISOString() + Math.random())
    .replace(/[^\d]+/g, '').substr(4, 20);
};

exports.logFile = function(data) {
  fs.writeFileSync(__dirname + '/tmp' + exports.random() + '.png', data);
};
