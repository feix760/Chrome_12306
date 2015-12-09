define('modules/index/tpl/trainOption_tpl', function(require, exports, module) {

  return function (it, opt) {
      it = it || {};
      with(it) {
          var _$out_= [];
          _$out_.push('<option value="',  train , '">',  train , '</option>');
        return _$out_.join('');
      }
  }

});
