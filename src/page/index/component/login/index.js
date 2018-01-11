
import React from 'react';
import { connect } from 'react-redux';
import { loginCheck, loginPost, logoutPost } from '../../action/login';
import Checkcode from '../checkcode';
import * as Log from '../../log';
import './index.scss';

class Component extends React.Component {
  constructor() {
    super(...arguments);
    this.state = {
    };
  }

  componentDidMount() {
    this.props.loginCheck();
    setInterval(() => {
      this.props.loginCheck();
    }, 10000);
  }

  login = () => {
    const { account, password } = this.props.input;
    if (!account || !password) {
      Log.info('请输入账号和密码');
      return Promise.reject();
    }

    const { checkcode } = this.refs;
    if (!checkcode.getValue()) {
      Log.info('请输入验证码');
      return Promise.reject();
    }

    return checkcode.getCheckedRandCode()
      .then(randCode => {
        return this.props.loginPost({
          account,
          password,
          randCode,
        });
      });
  }

  logout = () => {
    return this.props.logoutPost();
  }

  render() {
    const { props } = this;
    const { input, login } = props;
    return (
      <section className="login-container">
        <div className="margin">
          登陆验证码:
          { !login.hasLogin ? <button type="button" onClick={this.login}>请登陆</button> : null }
          { login.hasLogin ? <button type="button" onClick={this.logout}>退出登陆</button> : null }
        </div>
        <Checkcode ref="checkcode" onSubmit={!login.hasLogin && this.login}/>
      </section>
    );
  }
}

export default connect(
  ({
    input,
    login,
  }) => ({
    input,
    login,
  }),
  dispatch => ({
    loginCheck() {
      return dispatch(loginCheck());
    },
    loginPost(data) {
      return dispatch(loginPost(data));
    },
    logoutPost() {
      return dispatch(logoutPost());
    },
  })
)(Component);
