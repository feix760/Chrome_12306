define('modules/index/autosave', function(require, exports, module) {

  
  var C = require('modules/common/Chrome');
  
  var allSelector = 'input[type=text],input[type=password],select,textarea';
  
  function loadAll() {
      C.syncGet('viewholder', function(holder) {
          if(!holder){
              return;
          }
          $(allSelector).each(function() {
              var $ele = $(this),
                  id = $ele[0].id,
                  val = holder['' + id];
              if (!id || !val || $ele.attr('_sync') == 'false') {
                  return;
              }
              if ($ele.filter('input[type=text],input[type=password],textarea').length > 0) {
                  $ele.val(val);
              } else if ($ele.filter('select').length > 0) {
                  $ele[0].selectedIndex = val;
              }
          });
      });
  }
  
  function changeItem() {
      var $ele = $(this),
          val = '',
          id = $ele[0].id;
      if (!id) {
          return;
      }
      if ($ele.filter('input[type=text],input[type=password],textarea').length > 0) {
          val = $ele.val();
      } else if ($ele.filter('select').length > 0) {
          val = $ele[0].selectedIndex;
      }
      C.syncSet('viewholder.' + id, val);
  }
  
  exports.init = function() {
      loadAll();
      $(allSelector).bind('change keypress keyup', changeItem);
  }
  
  

});
