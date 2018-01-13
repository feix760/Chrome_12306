
import React from 'react';
import { connect } from 'react-redux';
import { getUpdater, seatMap, loadAllTrain } from '../../action/input';
import './index.scss';

class Component extends React.Component {
  constructor() {
    super(...arguments);
  }

  componentDidMount() {
    const { input } = this.props;
    if (input.from && input.to && input.date) {
      this.loadAllTrain();
    }
  }

  componentWillReceiveProps(nextProps) {
    const { input } = this.props;
    const { input: nextInput } = nextProps;

    if (nextInput.from && nextInput.to && nextInput.date
      && (nextInput.from !== input.from || nextInput.to !== input.to || nextInput.date !== input.date)
    ) {
      this.loadAllTrain(nextInput);
    }
  }

  loadAllTrain = async input => {
    input = input || this.props.input;
    if (!input.from || !input.to || !input.date) {
      return;
    }
    this.props.dispatch(loadAllTrain(input));
  }

  addItem = () => {
    const trainKey = this.refs.train.value;
    const seatKey = this.refs.seat.value;
    if (!trainKey || !seatKey) {
      return;
    }

    const { allTrain, trainList } = this.props.input;
    const train = allTrain[trainKey];
    const seat = seatMap[seatKey];

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
    const { input } = this.props;
    const { allTrain } = input;
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
        <button type="button" onClick={this.loadAllTrain.bind(this, null)}>刷新</button>
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
    dispatch,
    update: getUpdater(dispatch),
  })
)(Component);
