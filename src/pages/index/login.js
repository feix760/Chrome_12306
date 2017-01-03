/**
 * @file 登录模块
 * @date 2015-12-24
 */
var 
    utils = require('common/utils'),
    log = require('./log').log,
    db = require('./db'),
    Checkcode = require('./checkcode'),

    $login = $('.login'),
    $global = $(document),
    checkcode = new Checkcode({
        $ele: $('#login-checkcode'),
        type: 'login',
        forBtn: '.login'
    }),
    checking = null,
    checkInterval = 20000,
    checkTaskId = null,
    isFirstCheck = false;

function checkAndLogin() {
    checkTaskId && clearTimeout(checkTaskId);
    return checking = db.checkUser()
        .then(() => {
            $login.text('已登录').removeClass('nologin');
            isFirstCheck && $global.trigger('login');
        })
        .catch(() => {
            checkcode.refresh(true);
            log('请登录..');
            $login.text('请登录').addClass('nologin');
            return loginToSucc();
        })
        .then((data) => {
            checkTaskId = setTimeout(checkAndLogin, checkInterval);
            checking = null;
            isFirstCheck = false;
        });
}

var loginToSucc = function() {
    return new Promise((resolve, reject) => {
        function task() {
            $login.one('click', () => {
                login()
                    .then((data) => {
                        resolve();
                    })
                    .catch((err) => {
                        task();
                    });
            });
        }
        task();
    });
};

var login = function() {
    var user = $.trim($('#user').val()),
        pwd = $.trim($('#pwd').val()),
        code = checkcode.getValue().join(',');
    log('登陆中..');
    return db.login(user, pwd, code)
        .then((data) => {
            $login.text('已登录').removeClass('nologin');
            $global.trigger('login');
            log('登陆成功');
            checkcode.finish();
        })
        .catch((err) => {
            
            log('登陆失败！');
            checkcode.refresh(true);
            return Promise.reject(err);
        });
};

var logout = function() {
    log('退出登陆中..');
    db.logout().then(function() {
        $login.text('请登录').addClass('nologin');
        log('退出登陆成功！');
        checkcode.refresh();
    });
};

$login.click(function() {
    if (!checking) {
        login();
    }
});

exports.checkAndLogin = function() {
    return checking ? checking : checkAndLogin();
};

// start check
checkAndLogin();

