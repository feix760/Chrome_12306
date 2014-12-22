
(function(global) {
    global.C = global.Chrome = {
        clearAllCookies: function(urls, back) {
            var clear = function(url, back) {
                chrome.cookies.getAll({url: url}, function(cookies) {
                    $.each(cookies, function(i, item) {
                        chrome.cookies.remove({
                            url: url + item.path,
                            name: item.name
                        });
                    });
                    back();
                });
            },
                    worker = function() {
                var url = urls.shift();
                if (url) {
                    clear(url, worker);
                } else {
                    back();
                }
            };
            worker();
        },
        syncSet: function(key, obj, back) {
            if (!back) {
                back = $.noop;
            }
            key = key.replace(/[\s]*/g, '');
            chrome.storage.sync.get(function(items) {
                var iter = key.split('.'),
                        v = items;
                while (iter.length > 1) {
                    var temp = iter.shift();
                    v = v[temp] = v[temp] || {};
                    if (typeof v != 'object') {
                        throw "not a object";
                    }
                }
                v[iter.shift()] = obj;
                chrome.storage.sync.set(items, function() {
                    back();
                });
            });
        },
        syncGet: function(key, back) {
            if (!back) {
                back = $.noop;
            }
            key = key.replace(/[\s]*/g, '');
            chrome.storage.sync.get(function(items) {
                var iter = key.split('.'),
                        v = items;
                while (iter.length > 1) {
                    var temp = iter.shift();
                    v = v[temp];
                    if (!v) {
                        back(null);
                        return;
                    }
                    if (typeof v != 'object') {
                        back(null);
                        return;
                    }
                }
                var item=v[iter.shift()];
                back(item);
            });
        },
        syncDel: function(key, back) {
            if (!back) {
                back = $.noop;
            }
            key = key.replace(/[\s]*/g, '');
            chrome.storage.sync.get(function(items) {
                var iter = key.split('.'),
                        v = items;
                while (iter.length > 1) {
                    var temp = iter.shift();
                    v = v[temp] = v[temp] || {};
                    if (typeof v != 'object') {
                        back();
                    }
                }
                delete v[iter.shift()];
                chrome.storage.sync.set(items, function() {
                    back();
                });
            });
        },
        syncGetAll: function(back) {
            if (!back) {
                back = $.noop;
            }
            chrome.storage.sync.get(function(items) {
                back(items);
            });
        },
        syncSetAll: function(all, back) {
            if (!back) {
                back = $.noop;
            }
            chrome.storage.sync.set(all, function() {
                back();
            });
        },
        syncDelAll: function(back) {
            if (!back) {
                back = $.noop;
            }
            chrome.storage.sync.clear(function() {
                back();
            });
        }
    };

    //自动保存表单数据
    var autoSaveFormData = {
        allSelector: 'input[type=text],input[type=password],select,textarea',
        saveListener: function() {
            var ele = $(this),
                    val = '',
                    id = ele[0].id;
            if (!id) {
                return;
            }

            if (ele.filter('input[type=text],input[type=password],textarea').length > 0) {
                val = ele.val();
            } else if (ele.filter('select').length > 0) {
                val = ele[0].selectedIndex;
            }
            C.syncSet('viewholder.' + id, val);
        },
        loadAll: function() {
            var that = this;
            C.syncGet('viewholder', function(holder) {
                if(!holder){
                    return;
                }
                $(that.allSelector).each(function() {
                    var ele = $(this),
                            id = ele[0].id,
                            val = holder['' + id];
                    if (!id || !val || ele.attr('_sync') == 'false') {
                        return;
                    }
                    if (ele.filter('input[type=text],input[type=password],textarea').length > 0) {
                        ele.val(val);
                    } else if (ele.filter('select').length > 0) {
                        ele[0].selectedIndex = val;
                    }
                });
            });
        },
        init: function() {
            $(this.allSelector)
                    .bind('change keypress keyup', this.saveListener);
            this.loadAll();
        }
    };

    if (global.document) {
        $($.proxy(autoSaveFormData, 'init'));
    }
})(this);