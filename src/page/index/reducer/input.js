
import moment from 'moment';
import { INPUT_UPDATE } from '../action/input';

const defaultState = {
  account: '',
  password: '',
  from: '',
  to: '',
  date: moment(),
  trainList: [], // 选择的火车列表
  passengerList: [], // 选择的购票人员列表
};

function fn(state = defaultState, action) {
  switch(action.type) {
    case INPUT_UPDATE:
      state = {
        ...state,
        [action.field]: action.value,
      };
      break;
    default:
      break;
  }
  return state
}

fn.deserialization = function(obj) {
  if (obj && obj.date) {
    obj.date = moment(obj.date);
  }
  return obj;
};

export default fn;
