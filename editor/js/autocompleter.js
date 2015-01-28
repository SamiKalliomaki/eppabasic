define(['require', 'i18n'], function (require) {
    var i18n = require('i18n');

    function Autocompleter(ace, editor) {
        // Load the language tools module
        ace.config.loadModule('ace/ext/language_tools', function (langTools) {
            // Create a completer
            var completer = {
                getCompletions: function getCompletions(editor, session, pos, prefix, callback) {
                    var line = pos.row + 1;
                    var completions = [];
                    var mode = session.getMode();

                    // First get variables
                    var variables = mode.variableScopes.getVariables(line);
                    completions = completions.concat(variables.map(function map(variable) {
                        return { caption: variable.name, value: variable.name, meta: i18n.t('autocomplete.type.variable') };
                    }));

                    // Then defined functions
                    completions = completions.concat(mode.getTokenizer().toolchain.getCompiler().functions.map(function map(func) {
                        return { caption: func.name, value: func.name, meta: i18n.t('autocomplete.type.function') };
                    }));

                    callback(null, completions);
                }
            };

            // And finally set ace to use this just created completer
            editor.setOptions({
                enableBasicAutocompletion: [completer],
                enableLiveAutocompletion: true
            });
        });
    }

    return Autocompleter;
});