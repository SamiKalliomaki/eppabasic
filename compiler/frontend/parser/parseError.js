define([], function() {
    "use strict";

    function ParseError() {
    }

    ParseError.prototype.name = 'Parse Error';

    return {
        ParseError: ParseError
    };
});