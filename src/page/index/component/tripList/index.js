
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
      <section className="train-select">
        抢票列表:
      </section>
    );
  }
}
