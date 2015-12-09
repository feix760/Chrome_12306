define('modules/index/tpl/availableTicket_tpl', function(require, exports, module) {

  return function (it, opt) {
      it = it || {};
      with(it) {
          var _$out_= [];
          _$out_.push('<option>{{date}},{{train}},{{from}}-{{to}},{{name}},{{id}},{{type}},{{seatName}}</option>');
        return _$out_.join('');
      }
  }

});
