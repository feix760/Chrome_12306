
import { createStore, applyMiddleware, combineReducers } from 'redux';
import thunkMiddleware from 'redux-thunk';
import moment from 'moment';
import input from './reducer/input';
import login from './reducer/login';
import order from './reducer/order';

const STATE_KEY = 'state';

const reducers = {
  input,
  login,
  order,
};

const store = createStore(
  combineReducers(reducers),
  getInitialState(),
  applyMiddleware(thunkMiddleware)
);

function getInitialState() {
  const json = localStorage.getItem(STATE_KEY) || '{}';
  let state = {};
  try {
    state = JSON.parse(json) || {};
  } catch (err) {
    localStorage.removeItem(STATE_KEY);
  }

  // apply deserialization
  Object.keys(reducers).forEach(key => {
    const fn = reducers[key];
    if (fn.deserialization) {
      state[key] = fn.deserialization(state[key]);
    }
  });
  return state;
}

function saveState() {
  const state = {
    ...store.getState(),
  };
  // apply serialization
  Object.keys(reducers).forEach(key => {
    const fn = reducers[key];
    if (fn.serialization) {
      state[key] = fn.serialization(state[key]);
    }
  });
  try {
    localStorage.setItem(STATE_KEY, JSON.stringify(state));
  } catch (err) {
    console.log('save state error', err);
  }
}

let timer = null;
store.subscribe(() => {
  if (timer) {
    return;
  }
  timer = setTimeout(() => {
    timer = null;
    saveState();
  }, 1000);
});

export default store;
