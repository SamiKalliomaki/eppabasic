#!/usr/bin/env node

var requirejs = require('requirejs');
var less = require('less');
var fs = require('fs');
var path = require('path');

// Read the console parameters
var argv = require('minimist')(process.argv.slice(2), {
    'default': { optimize: 'none' }
});

// Create a basic configuration which is used for all compilations
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
        esrever: 'libs/esrever',
        ace: 'ace/lib/ace',
        marked: 'libs/marked'
    },
    optimize: argv.optimize
};

// Counter for pending manifest
var manifestCount = 0;

// Functions for file watching
var watchedFiles = {};
function addWatch(handle, file, callback) {
    if (!argv.autocompile)
        return;             // Autocompile not turned on

    if (Array.isArray(file)) {
        file.forEach(function (file) {
            addWatch(handle, file, callback)
        });
        return;
    }

    if (!fs.existsSync(file))
        return;

    if (!watchedFiles[file]) {
        // List for callbacks
        watchedFiles[file] = [];

        // Add the watcher
        fs.watch(file, function (e) {
            if (e !== 'change')
                return;
            var callbacks = watchedFiles[file];
            callbacks.forEach(function (callback) {
                callback.callback();
            });
        });
    }

    if (watchedFiles[file].some(function (callback) { return callback.handle === handle; }))
        return;

    watchedFiles[file].push({
        handle: handle,
        callback: callback
    });
}

function buildEditor() {
    var extra = {
        name: 'app',
        out: 'build/app.js',
        include: ['tools/ace.build.js',         // Make ace to think that it is compiled
            'editor/main']
    }
    var config = combine(baseConfig, extra);

    pendManifest();
    requirejs.optimize(config, function (res) {
        addWatch('editor', res.split('\n').slice(3), buildEditor);
        console.log('Succesfully compiled the main program');
        buildManifest();
    }, function (err) {
        console.error(err);
    });
}
function buildAceWorker(name) {
    var extra = {
        include: [
            'ace/worker/worker',
            'ace/mode/' + name + '_worker',
            'ace/lib/es5-shim'
        ],
        out: 'build/worker-' + name + '.js',
    }
    var config = combine(baseConfig, extra);

    pendManifest();
    requirejs.optimize(config, function (res) {
        addWatch('worker-' + name, res.split('\n').slice(3), function () {
            buildAceWorker(name);
        });
        console.log('Succesfully compiled the worker ' + name);
        buildManifest();
    }, function (err) {
        console.error(err);
    });
}
function buildAceWorkers() {
    workers('ace/lib/ace/mode').forEach(buildAceWorker);
}
function buildAceMode(name) {
    var extra = {
        name: 'ace/mode/' + name,
        out: 'build/mode-' + name + '.js',
    }
    var config = combine(baseConfig, extra);

    pendManifest();
    requirejs.optimize(config, function (res) {
        addWatch('mode-' + name, res.split('\n').slice(3), function () {
            buildAceMode(name);
        });
        console.log('Succesfully compiled the mode ' + name);
        buildManifest();
    }, function (err) {
        console.error(err);
    });
}
function buildAceModes() {
    modes().forEach(buildAceMode);
}
function buildAceExtension(name) {
    var extra = {
        name: 'ace/ext/' + name,
        out: 'build/ext-' + name + '.js',
    }
    var config = combine(baseConfig, extra);

    pendManifest();
    requirejs.optimize(config, function (res) {
        addWatch('extension-' + name, res.split('\n').slice(3), function () {
            buildAceExtension(name);
        });
        console.log('Succesfully compiled the extension ' + name);
        buildManifest();
    }, function (err) {
        console.error(err);
    });
}
function buildAceExtensions() {
    listJSFiles('ace/lib/ace/ext').forEach(buildAceExtension);
}
function buildAceTheme(name) {
    var extra = {
        name: 'ace/theme/' + name,
        out: 'build/theme-' + name + '.js',
    }
    var config = combine(baseConfig, extra);

    pendManifest();
    requirejs.optimize(config, function (res) {
        addWatch('theme-' + name, res.split('\n').slice(3), function () {
            buildAceTheme(name);
        });
        console.log('Succesfully compiled the theme ' + name);
        buildManifest();
    }, function (err) {
        console.error(err);
    });
}
function buildAceThemes() {
    listJSFiles('ace/lib/ace/theme').forEach(buildAceTheme);
}
function buildLess() {
    pendManifest();
    less.render('@import "main.less";', {
        paths: ['./editor/css']
    }, function (err, output) {
        if (err)
            return console.error(err);

        addWatch('less', output.imports.map(function (p) {
            return path.resolve(p);
        }), buildLess);

        fs.writeFile('build/styles.css', output.css, function (err) {
            if (err)
                return console.error(err);
            console.log('Succesfully compiled the style sheets');
            buildManifest();
        });
    });
}

deleteFolder('build');
buildEditor();
buildAceWorkers();
buildAceModes();
buildAceExtensions();
buildAceThemes();
buildLess();

function buildRuntime() {
    var extra = {
        include: [
            'runtime/app',
            'runtime/main/main'
        ],
        out: 'build/runtime/app.js',
    }
    var config = combine(baseConfig, extra);

    pendManifest();
    requirejs.optimize(config, function (res) {
        addWatch('runtime', res.split('\n').slice(3), buildRuntime);
        console.log('Succesfully compiled the runtime main program');
        buildManifest();
    }, function (err) {
        console.error(err);
    });
}
function buildRuntimeWorker() {
    var extra = {
        include: [
            'libs/requirejs',
            'runtime/worker/main'
        ],
        out: 'build/runtime/worker.js',
    }
    var config = combine(baseConfig, extra);

    pendManifest();
    requirejs.optimize(config, function (res) {
        addWatch('runtime-worker', res.split('\n').slice(3), buildRuntimeWorker);
        console.log('Succesfully compiled the runtime worker');
        buildManifest();
    }, function (err) {
        console.error(err);
    });
}

buildRuntime();
buildRuntimeWorker();

function pendManifest() {
    manifestCount++;
}
function buildManifest() {
    if (--manifestCount)
        return;

    var buf = [];

    // Manifest header
    buf.push('CACHE MANIFEST');
    // And timestamp
    buf.push('# ' + (new Date()).toISOString());

    // CACHE section
    buf.push('CACHE:');
    // First .html files
    buf.push('./');
    buf.push('./runtime/');
    // Then some external and weird located files
    buf.push('./runtime/styles.css');
    buf.push('./libs/requirejs.js');
    buf.push('./editor/img/logo.png');
    buf.push('http://ajax.googleapis.com/ajax/libs/jquery/1.11.0/jquery.min.js');
    buf.push('http://ajax.googleapis.com/ajax/libs/jqueryui/1.10.4/jquery-ui.min.js');

    // Finally everything in build folder
    buf = buf.concat(listFiles('build').map(function (file) { return './' + file; }));

    // Everything else must be downloaded
    buf.push('NETWORK:');
    buf.push('*');

    // Then just save the file
    fs.writeFile('cache.manifest', buf.join('\n'), function (err) {
        if (err)
            return console.error(err);

        console.log('Succesfully compiled the cache manifest');
    });
}

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

function listFiles(path) {
    var filelist = [];
    fs.readdirSync(path).forEach(function (file, index) {
        var curPath = path + '/' + file;
        if (fs.lstatSync(curPath).isDirectory()) {
            filelist = filelist.concat(listFiles(curPath));
        } else {
            filelist.push(curPath);
        }
    });
    return filelist;
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
