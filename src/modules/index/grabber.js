
var log = require('./log').log,
    moment = require('lib/moment'),
    login = require('./login'),
    Checkcode = require('./checkcode'),
    alarm = require('./alarm'),
    db = require('./db'),
    checkcode = new Checkcode({
        $ele: $('#order-checkcode'),
        type: 'order',
        forBtn: '.submit-order'
    });

var context = {
    tourFlag: 'dc',
    running: false,
    item: null,
    queryCount: 0,
    isStu: false,
    submitCheckcode: null,
    passengers: null,
    days: 0
};

var getInputInfo = function () {
    var trains = $('#trains_list .item').map(function() {
        var $ele = $(this);
        return {
            no: $ele.attr('_train'), 
            type: $ele.attr('_type')
        };
    });
    var passengers = $('#passenger_list .item').map(function() {
        var $ele = $(this);
        return {
            name: $ele.attr('_name'),
            id: $ele.attr('_id'), 
            type: $ele.attr('_type')
        };
    });
    return {
        from: station_names[$('#from_station').val()], 
        to: station_names[$('#to_station').val()], 
        dates: function() {
            var startDate = moment($('#train_date').val()),
                list = [startDate.format('YYYY-MM-DD')],
                dateMoreCount = $('#days').val();
            dateMoreCount = isNaN(dateMoreCount) || +dateMoreCount < 0 
                ? 0 : +dateMoreCount;
            for (var i = 0; i < dateMoreCount; i++) {
                startDate.add(1, 'days');
                list.push(startDate.format('YYYY-MM-DD'));
            }
            return list;
        }(), 
        duration: +$('#query_duration').val(),
        trains: trains, 
        passengers: passengers, 
        isStr: $('#stu')[0].checked
    };  
};

var _query = function() {
    return new Promise(function(resolve, reject) {
        function task() {
            context.queryCount++;
            var inputInfo = getInputInfo();
            if (!context.running) {
                return reject();
            }
            var chain = Promise.reject();
            inputInfo.dates.forEach(function(date) {
                chain = chain.catch(function(err) {
                    inputInfo.date = date;
                    return queryForOneAvailableItem(inputInfo);
                });
            });
            chain.then(function (item) {
                    resolve(item);
                })
                .catch(function(err) {
                    setTimeout(task, inputInfo.duration);
                });
        }
        task();
    });
};

var queryForOneAvailableItem = function(inputInfo) {
    if (inputInfo.trains.length == 0) {
        log('请选择车次！');
    }
    // 如果勾选了学生票，交换性的查询成人票和学生票
    // 在服务器端两个页面cache更新的时间不同。
    // 黄牛囤积的票一般都卖给成人，所以学生票可以很容易地从黄牛手中抢到
    context.isStu = inputInfo.isStu ? !context.isStu : false;
    log('%0 查询%1票..', inputInfo.date, context.isStu ? '学生' : '成人');
    return db.query(
        inputInfo.from, inputInfo.to, inputInfo.date, context.isStu
    ).then(function (data) {
        var availableItem = null;
        var loged = {};
        $.each(inputInfo.trains, function(i, trainItem) {
            var item = findTrainItem(data, trainItem.no);
            if (item) {
                var info = item['queryLeftNewDTO'];
                if (!loged[trainItem.no]) {
                    log('%0 %1：%2', inputInfo.date, info.station_train_code, item.buttonTextInfo);
                }
                if (item['buttonTextInfo'] == '预订') {
                    if (!loged[trainItem.no]) {
                        log(
                            '硬座：%0 无座：%1 硬卧：%2 二等座：%3 一等座：%4', 
                            info.yz_num, info.wz_num, 
                            info.yw_num, info.ze_num, info.zy_num
                        );
                    }
                    var seatKey = trainItem.type + '_num';
                    if (info[seatKey] 
                        && info[seatKey] != '无' 
                        && info[seatKey] != '--'
                    ) {
                        availableItem = $.extend(item, {seatType: trainItem.type});
                        return false;
                    }
                }
            }
            loged[trainItem.no] = true;
            return true;
        });
        if (availableItem) {
            return availableItem;
        } else {
            return Promise.reject();
        }
    }, function() {
        log('query fail');
        return Promise.reject();
    });
};

