
import moment from 'moment';
import { LOGIN_SET } from '../action/login';

const defaultState = {
  hasLogin: false,
};

export default function(state = defaultState, action) {
  switch(action.type) {
    case LOGIN_SET:
      state = {
        ...state,
        hasLogin: action.data,
      };
      break;
    default:
      break;
  }
  return state
}
