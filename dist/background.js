const tabIds = {};
const mainPage = chrome.extension.getURL('html/index.html');

chrome.browserAction.onClicked.addListener(tab => {
  chrome.tabs.query(
    {
      active: true,
      currentWindow: true
    },
    tabs => {
      chrome.tabs.update(tabs[0].id, { url: mainPage });
    }
  );
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'loading') {
    if (tab.url && tab.url.indexOf(mainPage) === 0) {
      tabIds[tabId] = true;
    } else {
      tabIds[tabId] && delete tabIds[tabId];
    }
  }
});

const webRequestFilter ={
  urls: ['http://kyfw.12306.cn/*', "https://kyfw.12306.cn/*"],
};

// 添加特殊请求头 _$Origin -> Origin
chrome.webRequest.onBeforeSendHeaders.addListener(
  ({ tabId, requestHeaders }) => {
    // 跳过非插件发出的请求
    if (tabIds[tabId]) {
      requestHeaders.slice().forEach(item => {
        if (item.name.match(/^_\$(.+)/)) {
          const name = RegExp.$1;
          requestHeaders = requestHeaders.filter(item => item.name !== name);
          item.name = name;
        }
      });
    }

    return {
      requestHeaders,
    };
  },
  webRequestFilter,
  ['blocking', 'requestHeaders']
);

// 删除缓存头
chrome.webRequest.onHeadersReceived.addListener(
  ({ tabId, responseHeaders }) => {
    // 跳过非插件发出的请求
    if (tabIds[tabId]) {
      requestHeaders = responseHeaders.filter((item) => {
        return item.name !== 'Expires';
      });
    }
    return {
      responseHeaders,
    };
  },
  webRequestFilter,
  ['blocking', 'responseHeaders']
);
