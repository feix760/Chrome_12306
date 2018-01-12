
const AipOcrClient = require('baidu-aip-sdk').ocr;
// var APP_ID = '10677820';
// var API_KEY = 'dZvHjpKsjRsp5WzkmHG3wQU6';
// var SECRET_KEY = 'UGOAziPvEE5c6eZvK91fmAvuyoZ4GwMK';

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
