
import React from 'react';
import { connect } from 'react-redux';
import { getUpdater } from '../../action/input';
import './index.scss';

class Component extends React.Component {
  constructor() {
    super(...arguments);
  }

  render() {
    const { props } = this;
    const { input } = props;
    return (
      <section className="account-input">
        <span>用户名:</span>
        <input type="text" value={input.account} onChange={props.update('account')} />
        <span>密码:</span>
        <input type="password" value={input.password} onChange={props.update('password')} />
      </section>
    );
  }
}

export default connect(
  ({
    input,
  }) => ({
    input,
  }),
  dispatch => ({
    update: getUpdater(dispatch),
  })
)(Component);
