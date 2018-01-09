
import React from 'react';
import { connect } from 'react-redux';
import './index.scss';

class Component extends React.Component {
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
    const param = this.props.isSubmit
      ? 'module=passenger&rand=randp'
      : 'module=login&rand=sjrand';
    this.setState({
      url: `https://kyfw.12306.cn/otn/passcodeNew/getPassCodeNew?${param}&_=${Math.random()}`,
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

  get value() {
    const list = [];
    this.state.points.forEach(item => {
      list = list.concat([ item.x, item.y ]);
    });
    return list.join(',');
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

export default connect(({ input }) => {
  return { };
}, (dispatch) => {
  return { };
})(Component);
