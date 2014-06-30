function Manual(manual, lang) {
    this.manual = $(manual);
    this.lang = lang;

    var me = this;
    this.manual.on('click', 'a', function(e) {
        e.preventDefault();

        var href = $(this).attr('href');
        var manualKey = 'manual:';

        if(href.substring(0, manualKey.length) == manualKey) {
            me.openPage(href.substring(manualKey.length));
        } else {
            window.open(href);
        }
    });
}

Manual.prototype = {
    openPage: function(page) {
        var me = this;

        $.get('manual/' + this.lang + '/' + page + '.md', function(data) {
            me.manual.html(marked(data));
        });
    }
}