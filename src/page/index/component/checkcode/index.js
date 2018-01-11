
import React from 'react';
import { connect } from 'react-redux';
import domtoimage from 'dom-to-image';
import request from 'asset/common/request';
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

  getValue() {
    let list = [];
    this.state.points.forEach(item => {
      list = list.concat([ item.x + 5, item.y + 10 ]);
    });
    return list.join(',');
  }

  getCheckedRandCode() {
    const { isSubmit, submitToken } = this.props;
    const randCode = this.getValue();
    if (!randCode) {
      return Promise.reject();
    }
    return api[ isSubmit ? 'checkRandCode' : 'checkLoginRandCode' ]({
        isSubmit,
        randCode,
        submitToken,
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

  onLoad = e => {
    // 这里有bug
    // domtoimage.toPng(e.target)
      // .then(base64 => {
        // this.props.onLoad && this.props.onLoad(base64);
      // });
  }

  tryOCR({ OCRUrl, OCRAK, OCRSK, base64 }) {
    return request({
      url: OCRUrl,
      method: 'POST',
      data: {
        ak: OCRAK,
        sk: OCRSK,
        img: base64,
      },
    }).then(data => {
      if (data && data.retCode === 0 && data.result.length) {
        Log.info('自动识别验证码成功');
        return data.result.join(',');
        this.props.dispatch(submitOrder(data.result.join(',')));
      } else {
        return Promise.reject(data);
      }
    });
  }

  render() {
    const { state } = this;
    return (
      <div className="checkcode-wrap">
        {
          state.url && (
            <div>
              <img refs="img" src={state.url} onLoad={this.onLoad}/>
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
