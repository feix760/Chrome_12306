//utils
(function() {
    window.ajax = function(url, settings) {
        $.ajax(url, $.extend({
            type: 'post',
            error: function(jqXhr) {
                log('--------ajax error----------');
                log("url:" + url + ' status:' + jqXhr.status);
                settings['success'](null, '', jqXhr.status, jqXhr);
            }
        }, settings, {
            success: function(data, status, jqXhr) {
                var html = jqXhr.responseText;
                /*
                 if (html.length < 1000) {
                 log(html);
                 } else {
                 log(html.substr(0, 1000) + "-----------");
                 }
                 */
                if (settings['success']) {
                    settings['success'](data, html, jqXhr.status, jqXhr);
                }
            }
        }));
    };
    window.trimInput = function(ipt) {
        ipt.val($.trim(ipt.val()));
    };
})();
//log
(function() {
    var id = 0;
    function getId() {
        id++;
        var str = '0000000000' + id;
        return str.match(/[\w]{6}$/)[0];
    }
    window.log = function(text) {
        var id = $('<span></span>').html('&nbsp;&nbsp;&nbsp;' + getId() + '&nbsp;');
        var t = $('<span></span>').text(text);
        $('.log').append($('<div></div>').append(id).append(t));
        if ($('.log > div').length > 200) {
            $('.log > div:first').remove();
        }
        setTimeout(function() {
            $('.log_wrapper').each(function() {
                var jthis = $(this),
                        jlog = jthis.find('.log');
                var th = jthis.height(),
                        lh = jlog.height();
                if (lh > th) {
                    jthis.scrollTop(lh - th);
                }
            });
        }, 1);
    };
    $(document).on('click', '.clear_log', function() {
        $('.log').html('');
    });
})();

