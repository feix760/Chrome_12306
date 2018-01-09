
import { createStore, applyMiddleware, combineReducers } from 'redux';
import thunkMiddleware from 'redux-thunk';
import input from './reducer/input';

export default createStore(
  combineReducers({
    input,
  }),
  window.__initialState || {},
  applyMiddleware(thunkMiddleware)
);
