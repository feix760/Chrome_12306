
var moment = require('lib/moment');

function ajax(url, settings = {}) {
    settings = Object.assign(
        {
            timeout: 10000
        }, 
        settings || {}, 
        {
            headers: Object.assign({
                '_$Cache-Control': 'no-cache',
                '_$Origin': 'https://kyfw.12306.cn',
                '_$Referer': 'https://kyfw.12306.cn/otn/confirmPassenger/initDc',
                '_$X-Requested-With': 'XMLHttpRequest'
            }, settings.headers || {})
        }
    );
    return new Promise((resolve, reject) => {
        $.ajax(url, settings).then(
            (data, status, jqXhr) => {
                resolve(data);
            }, 
            (jqXhr) => {
                reject(jqXhr.responseText || jqXhr.status);
            }
        )
    });
};

var context = {
    queryUrl: 'leftTicket/queryA',
    submitToken: '',
    keyChange: ''
};

var db = {};

db.checkRandCode = function(randId, code) {
    var rands = ['', 'sjrand', 'randp'],
        data = {
            _json_att: '',
            randCode: code,
            rand: rands[randId]
        };
    if (randId === 2) {
        data.REPEAT_SUBMIT_TOKEN = context.submitToken;
    }
    return ajax(
        'https://kyfw.12306.cn/otn/passcodeNew/checkRandCodeAnsyn',
        {
            type: 'post',
            data: data
        }
    ).then((data) => {
        if(!(data && data.data && data.data.result === '1')) {
            return Pormise.reject(data);
        }
    });
};

db.logout = function() {
    return ajax('https://kyfw.12306.cn/otn/login/loginOut');
};

db.checkUser = function () {
    return ajax(
        'https://kyfw.12306.cn/otn/login/checkUser', 
        {
            data: {
                _json_att: ''
            }, 
            type: 'post'
        }
    ).then((data) => {
        if (!data || !data.data || !data.data.flag) {
            return Promise.reject(data);
        }
    });
}; 

db.login = function(user, pwd, code) {
    return this.checkRandCode(1, code).then(() => {
        return ajax(
            'https://kyfw.12306.cn/otn/login/loginAysnSuggest', 
            {
                data: {
                    'loginUserDTO.user_name': user, 
                    'userDTO.password': pwd, 
                    randCode: code 
                },
                type: 'post'
            }
        ).then((data) => {
            if (!(data && data.data && data.data.loginCheck === 'Y')) {
                return Promise.reject(data);
            }
        });
    });
};

db.getMyPassengers = function() {
    return ajax(
        'https://kyfw.12306.cn/otn/confirmPassenger/getPassengerDTOs', 
        {
            data: {
                _json_att: ''
            },
            type: 'post'
        }
    ).then((data) => {
        if (data && data.data && data.data.normal_passengers) {
            return data.data.normal_passengers;
        } else {
            return Promise.reject(data);
        }
    });
};

db.query = function(from, to, date, isStudent) {
    var purpose_codes = isStudent ? '0X00' : 'ADULT';
    var params = 'leftTicketDTO.train_date=' + date 
        + '&leftTicketDTO.from_station=' + from 
        + '&leftTicketDTO.to_station=' + to 
        + '&purpose_codes=' + purpose_codes;
    return ajax(
        'https://kyfw.12306.cn/otn/' + context.queryUrl, 
        {
            data: params,
            headers: {
                '_$Referer': 'https://kyfw.12306.cn/otn/leftTicket/init'
            }
        }
    ).then((data) => {
        if (data && data.data) {
            return data.data;
        } else {
            if (data && data.status === false && data.c_url) {
                context.queryUrl = data.c_url; // 变换地址
            }
            return Promise.reject(data);
        }
    });
};

db.getQueueCount = function (item, seatType) {
    var trainInfo = item.queryLeftNewDTO;
    return ajax(
        'https://kyfw.12306.cn/otn/confirmPassenger/getQueueCount', 
        {
            data: {
                train_date: trainInfo.start_train_date, 
                train_no: trainInfo.train_no, 
                stationTrainCode: trainInfo.station_train_code,
                seatType: seatType, 
                fromStationTelecode: trainInfo.from_station_telecode, 
                toStationTelecode: trainInfo.to_station_telecode, 
                leftTicket: trainInfo.yp_info, 
                purpose_codes: '00', 
                _json_att: '', 
                REPEAT_SUBMIT_TOKEN: context.submitToken
            }, 
            type: 'post'
        }
    ).then((data) => {
        if (data && data.data) {
            return data.data;
        } else {
            return Promise.reject(data);
        }
    });
}; 

db.submitOrderRequest = function(item, tour_flag, isStu) {
    var DATA_P = 'YYYY-MM-DD';
    return ajax(
        'https://kyfw.12306.cn/otn/leftTicket/submitOrderRequest', 
        {
            data: {
                secretStr: decodeURIComponent(item.secretStr),
                train_date: moment(
                        item.queryLeftNewDTO.start_train_date,
                        'YYYYMMDD'
                    ).format(DATA_P),
                back_train_date: moment().format(DATA_P),
                tour_flag: tour_flag,
                purpose_codes: isStu ? '0X00' : 'ADULT',
                query_from_station_name: 
                    item.queryLeftNewDTO.from_station_name,
                query_to_station_name: 
                    item.queryLeftNewDTO.to_station_name, 
                myversion: 'undefined', 
                'undefined': ''
            },
            type: 'post'
        }
    ).then((data) => {
        if (!(data && data.status && data.data === 'N')) {
            return Promise.reject(data);
        }
    });
};