//console
(function() {
    var url = $('#console_url'),
            method = $('#console_method'),
            dataType = $('#console_datatype'),
            data = $('#console_data');
    $('.console_submit').click(function() {
        log('submitting');
        ajax(url.val(), {
            data: data.val(),
            dataType: dataType.val(),
            type: method.find('option:selected').val(),
            success: function(data, html) {
                log(html);
            }
        });
    });
    $('.console_reset').click(function() {
        url.val('');
        data.val('');
    });
    $('.console_switch').click(function() {
        var w = $('#console');
        if (w.css('display') == 'block') {
            w.css('display', 'none');
        } else {
            w.css('display', 'block');
        }
    });
    $('.console_parse').unbind('click').click(function() {
        var query = '';
        if (data.val().indexOf(':') == -1) {
            return;
        }
        $.each(data.val().split('\n'), function() {
            var str = $.trim(this),
                    k = str.replace(/:[\s\S]*$/, ''),
                    v = str.replace(/^[^:]*:/, '');
            query += (query ? '&' : '') + k + '=' + v;
        });
        data.val(query);
    });
})();
$(function() {
    $('textarea').each(function() {
        $(this).val($.trim($(this).val()));
    });
    $('#train_date').datepicker({
        dateFormat: "yy-mm-dd", maxDate: '+60', minDate: 0
    });
    $('#train_date').val(new Date().pattern('yyyy-MM-dd'));
    $('.station_name').autocomplete({
        delay: 50,
        minLength: 1,
        selectListText: 'value',
        source: station_autocomplete,
        autoFocus: true,
        height: '200px',
        select: function() {
            setTimeout(function() {
                $(document).trigger('station_name_change');
            }, 1);
        },
        change: function() {
            setTimeout(function() {
                $(document).trigger('station_name_change');
            }, 1);
        }
    });
});
//checkcode
$(function() {
    $(document).on('click', '.checkcode_hint', function() {
        $(this).next('.checkcode').trigger('click');
    });
    $(document).on('click', '.checkcode', function() {
        var jthis = $(this),
                s = this.src;
        s = s.replace(/\&[^&]*$/, '');
        s = s + '&' + new Date().getTime();
        var hint = jthis.prev('.checkcode_hint');
        if (hint.length == 0) {
            hint = $('<span class="checkcode_hint"></span>');
            jthis.before(hint);
        }
        hint.text('加载中..').show();
        jthis.hide();
        jthis.unbind('load').bind('load', function() {
            jthis.show();
            hint.hide();
        });
        jthis.unbind('error').bind('error', function() {
            hint.text('加载错误！');
        });
        jthis.get(0).src = s;
    });
    window.newcode = function(id) {
        if (id) {
            $('.checkcode' + id).trigger('click');
        } else {
            $('.checkcode').trigger('click');
        }
    };newcode();
    setTimeout(function() {
        
    }, 20);
});
//alarm
$(function() {
    window.alarm = {
        view: $('#alarm'),
        audio: $("#alarm_audio").get(0),
        show: function() {
            var that = alarm;
            that.view.show();
            that.audio.load();
            that.audio.play();
        },
        hide: function() {
            var that = alarm;
            that.view.hide();
            that.audio.pause();
        }
    };
    $(document).on('click', '.alarm_show', alarm.show);
    $(document).on('click', '.alarm_hide', alarm.hide);
    $(document).on('click', '.alarm_switch', function() {
        if (alarm.view.css('display') == 'block') {
            alarm.hide();
        } else {
            alarm.show();
        }
    });
});
$(function() {
    $('.clear_cookies').click($.proxy(grabber, 'clearCookies'));
    $('.login').click($.proxy(grabber, 'login'));
    $('.query').click($.proxy(grabber, 'query'));
    $('.stop_query').click($.proxy(grabber, 'stopQuery'));

    $('.submit_order').click(function() {
        var ocode = $.trim($('#order_code').val());
        grabber.submitOrder(ocode);
    });
    $('#order_code').bind('keyup change', function() {
        var code = $(this).val();
        if (code.length != 4) {
            return;
        }
        log('验证验证码： ' + code + " 中...");
        Req.checkRandCode(2, code, function(rt) {
            if (rt) {
                log('验证码正确，自动提交订单！');
                grabber.submitOrder(code);
            } else {
                log('验证码： ' + code + " 错误！");
            }
        });
    });
    $('.switch_from_to').click(function(e) {
        e.preventDefault();
        var a = $('#from_station'),
                b = $('#to_station');
        var v = a.val();
        a.val(b.val());
        b.val(v);
        setTimeout(function() {
            $(document).trigger('station_name_change');
        }, 1);
    });
    $(document).on('click', '.delete_item', function(e) {
        e.preventDefault();
        $(this).closest('.item').remove();
    });
    $(document).bind('station_name_change', function() {
        var from = station_names[$('#from_station').val()],
                to = station_names[$('#to_station').val()],
                date = $('#train_date').val();
        if (!from || !to) {
            return;
        }
        var trains = $('.train_idx');
        var $data = from + '_' + to + '_' + date;
        if (trains.attr('_data') == $data) {
            return;
        }
        log('获取列车列表..');
        trains.attr('_data', $data);
        Req.query(from, to, date, function(data) {
            if (!data || trains.attr('_data') != $data) {
                return;
            }
            trains.empty();
            var i = 0;
            $.each(data, function() {
                trains.append($.decodeTemplate('<option value="{{idx}}">{{train}}</option>', {
                    idx: i,
                    train: this['queryLeftNewDTO']['station_train_code']
                }));
                i++;
            });
            $('#trains_list .item').remove();
            log('获取列车列表成功');
        });
    });
    $(document).trigger('station_name_change');
    $('#trains .add_train').click(function(e) {
        var train = $('.train_idx option:selected').val(),
                trainName = $('.train_idx option:selected').text(),
                type = $('.train_type option:selected').val(),
                typeName = $('.train_type option:selected').text();
        if (!train) {
            return;
        }
        var v = trainName + ',' + type;
        var list = $('#trains_list');
        if (list.find('.item[_v=' + v.replace(/\,/g, '\\,') + ']').length != 0) {
            return;
        }
        list.append($.decodeTemplate('<span class="item" _v="{{v}}">'
                + '<span class="hint">{{trainName}}-{{typeName}}</span>'
                + '<button class="delete_item" type="button">删除</button>'
                + '</span>'
                , {
            v: v,
            typeName: typeName,
            trainName: trainName
        }));
    });
    function addP(name, id, type, oldtype, typeName) {
        if (name == '' || id.length != 18) {
            return false;
        }
        var list = $('#passenger_list');
        if (list.find('.item[_id=' + id + ']').length != 0) {
            return false;
        }
        if (list.find('.item').length >= 5) {
            log('最多5位乘客！');
            return false;
        }
        list.append($.decodeTemplate('<span class="item" _name="{{name}}" _id="{{id}}" _type="{{type}}" _oldtype="{{oldtype}}">'
                + '<span class="hint">{{name}},{{id}},{{typeName}}</span>'
                + '<button class="delete_item" type="button">删除</button>'
                + '</span>', {
            id: id,
            name: name,
            type: type,
            oldtype: oldtype,
            typeName: typeName
        }));
        return true;
    }
    $('.new_p_add').click(function(e) {
        e.preventDefault();
        var name = $('#new_p_name'),
                id = $('#new_p_id'),
                type = $('#new_p_type option:selected').val(),
                typeName = $('#new_p_type option:selected').text();
        trimInput(name);
        trimInput(id);
        if (addP(name.val(), id.val(), type, type, typeName)) {
            id.val('');
            name.val('');
        }
    });
    $('.old_p_add').click(function(e) {
        e.preventDefault();
        if ($('#old_p option:selected').length == 0) {
            return;
        }
        var name = $('#old_p option:selected').attr('_name'),
                id = $('#old_p option:selected').attr('_id'),
                oldType = $('#old_p option:selected').attr('_type'),
                type = $('#old_p_type option:selected').val(),
                typeName = $('#old_p_type option:selected').text();
        addP(name, id, type, oldType, typeName);
    });
    $(document).bind('reload_my_passenger', function() {
        log('获取已存乘客..');
        grabber.getMyPassengers(function(data) {
            if (data == null) {
                log('获取已存乘客失败，是否登陆了？');
                return;
            }
            log('获取已存乘客成功');
            var options = $('#old_p').empty();
            $.each(data, function() {
                var name = this['passenger_name'],
                        id = this['passenger_id_no'],
                        type = this['passenger_type'];
                options.append($.decodeTemplate('<option value="{{id}}" _id="{{id}}" _name="{{name}}" _type="{{type}}">{{name}}</option>', {
                    name: name,
                    id: id,
                    type: type
                }));
            });
        });
    });
    $(document).trigger('reload_my_passenger');
});

