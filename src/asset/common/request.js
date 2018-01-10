
import querystring from 'querystring';

export default function(url, option = {}) {
  if (typeof url === 'object') {
    option = url;
    url = option.url;
  }

  option = {
    credentials: 'include',
    ...option,
  };

  if (option.method === 'POST') {
    option.headers = {
      'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
      ...option.headers,
    };
  }

  if (typeof option.data === 'object') {
    const param = querystring.stringify(option.data);
    if (option.method === 'GET') {
      url = `${url}${url.match(/\?/) ? '&' : '?'}${param}`;
    } else {
      option.body = param;
    }
    delete option.data;
  }
  if (option.method === 'GET') {
    url = `${url}${url.match(/\?/) ? '&' : '?'}_=${Math.random()}`;
  }
  return fetch(url, option).then(response => {
    return option.dataType === 'html' ? response.text() : response.json();
  });
}
