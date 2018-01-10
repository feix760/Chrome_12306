
import React from 'react';
import { connect } from 'react-redux';
import './index.scss';

class Component extends React.Component {
  constructor() {
    super(...arguments);
    this.state = {
    };
  }

  render() {
    const { props } = this;
    const { input } = props;
    return (
      <section className="login-container">
        登陆验证码:
        <button type="button" onClick={this.login}>请登陆</button>
        <button type="button" onClick={this.logout}>退出登陆</button>
        <Checkcode />
      </section>
    );
  }
}

export default connect(() => {
  return {};
}, (dispatch) => {
  return {};
})(Component);
