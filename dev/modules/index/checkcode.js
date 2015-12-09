define('modules/index/checkcode', function(require, exports, module) {

  
  exports.init = function() {
      $(document).on('click', '.checkcode-new', function(e) {
          var $wrap = $(e.currentTarget).parent();
          var $img = $wrap.find('img');
          $img.unbind('load').bind('load', function() {
              $wrap.removeClass('loading');
          });
          $wrap.addClass('loading');
          $wrap.find('.checkcode-select').remove();
          $img[0].src = $img[0].src.replace(/\&[^&]*$/, '') + '&' + (+new Date());
      });
  
      $(document).on('click', '.checkcode-click', function(e) {
          var $e = $(e.currentTarget);
          var radius = 15;
          $('<div class="checkcode-select"></div>')
              .css({
                  position: 'absoulte',
                  left: e.offsetX - radius,
                  top: e.offsetY - radius
              })
              .data({
                  x: e.offsetX,
                  y: e.offsetY
              })
              .appendTo($e);
      });
  
      $(document).on('click', '.checkcode-select', function(e) {
          $(e.currentTarget).remove();
      });
  
      // init
      $('.checkcode').each(function() {
          var $wrap = $(this).parent();
          $('<div class="checkcode-new"></div>').appendTo($wrap);
          $('<div class="checkcode-click"></div>').appendTo($wrap);
      });
  };
  
  exports.reset = function(id) {
      id = id || 1;
      $('.checkcode' + id).nextAll('.checkcode-new').trigger('click');
  };
  
  exports.get = function(id) {
      id = id || 1;
      var $wrap = $('.checkcode' + id).parent();
      var selects = [];
      $wrap.find('.checkcode-select').each(function() {
          var $item = $(this);
          selects.push($item.data('x'));
          selects.push($item.data('y'));
      });
      return selects;
  };
  
  

});
