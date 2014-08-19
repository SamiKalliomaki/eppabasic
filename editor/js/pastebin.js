define(['jquery', './framework'], function ($, Framework) {
    function Pastebin() {

    }

    Pastebin.paste = function (code, cb) {
        Framework.simplePost('eb/paste/make/', { 'code': code }, cb);
    }

    Pastebin.load = function (key, cb) {
        Framework.simpleGet('eb/paste/get/' + encodeURIComponent(key) + '/', '', cb);
    }

    return Pastebin;
});