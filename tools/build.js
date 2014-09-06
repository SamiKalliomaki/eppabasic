#!/usr/bin/env node

var requirejs = require('requirejs');
var fs = require('fs');

// Console parameters
var argv = require('minimist')(process.argv.slice(2), {
    'default': { optimize: 'none' }
});

var baseConfig = {
    baseUrl: '.',
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
    optimize: argv.optimize
};

function buildEditor() {
    var extra = {
        name: 'app',
        out: 'build/app.js',
        include: ['tools/ace.build.js']         // Make ace to think that it is compiled
    }
    var config = combine(baseConfig, extra);

    requirejs.optimize(config, function (res) {
        //console.log(res);
        console.log('Succesfully compiled the main program');
    }, function (err) {
        console.error(err);
    });
}
function buildAceWorkers() {
    workers('ace/lib/ace/mode').forEach(function (name) {
        var extra = {
            include: [
                'ace/worker/worker',
                'ace/mode/' + name + '_worker',
                'ace/lib/es5-shim'
            ],
            out: 'build/worker-' + name + '.js',
        }
        var config = combine(baseConfig, extra);

        requirejs.optimize(config, function (res) {
            //console.log(res);
            console.log('Succesfully compiled the worker ' + name);
        }, function (err) {
            console.error(err);
        });
    });
}
function buildAceModes() {
    modes().forEach(function (name) {
        var extra = {
            name: 'ace/mode/' + name,
            out: 'build/mode-' + name + '.js',
        }
        var config = combine(baseConfig, extra);

        requirejs.optimize(config, function (res) {
            //console.log(res);
            console.log('Succesfully compiled the mode ' + name);
        }, function (err) {
            console.error(err);
        });
    });
}
function buildAceExtensions() {
    listJSFiles('ace/lib/ace/ext').forEach(function (name) {
        var extra = {
            name: 'ace/ext/' + name,
            out: 'build/ext-' + name + '.js',
        }
        var config = combine(baseConfig, extra);

        requirejs.optimize(config, function (res) {
            //console.log(res);
            console.log('Succesfully compiled the extension ' + name);
        }, function (err) {
            console.error(err);
        });
    });
}
function buildAceThemes() {
    listJSFiles('ace/lib/ace/theme').forEach(function (name) {
        var extra = {
            name: 'ace/theme/' + name,
            out: 'build/theme-' + name + '.js',
        }
        var config = combine(baseConfig, extra);

        requirejs.optimize(config, function (res) {
            //console.log(res);
            console.log('Succesfully compiled the theme ' + name);
        }, function (err) {
            console.error(err);
        });
    });
}

deleteFolder('build');
buildEditor();
buildAceWorkers();
buildAceModes();
buildAceExtensions();
buildAceThemes();

function buildRuntime() {
    // The main page
    var extra = {
        name: 'runtime/app',
        out: 'build/runtime/app.js',
    }
    var config = combine(baseConfig, extra);

    requirejs.optimize(config, function (res) {
        //console.log(res);
        console.log('Succesfully compiled the runtime main program');
    }, function (err) {
        console.error(err);
    });

    // The worker
    var extra = {
        include: [
            'libs/requirejs',
            'runtime/worker/main'
        ],
        out: 'build/runtime/worker.js',
    }
    var config = combine(baseConfig, extra);

    requirejs.optimize(config, function (res) {
        //console.log(res);
        console.log('Succesfully compiled the runtime worker');
    }, function (err) {
        console.error(err);
    });
}

buildRuntime();

function listJSFiles(path, filter) {
    if (!filter)
        filter = /_test/;

    return fs.readdirSync(path).map(function (x) {
        if (x.slice(-3) === '.js' && !filter.test(x) && !/\s/.test(x))
            return x.slice(0, -3);
    }).filter(Boolean);
}
function workers(path) {
    return listJSFiles(path).map(function (x) {
        if (x.slice(-7) === '_worker')
            return x.slice(0, -7);
    }).filter(function (x) { return !!x; });
}
function modes() {
    return listJSFiles("ace/lib/ace/mode", /_highlight_rules|_test|_worker|xml_util|_outdent|behaviour|completions/);
}

function combine(a, b) {
    var c = {};
    for (var d in a)
        c[d] = a[d];
    for (var d in b)
        c[d] = b[d];
    return c;
}


function deleteFolder(path) {
    if (fs.existsSync(path)) {
        fs.readdirSync(path).forEach(function (file, index) {
            var curPath = path + '/' + file;
            if (fs.lstatSync(curPath).isDirectory()) {
                deleteFolder(curPath);
            } else {
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(path);
    }
}

/*
var copy = require('dryice').copy;

console.log(__dirname);
var project = copy.createCommonJsProject({
    roots: [__dirname],
    aliases: {editor: 'editor/js'}
});

copy({
    source: {
        project: project,
        require: ['app']
    },
    dest: 'build/eb.js'
});*/
