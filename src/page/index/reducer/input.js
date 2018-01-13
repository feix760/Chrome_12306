
import moment from 'moment';
import { INPUT_UPDATE } from '../action/input';

const defaultState = {
  account: '',
  password: '',
  from: '',
  to: '',
  date: moment(),
  allTrain: [],
  allPassenger: [],
  trainList: [], // 选择的火车列表
  passengerList: [], // 选择的购票人员列表
  duration: 1000, // 查询间隔
  queryStudent: false, // 是否查询学生票
  queryUrl: 'leftTicket/queryZ',

  OCREnable: false,
  OCRUrl: 'http://127.0.0.1:8100',
  appId: '',
  appKey: '',
  appSecret: '',
};

function fn(state = defaultState, action) {
  switch(action.type) {
    case INPUT_UPDATE:
      state = {
        ...state,
        ...action.data,
      };
      break;
    default:
      break;
  }
  return state
}

fn.deserialization = function(obj = {}) {
  if (obj.date) {
    obj.date = moment(obj.date);
  }
  obj = {
    ...defaultState,
    ...obj,
  };
  return obj;
};

fn.serialization = function(obj) {
  return obj;
};

export default fn;
