/**
 * @require 'lib/mod.js'
 * @require 'lib/jquery.min'
 * @require 'lib/jquery.ui.min'
 * @require 'lib/jquery.ui.autocomplete'
 * @require 'lib/jquery.ui.datepicker'
 * @require 'common/station_name'
 */

require('common/utils');
require('common/autosave');
require('./login');

var logger = require('./log'),
    log = logger.log,
    alarm = require('./alarm'),
    db = require('./db'),
    grabber = require('./grabber'),
    $global = $(document),
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
        loadAvailableTrains();
    }, 1);
};

var del_item = function() {
    var $item = $(this).closest('.item'),
        $parent = $item.parent();
    $item.remove();
    $parent.trigger('change');
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
    db.query(from, to, date, false).then(function (data) {
        if (trains.attr('_data') != $data) {
            return;
        }
        trains.empty();
        data.forEach(function(item) {
            trains.append(tpl.trainOption({
                train: item.queryLeftNewDTO.station_train_code
            }));
        });
        trains.trigger('change');
        log('获取列车列表成功');
    }, function() {
        log('获取列车列表失败');
    });
};

var addTrain = function() {
    var t = {
        train: $('#available_trains option:selected').text(),
        type: $('#available_train_type option:selected').val(),
        name: $('#available_train_type option:selected').text()
    };
    var $list = $('#trains_list');
    if (
        $list.find('.item[_train=' + t.train + '][_type=' + t.type + ']')
            .length
    ) {
        return;
    }
    $list.append(tpl.trainItem(t)).trigger('change');
};

var addPassenger = function() {
    var o = $('#old_p option:selected'),
        t = $('#old_p_type option:selected');
    if (o.length == 0) {
        return;
    }
    var p = {
        name: o.attr('_name'),
        id: o.attr('_id'),
        oldType: o.attr('_type'),
        type: t.val(),
        typeName: t.text()
    };
    var $list = $('#passenger_list');
    if (p.name == '' 
        || p.id.length != 18 
        || $list.find('.item[_id=' + p.id + ']').length
    ) {
        return false;
    }

    if ($list.find('.item').length >= 5) {
        log('最多5位乘客！');
        return false;
    }

    $list.append(tpl.passenger(p)).trigger('change');
};

var loadMyPassengers = function() {
    log('获取已存乘客..');
    db.getMyPassengers().then(function(data) {
        log('获取已存乘客成功');
        var options = $('#old_p').empty();
        data.forEach(function(item) {
            options.append(tpl.passengerOpt({
                name: item['passenger_name'],
                id: item['passenger_id_no'],
                type: item['passenger_type']
            }));
        });
        options.trigger('change');
    }, function() {
        log('获取已存乘客失败，是否登陆了？');
    });
};

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
        $(this).trigger('sync');
    }
});

$(document).on('click', '.delete_item', del_item);

$('.switch_dest').click(switchDest);
$('.add_train').click(addTrain);
$('.old_p_add').click(addPassenger);

$('.refresh_train').click(loadAvailableTrains);
$('.refresh_p').click(loadMyPassengers);

$('.query').click(grabber.query.bind(grabber));
$('.stop_query').click(grabber.stop.bind(grabber));

setTimeout(function() {
    loadAvailableTrains();
}, 1000);

$global.bind('login', function() {
    loadMyPassengers();
});


