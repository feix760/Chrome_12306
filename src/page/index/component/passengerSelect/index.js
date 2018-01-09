
import React from 'react';
import './index.scss';

export default class Component extends React.Component {
  constructor() {
    super(...arguments);
    this.state = {
    };
  }

  render() {
    const { state } = this;
    return (
      <section className="passenger-select">
        <span>添加乘客:</span>
        <span>已存乘客</span>
        <select></select>
        <select>
          <option value="1">成人票</option>
          <option value="3">学生票</option>
          <option value="2">儿童票</option>
        </select>
        <button type="button">刷新</button>
      </section>
    );
  }
}
