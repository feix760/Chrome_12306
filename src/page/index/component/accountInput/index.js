
import React from 'react';
import { connect } from 'react-redux';
import { INPUT_UPDATE } from '../../action/input';
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
        <input type="text" value={input.loginname} onChange={props.update('loginname')} />
        <span>密码:</span>
        <input type="password" value={input.password} onChange={props.update('password')} />
      </section>
    );
  }
}

export default connect(({ input }) => {
  return {
    input,
  }
}, (dispatch) => {
  return {
    update(field) {
      return data => {
        dispatch({
          type: INPUT_UPDATE,
          field: field,
          value: data.target ? data.target.value : data,
        });
      }
    }
  }
})(Component);
