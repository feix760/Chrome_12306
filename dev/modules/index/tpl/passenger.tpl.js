define('modules/index/tpl/passenger_tpl', function(require, exports, module) {

  return function (it, opt) {
      it = it || {};
      with(it) {
          var _$out_= [];
          _$out_.push('<span class="item" _name="',  name , '" _id="',  id , '" _type="',  type , '" _oldType="',  oldType , '"> <span class="hint">',  name , ',',  id , ',',  typeName , '</span> <button class="delete_item" type="button">删除</button></span>');
        return _$out_.join('');
      }
  }

});
