
import api from '../api';
import * as Log from '../log';

export const LOGIN_SET = 'LOGIN_SET';

export function loginCheck() {
  return (dispatch, getState) => {
    return (async () => {
      try {
        await api.checkUser();
      } catch (err) {
        dispatch({
          type: LOGIN_SET,
          data: false,
        });
        throw err;
      }

      dispatch({
        type: LOGIN_SET,
        data: true,
      });
    })();
  };
}

export function loginPost(data) {
  return (dispatch, getState) => {
    return (async () => {
      await api.login(data);

      const tk = await api.uamtk();

      await api.uamauthclient({
        tk,
      });

      dispatch({
        type: LOGIN_SET,
        data: true,
      });
    })();
  };
}

export function logoutPost() {
  return (dispatch, getState) => {
    return (async () => {
      await api.logout();
      dispatch({
        type: LOGIN_SET,
        data: false,
      });
    })();
  };
}
