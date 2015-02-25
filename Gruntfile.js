module.exports = function (grunt) {
    var glob = require('glob');
    var path = require('path');

    // Map from files to dependent tasks
    var fileTasks = {};

    // Done function generator
    function addToWatch(task, files) {
        if (!(files instanceof Array))
            files = [files];

        files.forEach(function (file) {
            // Resolve file path to its full length
            file = path.resolve(file);

            // Create file entry in the list if not existing
            if (!fileTasks[file])
                fileTasks[file] = [];
            // Don't create doublicates
            if (fileTasks[file].indexOf(task) !== -1)
                return;
            // Add the task to the list
            fileTasks[file].push(task);
        });
    }
    function makeDoneFunction(task) {
        return function (done, output) {
            output = require('rjs-build-analysis').parse(output);
            output.bundles.forEach(function (bundle) {
                addToWatch(task, bundle.children);
            });
            // Update the watch list
            grunt.config('watch.all.files', Object.keys(fileTasks));
            // Signal that we are done here
            done();
        };
    }

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
            optimize: grunt.option('minify') ? 'uglify2' : 'none'
        },
        // Main program
        main: {
            options: {
                name: 'app',
                out: 'build/app.js',
                include: [
                    'tools/ace.build.js',           // Make ace to think that it is compiled
                    'editor/main'
                ],
                done: makeDoneFunction('requirejs:main')
            }
        },
        // Runtime
        runtime: {
            options: {
                include: [
                    'runtime/app',
                    'runtime/main/main'
                ],
                out: 'build/runtime/app.js',
                done: makeDoneFunction('requirejs:runtime')
            }
        },
        // Runtime worker
        'runtime-worker': {
            options: {
                include: [
                    'libs/requirejs',
                    'runtime/worker/main'
                ],
                out: 'build/runtime/worker.js',
                done: makeDoneFunction('requirejs:runtime-worker')
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
                out: 'build/mode-' + mode + '.js',
                done: makeDoneFunction('requirejs:mode-' + mode)
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
                out: 'build/worker-' + worker + '.js',
                done: makeDoneFunction('requirejs:worker-' + worker)
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

        requirejsOptions['extension-' + extension] = {
            options: {
                name: 'ace/ext/' + extension,
                out: 'build/ext-' + extension + '.js',
                done: makeDoneFunction('requirejs:extension-' + extension)
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
                out: 'build/theme-' + theme + '.js',
                done: makeDoneFunction('requirejs:theme-' + theme)
            }
        };
    });

    // Style sheets
    var lessOptions = {
        options: {
            compress: grunt.option('minify')
        },
        main: {
            files: {
                'build/styles.css': 'editor/css/main.less'
            }
        }
    };

    grunt.initConfig({
        requirejs: requirejsOptions,
        less: lessOptions,
        watch: {
            all: {
                files: [],
                options: {
                    spawn: false
                }
            }
        },
        clean: ['build/**/*']
    });

    grunt.loadNpmTasks('grunt-contrib-requirejs');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-clean');

    grunt.event.on('less.compiled', function (output) {
        addToWatch('less.main', output.imports);
    });
    grunt.event.on('watch', function (action, filepath, target) {
        // Resolve file path
        filepath = path.resolve(filepath);
        if (!fileTasks[filepath])
            return console.error('No handler: ' + filepath);
        // Excecute marked tasks
        fileTasks[filepath].forEach(function (task) {
            grunt.task.run(task);
        });
    });

    grunt.registerTask('default', ['clean', 'requirejs', 'less']);
    grunt.registerTask('develop', ['default', 'watch']);
};