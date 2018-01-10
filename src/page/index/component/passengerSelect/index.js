
import React from 'react';
import { connect } from 'react-redux';
import { INPUT_UPDATE } from '../../action/input';
import api from '../../api';
import './index.scss';

const typeMap = [
  { name: '成人票', key: '1' },
  { name: '学生票', key: '3' },
  { name: '儿童票', key: '2' },
].reduce((o, item) => Object.assign(o, { [item.key]: item }), {});

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
        type,
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
            Object.keys(typeMap).map(type => (
              <option value={type} key={type}>{typeMap[type].name}</option>
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

export default connect(({ input, login }) => {
  return {
    input,
    login,
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
    },
  }
})(Component);
