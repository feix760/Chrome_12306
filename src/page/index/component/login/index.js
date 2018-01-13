
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
    this.checkUser();
    setInterval(this.checkUser, 10000);
  }

  checkUser = () => {
    this.props.loginCheck()
      .catch(() => {
        const checkcode = this.refs.checkcode.getWrappedInstance();
        if (!checkcode.hasUrl()) {
          checkcode.refresh();
        }
      });
  }

  login = async () => {
    const { account, password } = this.props.input;
    if (!account || !password) {
      Log.info('请输入账号和密码');
      return;
    }

    const checkcode = this.refs.checkcode.getWrappedInstance();

    if (!checkcode.getValue()) {
      Log.info('请输入验证码');
      return;
    }

    try {
      const randCode = await checkcode.getCheckedRandCode();

      await this.props.loginPost({
        account,
        password,
        randCode,
      });

    } catch (err) {
      Log.info('登陆失败');
      checkcode.refresh();
      return;
    }

    Log.info('登陆成功');
  }

  logout = async () => {
    try {
      this.props.logoutPost();
    } catch (err) {
      Log.info('退出登陆失败');
      return;
    }
    Log.info('退出登陆成功');
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
