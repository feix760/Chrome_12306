
var ID = null;

exports.show = function(title, msg) {
    chrome.notifications.create(null, {
        type: 'basic',
        iconUrl: __inline('/icon32.png'),
        title: title,
        message: msg
    });
};

