
import React from 'react';
import { connect } from 'react-redux';
import Checkcode from '../checkcode';
import { submitOrder } from '../../action/order';
import './index.scss';

class Component extends React.Component {
  constructor() {
    super(...arguments);
    this.state = {};
  }

  componentWillReceiveProps(nextProps) {
    const { order } = this.props;
    const { order: nextOrder } = nextProps;
    if (nextOrder.status === 'read-checkcode' && nextOrder.status !== order.status) {
      this.getCheckcode();
    }
  }

  getCheckcode() {
    const { checkcode } = this.refs;
    checkcode.refresh();

  }

  submitOrder = () => {
    checkcode.getCheckedRandCode(randCode => {
      this.props.dispatch(submitOrder(randCode));
    });
  }

  render() {
    return (
      <section className="submit-container">
        <div className="margin">
          提交订单验证码:
          <button type="button" onClick={this.submitOrder}>提交</button>
        </div>
        <Checkcode ref="checkcode" isSubmit={true} />
      </section>
    );
  }
}

export default connect(
  ({
    order,
  }) => ({
    order,
  }),
  dispatch => ({
    dispatch,
  })
)(Component);