db.initDc = function() {
    return ajax(
        'https://kyfw.12306.cn/otn/confirmPassenger/initDc', 
        {
            data: {
                _json_att: ''
            }, 
            type: 'post', 
            dataType: 'html'
        }
    ).then((data) => {
        context.submitToken = data.match(/globalRepeatSubmitToken[^']*'([\w]*)'/)
            ? RegExp.$1 : null;
        context.keyChange = data.match(/key_check_isChange':'([\w]*)'/)
            ? RegExp.$1 : null;
        return db.dynamicJs(data);
    });
};

db.dynamicJs = function(data) {
    var url = data.match(/<script src\="\/otn\/dynamicJs\/(\w+)"/)
        ? RegExp.$1 : null;
    if (!url) {
        return Pormise.resolve();
    } else {
        return ajax(
            'https://kyfw.12306.cn/otn/dynamicJs/' + url,
            {
                dataType: 'html'
            }
        );
    }
};

db.checkOrderInfo = function(ps, oldps, code, tour_flag) {
    return ajax(
        'https://kyfw.12306.cn/otn/confirmPassenger' 
            + '/checkOrderInfo',
        {
            data: {
                cancel_flag: 2,
                bed_level_order_num: 
                    '000000000000000000000000000000',
                passengerTicketStr: ps,
                oldPassengerStr: oldps,
                tour_flag: tour_flag,
                randCode: code,
                REPEAT_SUBMIT_TOKEN: context.submitToken,
                _json_att: ''
            },
            type: 'post'
        }
    ).then((data) => {
        if (!(data && data.data && data.data.submitStatus)) {
            return Promise.reject(data);
        }
    });
};

db.confirmSingleForQueue = function(ps, oldps, code, item) {
    return ajax(
        'https://kyfw.12306.cn/otn/confirmPassenger' 
            + '/confirmSingleForQueue',
        {
            data: {
                passengerTicketStr: ps,
                oldPassengerStr: oldps,
                randCode: code,
                REPEAT_SUBMIT_TOKEN: context.submitToken,
                key_check_isChange: context.keyChange,
                leftTicketStr: item.queryLeftNewDTO.yp_info,
                purpose_codes: '00',
                train_location: item.queryLeftNewDTO.location_code,
                _json_att: ''
            }, 
            type: 'post'
        }
    ).then((data) => {
        if (!(data && data.data && data.data.submitStatus)) {
            return Promise.reject(data);
        }
    });
};

//改签
db.getTictets = function(start, end) {
    if (!end) {
        back = start;
        var start_t = new Date();
        start_t.setDate(new Date().getDate() - 60);
        start = start_t.pattern('yyyy-MM-dd');
        end = new Date().pattern('yyyy-MM-dd');
    }
    return ajax(
        'https://kyfw.12306.cn/otn/queryOrder/queryMyOrder', 
        {
            data: {
                queryType: 1,
                queryStartDate: start,
                queryEndDate: end,
                come_from_flag: 'my_order',
                pageSize: 50,
                pageIndex: 0,
                query_where: 'G',
                sequeue_train_name: ''
            },
            type: 'post'
        }
    ).then((data) => {
        if (data && data.data && data.data.OrderDTODataList) {
            return data.data.OrderDTODataList;
        } else {
            return Promise.reject(data);
        }
    });
};

db.resginTicket = function(tickets) {
    var data = _getResginTicketsData(tickets);
    return ajax(
        'https://kyfw.12306.cn/otn/queryOrder/resginTicket', 
        {
            data: {
                ticketkey: data['ticketkey'],
                sequenceNo: data['sequenceNo'],
                _json_att: ''
            }
        }
    ).then((data) => {
        if (!(data && data.data && data.data.existError === 'N')) {
            return Promise.reject(data);
        }
    });
};

function _getResginTicketsData(tickets) {
    // E243443701,1,03,0033,2014-01-18 20:06#E243443701,1,03,0033,2014-01-18 20:06#
    // E243443701
    var ticketkey = [], sequenceNo = '';
    tickets.forEach((item) => {
        var no = item['ticket_no'];
        var temp = [
            no.substr(0, 10), 
            no.substr(10, 1), 
            no.substr(11, 2),
            no.substr(13, 4),
            item['start_train_date_page']
        ];
        ticketkey.push(temp.join(','));
        sequenceNo = temp[0];
    });
    return {
        ticketkey: ticketkey.join('#') + '#',
        sequenceNo: sequenceNo
    };
}

db.confirmResignForQueue = function(ps, oldps, code, item) {
    return ajax(
        'https://kyfw.12306.cn/otn/confirmPassenger' 
            + '/confirmResignForQueue', 
        {
            data: {
                passengerTicketStr: ps,
                oldPassengerStr: oldps,
                randCode: code,
                key_check_isChange: context.keyChange,
                purpose_codes: '00',
                leftTicketStr: item.queryLeftNewDTO.yp_info,
                train_location: item.queryLeftNewDTO.location_code,
                roomType: '00',
                dwAll: 'N',
                REPEAT_SUBMIT_TOKEN: context.submitToken,
                _json_att: ''
            }
        }
    ).then((data) => {
        if (!(data && data.data && data.data.submitStatus)) {
            return Promise.reject(data);
        }
    });
};

return db;

