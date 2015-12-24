
var utils = require('common/utils');

function getLocal(ele) {
    var val = utils.getItem('local_' + ele.id);
    if (!val) {
        return;
    }
    if (ele.hasAttribute('data-cachehtml')) {
        ele.innerHTML = val;
    } else {
        switch (ele.tagName.toLowerCase()) {
            case 'input':
                if (ele.type === 'checkbox') {
                    ele.checked = val;
                    break;
                }
            case 'textarea':
                ele.value = val;
                break;
            case 'select':
                ele.selectedIndex = val;
                break;
        }
    }
}

function setLocal(ele) {
    var val = '';
    if (ele.hasAttribute('data-cachehtml')) {
        val = ele.innerHTML.trim();
        if (!val && ele.getAttribute('data-cachehtml') === '1') {
            return;
        }
    } else {
        switch (ele.tagName.toLowerCase()) {
            case 'input':
                if (ele.type === 'checkbox') {
                    val = ele.checked;
                    break;
                }
            case 'textarea':
                val = ele.value;
                break;
            case 'select':
                val = ele.selectedIndex;
                break;
        }
    }
    utils.setItem('local_' + ele.id, val);
}

function init() {
    [].forEach.call(
        document.body.querySelectorAll([
            'input[type="text"],input[type="password"],select,textarea',
            'input[type="checkbox"]', '[data-cachehtml]'
        ].join(',')),
        function(ele) {
            getLocal(ele);
            if (ele.hasAttribute('data-cachehtml')) {
                $(ele).bind('change', setLocal.bind(ele, ele));
            } else {
                $(ele).bind('change keypress keyup', setLocal.bind(ele, ele));
            }
        }
   );
}

init();

