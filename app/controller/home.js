
const ocr = require('../service/ocr');

exports.index = async ctx => {
  const startAt = Date.now();
  const {
    appId,
    appKey,
    appSecret,
    image,
  } = ctx.request.body || {};

  if (!appId || !appKey || !appSecret || !image) {
    ctx.body = {
      success: false,
      code: 400,
      message: '参数错误',
    };
    return;
  }

  console.info('appId: %s, appKey: %s, appSecret: %s, imageLength: %s', appId, appKey, appSecret, image.length);

  const imageBuffer = new Buffer(image.replace(/^[^,]*,\s*/, ''), 'base64');

  const { text, value } = await ocr.recognizeCheckcode({
    appId,
    appKey,
    appSecret,
    image: imageBuffer,
  });

  console.info(text);
  console.info(value);

  ctx.body = {
    success: !!value.length,
    data: {
      text,
      value,
      timeUsed: Date.now() - startAt,
    },
  };
};
