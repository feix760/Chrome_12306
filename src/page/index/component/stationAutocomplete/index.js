
import React from 'react';
import Autocomplete from 'react-autocomplete';
import _stationNames from './stationNames';
import './index.scss';

const stationNames = (() => {
  return _stationNames.split('@')
    .filter(item => item)
    .map((item, index) => {
      const fields = item.split('|');
      return {
        key: index,
        label: fields[0],
        name: fields[1],
        code: fields[2],
      };
    });
})();

export default class Component extends React.Component {
  constructor(props) {
    super(...arguments);
    this.state = {
      value: props.value && props.value.name || '',
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.value !== this.props.value && nextProps.value) {
      this.setState({
        value: nextProps.value.name,
      });
    }
  }

  renderItem = (item, isHighlighted) => {
    return (
      <div key={item.key} style={{ background: isHighlighted ? 'lightgray' : 'white' }}>
        {item.name}
      </div>
    );
  }

  getItemValue = (item) => item.label

  onChange = (e) => {
    this.setState({
      value: e.target.value,
    });
  }

  onSelect = (value, item) => {
    this.setState({
      value: item.name,
    });
    this.props.onChange && this.props.onChange(item);
  }

  shouldItemRender = (item, value) => {
    return value && item.label.toLowerCase().indexOf(value.toLowerCase()) > -1;
  }

  render() {
    const { state } = this;
    return (
      <div className="station-autocomplete-wrap">
        <Autocomplete
          items={stationNames}
          shouldItemRender={this.shouldItemRender}
          getItemValue={this.getItemValue}
          renderItem={this.renderItem}
          value={state.value}
          onChange={this.onChange}
          onSelect={this.onSelect}
        />
      </div>
    );
  }
}
