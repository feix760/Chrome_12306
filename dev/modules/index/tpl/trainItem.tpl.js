define('modules/index/tpl/trainItem_tpl', function(require, exports, module) {

  return function (it, opt) {
      it = it || {};
      with(it) {
          var _$out_= [];
          _$out_.push('<span class="item" _train="',  train , '" _type="',  type , '"> <span class="hint">',  train , ' - ',  name , '</span> <button class="delete_item" type="button">删除</button></span>');
        return _$out_.join('');
      }
  }

});
