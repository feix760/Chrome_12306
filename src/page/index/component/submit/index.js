
import React from 'react';
import { connect } from 'react-redux';
import request from 'asset/common/request';
import Checkcode from '../checkcode';
import { submitOrder } from '../../action/order';
import * as Log from '../../log';
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
      this.refresh();
    }
  }

  refresh() {
    this.refs.checkcode.refresh();
  }

  submitOrder = () => {
    const { checkcode } = this.refs;
    if (!checkcode.getValue()) {
      Log.info('请输入验证码');
      return;
    }
    const { order } = this.props;
    if (order.status !== 'read-checkcode') {
      Log.info('已取消抢票');
      return;
    }
    checkcode.getCheckedRandCode()
      .catch(err => {
        Log.info('验证码错误, 请重新输入');
        this.refresh();
        return Promise.reject(err);
      })
      .then(randCode => {
        this.props.dispatch(submitOrder(randCode));
      });
  }

  onLoad = (base64) => {
    const { order } = this.props;
    if (order.status !== 'read-checkcode') {
      return;
    }
    const { OCREnable, OCRUrl, OCRAK, OCRSK } = this.props.input;
    if (OCREnable) {
      request({
        url: OCRUrl,
        data: {
          ak: OCRAK,
          sk: OCRSK,
          img: base64,
        }
      }).then(data => {
        if (data && data.retCode === 0 && data.result.length) {
          Log.info('自动识别验证码成功');
          this.props.dispatch(submitOrder(data.result.join(',')));
        }
      });
    }
  }

  render() {
    return (
      <section className="submit-container">
        <div className="margin">
          提交订单验证码:
          <button type="button" onClick={this.submitOrder}>提交</button>
        </div>
        <Checkcode ref="checkcode" isSubmit={true} submitToken={this.props.order.submitToken}
          onLoad={this.onLoad} onSubmit={this.submitOrder}/>
      </section>
    );
  }
}

export default connect(
  ({
    input,
    order,
  }) => ({
    input,
    order,
  }),
  dispatch => ({
    dispatch,
  })
)(Component);
