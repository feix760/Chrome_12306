
import React from 'react';
import { connect } from 'react-redux';
import * as Log from '../../log';
import { getUpdater } from '../../action/input';
import { startQuery, stopQuery } from '../../action/order';
import './index.scss';

import alarmVideo from './asset/alarm.wav';
import alertVideo from './asset/alert.wav';

class Component extends React.Component {
  constructor() {
    super(...arguments);
    this.state = {
      playingMusic: false,
    };
  }

  componentWillReceiveProps(nextProps) {
    const { order } = this.props;
    const { order: nextOrder } = nextProps;
    if (nextOrder.status === 'submit' && nextOrder.status !== order.status) {
      this.playMusic();
    }
    if (nextOrder.status === 'stop' && nextOrder.status !== order.status && this.state.playingMusic) {
      this.stopMusic();
    }
  }

  startQuery = () => {
    this.props.dispatch(startQuery());
  }

  stopQuery = () => {
    this.props.dispatch(stopQuery());
  }

  clearLog = () => {
    Log.clear();
  }

  playMusic = () => {
    if (!this.state.playingMusic) {
      this.setState({
        playingMusic: true,
      });
      this.refs.alert.play();
      this.refs.alarm.play();

      this._title = document.title;
      this._titleInterval = setInterval(() => {
        document.title = Math.random() + '';
      }, 500);
    }
  }

  stopMusic = () => {
    if (this.state.playingMusic) {
      document.title = this._title;
      clearInterval(this._titleInterval);
      this.setState({
        playingMusic: false,
      });
      this.refs.alert.pause();
      this.refs.alarm.pause();
    }
  }

  render() {
    const { props, state } = this;
    const { input } = props;
    return (
      <section className="action-area-container">
        <span>查询间隔:</span>
        <input type="text" value={input.duration} onChange={props.update('duration')}/> 毫秒
        <input type="checkbox" checked={input.queryStudent} onChange={props.update('queryStudent')}/> 学生票
        <button type="button" onClick={this.startQuery}>开始查询</button>
        <button type="button" onClick={this.stopQuery}>停止查询</button>
        <button type="button" onClick={this.clearLog}>清除日志</button>
        { !state.playingMusic && <button type="button" onClick={this.playMusic}>试听声音</button> }
        { state.playingMusic && <button type="button" onClick={this.stopMusic}>停止声音</button> }
        <a target="_blank" href="https://kyfw.12306.cn/otn/">12306</a>
        <a target="_blank" href="https://kyfw.12306.cn/otn/queryOrder/initNoComplete">查看订单</a>
        <a target="_blank" href="http://www.12306.cn/mormhweb/zxdt/201411/t20141126_2316.html">起售时间</a>
        <div className="alarm" style={{display: state.playingMusic ? '' : 'none'}}>
          <audio ref="alarm" src={alarmVideo} loop="loop"></audio>
          <audio ref="alert" src={alertVideo} loop="loop"></audio>
        </div>
      </section>
    );
  }
}

export default connect(
  ({
    input,
    order,
  }) => ({
    input,
    order,
  }),
  dispatch => ({
    dispatch,
    update: getUpdater(dispatch),
  })
)(Component);
