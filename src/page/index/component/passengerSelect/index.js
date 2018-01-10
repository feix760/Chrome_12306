
import React from 'react';
import { connect } from 'react-redux';
import { getUpdater, passengerTypeMap } from '../../action/input';
import api from '../../api';
import './index.scss';

class Component extends React.Component {
  constructor() {
    super(...arguments);
    this.state = {
      allPassenger: [],
    };
  }

  componentDidMount() {
    if (this.props.login.hasLogin) {
      this.refreshList();
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.login.hasLogin && !this.props.login.hasLogin) {
      this.refreshList();
    }
  }

  refreshList = () => {
    return api.getMyPassengers()
      .then(allPassenger => {
        this.setState({
          allPassenger,
        });
        return allPassenger;
      });
  }

  addItem = () => {
    const passengerIndex = this.refs.passenger.value;
    const type = this.refs.type.value;
    if (!passengerIndex || !type) {
      return;
    }
    const passenger = this.state.allPassenger[passengerIndex];
    const { passengerList } = this.props.input;

    const found = passengerList.find(item => {
      return item.passenger_id_no === passenger.passenger_id_no;
    });

    if (!found) {
      this.updateList(passengerList.concat([{
        ...passenger,
        type, // 成人票/学生票/儿童票
      }]));
    }
  }

  removeItem(item) {
    const { passengerList: list } = this.props.input;
    list.splice(list.indexOf(item), 1);
    this.updateList(list.concat([]));
  }

  updateList(list) {
    this.props.update('passengerList')(list);
  }

  render() {
    const { allPassenger } = this.state;
    const { input } = this.props;
    return (
      <section className="passenger-select">
        <span>添加乘客:</span>
        <select ref="passenger">
          {
            allPassenger.map((item, index) => (
              <option key={item.passenger_id_no} value={index}>{item.passenger_name}</option>
            ))
          }
        </select>
        <select ref="type">
          {
            Object.keys(passengerTypeMap).map(type => (
              <option value={type} key={type}>{passengerTypeMap[type].name}</option>
            ))
          }
        </select>
        <button type="button" onClick={this.addItem}>添加</button>
        <button type="button" onClick={this.refreshList}>刷新</button>
        {
          input.passengerList.map(item => (
            <span className="selected-item" key={item.passenger_id_no}>
              { item.passenger_name } - { item.passenger_id_no }
              <button type="button" onClick={this.removeItem.bind(this, item)}>删除</button>
            </span>
          ))
        }
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
    update: getUpdater(dispatch),
  })
)(Component);
