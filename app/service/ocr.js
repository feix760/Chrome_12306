
const asyncModule = require('async');
const Canvas = require('canvas');
const Image = Canvas.Image;

const baiduimg = require('./baiduimg');
const baiduyun = require('./baiduyun');

function getImageBuffer(context, x1, y1, x2, y2) {
  const imageData = context.getImageData(x1, y1, x2, y2);
  const canvas = new Canvas(x2 - x1, y2 - y1);
  canvas.getContext('2d').putImageData(imageData, 0, 0);
  return canvas.toBuffer();
}

function parseCheckcode(source) {
  const image = new Image();
  image.src = source;
  const context = new Canvas(293, 190).getContext('2d');
  context.drawImage(image, 0, 0);
  return {
    image,
    context,
  };
}

function cutImage(source) {
  const { context } = getCheckcodeContext(source);

  const width = 67;
  const list = [];
  for (let i = 0; i < 2; i++) {
    for (let j = 0; j < 4; j++) {
      list.push([ 5 + j * (width + 5), 40 + i * (width + 5) ]);
    }
  }

  return {
    text: getImageBuffer(context, 120, 0, 100, 30),
    imageList: list.map(({ x, y }) => getImageBuffer(context, x, y, x + width, y + width)),
  };
}

async function isSimilar(info, text) {
  return true;
}

// 判断是否是一张坏的验证码, 例如`你的操作过于频繁..`
exports.isBadImage = async source => {
  const { context, image } = getCheckcodeContext(source);
  const data = context.getImageData(0, 0, image.width, image.height);

  const totalCount = data.width * data.height;
  const maxDiffCount = totalCount * 0.3;
  const maxSameCount = totalCount - maxDiffCount;
  let diffCount = 0;
  let sameCount = 0;

  for (let i = 0; i < data.height; i++) {
    for (let j = 0; j < data.width; j++) {
      const k = (data.width * i + j) * 3;
      const diff = Math.abs(data.data[k] - 255)
        + Math.abs(data.data[k + 1] - 255)
        + Math.abs(data.data[k + 2] - 255);
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

exports.recognizeCheckcode = async args => {
  const {
    appId,
    appKey,
    appSecret,
    image,
  } = args;

  const cut = cutImage(image);

  const text = await baiduyun.accurate({
    appId,
    appKey,
    appSecret,
    image: cut.text,
  });

  const result = await new Promise((resolve, reject) => {
    asyncModule.mapLimit(
      cut.imageList,
      3,
      async image => {
        const info = await baiduimg.dutu(image);
        return await isSimilar(info, text);
      },
      (err, result) => {
        err ? reject(err) : resolve(result);
      }
    );
  });

  return result;
};
