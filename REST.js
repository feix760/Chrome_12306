
(function(global) {

    var ajax = function(url, settings) {
        $.ajax(url, $.extend({
            error: function(jqXhr) {
                log('--------ajax error----------');
                log("url:" + url + ' status:' + jqXhr.status);
                settings['success'](null, '', jqXhr.status, jqXhr);
            }
        }, settings, {
            success: function(data, status, jqXhr) {
                var html = jqXhr.responseText;
                if (settings['success']) {
                    settings['success'](data, html, jqXhr.status, jqXhr);
                }
            }
        }));
    };

    var R = {
        checkRandCode: function(randId, code, back) {
            var rands = ['', 'sjrand', 'randp'];
            ajax('https://kyfw.12306.cn/otn/passcodeNew/checkRandCodeAnsyn', {
                data: {
                    randCode: code,
                    rand: rands[randId]
                },
                success: function(data) {
                    if (data['data'] && data['data'] == 'Y') {
                        back(true);
                    } else {
                        back(false);
                    }
                }
            });
        },
        logout: function(back) {
            log('logout..');
            var urls = ['https://kyfw.12306.cn/'];
            C.clearAllCookies(urls, back);
        },
        login: function(user, pwd, code, back) {
            ajax('https://kyfw.12306.cn/otn/login/loginAysnSuggest', {
                data: "loginUserDTO.user_name=" + user + "&userDTO.password=" + pwd + "&randCode=" + code,
                dataType: "json",
                success: function(data, html) {
                    if (data['data'] && data['data']['loginCheck'] == 'Y') {
                        back(true);
                    } else {
                        log(html);
                        back(false);
                    }
                }
            });
        },
        getMyPassengers: function(token, back) {
            if (!token) {
                back(null);
            }
            ajax('https://kyfw.12306.cn/otn/confirmPassenger/getPassengerDTOs', {
                data: {
                    _json_att: '',
                    REPEAT_SUBMIT_TOKEN: token
                },
                success: function(data) {
                    if (data && data['data'] && data['data']['normal_passengers']) {
                        back(data['data']['normal_passengers']);
                    } else {
                        back(null);
                    }
                }
            });
        },
        query: function(from, to, date, isStudent, back) {
            var purpose_codes = isStudent ? '0X00' : 'ADULT';
            ajax('https://kyfw.12306.cn/otn/leftTicket/query', {
                data: 'leftTicketDTO.train_date=' + date +
                        '&leftTicketDTO.from_station=' + from +
                        '&leftTicketDTO.to_station=' + to +
                        "&purpose_codes=" + purpose_codes,
                dataType: "json",
                success: function(data, text) {
                    if (data && data['data']) {
                        back(data.data);
                    }
                    else {
                        log(text);
                        back(null);
                    }
                }
            });
        },
        submitOrderRequest: function(secretStr, date, f_s, t_s, tour_flag, isStudent, back) {
            var purpose_codes = isStudent ? '0X00' : 'ADULT';
            log('submitOrderRequest..');
            log('secretStr:' + secretStr + ' from:' + f_s + " to:" + t_s + " date:" + date + ' purpose_codes:' + purpose_codes);
            ajax('https://kyfw.12306.cn/otn/leftTicket/submitOrderRequest', {
                data: {
                    secretStr: secretStr,
                    train_date: date,
                    back_train_date: '2014-02-24',
                    tour_flag: tour_flag,
                    purpose_codes: purpose_codes,
                    query_from_station_name: f_s,
                    query_to_station_name: t_s
                },
                success: function(data, html) {
                    if (data['status']) {
                        back(true);
                    } else {
                        log('submitOrderRequest falied');
                        log(html);
                        back(false);
                    }
                }
            });
        },
        getTokens: function(back) {
            log('getting tokens..');
            ajax('https://kyfw.12306.cn/otn/confirmPassenger/initDc', {
                cache: false,
                type: 'get',
                success: function(data) {
                    var token = null,
                            key_change = null;
                    try {
                        token = data.match(/globalRepeatSubmitToken[^']*'([\w]*)'/)[1];
                        key_change = data.match(/key_check_isChange':'([\w]*)'/)[1];
                    } catch (e) {

                    }
                    log('token:' + token + ',key_change:' + key_change);
                    back(token, key_change);
                }
            });
        },
        checkOrderInfo: function(ps, oldps, code, token, tour_flag, back) {
            log('checking order..');
            ajax('https://kyfw.12306.cn/otn/confirmPassenger/checkOrderInfo', {
                data: {
                    cancel_flag: 2,
                    bed_level_order_num: '000000000000000000000000000000',
                    passengerTicketStr: ps,
                    oldPassengerStr: oldps,
                    tour_flag: tour_flag,
                    randCode: code,
                    REPEAT_SUBMIT_TOKEN: token,
                    _json_att: ''
                },
                success: function(data, html) {
                    if (data['data'] && data['data']['submitStatus']) {
                        back(true);
                    } else {
                        log('checkorder failed');
                        log(html);
                        back(false);
                    }
                }
            });
        },
        confirmSingleForQueue: function(ps, oldps,
                code, leftTicketStr,
                token, keyChange,
                train_location,  back) {
            log('confirmsubmitting..');
            ajax('https://kyfw.12306.cn/otn/confirmPassenger/confirmSingleForQueue', {
                data: {
                    passengerTicketStr: ps,
                    oldPassengerStr: oldps,
                    randCode: code,
                    REPEAT_SUBMIT_TOKEN: token,
                    key_check_isChange: keyChange,
                    leftTicketStr: leftTicketStr,
                    purpose_codes: '00',
                    train_location: train_location,
                    _json_att: ''
                },
                success: function(data, text) {
                    if (data['data'] && data['data']['submitStatus']) {
                        back(true);
                    } else {
                        log(text);
                        back(false);
                    }
                }
            });
        }
    };

    //改签
    $.extend(R, {
        getTictets: function(start, end, back) {
            if (!end) {
                back = start;
                var start_t = new Date();
                start_t.setDate(new Date().getDate() - 60);
                start = start_t.pattern('yyyy-MM-dd');
                end = new Date().pattern('yyyy-MM-dd');
            }
            ajax('https://kyfw.12306.cn/otn/queryOrder/queryMyOrder', {
                data: {
                    queryType: 1,
                    queryStartDate: start,
                    queryEndDate: end,
                    come_from_flag: 'my_order',
                    pageSize: 50,
                    pageIndex: 0,
                    sequeue_train_name: ''
                },
                success: function(data, html) {
                    if (data && data['data'] && data['data']['OrderDTODataList']) {
                        back(data['data']['OrderDTODataList']);
                    } else {
                        log('获取车票失败！');
                        log(html);
                        back(null);
                    }
                }
            });
        },
        resginTicket: function(tickets, back) {
            var data = this._getResginTicketsData(tickets);
            ajax('https://kyfw.12306.cn/otn/queryOrder/resginTicket', {
                data: {
                    ticketkey: data['ticketkey'],
                    sequenceNo: data['sequenceNo'],
                    _json_att: ''
                },
                success: function(data, html) {
                    if (data && data['data'] && data['data']['existError'] == 'N') {
                        back(true);
                    } else {
                        log('resign ticket failed!');
                        log(html);
                        back(false);
                    }
                }
            });
        },
        _getResginTicketsData: function(tickets) {
            //E243443701,1,03,0033,2014-01-18 20:06#E243443701,1,03,0033,2014-01-18 20:06#
            //E243443701
            var ticketkey = '', sequenceNo = '';
            $.each(tickets, function(idx, item) {
                var no = item['ticket_no'];
                var temp = [];
                temp.push(no.substr(0, 10));
                temp.push(no.substr(10, 1));
                temp.push(no.substr(11, 2));
                temp.push(no.substr(13, 4));
                temp.push(item['start_train_date_page']);
                ticketkey += temp.join(',') + '#';
                sequenceNo = temp[0];
            });
            return {
                ticketkey: ticketkey,
                sequenceNo: sequenceNo
            };
        },
        getResignTokens: function(back) {
            log('getting tokens..');
            ajax('https://kyfw.12306.cn/otn/confirmPassenger/initGc', {
                cache: false,
                type: 'get',
                success: function(data) {
                    var token = null,
                            key_change = null;
                    try {
                        token = data.match(/globalRepeatSubmitToken[^']*'([\w]*)'/)[1];
                        key_change = data.match(/key_check_isChange':'([\w]*)'/)[1];
                    } catch (e) {
                    }
                    log('token:' + token + ',key_change:' + key_change);
                    back(token, key_change);
                }
            });
        },
        confirmResignForQueue: function(ps, oldps,
                code, leftTicketStr,
                token, keyChange,
                train_location, back) {
            log('confirmsubmitting..');
            ajax('https://kyfw.12306.cn/otn/confirmPassenger/confirmResignForQueue', {
                data: {
                    passengerTicketStr: ps,
                    oldPassengerStr: oldps,
                    randCode: code,
                    key_check_isChange: keyChange,
                    leftTicketStr: leftTicketStr,
                    purpose_codes: '00',
                    train_location: train_location,
                    REPEAT_SUBMIT_TOKEN: token,
                    _json_att: ''
                },
                success: function(data, text) {
                    if (data['data'] && data['data']['submitStatus']) {
                        back(true);
                    } else {
                        log('提交订单失败！');
                        log(text);
                        back(false);
                    }
                }
            });
        }
    });

    $.extend(global, {
        REST: R,
        R: R
    });
})(this);
