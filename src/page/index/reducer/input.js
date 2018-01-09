
import moment from 'moment';
import { INPUT_UPDATE } from '../action/input';

const defaultState = {
  loginname: '',
  password: '',
  from: '',
  to: '',
  date: moment(),
};

export default function(state = defaultState, action) {
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
