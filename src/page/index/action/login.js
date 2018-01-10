
import api from '../api';

export const LOGIN_SET = 'LOGIN_SET';

export function loginCheck() {
  return (dispatch, getState) => {
    return api.checkUser()
      .catch(err => {
        dispatch({
          type: LOGIN_SET,
          data: false,
        });
        return Promise.reject(err);
      })
      .then(data => {
        dispatch({
          type: LOGIN_SET,
          data: true,
        });
        return data;
      });
  };
}

export function loginPost(data) {
  return (dispatch, getState) => {
    return api.login(data)
      .then(data => {
        dispatch({
          type: LOGIN_SET,
          data: true,
        });
        return data;
      });
  };
}

export function logoutPost() {
  return (dispatch, getState) => {
    return api.logout()
      .then(data => {
        dispatch({
          type: LOGIN_SET,
          data: false,
        });
        return data;
      });
  };
}
