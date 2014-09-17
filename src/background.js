//"browser_action": {"default_icon": "icon.png", "default_popup": "popup.html"},
chrome.browserAction.onClicked.addListener(function(tab) {
    var url = chrome.extension.getURL('main.html');
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