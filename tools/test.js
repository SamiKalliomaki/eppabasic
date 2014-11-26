﻿var fs = require('fs');
var requirejs = require('requirejs');
var path = require('path');

var walk = function (dir, done) {
    var results = [];
    fs.readdir(dir, function (err, list) {
        if (err) return done(err);
        var pending = list.length;
        if (!pending) return done(null, results);
        list.forEach(function (file) {
            file = dir + '/' + file;
            fs.stat(file, function (err, stat) {
                if (stat && stat.isDirectory()) {
                    walk(file, function (err, res) {
                        results = results.concat(res);
                        if (!--pending) done(null, results);
                    });
                } else {
                    if (/Suite\.js$/.exec(file))
                        results.push(file);
                    if (!--pending) done(null, results);
                }
            });
        });
    });
};

walk('./test', function (err, testFiles) {
    testFiles.sort();

    console.log('Found ' + testFiles.length + ' tests');

    testFiles.forEach(function (testFile) {
        // Create a require context for it
        var testRequire = requirejs.config({
            baseUrl: __dirname + '/..',
            paths: {
                compiler: 'compiler',
                editor: 'editor/js',
                jquery: '//ajax.googleapis.com/ajax/libs/jquery/1.11.0/jquery.min',
                jqueryui: '//ajax.googleapis.com/ajax/libs/jqueryui/1.10.4/jquery-ui.min',
                xregexp: 'libs/xregexp',
                i18n: 'libs/i18next.amd.withJQuery-1.7.3.min',
                text: 'libs/requirejs_text',
                ace: 'ace/lib/ace'
            },
            shim: {
                'jqueryui': ['jquery']
            },
            nodeRequire: require
        });

        // Require the file with it dependencies
        var moduleName = path.join(path.dirname(testFile), path.basename(testFile, '.js')).replace(/\\/g, '/');
        testRequire([moduleName], function (testSuite) {
            console.log("Testing suite " + path.basename(testFile, '.js'));

            for (name in testSuite) {
                if (/Test$/.exec(name) && testSuite.hasOwnProperty(name)) {
                    try {
                        testSuite[name](assert);
                    } catch (e) {
                        if (e instanceof AssertationError)
                            console.log('Test "' + moduleName + '.' + name + '" failed: ' + e.message);
                        else
                            console.log('Internal error: ' + e.message);
                    }
                }
            }
        });
    });
});

function AssertationError(msg) {
    this.message = msg;
}
AssertationError.prototype = new Error;
AssertationError.prototype.constructor = AssertationError;

var assert = {
    'instanceof': function (got, expect, msg) {
        if (!(got instanceof expect)) {
            var gottype;
            var expecttype;
            if (!got)
                gottype = '<nothing>';
            else if (got.constructor && got.constructor.name)
                gottype = got.constructor.name;
            else
                gottype = '' + got;
            if (!expect)
                expecttype = '<nothing>';
            else if (expect.name)
                expecttype = expect.name;
            else
                expecttype = '' + expect;
            throw new AssertationError("Got type '" + gottype + "' but expected '" + expecttype + "': " + msg);
        }
    },
    'null': function (got, msg) {
        if (got !== null) {
            throw new AssertationError("Got '" + got + "' but expected null: " + msg);
        }
    }
};