$(function() {
    $('.resign_btn').click(function() {
        if (grabber.getTourFlag() == 'gc') {
            grabber.setTourFlag('dc');
            $('.noresign').show();
            $('.resign').hide();
        } else {
            grabber.setTourFlag('gc');
            $('.resign').show();
            $('.noresign').hide();
            addTickets();
        }
    });
    var ticketdatakey = 'ticket';
    $('.resign_add').click(function() {
        var op = $('#tickets option:selected').get(0);
        if (!op) {
            return;
        }
        var t = $.data(op, ticketdatakey);
        var added = false;
        $('#resign_tickets .item').each(function() {
            if ($.data(this, ticketdatakey) == t) {
                added = true;
                return false;
            }
        });
        if (added) {
            return;
        }
        var from = t['stationTrainDTO']['from_station_name'],
                to = t['stationTrainDTO']['to_station_name'],
                date = t['start_train_date_page'].substr(0, 10);
        $('#resign_tickets').append($.decodeTemplate('<span class="item">'
                + '<span class="hint">{{date}},{{train}},{{from}}-{{to}},{{name}},{{id}},{{type}},{{seatName}}</span>'
                + '<button class="delete_item" type="button">删除</button>'
                + '</span>', {
            from: from,
            to: to,
            date: date,
            name: t['passengerDTO']['passenger_name'],
            id: t['passengerDTO']['passenger_id_no'],
            type: t['ticket_type_name'],
            seatName: t['seat_type_name'] + '-' + t['seat_name'],
            train: t['stationTrainDTO']['station_train_code']
        }));
        $.data($('#resign_tickets .item:last').get(0), ticketdatakey, t);
        $('#from_station').val(from);
        $('#to_station').val(to);
        $('#train_date').val(date);
        $(document).trigger('station_name_change');
    });
    function addTickets() {
        var container = $('#tickets');
        container.empty();
        Req.getTictets(function(data) {
            if (!data) {
                return;
            }
            $.each(data, function() {
                $.each(this['tickets'], function() {
                    var t = this;
                    if (t['ticket_status_code'] != 'a') {
                        return;
                    }
                    var from = t['stationTrainDTO']['from_station_name'],
                            to = t['stationTrainDTO']['to_station_name'],
                            date = t['start_train_date_page'].substr(0, 10);
                    container.append($.decodeTemplate('<option>'
                            + '{{date}},{{train}},{{from}}-{{to}},{{name}},{{id}},{{type}},{{seatName}}</option>', {
                        from: from,
                        to: to,
                        date: date,
                        name: t['passengerDTO']['passenger_name'],
                        id: t['passengerDTO']['passenger_id_no'],
                        type: t['ticket_type_name'],
                        seatName: t['seat_type_name'] + '-' + t['seat_name'],
                        train: t['stationTrainDTO']['station_train_code']
                    }));
                    $.data(container.find('option:last').get(0), ticketdatakey, t);
                });
            });
        });
    }
});

