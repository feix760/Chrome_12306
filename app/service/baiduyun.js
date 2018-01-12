
const AipOcrClient = require('baidu-aip-sdk').ocr;

exports.accurate = async args => {
  const {
    appId,
    appKey,
    appSecret,
    image,
  } = args;
  const client = new AipOcrClient(appId, appKey, appSecret);
  const result = await client.generalBasic(image.toString('base64'), {
    language_type: 'CHN_ENG',
  });
  if (result.error_code) {
    throw result;
  }
  return (result.words_result || []).map(item => item.words).join(' ');
};
