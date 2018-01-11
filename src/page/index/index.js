
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider, connect } from 'react-redux';
import 'asset/common/component.extend';
import * as Log from './log';
import store from './store';
import AccountInput from './component/accountInput';
import TripInput from './component/tripInput';
import TrainSelect from './component/trainSelect';
import PassengerSelect from './component/passengerSelect';
import Clock from './component/clock';
import Checkcode from './component/checkcode';
import Login from './component/login';
import Submit from './component/submit';
import ActionArea from './component/actionArea';
import OCR from './component/OCR';
import './index.scss';

class Component extends React.Component {
  constructor() {
    super(...arguments);
  }

  render() {
    const { state } = this;
    return (
      <div>
        <AccountInput />
        <TripInput />
        <TrainSelect />
        <PassengerSelect />
        <OCR />
        <Clock />
        <div className="layout">
          <div>
            <Login />
          </div>
          <div>
            <Submit />
          </div>
        </div>
        <ActionArea />
        <div id="log"></div>
        <div id="tip">
          1、点击开始查询之后，听到报警声，立刻输入订单验证码(右击验证码尝试提交), 订单将自动提交；
        </div>
      </div>
    );
  }
}

const Root = connect(state => {
  return state;
})(Component);

ReactDOM.render(
  <Provider store={ store }>
    <Root />
  </Provider>,
  document.getElementById('root')
);