var findTrainItem = function(data, name) {
    var theTrain = null;
    data.every(function(item) {
        if (item.queryLeftNewDTO.station_train_code.toUpperCase() 
            === name.toUpperCase()
        ) {
            theTrain = item;
        }
        return !theTrain;
    });
    return theTrain;
};

var getOrderCheckcode = function() {
    return new Promise(function(resolve, reject) {
        checkcode.refresh(true);
        $('.submit-order').unbind('click').click(function() {
            // stop
            if (!context.running) {
                return reject();
            }
            var code = checkcode.getValue().join(',');
            if (!code) {
                return;
            }
            log('验证验证码： ' + code + " 中...");
            db.checkRandCode(2, code).then(function () {
                alarm.hide();
                log('验证码正确，自动提交订单！');
                checkcode.finish();
                resolve(code);
            }, function () {
                checkcode.refresh(true);
                log('验证码： ' + code + " 错误！");
            });
        });
    });
};

var getPassengers =  function() {
    var passengerDTOs = [],
        types = [],
        t = 'N';
    $('#passenger_list .item').each(function() {
        var $ele = $(this);
        passengerDTOs.push({
            passenger_id_no: $ele.attr('_id'),
            passenger_name: $ele.attr('_name')
        });
        types.push($ele.attr('_type'));
    });
    return _getPassengers(passengerDTOs, types, t);
};

var _getPassengers = function(passengerDTOs, types, t) {
    var seats = {
            yz: 1,
            wz: 1,
            yw: 3,
            ze: 'O',
            zy: 'M'
        },
        seatType = seats[context.item.seatType],
        ps = [],
        oldps = [];
    passengerDTOs.forEach(function(item, i) {
        var id = item['passenger_id_no'],
            name = item['passenger_name'],
            ticket_type = types[i];
        ps.push(
            [seatType, 0, ticket_type, name, 1, id, '', t].join(',')
        );
        oldps.push([name, 1, id, ticket_type].join(','));
    });
    return {
        ps: ps.join('_'),
        oldps: oldps.join('_') + '_',
        length: ps.length
    };
};

var query = function() {
    if (context.running) {
        return;
    }
    context.running = true;

    _query()
    .then(function(item) {
        context.getTrainTime = +new Date();
        context.item = item;
        alarm.show(item);
        return login.checkAndLogin();
    })
    .then(function() {
        return db.submitOrderRequest(
            context.item, context.tourFlag, context.isStu
        );
    })
    .then(function() {
        return db.initDc();
    })
    .then(function() {
        log('请立刻输入 验证码2 ，验证码输入正确后将自动提交订单');
        return getOrderCheckcode();
    })
    .then(function(code) {
        var passengers = getPassengers();
        if (!passengers.length) {
            log('请选择乘客！');
            return Promise.reject();
        }
        log(passengers);
        context.passengers = passengers;
        context.submitCheckcode = code;
        return db.checkOrderInfo(
            context.passengers.ps, context.passengers.oldps, 
            context.submitCheckcode, context.tourFlag
        );
    })
    .then(function() {
        return db.confirmSingleForQueue(
            context.passengers.ps, context.passengers.oldps, 
            context.submitCheckcode, context.item
        );
    })
    .then(function() {
        stop();
        log(
            '提交订单成功，耗时: %0s，请点击查看订单前往12306完成付款。', 
            ((+new Date() - context.getTrainTime) / 1000).toFixed(3)
        );
    })
    .catch(function(err) {
        stop();
        log(err);
    });
};

function stop() {
    context.running = false;
    checkcode.finish();
}

return {
    query: query,
    stop: stop
};

