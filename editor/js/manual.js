function Manual(manualContainer, lang) {
    manualContainer = $(manualContainer);
    this.manual = $(manualContainer.find('#manual'));
    this.back = $(manualContainer.find('.back'));
    this.lang = lang;

    this.history = [];

    var me = this;

    this.manual.on('click', 'a', function (e) {
        e.preventDefault();

        var href = $(this).attr('href');
        var manualKey = 'manual:';

        if (href.substring(0, manualKey.length) == manualKey) {
            var page = href.substring(manualKey.length);
            me.openPage(page);
        } else {
            window.open(href);
        }
    });

    console.log(this.back);

    this.back.click(function back(e) {
        if (this.history.length > 1) {
            this.history.pop();
            this.openPage(this.history.pop());
        }
    }.bind(this));
}

Manual.prototype = {
    openPage: function (page) {
        $.get('manual/' + this.lang + '/' + page + '.md', function (data) {
            this.history.push(page);
            this.manual.html(marked(data));
        }.bind(this));
    }
}