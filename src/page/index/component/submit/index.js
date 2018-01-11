
import React from 'react';
import { connect } from 'react-redux';
import Checkcode from '../checkcode';
import { submitOrder } from '../../action/order';
import * as Log from '../../log';
import './index.scss';

class Component extends React.Component {
  constructor() {
    super(...arguments);
    this.state = {};
  }

  componentDidMount() {
    // this.refresh();
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

  submitOrder = async () => {
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
    if (this._checking) {
      return;
    }
    this._checking = true;

    try {
      const randCode = await checkcode.getCheckedRandCode();
      Log.info('验证码正确, 提交订单中');
      this.props.dispatch(submitOrder(randCode));
    } catch (err) {
      Log.info('验证码错误, 请重新输入');
      this.refresh();
    }

    this._checking = false;
  }

  onLoad = async base64 => {
    const { order } = this.props;
    if (order.status !== 'read-checkcode') {
      return;
    }
    const { checkcode } = this.refs;
    const { OCREnable, OCRUrl, OCRAK, OCRSK } = this.props.input;
    if (OCREnable) {
      try {
        const randCode = await checkcode.tryOCR({
          OCRUrl,
          OCRAK,
          OCRSK,
          base64,
        });
        Log.info(`自动识别验证码成功: ${randCode}`);
        this.props.dispatch(submitOrder(randCode));
      } catch (err) {
        Log.info(`自动识别验证码失败`);
      }
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
