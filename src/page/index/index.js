
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
        <Clock />
        <div className="layout">
          <div>
            <Login />
          </div>
          <div>
            <Checkcode isSubmit={true} />
          </div>
        </div>
        <div id="log"></div>
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