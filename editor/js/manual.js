define(['jquery', 'i18n', 'marked', './framework'], function ($, i18n, marked, Framework) {
    function Manual(manualContainer, lang, appCache) {
        manualContainer = $(manualContainer);
        this.container = manualContainer;
        this.manual = $(manualContainer.find('#manual'));
        this.index = $(manualContainer.find('.index'));
        this.back = $(manualContainer.find('.back'));
        this.lang = lang;
        this.appCache = appCache;

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

        // Create a custom renderer for news
        this.renderer = new marked.Renderer();

        this.renderer.html = function html(html) {
            // Check for custom tags
            if (html === '<!---NEWS--->') {
                this.populateNewsSection();             // This is async so we can do this this way
                return this.generateNewsSection();
            }
            return html;
        }.bind(this);
    }

    Manual.prototype = {
        generateNewsSection: function () {
            return '<div class="news">' + i18n.t('news.loading') + '</div>';
        },
        populateNewsSection: function () {
            var me = this;

            function showOffline() {
                var newsDiv = $('.news', me.manual);
                newsDiv.empty();

                newsDiv.append($('<p/>', {
                    text: i18n.t('news.offline')
                }));
            }
            function showPosts(data) {
                var newsDiv = $('.news', me.manual);
                newsDiv.empty();

                data['posts'].forEach(function (post) {
                    var postElem = $('<div/>', {});
                    postElem.append($('<h2/>', {
                        text: post['title']
                    }));
                    postElem.append(marked(post['content']));
                    newsDiv.append(postElem);
                });

                if (data['posts'].length === 0) {
                    newsDiv.append($('<p/>', {
                        text: i18n.t('news.no-news')
                    }));
                }
            }

            if (this.appCache.isOnline()) {
                Framework.simpleGet('eb/news/get/' + this.lang + '/', '',
                   showPosts, showOffline);
            } else {
                setTimeout(showOffline);
            }
        },
        openPage: function (page, scrollY) {
            $.get('manual/' + this.lang + '/' + page + '.md', function (data) {
                var header = '';

                this.history.push(page);
                this.scrollHistory.push(this.container.scrollTop());
                this.manual.html(header + marked(data, { renderer: this.renderer }));
                this.container.scrollTop(scrollY);
            }.bind(this));
        },
        navigate: function navigate(url) {
            function resolveUrl(baseUrl, relUrl) {
                var aParts = baseUrl.split('/');
                var bParts = relUrl.split('/');

                if (bParts.length >= 1 && bParts[0] === '') {
                    bParts.shift();
                    return bParts.join('/');
                }

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
