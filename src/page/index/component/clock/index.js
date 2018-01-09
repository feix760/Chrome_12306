
import React from 'react';
import moment from 'moment';
import './index.scss';

export default class Component extends React.Component {
  constructor() {
    super(...arguments);
    this.state = {
      time: moment(),
    };
  }

  componentDidMount() {
    setInterval(() => {
      this.setState({
        time: moment(),
      });
    }, 1000);
  }

  render() {
    return (
      <section className="clock-container">
        {this.state.time.format('HH:mm:ss')}
      </section>
    );
  }
}
