
const request = require('request-promise-native');

exports.dutu = async ({ image }) => {
  const client = request.defaults({ jar: true });

  const upload = await client.post({
    url: 'http://image.baidu.com/pcdutu/a_upload?fr=html5&target=pcSearchImage&needJson=true',
    timeout: 5000,
    json: true,
    formData: {
      pos: 'upload',
      uptype: 'upload_pc',
      fm: 'index',
      file: {
        value: image,
        options: {
          filename: 'xxx.png',
          contentType: 'application/octet-stream'
        }
      },
    },
  });

  const html = await client({
    url: 'http://image.baidu.com/pcdutu',
    qs: {
      queryImageUrl: upload.url,
      querySign: upload.querySign,
      fm: 'index',
      uptype: 'upload_pc',
      result: 'result_camera',
      vs: '',
    },
  });

  const str = html.match(/<script>\s*window.bd\s*=\s*(\{[\s\S]*?\})[^}]*<\/script>/) && RegExp.$1 || '{}';

  const json = eval(`(${str})`);

  const simiList = (json.simiList || []).map(({ FromPageSummary, FromPageSummaryOrig }) => ({
    FromPageSummary,
    FromPageSummaryOrig,
  }));

  return {
    word: json.word,
    guessWord: json.guessWord,
    simiList,
  };
};
