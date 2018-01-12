
import React from 'react';
import { connect } from 'react-redux';
import request from 'asset/common/request';
import * as Log from '../../log';
import api from '../../api';
import './index.scss';

class Component extends React.Component {
  constructor() {
    super(...arguments);
    this.state = {
      url: '',
      points: [],
    };
  }

  hasUrl() {
    return !!this.state.url;
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

  getValue() {
    let list = [];
    this.state.points.forEach(item => {
      list = list.concat([ item.x + 5, item.y + 10 ]);
    });
    return list.join(',');
  }

  setValue(list) {
    const points = [];
    for (let i = 0; i < list.length; i += 2) {
      points.push({
        x: list[i],
        y: list[i + 1],
      });
    }
    this.setState({
      points,
    });
  }

  getCheckedRandCode() {
    const { isSubmit } = this.props;
    const { submitToken } = this.props.order;
    const randCode = this.getValue();
    if (!randCode) {
      return Promise.reject();
    }
    return api[ isSubmit ? 'checkRandCode' : 'checkLoginRandCode' ]({
        isSubmit,
        randCode,
        submitToken: isSubmit ? submitToken : '',
      })
      .then(() => {
        return randCode;
      });
  }

  submit = e => {
    e.preventDefault();
    e.stopPropagation();
    this.props.onSubmit && this.props.onSubmit();
  }

  onLoad = async () => {
    const { OCREnable, OCRUrl, appId, appKey, appSecret} = this.props.input;

    if (!OCREnable) {
      return;
    }

    const { checkcode } = this.refs;
    const canvas = document.createElement('canvas');
    canvas.width = checkcode.width;
    canvas.height = checkcode.height;
    const context = canvas.getContext('2d');
    context.drawImage(checkcode, 0, 0);
    const image = canvas.toDataURL('png');
    const { src } = checkcode;

    let data;
    try {
      data = await request({
        url: OCRUrl,
        method: 'POST',
        data: {
          appId,
          appKey,
          appSecret,
          image,
        },
      });
    } catch (err) {
    }

    // 如果验证码已被刷新等
    if (src !== this.state.url) {
      return;
    }

    const { text, value} = data && data.data || {};
    if (value && value.length) {
      Log.info(`获取自动识别验证码成功 ${text}`);
      this.setValue(value);
      this.props.onSubmit && this.props.onSubmit();
    } else {
      Log.info(`获取自动识别验证码失败 ${text}`);
    }
  }

  render() {
    const { state } = this;
    return (
      <div className="checkcode-wrap">
        {
          state.url && (
            <div>
              <img ref="checkcode" src={state.url} onLoad={this.onLoad}/>
              <div className="refresh-area" onClick={this.refresh}>刷新</div>
              <div className="click-area" onClick={this.addPoint} onContextMenu={this.submit}>
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

export default connect(
  ({
    order,
    input,
  }) => ({
    order,
    input,
  }),
  dispatch => ({
  }),
  null,
  { withRef: true }
)(Component);
