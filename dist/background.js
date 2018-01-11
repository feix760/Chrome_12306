const tabIds = {};
const mainPage = chrome.extension.getURL('html/index.html');

chrome.browserAction.onClicked.addListener(tab => {
  chrome.tabs.query({
    active: true,
    currentWindow: true
  }, (tabs) => {
    const tab = tabs[0];
    chrome.tabs.update(tab.id, {
      url: mainPage
    }, () => {

    });
  });
});

const targetUrls = ['http://kyfw.12306.cn/*', "https://kyfw.12306.cn/*"];

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'loading') {
    if (tab.url === mainPage) {
      tabIds[tabId] = true;
    } else {
      tabIds[tabId] && delete tabIds[tabId];
    }
  }
});

// 添加特殊请求头 _$Origin -> Origin
chrome.webRequest.onBeforeSendHeaders.addListener(
  (details) => {
    const headers = details.requestHeaders;
    // 跳过非插件发出的请求
    if (!tabIds[details.tabId]) {
      return {
        requestHeaders: headers
      };
    }
    const customHeaderNames = {};
    headers.forEach((item) => {
      if (item.name.indexOf('_$') === 0) {
        const name = item.name.replace(/^_\$/, '');
        customHeaderNames[name] = true;
      }
    });

    const finalHeaders = [];
    headers.forEach((item) => {
      if (item.name.indexOf('_$') === 0) {
        const name = item.name.replace(/^_\$/, '');
        finalHeaders.push({
          name: name,
          value: item.value
        });
      } else if (!customHeaderNames[item.name]) {
        finalHeaders.push(item);
      }
    });

    return {
      requestHeaders: finalHeaders
    };
  }, {
    urls: targetUrls
  }, ["blocking", "requestHeaders"]
);

chrome.webRequest.onHeadersReceived.addListener(
  (details) => {
    // 跳过非插件发出的请求
    if (!tabIds[details.tabId]) {
      return {
        responseHeaders: headers
      };
    }
    return {
      responseHeaders: details.responseHeaders.filter((item) => {
        return item.name !== 'Expires';
      })
    };
  }, {
    urls: targetUrls
  }, ["blocking", "responseHeaders"]
);