(function() {
    window.grabber = {
        item: null,
        itemType: 'yz',
        token: null,
        keyChange: null,
        tour_flag: 'dc',
        setTourFlag: function(flag) {
            this.tour_flag = flag;
        },
        getTourFlag: function() {
            return this.tour_flag;
        },
        clearCookies: function() {
            Req.removeCookies(function() {
                newcode(1);
            });
        },
        login: function() {
            var user = $.trim($('#user').val()),
                    pwd = $.trim($('#pwd').val()),
                    code = $.trim($('#login_code').val());
            log('登陆中..');
            Req.login(user, pwd, code, function(rt) {
                if (rt) {
                    log('登陆成功');
                    $(document).trigger('reload_my_passenger');
                } else {
                    log('登陆失败！');
                }
            });
        },
        queryRunning: false,
        stopQuerySign: true,
        lockQuery: function() {
            var that = grabber;
            if (that.queryRunning) {
                log('is aready querying!');
                return false;
            }
            log('start query');
            that.queryRunning = true;
            that.stopQuerySign = false;
            return true;
        },
        freeQuery: function() {
            var that = grabber;
            log('exit query');
            that.queryRunning = false;
        },
        stopQuery: function() {
            grabber.stopQuerySign = true;
        },
        needStopQuery: function() {
            var that = grabber;
            if (that.stopQuerySign) {
                log('cancel query');
                that.freeQuery();
                return true;
            } else {
                return false;
            }
        },
        getIdxs: function() {
            var idxs = [];
            $.each($('#trains_list .item'), function() {
                var v = $(this).attr('_v');
                var temp = v.split(',');
                idxs.push([temp[0], temp[1]]);
            });
            return idxs;
        },
        _findTrainItem: function(data, name) {
            var item = null;
            $.each(data, function() {
                if (this['queryLeftNewDTO']['station_train_code'].toUpperCase() == name.toUpperCase()) {
                    item = this;
                    return false;
                }
            });
            return item;
        },
        _query: function(back) {
            var that = this;
            if (!that.lockQuery()) {
                return;
            }
            var from = station_names[$('#from_station').val()],
                    to = station_names[$('#to_station').val()],
                    date = $('#train_date').val();
            var queryDuration = parseInt($('#query_duration').val());

            that.item = null;
            function task() {
                date = $('#train_date').val();
                var stu = $('#stu')[0].checked;
                var idxs = that.getIdxs();
                if (idxs.length == 0) {
                    log('请选择车次席位！');
                }
                queryDuration = parseInt($('#query_duration').val());

                Req.query(from, to, date, stu, function(data) {
                    if (!data) {
                        if (that.needStopQuery()) {
                            back(false);
                        } else {
                            setTimeout(task, 500);
                        }
                        return;
                    }
                    $.each(idxs, function() {
                        var trainName = this[0],
                                ot = this[1],
                                t = ot + '_num';
                        var item = that._findTrainItem(data, trainName);
                        if (item == null) {
                            log('error:' + trainName);
                            return true;
                        }
                        var info = item['queryLeftNewDTO'];
                        log('query:' + 'train,' + info['station_train_code'] + '  text:' + item['buttonTextInfo']);
                        if (item['buttonTextInfo'] == '预订') {
                            var seats = info;
                            log('硬座：' + seats.yz_num + '   无座：' + seats.wz_num + '   硬卧：'
                                    + seats.yw_num + '   二等座：' + seats.ze_num + '   一等座：' + seats.zy_num);

                            if (seats[t] != '无' && seats[t] != '--') {
                                that.itemType = ot;
                                that.item = item;
                                window.GET_TRAIN_TIME = new Date();
                                return false;
                            }
                        }
                    });
                    if (that.item != null) {
                        that.freeQuery();
                        back(true);
                    } else if (that.needStopQuery()) {
                        back(false);
                    } else {
                        setTimeout(task, queryDuration);
                    }
                });
            }
            task();
        },
        query: function() {
            var that = this;
            var tour_flag = that.tour_flag;
            that._query(function(rt) {
                if (rt) {
                    if (tour_flag == 'dc') {
                        that.initDc();
                    } else if (tour_flag == 'gc') {
                        that.initGc();
                    }
                }
            });
        },
        initDc: function() {
            this._submitOrderRequest('dc');
        },
        getTickets: function() {
            var tickets = [];
            $('#resign_tickets .item').each(function() {
                tickets.push($.data(this, 'ticket'));
            });
            return tickets;
        },
        initGc: function() {
            var that = this;
            var tickets = that.getTickets();
            if (tickets.length == 0) {
                log('请选择需要改签的车票！');
                return;
            }
            var Q = Queue();
            Q.next();
            Q.step(function() {
                Req.getTictets(function(data) {
                    if (data) {
                        Q.next();
                    }
                });
            });
            Q.step(function() {
                Req.resginTicket(tickets, function(rt) {
                    if (rt) {
                        Q.next();
                    }
                });
            });
            Q.step(function() {
                that._submitOrderRequest('gc');
            });
        },
        _getPassengers: function(passengerDTOs, types, t) {
            var seats = {
                yz: 1,
                wz: 1,
                yw: 3,
                ze: 'O',
                zy: 'M'
            };
            var seatType = seats[this.itemType];
            var ps = [],
                    oldps = [];
            $.each(passengerDTOs, function(idx, item) {
                var id = item['passenger_id_no'],
                        name = item['passenger_name'],
                        ticket_type = types[idx];
                ps.push(seatType + ',0,' + ticket_type + ',' + name + ',1,' + id + ',,' + t);
                oldps.push(name + ',1,' + id + ',' + ticket_type);
            });
            return {
                ps: ps.join('_'),
                oldps: oldps.join('_') + '_',
                length: ps.length
            };
        },
        getResignPassengers: function() {
            var passengerDTOs = [],
                    types = [],
                    t = 'Y';
            $('#resign_tickets .item').each(function() {
                var ticket = $.data(this, 'ticket');
                passengerDTOs.push(ticket['passengerDTO']);
                types.push(ticket['ticket_type_code']);
            });
            return this._getPassengers(passengerDTOs, types, t);
        },
        getPassengers: function() {
            var passengerDTOs = [],
                    types = [],
                    t = 'N';
            $('#passenger_list .item').each(function() {
                var jthis = $(this);
                var name = jthis.attr('_name'),
                        id = jthis.attr('_id'),
                        type = jthis.attr('_type');
                passengerDTOs.push({
                    passenger_id_no: id,
                    passenger_name: name
                });
                types.push(type);
            });
            return this._getPassengers(passengerDTOs, types, t);
        },
        _submitOrderRequest: function(tour_flag) {
            var that = this;
            var item = this.item;
            var Q = new Queue();
            Q.next();
            Q.step(function() {
                Req.submitOrderRequest(decodeURIComponent(item['secretStr']),
                        item['queryLeftNewDTO']['start_train_date'],
                        item['queryLeftNewDTO']['from_station_name'],
                        item['queryLeftNewDTO']['to_station_name'],
                        tour_flag, function(rt) {
                    if (rt) {
                        Q.next();
                    }
                });
            });
            Q.step(function() {
                Req.getTokens(tour_flag, function(token, keyChange) {
                    if (token != null) {
                        that.token = token;
                        that.keyChange = keyChange;
                        Q.next();
                    }
                });
            });
            Q.step(function() {
                newcode(2);
                alarm.show();
                log('请立刻输入 验证码2 ，验证码输入正确后将自动提交订单');
            });
        },
        submittingOrder: false,
        lockSubmit: function() {
            var that = this;
            if (that.token == null) {
                log('no token,cancelled submit order');
                return false;
            } else if (that.submittingOrder) {
                log('is aready submitting order!');
                return false;
            } else {
                that.submittingOrder = true;
                alarm.hide();
                return true;
            }
        },
        freeSubmit: function() {
            this.submittingOrder = false;
        },
        submitOrder: function(ocode) {
            var that = grabber;
            var tour_flag = that.tour_flag;
            if (tour_flag == 'gc') {
                that._submitResignOrder(ocode);
            } else if (that.tour_flag == 'dc') {
                that._submitOrder(ocode);
            }
        },
        _submitResignOrder: function(ocode) {
            var that = this;
            if (!that.lockSubmit()) {
                return;
            }
            var tour_flag = 'gc';
            var passengers = that.getResignPassengers();
            if (passengers.length == 0) {
                log('请选择乘客！');
                that.freeSubmit();
                return;
            }
            var item = that.item;
            var ps = passengers['ps'],
                    oldps = passengers['oldps'];
            log('ps:' + ps);
            log('oldPs:' + oldps);
            var Q = new Queue();
            Q.next();
            Q.step(function() {
                Req.checkOrderInfo(ps, oldps, ocode, that.token, tour_flag, function(rt) {
                    if (rt) {
                        Q.next();
                    } else {
                        that.freeSubmit();
                    }
                });
            });
            Q.step(function() {
                Req.confirmResignForQueue(ps, oldps, ocode, item['queryLeftNewDTO']['yp_info'],
                        that.token, that.keyChange, item['queryLeftNewDTO']['location_code'], function(rt) {
                    if (rt) {
                        Q.next();
                    } else {
                        that.freeSubmit();
                    }
                });
            });
            Q.step(function() {
                that.freeSubmit();
            });
        },
        _submitOrder: function(ocode) {
            var that = this;
            if (!that.lockSubmit()) {
                return;
            }
            var tour_flag = 'dc';
            var passengers = that.getPassengers();
            if (passengers.length == 0) {
                log('请选择乘客！');
                that.freeSubmit();
                return;
            }
            var item = that.item;
            var ps = passengers['ps'],
                    oldps = passengers['oldps'];
            log('ps:' + ps);
            log('oldPs:' + oldps);
            var Q = new Queue();
            Q.next();
            Q.step(function() {
                Req.checkOrderInfo(ps, oldps, ocode, that.token, tour_flag, function(rt) {
                    if (rt) {
                        Q.next();
                    } else {
                        that.freeSubmit();
                    }
                });
            });
            Q.step(function() {
                Req.confirmSingleForQueue(ps, oldps, ocode, item['queryLeftNewDTO']['yp_info'],
                        that.token, that.keyChange, item['queryLeftNewDTO']['location_code'], function(rt) {
                    if (rt) {
                        Q.next();
                    } else {
                        that.freeSubmit();
                    }
                });
            });
            Q.step(function() {
                that.freeSubmit();
            });
        },
        getMyPassengers: function(back) {
            Req.getTokens(function(token) {
                if (token == null) {
                    back(null);
                }
                Req.getMyPassengers(token, function(data) {
                    back(data);
                });
            });
        }
    };
    window.Req = {
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
        getMyPassengers: function(token, back) {
            ajax('https://kyfw.12306.cn/otn/confirmPassenger/getPassengerDTOs', {
                data: {_json_att: '',
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
        removeCookies: function(back) {
            log('clear cookies..');
            chrome.cookies.getAll({domain: "kyfw.12306.cn"}, function(cookies) {
                for (var i = 0; i < cookies.length; i++) {
                    if (cookies[i].name.toUpperCase() == 'JSESSIONID') {
                        chrome.cookies.remove({url: "https://kyfw.12306.cn" + cookies[i].path, name: cookies[i].name});
                    }
                }
                ajax('https://kyfw.12306.cn/otn/', {
                    type: 'get',
                    success: function() {
                        log('finish clear cookies');
                        if (back)
                            back();
                    }
                });
            });
        },
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
        login: function(user, pwd, code, back) {
            ajax('https://kyfw.12306.cn/otn/login/loginAysnSuggest', {
                data: "loginUserDTO.user_name=" + user + "&userDTO.password=" + pwd + "&randCode=" + code,
                success: function(data, html) {
                    if (data['data'] && data['data']['loginCheck'] && data['data']['loginCheck'] == 'Y') {
                        back(true);
                    } else {
                        log(html);
                        back(false);
                    }
                }
            });
        },
        query: function(from, to, date, stu, back) {
            if (!back) {
                back = stu;
                stu = false;
            }

            if (stu && window.$$prestu) {
                stu = false;
            }
            var purpose_codes = 'ADULT';
            if (stu) {
                log('查询学生票..');
                purpose_codes = '0X00';
                window.$$prestu = true;
            } else {
                log('查询成人票..');
                purpose_codes = 'ADULT';
                window.$$prestu = false;
            }
            ajax('https://kyfw.12306.cn/otn/leftTicket/query', {
                type: 'get',
                data: 'leftTicketDTO.train_date=' + date
                        + '&leftTicketDTO.from_station=' + from
                        + '&leftTicketDTO.to_station=' + to
                        + "&purpose_codes=" + purpose_codes,
                success: function(data) {
                    if (data && data['data'])
                        back(data.data);
                    else
                        back(null);
                }
            });
        },
        submitOrderRequest: function(secretStr, date, f_s, t_s, tour_flag, back) {
            log('submitOrderRequest..');
            log('secretStr:' + secretStr + ' from:' + f_s + " to:" + t_s + " date:" + date);
            var purpose_codes = 'ADULT';
            if (window.$$prestu) {
                purpose_codes = '0X00';
            } else {
                purpose_codes = 'ADULT';
            }
            purpose_codes = 'ADULT';
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
        getTokens: function(tour_flag, back) {
            if (!back) {
                back = tour_flag;
                tour_flag = 'dc';
            }
            log('getting tokens..');
            var token = null,
                    key_change = null;
            var url;
            if (tour_flag == 'gc') {
                url = 'https://kyfw.12306.cn/otn/confirmPassenger/initGc';
            } else {
                url = 'https://kyfw.12306.cn/otn/confirmPassenger/initDc';
            }
            ajax(url, {
                cache: false,
                type: 'get',
                success: function(data) {
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
        confirmResignForQueue: function(ps, oldps, code, leftTicketStr, token, keyChange, train_location, back) {
            log('confirmsubmitting..');
            var purpose_codes = '00';
            if (window.$$prestu) {
                purpose_codes = '0X00';
            } else {
                purpose_codes = 'ADULT';
            }
            purpose_codes = '00';
            ajax('https://kyfw.12306.cn/otn/confirmPassenger/confirmResignForQueue', {
                data: {
                    passengerTicketStr: ps,
                    oldPassengerStr: oldps,
                    randCode: code,
                    key_check_isChange: keyChange,
                    leftTicketStr: leftTicketStr,
                    purpose_codes: purpose_codes,
                    train_location: train_location,
                    REPEAT_SUBMIT_TOKEN: token,
                    _json_att: ''
                },
                success: function(data, text) {
                    if (data['data'] && data['data']['submitStatus']) {
                        var start = window.GET_TRAIN_TIME;
                        var time_used = (new Date().getTime() - start.getTime()) / 1000;
                        log('提交订单成功,耗时：' + formatFloat(time_used, '.3') + '秒; 请点击 查看订单 到12306付款');
                        back(true);
                    } else {
                        log('提交订单失败！');
                        log(text);
                        back(false);
                    }
                }
            });
        },
        confirmSingleForQueue: function(ps, oldps, code, leftTicketStr, token, keyChange, train_location, back) {
            log('confirmsubmitting..');
            var purpose_codes = '00';
            if (window.$$prestu) {
                purpose_codes = '0X00';
            } else {
                purpose_codes = 'ADULT';
            }
            purpose_codes = '00';
            ajax('https://kyfw.12306.cn/otn/confirmPassenger/confirmSingleForQueue', {
                data: {
                    passengerTicketStr: ps,
                    oldPassengerStr: oldps,
                    randCode: code,
                    REPEAT_SUBMIT_TOKEN: token,
                    key_check_isChange: keyChange,
                    leftTicketStr: leftTicketStr,
                    purpose_codes: purpose_codes,
                    train_location: train_location,
                    _json_att: ''
                },
                success: function(data, text) {
                    if (data['data'] && data['data']['submitStatus']) {
                        var start = window.GET_TRAIN_TIME;
                        var time_used = (new Date().getTime() - start.getTime()) / 1000;
                        log('提交订单成功,耗时：' + formatFloat(time_used, '.3') + '秒; 请点击 查看订单 到12306付款');
                        back(true);
                    } else {
                        log('提交订单失败！');
                        log(text);
                        back(false);
                    }
                }
            });
        }
    };
})();
