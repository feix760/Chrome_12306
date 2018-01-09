
import React from 'react';
import { connect } from 'react-redux';
import DatePicker from 'react-datepicker';
import moment from 'moment';
import StationAutocomplete from '../stationAutocomplete';
import { INPUT_UPDATE } from '../../action/input';
import 'react-datepicker/dist/react-datepicker.css';
import './index.scss';

class Component extends React.Component {
  constructor() {
    super(...arguments);
    this.state = {
    };
  }

  render() {
    const { props } = this;
    const { input } = props;
    return (
      <section className="account-input">
        <span>发站:</span>
        <StationAutocomplete value={input.from} onChange={props.update('from')} />
        <span>&lt;&gt;</span>
        <span>到站:</span>
        <StationAutocomplete value={input.to} onChange={props.update('to')} />
        <span>日期:</span>
        <div className="date-picker-wrap">
          <DatePicker selected={input.date} onChange={props.update('date')}
            locale="zh-cn"
            minDate={moment()}
            maxDate={moment().add(30, 'days')} />
        </div>
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
    }
  }
})(Component);
