define('modules/index/tpl/ticketResign_tpl', function(require, exports, module) {

  return function (it, opt) {
      it = it || {};
      with(it) {
          var _$out_= [];
          _$out_.push('<span class="item"><span class="hint">{{date}},{{train}},{{from}}-{{to}},{{name}},{{id}},{{type}},{{seatName}}</span><button class="delete_item" type="button">删除</button></span>');
        return _$out_.join('');
      }
  }

});
