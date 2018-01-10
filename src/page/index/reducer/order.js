
import moment from 'moment';
import {
  ORDER_STATUS,
  ORDER_UPDATE_ATTR,
} from '../action/order';

const defaultState = {
  status: 'stop',
  startAt: 0,
  train: null,
  seat: null,
  tourFlag: 'dc',
  keyChange: '',
  submitToken: '',
  passengerTicketStr: '',
  oldPassengerStr: '',
};

function fn(state = defaultState, { type, data }) {
  switch(type) {
    case ORDER_STATUS:
      state = {
        ...state,
        status: data,
      };
      break;
    case ORDER_UPDATE_ATTR:
      state = {
        ...state,
        ...data,
      };
      break;
    default:
      break;
  }
  return state
}

fn.serialization = function() {
  return {};
};

fn.deserialization = function() {
  return defaultState;
};

export default fn;
