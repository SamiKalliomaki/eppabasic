define(['jquery'], function ($) {
    function Manual(manualContainer, lang) {
        manualContainer = $(manualContainer);
        this.container = manualContainer;
        this.manual = $(manualContainer.find('#manual'));
        this.index = $(manualContainer.find('.index'));
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
                me.navigate(page, 0);
            } else {
                window.open(href);
            }
        });

        this.index.click(function index(e) {
            this.navigate('/index', 0);
        }.bind(this));

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
        },
        navigate: function navigate(url) {
            function resolveUrl(baseUrl, relUrl) {
                var aParts = baseUrl.split('/');
                var bParts = relUrl.split('/');

                // Pop the old filename from the url
                aParts.pop();

                if (bParts[0] === '')
                    aParts = [];                 // An absolute path

                bParts.forEach(function (part) {
                    if (part === '.')
                        return;
                    else if (part === '..')
                        aParts.pop();
                    else
                        aParts.push(part);
                });

                return aParts.join('/');
            }

            this.currentUrl = this.currentUrl || '';
            this.currentUrl = resolveUrl(this.currentUrl, url);
            this.openPage(this.currentUrl, 0);
        }
    };

    return Manual;
});
