
const request = require('request-promise');

exports.dutu = async ({ image }) => {
  const upload = await request.post({
    url: 'http://image.baidu.com/pcdutu/a_upload?fr=html5&target=pcSearchImage&needJson=true',
    timeout: 5000,
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

  console.log(upload);
  const html = await request({
    url: 'http://image.baidu.com/pcdutu',
    qs: {
      // queryImageUrl: upload.url,
      // querySign: upload.querySign,
      queryImageUrl: 'http://b.hiphotos.baidu.com/image/%70%69%63/item/a1ec08fa513d269798e95b8c5efbb2fb4316d82d.jpg',
      querySign: '313463570,4135500842',
      fm: 'index',
      uptype: 'upload_pc',
      result: 'result_camera',
      vs: '99fbea2c8e9c2298fcb2838963cbaa3d0a3cbb56',
    },
  });
  console.log(html);
};

exports.dutu({
  image: require('fs').readFileSync(__dirname + '/maozi.png'),
});
