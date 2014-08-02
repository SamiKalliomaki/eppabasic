function Manual(manualContainer, lang) {
    manualContainer = $(manualContainer);
    this.container = manualContainer;
    this.manual = $(manualContainer.find('#manual'));
    this.back = $(manualContainer.find('.back'));
    this.lang = lang;

    this.history = [];
    this.scrollHistory = [];

    var me = this;

    this.manual.on('click', 'a', function (e) {
        e.preventDefault();

        var href = $(this).attr('href');
        var manualKey = 'manual:';

        if (href.substring(0, manualKey.length) == manualKey) {
            var page = href.substring(manualKey.length);
            me.openPage(page, 0);
        } else {
            window.open(href);
        }
    });

    this.back.click(function back(e) {
        if (this.history.length > 1) {
            this.history.pop();
            this.openPage(this.history.pop(), this.scrollHistory.pop());
        }
    }.bind(this));
}

Manual.prototype = {
    openPage: function (page, scrollY) {
        $.get('manual/' + this.lang + '/' + page + '.md', function (data) {
            this.history.push(page);
            this.scrollHistory.push(this.container.scrollTop());
            this.manual.html(marked(data) + "<br><br>");
            this.container.scrollTop(scrollY);
        }.bind(this));
    }
}