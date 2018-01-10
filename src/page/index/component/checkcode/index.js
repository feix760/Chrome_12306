
import React from 'react';
import { connect } from 'react-redux';
import api from '../../api';
import './index.scss';

export default class Component extends React.Component {
  constructor() {
    super(...arguments);
    this.state = {
      url: '',
      points: [],
    };
  }

  componentDidMount() {
    if (!this.props.isSubmit) {
      this.refresh();
    }
  }

  refresh = () => {
    const url = this.props.isSubmit
      ? `https://kyfw.12306.cn/otn/passcodeNew/getPassCodeNew?module=passenger&rand=randp&${Math.random()}`
      : `https://kyfw.12306.cn/passport/captcha/captcha-image?login_site=E&module=login&rand=sjrand&${Math.random()}`;
    this.setState({
      url,
      points: [],
    });
  }

  addPoint = (e) => {
    const { offsetX, offsetY } = e.nativeEvent;
    this.setState({
      points: this.state.points.concat([{
        x: offsetX,
        y: offsetY,
      }]),
    });
  }

  removePoint(removeItem, e) {
    e.preventDefault();
    e.stopPropagation();

    const { points } = this.state;
    points.find((item, index) => {
      if (item === removeItem) {
        points.splice(index, 1);
      }
    });
    this.setState({
      points: points.concat([]),
    });
  }

  getCheckedRandCode() {
    const { isSubmit } = this.props;
    let list = [];
    this.state.points.forEach(item => {
      list = list.concat([ item.x, item.y ]);
    });
    const randCode = list.join(',');
    return api[ isSubmit ? 'checkRandCode' : 'checkLoginRandCode' ]({
        isSubmit,
        randCode,
      })
      .then(() => {
        return randCode;
      });
  }

  render() {
    const { state } = this;
    return (
      <div className="checkcode-wrap">
        {
          state.url && (
            <div>
              <img src={state.url} />
              <div className="refresh-area" onClick={this.refresh}>刷新</div>
              <div className="click-area" onClick={this.addPoint}>
                {
                  state.points.map(item => (
                    <div className="point" key={item.x + '-' + item.y}
                      onClick={this.removePoint.bind(this, item)}
                      style={{
                        left: item.x - 15 + 'px',
                        top: item.y - 15 + 'px',
                      }}
                    ></div>
                  ))
                }
              </div>
            </div>
          )
        }
      </div>
    );
  }
}
