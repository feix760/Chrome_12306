define('modules/index/rest', function(require, exports, module) {

  function ajax(url, settings) {
      settings = settings || {};
      settings.headers = $.extend({
          '_$Origin': 'https://kyfw.12306.cn',
          '_$X-Requested-With': 'XMLHttpRequest'
      }, settings.headers || {});
      return new Promise(function(resolve, reject) {
          $.ajax(url, settings).then(
              function (data, status, jqXhr) {
                  resolve(data);
              }, 
              function (jqXhr) {
                  reject(jqXhr);
              }
          )
      });
  };
  
  var context = {
      queryUrl: 'leftTicket/queryT',
      token: '',
      keyChange: ''
  };
  
  var R = {};
  
  R.checkRandCode = function(randId, code) {
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
              return Pormise.reject(data);
          }
      });
  };
  
  R.logout = function() {
      return ajax('https://kyfw.12306.cn/otn/login/loginOut');
  };
  
  R.checkUser = function () {
      return ajax(
          'https://kyfw.12306.cn/otn/login/checkUser', 
          {
              data: {
                  _json_att: ''
              }, 
              type: 'post'
          }
      ).then(function (data) {
          if (!data || !data.data || !data.data.flag) {
              return $.Deferred().reject(arguments).promise();
          }
      });
  }; 
  
  R.login = function(user, pwd, code) {
      return this.checkRandCode(1, code).then(function() {
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
          ).then(function (data) {
              if (!(data && data.data && data.data.loginCheck === 'Y')) {
                  return $.Deferred().reject(arguments);
              }
          });
      });
  };
  
  R.getMyPassengers = function() {
      return ajax(
          'https://kyfw.12306.cn/otn/confirmPassenger/getPassengerDTOs', 
          {
              data: {
                  _json_att: ''
              },
              type: 'post'
          }
      ).then(function (data) {
          if (data && data.data && data.data.normal_passengers) {
              return data.data.normal_passengers;
          } else {
              return Promise.reject(data);
          }
      });
  };
  
  R.query = function(from, to, date, isStudent) {
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
                  '_$If-Modified-Since': 0,
                  '_$Referer': 'https://kyfw.12306.cn/otn/leftTicket/init'
              }
          }
      ).then(function (data) {
          if (data && data.data) {
              return data.data;
          } else {
              return Promise.reject(data);
          }
      });
  };
  
  R.getQueueCount = function (item, seatType) {
      var me = this;
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
                  REPEAT_SUBMIT_TOKEN: me.submitToken
              }, 
              type: 'post'
          }
      ).then(function (data) {
          if (data && data.data) {
              return data.data;
          } else {
              return $.Deferred().reject();
          }
      });
  }; 
  
  R.submitOrderRequest = function(item, tour_flag, isStu) {
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
      ).then(function (data) {
          if (!(data && data.status && data.data === 'N')) {
              return Promise.reject();
          }
      });
  };
  
  R.initDc = function() {
      return ajax(
          'https://kyfw.12306.cn/otn/confirmPassenger/initDc', 
          {
              data: {
                  _json_att: ''
              }, 
              type: 'post', 
              dataType: 'html'
          }
      ).then(function (data) {
          context.submitToken = data.match(/globalRepeatSubmitToken[^']*'([\w]*)'/)
              ? RegExp.$1 : null;
          context.keyChange = data.match(/key_check_isChange':'([\w]*)'/)
              ? RegExp.$1 : null;
          return R.dynamicJs(data);
      });
  };
  
  R.dynamicJs = function(data) {
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
  
  R.checkOrderInfo = function(ps, oldps, code, tour_flag) {
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
      ).then(function (data) {
          if (!(data && data.data && data.data.submitStatus)) {
              return $.Deferred().reject(arguments);
          }
      });
  };
  
  R.confirmSingleForQueue = function(ps, oldps, code, item) {
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
      ).then(function (data) {
          if (!(data && data.data && data.data.submitStatus)) {
              return Promise.reject();
          }
      });
  };
  
  //改签
  R.getTictets = function(start, end) {
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
      ).then(function (data) {
          if (data && data.data && data.data.OrderDTODataList) {
              return data.data.OrderDTODataList;
          } else {
              return $.Deferred().reject(arguments);
          }
      });
  };
  
  R.resginTicket = function(tickets) {
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
      ).then(function (data) {
          if (!(data && data.data && data.data.existError === 'N')) {
              return $.Deferred().reject(arguments);
          }
      });
  };
  
  function _getResginTicketsData(tickets) {
      // E243443701,1,03,0033,2014-01-18 20:06#E243443701,1,03,0033,2014-01-18 20:06#
      // E243443701
      var ticketkey = [], sequenceNo = '';
      tickets.forEach(function(item) {
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
  
  R.getResignTokens = function() {
      var me = this;
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
          } catch (e) {}
          me._setToken(token, key_change);
          if (data.indexOf('dynamicJs') !== -1) {
              return me._getLoginKeyFormData(data);
          }
      });
  };
  
  R.confirmResignForQueue = function(ps, oldps, code, item) {
      var me = this;
      return ajax(
          'https://kyfw.12306.cn/otn/confirmPassenger' 
              + '/confirmResignForQueue', 
          {
              data: {
                  passengerTicketStr: ps,
                  oldPassengerStr: oldps,
                  randCode: code,
                  key_check_isChange: me.keyChange,
                  purpose_codes: '00',
                  leftTicketStr: item.queryLeftNewDTO.yp_info,
                  train_location: item.queryLeftNewDTO.location_code,
                  roomType: '00',
                  dwAll: 'N',
                  REPEAT_SUBMIT_TOKEN: me.submitToken,
                  _json_att: ''
              }
          }
      ).then(function (data) {
          if (!(data && data.data && data.data.submitStatus)) {
              return $.Deferred().reject(arguments);
          }
      });
  };
  
  return R;
  
  

});
