var tabIds = {},
    mainPage = chrome.extension.getURL('pages/index/main.html');

chrome.browserAction.onClicked.addListener(function(tab) {
    chrome.tabs.query({
        active: true,
        currentWindow: true
    }, function(tabs) {
        var tab = tabs[0];
        chrome.tabs.update(tab.id, {
            url: mainPage
        }, function() {

        });
    });
});

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    if (changeInfo.status === 'loading') {
        if (tab.url === mainPage) {
            tabIds[tabId] = true;
        } else {
            tabIds[tabId] && delete tabIds[tabId];
        }
    }
});

// 添加特殊请求头 _$Origin -> Origin
chrome.webRequest.onBeforeSendHeaders.addListener(function(details) {
    var headers = details.requestHeaders;
    // 跳过非插件发出的请求
    if (!tabIds[details.tabId]) {
        return {
            requestHeaders: headers
        };
    }
    var customHeaderNames = {};
    for (var i in headers) {
        var item = headers[i];
        if (item.name.indexOf('_$') === 0) {
            var name = item.name.replace(/^_\$/,'');
            customHeaderNames[name] = true;
        }
    }
    var finalHeaders = [];
    for (var i in headers) {
        var item = headers[i];
        if (item.name.indexOf('_$') === 0) {
            var name = item.name.replace(/^_\$/,'');
            finalHeaders.push({
                name: name, 
                value: item.value
            });
        } else if (!customHeaderNames[item.name]) {
            finalHeaders.push(item);
        }
    }
    return {
        requestHeaders: finalHeaders
    };
}, {
    urls: ['http://*/*', "https://*/*"]
}, ["blocking", "requestHeaders"]);

