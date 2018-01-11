
import moment from 'moment';
import request from 'asset/common/request';

const api = {
  checkLoginRandCode({ randCode }) {
    return request({
        url: 'https://kyfw.12306.cn/passport/captcha/captcha-check',
        method: 'POST',
        data: {
          login_site: 'E',
          rand: 'sjrand',
          answer: randCode,
        },
      })
      .then(data => {
        if (data && data.result_code === '4') {
          return data;
        } else {
          return Promise.reject(data);
        }
      });
  },

  checkRandCode({ isSubmit, randCode, submitToken = '' }) {
    return request({
        url: 'https://kyfw.12306.cn/otn/passcodeNew/checkRandCodeAnsyn',
        method: 'POST',
        headers: {
          '_$Origin': 'https://kyfw.12306.cn',
          '_$Referer': 'https://kyfw.12306.cn/otn/confirmPassenger/initDc',
        },
        data: {
          _json_att: '',
          rand: isSubmit ? 'randp' : 'sjrand',
          randCode,
          REPEAT_SUBMIT_TOKEN: submitToken,
        },
      })
      .then(data => {
        if (data && data.data && data.data.result === '1') {
          return data.data;
        } else {
          return Promise.reject(data);
        }
      });
  },

  logout() {
    return request('https://kyfw.12306.cn/otn/login/loginOut');
  },

  checkUser() {
    return request({
        url: 'https://kyfw.12306.cn/otn/index/initMy12306',
        redirect: 'error',
        dataType: 'html',
      })
      .then(data => {
        if (data && !data.match(/var sessionInit = '([^']+)';/)) {
          return Promise.reject(data);
        }
        return data;
      });
  },

  login({ account, password, randCode }) {

    return request({
        url: 'https://kyfw.12306.cn/passport/web/login',
        method: 'POST',
        data: {
          username: account,
          password,
          appid: 'otnj',
        },
      })
      .then(data => {
        if (data && data.data && data.data.loginCheck === 'Y') {
          return data.data;
        } else {
          return Promise.reject(data);
        }
      });
  },

  getMyPassengers() {
    return request({
        url: 'https://kyfw.12306.cn/otn/confirmPassenger/getPassengerDTOs',
        method: 'POST',
        data: {
          _json_att: '',
        },
      })
      .then(data => {
        if (data && data.data && data.data.normal_passengers) {
          return data.data.normal_passengers || [];
        } else {
          return Promise.reject(data);
        }
      });
  },

  getQueryUrl() {
    return request({
        url: 'https://kyfw.12306.cn/otn/leftTicket/init',
        dataType: 'html'
      })
      .then(data => {
        if (data && data.match(/var CLeftTicketUrl = '([^']+)';/)) {
          return RegExp.$1;
        } else {
          return Promise.reject(data);
        }
      });
  },

  query({ queryUrl, from, to, date, isStudent }) {
    const params = [
      `leftTicketDTO.train_date=${date}`, // 2018-01-09
      `leftTicketDTO.from_station=${from}`,
      `leftTicketDTO.to_station=${to}`,
      `purpose_codes=${isStudent ? '0X00' : 'ADULT'}`,
    ].join('&');
    return request({
        url: `https://kyfw.12306.cn/otn/${queryUrl}?${params}`,
        timeout: 5000,
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
          '_$Referer': 'https://kyfw.12306.cn/otn/leftTicket/init',
        },
      })
      .then(data => {
        if (data && data.data) {
          return (data.data.result || []).map(item => {
            const fields = item.split('|');
            return {
              button: fields[1],
              name: fields[3], // 车次号
              secretStr: fields[0],
              fromStationName: fields[6],
              toStationName: fields[7],
              leftTicketStr: fields[12],
              locationCode: fields[15],
              date: fields[13],
              rw: fields[23] || '-', // 软卧
              wz: fields[26] || '-', // 卧铺
              yw: fields[28] || '-', // 硬座
              yz: fields[29] || '-', // 硬座
              zs: fields[32] || '-', // 商务座
              zy: fields[31] || '-', // 一等座
              ze: fields[30] || '-', // 二等座
              fields,
            };
          });
        } else {
          if (data && data.status === false && data.c_url) {
            console.error('new addr', data);
          }
          return Promise.reject(data);
        }
      });
  },

  getQueueCount(item, seatType) {
    var trainInfo = item.queryLeftNewDTO;
    return request({
        url: 'https://kyfw.12306.cn/otn/confirmPassenger/getQueueCount',
        method: 'POST',
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
          REPEAT_SUBMIT_TOKEN: context.submitToken,
        },
      })
      .then(data => {
        if (data && data.data) {
          return data.data;
        } else {
          return Promise.reject(data);
        }
      });
  },

  submitOrderRequest({ train, tourFlag, isStu }) {
    const DATA_P = 'YYYY-MM-DD';
    return request({
        url: 'https://kyfw.12306.cn/otn/leftTicket/submitOrderRequest',
        method: 'POST',
        data: {
          secretStr: decodeURIComponent(train.secretStr),
          query_from_station_name: train.fromStationName,
          query_to_station_name: train.toStationName,
          train_date: moment(train.date, 'YYYYMMDD').format(DATA_P),
          back_train_date: moment().format(DATA_P),
          tour_flag: tourFlag,
          purpose_codes: isStu ? '0X00' : 'ADULT',
          myversion: 'undefined',
          'undefined': ''
        },
      }).then(data => {
        if (data && data.status && data.data === 'N') {
          return data.data;
        } else {
          return Promise.reject(data);
        }
      });
  },

  async initDc() {
    const data = await request({
      url: 'https://kyfw.12306.cn/otn/confirmPassenger/initDc',
      method: 'POST',
      data: {
        _json_att: ''
      },
      dataType: 'html'
    });
    const submitToken = data.match(/globalRepeatSubmitToken[^']*'([\w]*)'/) ? RegExp.$1 : null;
    const keyChange = data.match(/key_check_isChange':'([\w]*)'/) ? RegExp.$1 : null;

    const dynamicJs = data.match(/<script src\="\/otn\/dynamicJs\/(\w+)"/) ? RegExp.$1 : null;

    if (dynamicJs) {
      await request({
        url: `https://kyfw.12306.cn/otn/dynamicJs/${dynamicJs}`,
        dataType: 'html'
      });
    }
    return {
      submitToken,
      keyChange,
    };
  },

  checkOrderInfo({ passengerTicketStr, oldPassengerStr, tourFlag, randCode = '', submitToken }) {
    return request({
        url: 'https://kyfw.12306.cn/otn/confirmPassenger/checkOrderInfo',
        method: 'POST',
        data: {
          cancel_flag: 2,
          bed_level_order_num: '000000000000000000000000000000',
          tour_flag: tourFlag,
          passengerTicketStr,
          oldPassengerStr,
          randCode,
          whatsSelect: 1,
          REPEAT_SUBMIT_TOKEN: submitToken,
          _json_att: ''
        },
      })
      .then(data => {
        if (data && data.data && data.data.submitStatus) {
          return data.data;
        } else {
          return Promise.reject(data);
        }
      });
  },

  confirmSingleForQueue({ passengerTicketStr, oldPassengerStr, randCode = '', submitToken, keyChange, train }) {
    return request({
        url: 'https://kyfw.12306.cn/otn/confirmPassenger/confirmSingleForQueue',
        method: 'POST',
        data: {
          passengerTicketStr,
          oldPassengerStr,
          randCode,
          REPEAT_SUBMIT_TOKEN: submitToken,
          key_check_isChange: keyChange,
          leftTicketStr: train.leftTicketStr,
          train_location: train.locationCode,
          purpose_codes: '00',
          choose_seats: '',
          seatDetailType: '000',
          whatsSelect: 1,
          roomType: '00',
          dwAll: 'N',
          _json_att: ''
        },
      })
      .then(data => {
        if (data && data.data && data.data.submitStatus) {
          return data.data;
        } else {
          return Promise.reject(data);
        }
      });
  },
};

export default api;
