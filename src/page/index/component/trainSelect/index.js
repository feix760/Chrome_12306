
import React from 'react';
import { connect } from 'react-redux';
import { INPUT_UPDATE } from '../../action/input';
import api from '../../api';
import './index.scss';

const siteMap = [
  { name: '硬卧', key: 'yw' },
  { name: '硬座', key: 'yz' },
  { name: '无座', key: 'wz' },
  { name: '软卧', key: 'rw' },
  { name: '商务座', key: 'swz' },
  { name: '一等座', key: 'zy' },
  { name: '二等座', key: 'ze' },
].reduce((o, item) => Object.assign(o, { [item.key]: item }), {});

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
    const siteKey = this.refs.site.value;
    if (!trainKey || !siteKey) {
      return;
    }

    const train = this.state.allTrain[trainKey];
    const site = siteMap[siteKey];

    const { trainList } = this.props.input;
    const found = trainList.find(item => {
      return item.train.name === train.name && item.site.key === site.key;
    });

    if (!found) {
      this.updateList(trainList.concat([{
        train,
        site,
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
        <select ref="site">
          {
            Object.keys(siteMap).map(type => (
              <option value={type} key={type}>{siteMap[type].name}</option>
            ))
          }
        </select>
        <button type="button" onClick={this.addItem}>添加</button>
        <button type="button" onClick={this.refreshList}>刷新</button>
        {
          input.trainList.map(item => (
            <span className="selected-item" key={item.train.name + '_' + item.site.key}>
              { item.train.name } - { item.site.name }
              <button type="button" onClick={this.removeItem.bind(this, item)}>删除</button>
            </span>
          ))
        }
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
