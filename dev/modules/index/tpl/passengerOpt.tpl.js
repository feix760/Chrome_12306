define('modules/index/tpl/passengerOpt_tpl', function(require, exports, module) {

  return function (it, opt) {
      it = it || {};
      with(it) {
          var _$out_= [];
          _$out_.push('<option value="',  id , '" _id="',  id , '" _name="',  name , '" _type="',  type , '">',  name , '</option>');
        return _$out_.join('');
      }
  }

});
