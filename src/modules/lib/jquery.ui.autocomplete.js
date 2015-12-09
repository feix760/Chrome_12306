(function() {
    $.widget("ui.autocomplete", $.ui.autocomplete, {
        options: {
            selectListText: 'label',
            height: 'auto'
        },
        _suggest: function() {
            this._superApply(arguments);
            var ul = this.menu.element;
            ul.css({
                'overflowY': 'auto',                
                height: this.options['height']
            });
        },
        _renderItem: function(ul, item) {           
            var selectListText = this.options.selectListText;
            if (!item[selectListText]) {
                selectListText = 'label';
            }
            return $("<li>")
                    .append($("<a>").text(item[selectListText]))
                    .appendTo(ul);
        }
    });
})();