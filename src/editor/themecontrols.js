define(['jquery', 'i18n', 'cookies'], function ($, i18n, Cookies) {
    function ThemeControlsController(randomThemeButton) {
        this.randomThemeButton = $(randomThemeButton);
        this.styleTag = $('<link rel="stylesheet" />');
        $('head').append(this.styleTag);

        this.randomThemeButton.on('click', this.setRandomTheme.bind(this));

        this.themes = [
                'dark',
                'light'
        ];
        this.currentTheme = Cookies.getItem('theme');
        if (!this.currentTheme)
            this.currentTheme = this.randomTheme();
        this.setTheme(this.currentTheme);
    }

    ThemeControlsController.prototype = {
        randomTheme: function randomTheme() {
            var newTheme;
            if (this.themes.length > 1) {
                do {
                    newTheme = this.themes[Math.floor(Math.random()*this.themes.length)];
                } while (newTheme === this.currentTheme)
            } else {
                newTheme = this.themes[0];
            }
            return newTheme;
        },
        setTheme: function setTheme(theme) {
            this.currentTheme = theme;
            this.styleTag.attr('href', 'css/' + theme + '-theme.css');
            Cookies.setItem('theme', theme, Infinity);
        },
        setRandomTheme: function setRandomTheme() {
            this.setTheme(this.randomTheme());
        }
    };

    return ThemeControlsController;
});
