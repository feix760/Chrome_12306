
import React from 'react';
import { connect } from 'react-redux';
import { getUpdater } from '../../action/input';
import './index.scss';

class Component extends React.Component {
  constructor() {
    super(...arguments);
  }

  render() {
    const { props } = this;
    const { input } = props;
    return (
      <section className="ocr-container">
        <div>
          <input type="checkbox" checked={input.OCREnable}
            onChange={props.update('OCREnable')}/> 验证码自动识别
          url: <input className="url" type="text" value={input.OCRUrl} onChange={props.update('OCRUrl')} />
        </div>
        <div>
        百度云ak: <input type="text" value={input.OCRAK} onChange={props.update('OCRAK')} />
        sk: <input type="text" value={input.OCRSK} onChange={props.update('OCRSK')} />
        </div>
      </section>
    );
  }
}

export default connect(
  ({
    input,
  }) => ({
    input,
  }),
  dispatch => ({
    update: getUpdater(dispatch),
  })
)(Component);
