
var logger = require('./log'),
    log = logger.log,
    autosave = require('./autosave'),
    checkcode = require('./checkcode'),
    alarm = require('./alarm'),
    R = require('./rest'),
    grabber = require('./grabber'),
    tpl = {
        trainOption: require('./tpl/trainOption.tpl'),
        trainItem: require('./tpl/trainItem.tpl'),
        passenger: require('./tpl/passenger.tpl'),
        passengerOpt: require('./tpl/passengerOpt.tpl'),
        availableTicket: require('./tpl/availableTicket.tpl'),
        ticketResign: require('./tpl/ticketResign.tpl')
    };

var switchDest = function() {
    var a = $('#from_station'),
        b = $('#to_station');
    var v = a.val();
    a.val(b.val());
    b.val(v);
    setTimeout(function() {
        exports.loadAvailableTrains();
    }, 1);
};

var del_item = function() {
    $(this).closest('.item').remove();
};

var loadAvailableTrains = function() {
    var from = station_names[$('#from_station').val()],
        to = station_names[$('#to_station').val()],
        date = $('#train_date').val();

    if (!from || !to) {
        return;
    }
    var trains = $('#available_trains'),
        $data = from + '_' + to + '_' + date;
    trains.attr('_data', $data);

    log('获取列车列表..');
    R.query(from, to, date, false).then(function (data) {
        if (trains.attr('_data') != $data) {
            return;
        }
        trains.empty();
        data.forEach(function(item) {
            trains.append(tpl.trainOption({
                train: item.queryLeftNewDTO.station_train_code
            }));
        });
        $('#trains_list .item').remove();
        log('获取列车列表成功');
    }, function() {
        log('获取列车列表失败');
    });
};

var addTrain = function() {
    var train = $('#available_trains option:selected').text(),
        type = $('#available_train_type option:selected').val(),
        typeName = $('#available_train_type option:selected').text();
    if (!train) {
        return;
    }

    var list = $('#trains_list');
    if (
        list.find('.item[_train=' + train + '][_type=' + type + ']')
            .length
    ) {
        return;
    }
    list.append(tpl.trainItem({
        type: type,
        name: typeName,
        train: train
    }));
};

var addPassenger = function(p) {
    var list = $('#passenger_list');
    if (p.name == '' 
        || p.id.length != 18 
        || list.find('.item[_id=' + p.id + ']').length
    ) {
        return false;
    }

    if (list.find('.item').length >= 5) {
        log('最多5位乘客！');
        return false;
    }

    list.append(tpl.passenger(p));
    return true;
};

var addOldPassenger = function() {
    var o = $('#old_p option:selected'),
        t = $('#old_p_type option:selected');
    if (o.length == 0) {
        return;
    }
    addPassenger({
        name: o.attr('_name'),
        id: o.attr('_id'),
        oldType: o.attr('_type'),
        type: t.val(),
        typeName: t.text()
    });
};

var loadMyPassengers = function() {
    log('获取已存乘客..');
    R.getMyPassengers().then(function(data) {
        log('获取已存乘客成功');
        var options = $('#old_p').empty();
        data.forEach(function(item) {
            options.append(tpl.passengerOpt({
                name: item['passenger_name'],
                id: item['passenger_id_no'],
                type: item['passenger_type']
            }));
        });
    }, function() {
        log('获取已存乘客失败，是否登陆了？');
    });
};

var logout = function() {
    log('退出登陆中..');
    R.logout().then(function() {
        log('退出登陆成功！');
        checkcode.reset(1);
    });
};

var login = function() {
    var user = $.trim($('#user').val());
    var pwd = $.trim($('#pwd').val());
    var code = checkcode.get(1).join(',');
    log('登陆中..');
    R.login(user, pwd, code).then(function() {
        loadMyPassengers();
        checkUser();
        log('登陆成功');
    }, function() {
        log('登陆失败！');
        checkcode.reset();
    });
}

autosave.init();
checkcode.init();
alarm.init();
logger.init();

$('#train_date').datepicker({
    dateFormat: "yy-mm-dd",
    maxDate: '+59',
    minDate: 0
}).change(function() {
    loadAvailableTrains();
});

$('.station_name').autocomplete({
    delay: 50,
    minLength: 1,
    selectListText: 'value',
    source: station_autocomplete,
    autoFocus: true,
    height: '200px',
    select: function() {
        loadAvailableTrains();
    },
    change: function() {
        loadAvailableTrains();
    }
});

$(document).on('click', '.delete_item', del_item);

$('.switch_dest').click(switchDest);
$('.add_train').click(addTrain);
$('.old_p_add').click(addOldPassenger);

$('.login').click(login);
$('.logout').click(logout);
$('.refresh_train').click(loadAvailableTrains);
$('.refresh_p').click(loadMyPassengers);

$('.query').click(grabber.query.bind(grabber));
$('.stop_query').click(grabber.stop.bind(grabber));

setTimeout(function() {
    loadAvailableTrains();
    loadMyPassengers();
}, 1000);

function checkUser() {
    var interval = 10000;
    R.checkUser().then(function() {
        $('.login').text('已登录').removeClass('nologin');
        setTimeout(checkUser, interval);
    }, function() {
        $('.login').text('请登录').addClass('nologin');
        setTimeout(checkUser, interval);
    });
}

checkUser();

document.addEventListener('contextmenu', function(e) {
    e.preventDefault();
    $(document).trigger('submit_action');
}, false);

