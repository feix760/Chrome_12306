
import React from 'react';
import { connect } from 'react-redux';
import api from '../../api';
import './index.scss';

class Component extends React.Component {
  constructor() {
    super(...arguments);
    this.state = {
      trainList: [],
    };
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

    const trainList = await api.query({
      queryUrl,
      from: input.from.code,
      to: input.to.code,
      date: input.date.format('YYYY-MM-DD'),
    });

    this.setState({
      trainList,
    });
  }

  refreshTrainList = () => {
    this.loadTrainList(this.props.input);
  }

  selectTrain = (e) => {
    console.log(e);
  }

  render() {
    const { props } = this;
    const { trainList } = this.state;
    return (
      <section className="train-select">
        <span>车次:</span>
        <select onChange={this.selectTrain}>
          {
            trainList.map((item, index) => (
              <option key={item.train} value={index}>{item.train}</option>
            ))
          }
        </select>
        <select>
          <option value="zy">一等座</option>
          <option value="ze">二等座</option>
          <option value="rw">软卧</option>
          <option value="yw">硬卧</option>
          <option value="yz">硬座</option>
          <option value="wz">无座</option>
        </select>
        <button type="button" onClick={this.refreshTrainList}>刷新</button>
      </section>
    );
  }
}

export default connect(({ input }) => {
  return {
    input,
  }
}, (dispatch) => {
  return {
  }
})(Component);
