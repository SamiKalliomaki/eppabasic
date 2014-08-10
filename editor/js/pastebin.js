define(['jquery'], function ($) {
    function Pastebin() {

    }

    Pastebin.paste = function (code, cb) {
        simplePost('eb/paste/make/', { 'code': code }, cb);
    }

    Pastebin.load = function (key, cb) {
        simpleGet('eb/paste/get/' + encodeURIComponent(key) + '/', '', cb);
    }

    return Pastebin;
});