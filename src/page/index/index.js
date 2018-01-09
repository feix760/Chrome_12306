
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider, connect } from 'react-redux';
import 'asset/common/component.extend';
import store from './store';
import AccountInput from './component/accountInput';
import TripInput from './component/tripInput';
import TrainSelect from './component/trainSelect';
import PassengerSelect from './component/passengerSelect';
import TripList from './component/tripList';
import Clock from './component/clock';
import Checkcode from './component/checkcode';
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
        <TripList />
        <Clock />
        <div className="layout">
          <div className="login-wrap">
            <Checkcode />
          </div>
          <div className="submit-wrap">
            <Checkcode isSubmit={true} />
          </div>
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
