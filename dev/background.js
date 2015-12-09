//"browser_action": {"default_icon": "icon.png", "default_popup": "popup.html"},
chrome.browserAction.onClicked.addListener(function(tab) {
    var url = chrome.extension.getURL('pages/index/main.html');
    chrome.tabs.query({
        active: true,
        currentWindow: true
    }, function(tabs) {
        var tab = tabs[0];
        chrome.tabs.update(tab.id, {
            url: url
        }, function() {

        });
    });
});
// 添加特殊请求头 _$Origin -> Origin
chrome.webRequest.onBeforeSendHeaders.addListener(function(details) {
    var headers = details.requestHeaders;
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

