module.exports = function (grunt) {
    var glob = require('glob');
    var path = require('path');

    // Build different RequireJS tasks
    var requirejsOptions = {
        options: {
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
            optimize: 'none'
        },
        // Main program
        main: {
            options: {
                name: 'app',
                out: 'build/app.js',
                include: [
                    'tools/ace.build.js',           // Make ace to think that it is compiled
                    'editor/main'
                ]
            }
        },
        // Runtime
        runtime: {
            options: {
                include: [
                    'runtime/app',
                    'runtime/main/main'
                ],
                out: 'build/runtime/app.js'
            }
        },
        // Runtime worker
        'runtime-worker': {
            options: {
                include: [
                    'libs/requirejs',
                    'runtime/worker/main'
                ],
                out: 'build/runtime/worker.js'
            }

        }
    };

    // Ace modes
    var modes = glob.sync('ace/lib/ace/mode/*.js');
    modes.forEach(function (mode) {
        mode = path.basename(mode).slice(0, -3);
        // Filter unneeded results
        if (/_highlight_rules|_test|_worker|xml_util|_outdent|behaviour|completions/.test(mode))
            return;

        requirejsOptions['mode-' + mode] = {
            options: {
                name: 'ace/mode/' + mode,
                out: 'build/mode-' + mode + '.js'
            }
        };
    });

    // Ace workers
    var workers = glob.sync('ace/lib/ace/mode/*_worker.js');
    workers.forEach(function (worker) {
        worker = path.basename(worker).slice(0, -10);

        requirejsOptions['worker-' + worker] = {
            options: {
                include: [
                    'ace/worker/worker',
                    'ace/mode/' + worker + '_worker',
                    'ace/lib/es5-shim'
                ],
                out: 'build/worker-' + worker + '.js'
            }
        };
    });

    // Ace extensions
    var extensions = glob.sync('ace/lib/ace/ext/*.js');
    extensions.forEach(function (extension) {
        extension = path.basename(extension).slice(0, -3);

        // Filter unneeded results
        if (/_test/.test(extension))
            return;

        requirejsOptions['extensions-' + extension] = {
            options: {
                name: 'ace/ext/' + extension,
                out: 'build/ext-' + extension + '.js'
            }
        };
    });

    // Ace themes
    var themes = glob.sync('ace/lib/ace/theme/*.js');
    themes.forEach(function (theme) {
        theme = path.basename(theme).slice(0, -3);

        // Filter unneeded results
        if (/_test/.test(theme))
            return;

        requirejsOptions['theme-' + theme] = {
            options: {
                name: 'ace/theme/' + theme,
                out: 'build/theme-' + theme + '.js'
            }
        };
    });

    // Style sheets
    var lessOptions = {
        main: {
            files: {
                'build/styles.css': 'editor/css/main.less'
            }
        }
    };

    grunt.initConfig({
        requirejs: requirejsOptions,
        less: lessOptions
    });

    grunt.loadNpmTasks('grunt-contrib-requirejs');
    grunt.loadNpmTasks('grunt-contrib-less');

    grunt.registerTask('default', ['requirejs', 'less']);

};