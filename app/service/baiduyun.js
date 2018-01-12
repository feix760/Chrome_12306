
const AipOcrClient = require('baidu-aip-sdk').ocr;

exports.accurate = async args => {
  const {
    appId,
    appKey,
    appSecret,
    image,
  } = args;
  const client = new AipOcrClient(APP_ID, API_KEY, SECRET_KEY);
  const result = await client.generalBasic(image, {
    language_type: 'CHN_ENG',
  });
  return (result.words_result || []).map(item => item.words).join(' ');
};
