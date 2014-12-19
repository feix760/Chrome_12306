
(function(global) {

    var ajax = function(url, settings) {
        return $.ajax(url, settings).then(
            function (data, status, jqXhr) {
                var html = jqXhr.responseText;
                return $.Deferred().resolve(data, html, jqXhr.status, jqXhr);
            }
        );
    };

    var R = {
        checkRandCode: function(randId, code) {
            var rands = ['', 'sjrand', 'randp'];
            return ajax(
                'https://kyfw.12306.cn/otn/passcodeNew/checkRandCodeAnsyn',
                {
                    data: {
                        randCode: code,
                        rand: rands[randId]
                    }
                }
            ).then(function (data) {
                if(!(data && data.data && data.data.result === '1')) {
                    return $.Deferred().reject(arguments);
                }
            });
        },
        logout: function() {
            return $.Deferred(function (deferred) {
                var urls = ['https://kyfw.12306.cn/'];
                C.clearAllCookies(urls, function () {
                    deferred.resolve();
                });
            }).promise();
        },
        getLoginKey: function (type, force) {
            var me = this;
            type = type || 'login';
            var TYPE_URL_MAP = {
                login: 'https://kyfw.12306.cn/otn/login/init', 
                query: 'https://kyfw.12306.cn/otn/leftTicket/init'
            };
            if (me._loginKey && !force) {
                return $.Deferred().resolve(me._loginKey).promise();
            }
            return ajax(
                TYPE_URL_MAP[type],
                {
                    dataType: 'html'
                }
            ).then(function (data) {
                return me._getLoginKeyFormData(data);
            });
        }, 
        _getLoginKeyFormData: function (data) {
            var me = this;
            var url;
            try {
                url = data
                    .match(/<script src\="\/otn\/dynamicJs\/(\w+)"/)[1];
            } catch (e) {}
            return ajax(
                'https://kyfw.12306.cn/otn/dynamicJs/' + url,
                {
                    dataType: 'html'
                }
            ).then(function (data) {
                var dtd = $.Deferred();
                var key;
                var subUrl;
                try {
                    key = data
                        .match(/\{var key='(\w+)'/)[1];
                    subUrl = data.match(/url :'\/otn\/dynamicJs\/(\w+)'/)[1];
                } catch (e) {}
                ajax(
                    'https://kyfw.12306.cn/otn/dynamicJs/' + subUrl
                ).always(function () {
                    var keyVlues = [key, '1111'];
                    me._loginKey = {
                        myversion: 'undefined'
                    };
                    me._loginKey[key] = 
                        encode32(bin216(Base32.encrypt(keyVlues[1], keyVlues[0])));
                    me._loginKeyTime = +new Date();
                    dtd.resolve(me._loginKey);
                });
                return dtd.promise();
            });
        },
        login: function(user, pwd, code) {
            return this.getLoginKey('query', true).then(function (keyObj) {
                var param = {
                    'loginUserDTO.user_name': user, 
                    'userDTO.password': pwd, 
                    randCode: code, 
                    randCode_validate: ''
                };
                return ajax(
                    'https://kyfw.12306.cn/otn/login/loginAysnSuggest', 
                    {
                        data: $.extend(param, keyObj),
                        type: 'post'
                    }
                ).then(function (data) {
                    if (!(data && data.data && data.data.loginCheck === 'Y')) {
                        return $.Deferred().reject(arguments);
                    }
                });
            });
        },
        getMyPassengers: function(token) {
            return ajax(
                'https://kyfw.12306.cn/otn/confirmPassenger/getPassengerDTOs', 
                {
                    data: {
                        _json_att: '',
                        REPEAT_SUBMIT_TOKEN: token
                    }
                }
            ).then(function (data) {
                if (data && data.data && data.data.normal_passengers) {
                    return data.data.normal_passengers;
                } else {
                    return $.Deferred().reject(arguments);
                }
            });
        },
        query: function(from, to, date, isStudent) {
            var me = this;
            var purpose_codes = isStudent ? '0X00' : 'ADULT';
            var data = 'leftTicketDTO.train_date=' + date 
                + '&leftTicketDTO.from_station=' + from 
                + '&leftTicketDTO.to_station=' + to 
                + '&purpose_codes=' + purpose_codes;
            var urls = [
                'https://kyfw.12306.cn/otn/leftTicket/query', 
                'https://kyfw.12306.cn/otn/leftTicket/queryT'
            ];
            me.queryUrl = me.queryUrl || urls[0];
            var req = function (url) {
                return ajax(url, {data: data}).then(function (data, text) {
                    if (data && data.data) {
                        return data.data;
                    } else {
                        return $.Deferred().reject();
                    }
                });
            };
            return req(me.queryUrl).then(function (data) {
                return data;
            }, function (args) {
                me.queryUrl = me.queryUrl === urls[0] ? urls[1] : urls[0];
                return req(me.queryUrl);
            });
        },
        submitOrderRequest: function(item, tour_flag, isStu) {
            var purpose_codes = isStu ? '0X00' : 'ADULT';
            return this.getLoginKey('query').then(function (keyObj) {
                var DATA_P = 'YYYY-MM-DD';
                return ajax(
                    'https://kyfw.12306.cn/otn/leftTicket/submitOrderRequest', 
                    {
                        data: $.extend({
                            secretStr: decodeURIComponent(item.secretStr),
                            train_date: moment(
                                    item.queryLeftNewDTO.start_train_date,
                                    'YYYYMMDD'
                                ).format(DATA_P),
                            back_train_date: moment().format(DATA_P),
                            tour_flag: tour_flag,
                            purpose_codes: purpose_codes,
                            query_from_station_name: 
                                item.queryLeftNewDTO.from_station_name,
                            query_to_station_name: 
                                item.queryLeftNewDTO.to_station_name
                        }, keyObj), 
                        type: 'post'
                    }
                ).then(function (data) {
                    if (!(data && data.status)) {
                        return $.Deferred().reject(arguments);
                    }
                });
            });
        },
        getTokens: function() {
            var me = this;
            return ajax(
                'https://kyfw.12306.cn/otn/confirmPassenger/initDc', 
                {
                    cache: false,
                    type: 'get', 
                    dataType: 'html'
                }
            ).then(function (data) {
                var token = null;
                var key_change = null;
                try {
                    token = data
                        .match(/globalRepeatSubmitToken[^']*'([\w]*)'/)[1];
                    key_change = data
                        .match(/key_check_isChange':'([\w]*)'/)[1];
                } catch (e) {}
                if (data.indexOf('dynamicJs') !== -1) {
                    return me._getLoginKeyFormData(data).then(function () {
                        return $.Deferred().resolve(token, key_change);
                    });
                } else {
                    return $.Deferred().resolve(token, key_change);
                }
            });
        },
        checkOrderInfo: function(ps, oldps, code, token, tour_flag) {
            return this.getLoginKey().then(function (keyObj) {
                return ajax(
                    'https://kyfw.12306.cn/otn/confirmPassenger/checkOrderInfo', 
                    {
                        data: $.extend({
                            cancel_flag: 2,
                            bed_level_order_num: '000000000000000000000000000000',
                            passengerTicketStr: ps,
                            oldPassengerStr: oldps,
                            tour_flag: tour_flag,
                            randCode: code,
                            REPEAT_SUBMIT_TOKEN: token,
                            _json_att: ''
                        }, keyObj)
                    }
                ).then(function (data) {
                    if (!(data && data.data && data.data.submitStatus)) {
                        return $.Deferred().reject(arguments);
                    }
                });
            });
        },
        confirmSingleForQueue: function(ps, oldps,
                code, leftTicketStr,
                token, keyChange, train_location) {
            return ajax(
                'https://kyfw.12306.cn/otn/confirmPassenger' 
                    + '/confirmSingleForQueue',
                {
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
                    }
                }
            ).then(function (data) {
                if (!(data && data.data && data.data.submitStatus)) {
                    return $.Deferred().reject(arguments);
                }
            });
        }
    };

    //改签
    $.extend(R, {
        getTictets: function(start, end) {
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
                        sequeue_train_name: ''
                    }
                }
            ).then(function (data) {
                if (data && data.data && data.data.OrderDTODataList) {
                    return data.data.OrderDTODataList;
                } else {
                    return $.Deferred().reject(arguments);
                }
            });
        },
        resginTicket: function(tickets) {
            var data = this._getResginTicketsData(tickets);
            return ajax(
                'https://kyfw.12306.cn/otn/queryOrder/resginTicket', 
                {
                    data: {
                        ticketkey: data['ticketkey'],
                        sequenceNo: data['sequenceNo'],
                        _json_att: ''
                    }
                }
            ).then(function (data) {
                if (!(data && data.data && data.data.existError === 'N')) {
                    return $.Deferred().reject(arguments);
                }
            });
        },
        _getResginTicketsData: function(tickets) {
            // E243443701,1,03,0033,2014-01-18 20:06#E243443701,1,03,0033,2014-01-18 20:06#
            // E243443701
            var ticketkey = [], sequenceNo = '';
            $.each(tickets, function(idx, item) {
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
        },
        getResignTokens: function() {
            return ajax(
                'https://kyfw.12306.cn/otn/confirmPassenger/initGc', 
                {
                    cache: false,
                    type: 'get'
                }
            ).then(function (data) {
                var token = null;
                var key_change = null;
                try {
                    token =
                        data.match(/globalRepeatSubmitToken[^']*'([\w]*)'/)[1];
                    key_change =
                        data.match(/key_check_isChange':'([\w]*)'/)[1];
                } catch (e) {
                }
                return $.Deferred().resolve(token, key_change);
            });
        },
        confirmResignForQueue: function(ps, oldps,
                code, leftTicketStr,
                token, keyChange, train_location) {
            return ajax(
                'https://kyfw.12306.cn/otn/confirmPassenger' 
                    + '/confirmResignForQueue', 
                {
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
                    }
                }
            ).then(function (data) {
                if (!(data && data.data && data.data.submitStatus)) {
                    return $.Deferred().reject(arguments);
                }
            });
        }
    });

    $.extend(global, {
        REST: R,
        R: R
    });

    // copy form 12306
    function bin216(s) {
        var i, l, o = "",
            n;
        s += "";
        b = "";
        for (i = 0, l = s.length; i < l; i++) {
            b = s.charCodeAt(i);
            n = b.toString(16);
            o += n.length < 2 ? "0" + n : n;
        }
        return o;
    };
    var Base32 = new function() {
        var delta = 0x9E3779B8;

        function longArrayToString(data, includeLength) {
            var length = data.length;
            var n = (length - 1) << 2;
            if (includeLength) {
                var m = data[length - 1];
                if ((m < n - 3) || (m > n)) return null;
                n = m;
            }
            for (var i = 0; i < length; i++) {
                data[i] = String.fromCharCode(data[i] & 0xff, data[i] >>> 8 & 0xff, data[i] >>> 16 & 0xff, data[i] >>> 24 & 0xff);
            }
            if (includeLength) {
                return data.join('').substring(0, n);
            } else {
                return data.join('');
            }
        };

        function stringToLongArray(string, includeLength) {
            var length = string.length;
            var result = [];
            for (var i = 0; i < length; i += 4) {
                result[i >> 2] = string.charCodeAt(i) | string.charCodeAt(i + 1) << 8 | string.charCodeAt(i + 2) << 16 | string.charCodeAt(i + 3) << 24;
            }
            if (includeLength) {
                result[result.length] = length;
            }
            return result;
        };
        this.encrypt = function(string, key) {
            if (string == "") {
                return "";
            }
            var v = stringToLongArray(string, true);
            var k = stringToLongArray(key, false);
            if (k.length < 4) {
                k.length = 4;
            }
            var n = v.length - 1;
            var z = v[n],
                y = v[0];
            var mx, e, p, q = Math.floor(6 + 52 / (n + 1)),
                sum = 0;
            while (0 < q--) {
                sum = sum + delta & 0xffffffff;
                e = sum >>> 2 & 3;
                for (p = 0; p < n; p++) {
                    y = v[p + 1];
                    mx = (z >>> 5 ^ y << 2) + (y >>> 3 ^ z << 4) ^ (sum ^ y) + (k[p & 3 ^ e] ^ z);
                    z = v[p] = v[p] + mx & 0xffffffff;
                }
                y = v[0];
                mx = (z >>> 5 ^ y << 2) + (y >>> 3 ^ z << 4) ^ (sum ^ y) + (k[p & 3 ^ e] ^ z);
                z = v[n] = v[n] + mx & 0xffffffff;
            }
            return longArrayToString(v, false);
        };
    };
    var keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";

    function encode32(input) {
        input = escape(input);
        var output = "";
        var chr1, chr2, chr3 = "";
        var enc1, enc2, enc3, enc4 = "";
        var i = 0;
        do {
            chr1 = input.charCodeAt(i++);
            chr2 = input.charCodeAt(i++);
            chr3 = input.charCodeAt(i++);
            enc1 = chr1 >> 2;
            enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
            enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
            enc4 = chr3 & 63;
            if (isNaN(chr2)) {
                enc3 = enc4 = 64;
            } else if (isNaN(chr3)) {
                enc4 = 64;
            }
            output = output + keyStr.charAt(enc1) + keyStr.charAt(enc2) + keyStr.charAt(enc3) + keyStr.charAt(enc4);
            chr1 = chr2 = chr3 = "";
            enc1 = enc2 = enc3 = enc4 = "";
        } while (i < input.length);
        return output;
    };
})(this);
