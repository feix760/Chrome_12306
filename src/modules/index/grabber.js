
const log = require('./log').log,
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

const context = {
    running: false,
    tourFlag: 'dc',
    isStu: false
};

function getInputInfo() {
    const trains = Array.from($('#trains_list .item')).map((ele) => {
        const $ele = $(ele);
        return {
            no: $ele.attr('_train'), 
            type: $ele.attr('_type')
        };
    });
    const passengers = Array.from($('#passenger_list .item')).map((ele) => {
        const $ele = $(ele);
        return {
            name: $ele.attr('_name'),
            id: $ele.attr('_id'), 
            type: $ele.attr('_type')
        };
    });
    return {
        from: station_names[$('#from_station').val()], 
        to: station_names[$('#to_station').val()], 
        dates: (() => {
            let startDate = moment($('#train_date').val()),
                list = [startDate.format('YYYY-MM-DD')],
                dateMoreCount = $('#days').val();
            dateMoreCount = isNaN(dateMoreCount) || +dateMoreCount < 0 
                ? 0 : +dateMoreCount;
            for (let i = 0; i < dateMoreCount; i++) {
                startDate.add(1, 'days');
                list.push(startDate.format('YYYY-MM-DD'));
            }
            return list;
        })(), 
        duration: +$('#query_duration').val(),
        trains: trains, 
        passengers: passengers, 
        isStr: $('#stu')[0].checked
    };  
};

async function delay(duration) {
    return new Promise((resolve, reject) => {
        setTimeout(() => resolve(), duration);
    });
}

async function loopQueryTrip() {
    let trip = null;
    while (true) {
        let inputInfo = getInputInfo();
        if (!context.running) {
            return null;
        }

        for (let i = 0; i < inputInfo.dates.length; i++) {
            inputInfo.date = inputInfo.dates[i];
            try {
                trip = await queryAvailableTrip(inputInfo);
            } catch(ex) {
                log('query fail');
            }
            if (trip) {
                return trip;
            }
        }

        await delay(inputInfo.duration);
    }
};

async function queryAvailableTrip(inputInfo) {
    if (inputInfo.trains.length == 0) {
        log('请选择车次！');
    }
    // 如果勾选了学生票，交换性的查询成人票和学生票
    // 在服务器端两个页面cache更新的时间不同。
    // 黄牛囤积的票一般都卖给成人，所以学生票可以很容易地从黄牛手中抢到
    context.isStu = inputInfo.isStu ? !context.isStu : false;

    log('%0 查询%1票..', inputInfo.date, context.isStu ? '学生' : '成人');

    const tripList = await db.query(inputInfo.from, inputInfo.to, inputInfo.date, context.isStu);

    let trip = null;
    const loged = {};

    inputInfo.trains.every((trainItem) => {
        const item = findTrainItem(tripList, trainItem.no);
        if (item) {
            const info = item['queryLeftNewDTO'];
            const onSale = item['buttonTextInfo'] == '预订';
            if (onSale) {
                const seatKey = trainItem.type + '_num';
                if (info[seatKey] && info[seatKey] !==  '无' && info[seatKey] !== '--') {
                    trip = Object.assign(item, {
                        seatType: trainItem.type
                    });
                }
            }
            if (!loged[trainItem.no]) {
                loged[trainItem.no] = true;
                log('%0 %1：%2', inputInfo.date, info.station_train_code, item.buttonTextInfo);
                if (onSale) {
                    log(
                        '硬座：%0 无座：%1 硬卧：%2 二等座：%3 一等座：%4', 
                        info.yz_num, info.wz_num, info.yw_num, 
                        info.ze_num, info.zy_num
                    );
                }
            }
        }
        return !trip;
    });

    return trip;
};

function findTrainItem(data, name) {
    let theTrain = null;
    data.every((item) => {
        if (item.queryLeftNewDTO.station_train_code.toUpperCase() === name.toUpperCase()) {
            theTrain = item;
        }
        return !theTrain;
    });
    return theTrain;
};

function getOrderCheckcode() {
    return new Promise((resolve, reject) => {
        checkcode.refresh(true);
        $('.submit-order').unbind('click').click(() => {
            // stop
            if (!context.running) {
                return reject();
            }
            const code = checkcode.getValue().join(',');
            if (!code) {
                return;
            }
            log('验证验证码： ' + code + " 中...");
            db.checkRandCode(2, code).then(() => {
                alarm.hide();
                log('验证码正确，自动提交订单！');
                checkcode.finish();
                resolve(code);
            }, () => {
                checkcode.refresh(true);
                log('验证码： ' + code + " 错误！");
            });
        });
    });
};

function getPassengers(item) {
    const SEAT_TYPE_MAP = {
        yz: 1,
        wz: 1,
        yw: 3,
        ze: 'O',
        zy: 'M'
    };
    const passengerDTOs = Array.from($('#passenger_list .item')).map((ele) => {
        const $ele = $(ele);
        return {
            id: $ele.attr('_id'),
            name: $ele.attr('_name'),
            type: $ele.attr('_type'),
            seatType: SEAT_TYPE_MAP[item.seatType]
        };
    });
    return _getPassengers(passengerDTOs);
};

function _getPassengers(passengerDTOs) {
    const ps = [],
        oldps = [];
    passengerDTOs.forEach((item, i) => {
        const { id, name, type, seatType } = item;
        ps.push(
            [seatType, 0, type, name, 1, id, '', 'N'].join(',')
        );
        oldps.push([name, 1, id, type].join(','));
    });
    return {
        ps: ps.join('_'),
        oldps: oldps.join('_') + '_',
        length: ps.length
    };
};

async function query() {
    if (context.running) {
        return;
    }
    context.running = true;

    const trip = await loopQueryTrip();

    if (!trip) {
        return;
    }

    const getTrainTime = +new Date();
    
    alarm.show(trip);
    
    await login.checkAndLogin();
    
    await db.submitOrderRequest(trip, context.tourFlag, context.isStu);
    
    await db.initDc();
    
    log('请立刻输入 验证码2 ，验证码输入正确后将自动提交订单');
    const code = await getOrderCheckcode();
    const passengers = getPassengers(trip);
    if (!passengers.length) {
        log('请选择乘客！');
        return;
    }
    log(passengers);
    
    await db.checkOrderInfo(passengers.ps, passengers.oldps, code, context.tourFlag);
    
    await db.confirmSingleForQueue(passengers.ps, passengers.oldps, code, trip);
    
    log(
        '提交订单成功，耗时: %0s，请点击查看订单前往12306完成付款。', 
        ((+new Date() - getTrainTime) / 1000).toFixed(3)
    );
    
    stop();
}

function stop() {
    context.running = false;
    checkcode.finish();
}

return {
    async query() {
        try {
            await query();
        } catch(ex) {
            console.log(ex);
            stop();
        }
    },
    stop: stop
};

