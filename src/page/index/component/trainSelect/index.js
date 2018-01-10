
import React from 'react';
import { connect } from 'react-redux';
import { getUpdater, seatMap } from '../../action/input';
import api from '../../api';
import './index.scss';

class Component extends React.Component {
  constructor() {
    super(...arguments);
    this.state = {
      allTrain: [],
    };
  }

  componentDidMount() {
    const { input } = this.props;
    if (input.from && input.to && input.date) {
      this.loadTrainList(input);
    }
  }

  componentWillReceiveProps(nextProps) {
    const { input } = this.props;
    const { input: nextInput } = nextProps;

    if (nextInput.from && nextInput.to && nextInput.date
      && (nextInput.from !== input.from || nextInput.to !== input.to || nextInput.date !== input.date)
    ) {
      this.loadTrainList(nextInput);
    }
  }

  async loadTrainList(input) {
    if (!input.from || !input.to || !input.date) {
      return;
    }

    const queryUrl = await api.getQueryUrl();

    const allTrain = await api.query({
      queryUrl,
      from: input.from.code,
      to: input.to.code,
      date: input.date.format('YYYY-MM-DD'),
    });

    this.setState({
      allTrain,
    });
  }

  refreshList = () => {
    this.loadTrainList(this.props.input);
  }

  addItem = () => {
    const trainKey = this.refs.train.value;
    const seatKey = this.refs.seat.value;
    if (!trainKey || !seatKey) {
      return;
    }

    const train = this.state.allTrain[trainKey];
    const seat = seatMap[seatKey];

    const { trainList } = this.props.input;
    const found = trainList.find(item => {
      return item.train.name === train.name && item.seat.key === seat.key;
    });

    if (!found) {
      this.updateList(trainList.concat([{
        train,
        seat,
      }]));
    }
  }

  removeItem(item) {
    const { trainList: list } = this.props.input;
    list.splice(list.indexOf(item), 1);
    this.updateList(list.concat([]));
  }

  updateList(list) {
    this.props.update('trainList')(list);
  }

  render() {
    const { allTrain } = this.state;
    const { input } = this.props;
    return (
      <section className="train-select">
        <span>车次:</span>
        <select ref="train">
          {
            allTrain.map((item, index) => (
              <option key={item.name} value={index}>{item.name}</option>
            ))
          }
        </select>
        <select ref="seat">
          {
            Object.keys(seatMap).map(type => (
              <option value={type} key={type}>{seatMap[type].name}</option>
            ))
          }
        </select>
        <button type="button" onClick={this.addItem}>添加</button>
        <button type="button" onClick={this.refreshList}>刷新</button>
        {
          input.trainList.map(item => (
            <span className="selected-item" key={item.train.name + '_' + item.seat.key}>
              { item.train.name } - { item.seat.name }
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
  }) => ({
    input,
  }),
  dispatch => ({
    update: getUpdater(dispatch),
  })
)(Component);
