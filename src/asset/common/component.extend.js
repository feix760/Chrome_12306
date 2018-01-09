
import React from 'react';
import shallowCompare from 'react-addons-shallow-compare';

Object.assign(React.Component.prototype, {
  shouldComponentUpdate(nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState);
  }
});
