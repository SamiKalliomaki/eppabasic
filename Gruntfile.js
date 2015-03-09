module.exports = function (grunt) {
    var path = require('path');

    // Settings
    var wwwDir = path.resolve(grunt.option('www') || 'www');
    var tmpDir = path.resolve(grunt.option('tmp') || wwwDir + '/tmp');

    var glob = require('glob');

    // Map from files to dependent tasks
    var requirejsFileTasks = {};
    var lessFileTasks = {};

    // Done function generator
    function addToWatch(task, files, fileTasks) {
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
                addToWatch(task, bundle.children, requirejsFileTasks);
            });
            // Update the watch list
            grunt.config('watch.requirejs.files', Object.keys(requirejsFileTasks));
            // Signal that we are done here
            done();
        };
    }

    // Build different RequireJS tasks
    var requirejsOptions = {
        options: {
            baseUrl: tmpDir,
            paths: {
                //compiler: 'compiler',
                //editor: 'editor/js',
                jquery: '//ajax.googleapis.com/ajax/libs/jquery/1.11.0/jquery.min',
                jqueryui: '//ajax.googleapis.com/ajax/libs/jqueryui/1.10.4/jquery-ui.min',
                //xregexp: 'xregexp',
                i18n: 'i18next.amd.withJQuery-1.7.3.min',
                text: 'requirejs_text',
                //esrever: 'esrever',
                ace: 'ace/lib/ace',
                //marked: 'marked'
            },
            optimize: grunt.option('minify') ? 'uglify2' : 'none'
        },
        // Main program
        main: {
            options: {
                name: 'app',
                out: wwwDir + '/js/app.js',
                include: [
                    'ace.build.js',             // Make ace to think that it is compiled
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
                    'runtime/Runtime'
                ],
                out: wwwDir + '/js/runtime/app.js',
                done: makeDoneFunction('requirejs:runtime')
            }
        }
    };

    // Ace modes
    var modes = glob.sync(tmpDir + '/ace/lib/ace/mode/*.js');
    modes.forEach(function (mode) {
        mode = path.basename(mode).slice(0, -3);
        // Filter unneeded results
        if (/_highlight_rules|_test|_worker|xml_util|_outdent|behaviour|completions/.test(mode))
            return;

        requirejsOptions['mode-' + mode] = {
            options: {
                name: 'ace/mode/' + mode,
                out: wwwDir + '/js/mode-' + mode + '.js',
                done: makeDoneFunction('requirejs:mode-' + mode)
            }
        };
    });

    // Ace workers
    var workers = glob.sync(tmpDir + '/ace/lib/ace/mode/*_worker.js');
    workers.forEach(function (worker) {
        worker = path.basename(worker).slice(0, -10);

        requirejsOptions['worker-' + worker] = {
            options: {
                include: [
                    'ace/worker/worker',
                    'ace/mode/' + worker + '_worker',
                    'ace/lib/es5-shim'
                ],
                out: wwwDir + '/js/worker-' + worker + '.js',
                done: makeDoneFunction('requirejs:worker-' + worker)
            }
        };
    });

    // Ace extensions
    var extensions = glob.sync(tmpDir + '/ace/lib/ace/ext/*.js');
    extensions.forEach(function (extension) {
        extension = path.basename(extension).slice(0, -3);

        // Filter unneeded results
        if (/_test/.test(extension))
            return;

        requirejsOptions['extension-' + extension] = {
            options: {
                name: 'ace/ext/' + extension,
                out: wwwDir + '/js/ext-' + extension + '.js',
                done: makeDoneFunction('requirejs:extension-' + extension)
            }
        };
    });

    // Ace themes
    var themes = glob.sync(tmpDir + '/ace/lib/ace/theme/*.js');
    themes.forEach(function (theme) {
        theme = path.basename(theme).slice(0, -3);

        // Filter unneeded results
        if (/_test/.test(theme))
            return;

        requirejsOptions['theme-' + theme] = {
            options: {
                name: 'ace/theme/' + theme,
                out: wwwDir + '/js/theme-' + theme + '.js',
                done: makeDoneFunction('requirejs:theme-' + theme)
            }
        };
    });

    // Runtime modules
    var modules = glob.sync(tmpDir + '/runtime/modules/*Module.js');
    modules.forEach(function (module) {
        module = path.basename(module).slice(0, -9);

        // Filter out base module
        if (module === '')
            return;

        // Add a custom module which is basically the module name written in lower case letters.
        // The lower case name is used in the module loader so this must be done.
        var rawText = {};
        rawText['runtime/modules/' + module.toLowerCase()] = 'define([\'' + 'runtime/modules/' + module + 'Module\'],function(module){return module;});';

        requirejsOptions['runtime-module-' + module] = {
            options: {
                name: 'runtime/modules/' + module.toLowerCase(),
                out: wwwDir + '/js/runtime/modules/' + module.toLowerCase() + '.js',
                done: makeDoneFunction('requirejs:runtime-module-' + module),
                rawText: rawText
            }
        };
    });

    // Style sheets
    var lessOptions = {
        options: {
            compress: grunt.option('minify')
        },
        main: {
            files: {}
        }
    };
    lessOptions.main.files[wwwDir + '/css/editor.css'] = 'static/css/main.less';

    grunt.initConfig({
        requirejs: requirejsOptions,
        less: lessOptions,
        typescript: {
            all: {
                src: ['src/**/*.ts', 'lib/**/*.ts'],
                dest: tmpDir,
                options: {
                    module: 'amd',
                    target: 'es5',
                    basePath: 'src/'
                }
            }
        },
        typescriptdoc: {
            src: ['src/**/*.ts', 'lib/**/*.ts'],
            options: {
                module: 'amd',
                target: 'es5',
                out: wwwDir + '/doc',
            }
        },
        watch: {
            requirejs: {
                files: [],
                options: {
                    spawn: false
                }
            },
            less: {
                files: [],
                options: {
                    spawn: false
                }
            },
            'js-src': {
                files: 'src/**/*.js',
                tasks: ['sync:js-src']
            },
            'js-lib': {
                files: 'lib/**/*.js',
                tasks: ['sync:js-lib']
            },
            static: {
                files: 'static/**/*',
                tasks: ['sync:static']
            },
            typescript: {
                files: ['src/**/*.ts'],
                tasks: ['typescript']
            }
        },
        clean: {
            www: [wwwDir + '/**/*', wwwDir],
            tmp: [tmpDir + '/**/*', tmpDir]
        },
        sync: {
            'js-src': {
                files: [{
                    expand: true,
                    cwd: 'src',
                    src: ['**/*', '!**/*.ts'],
                    dest: tmpDir
                }]
            },
            'js-lib': {
                files: [{
                    expand: true,
                    cwd: 'lib',
                    src: ['**/*', '!**/*.ts'],
                    dest: tmpDir
                }]
            },
            'static': {
                files: [{
                    expand: true,
                    cwd: 'static',
                    src: ['**/*'],
                    dest: wwwDir,
                    dot: true
                }]
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-requirejs');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-typescript');
    grunt.loadNpmTasks('grunt-sync');

    grunt.event.on('less.compiled', function (output) {
        addToWatch('less.main', output.imports, lessFileTasks);
        // Update the watch list
        grunt.config('watch.all.files', Object.keys(lessFileTasks));
    });
    grunt.event.on('watch', function (action, filepath, target) {
        var fileTasks = null;
        if (target === 'requirejs')
            fileTasks = requirejsFileTasks;
        else if (target === 'less')
            fileTasks = lessFileTasks;
        else
            return;
        // Resolve file path
        filepath = path.resolve(filepath);
        if (!fileTasks[filepath])
            return console.error('No handler: ' + filepath);
        // Excecute marked tasks
        fileTasks[filepath].forEach(function (task) {
            grunt.task.run(task);
        });
    });

    grunt.registerTask('default', ['sync', 'typescript', 'requirejs', 'less']);
    grunt.registerTask('develop', ['default', 'watch']);
    grunt.registerTask('release', ['clean', 'default', 'clean:tmp']);
    grunt.registerTask('doc', ['typescriptdoc']);

    grunt.registerMultiTask('typescriptdoc', 'Generate TypeScript documentation', function () {
        var options = this.options({});

        var args = [];
        for (var key in options) {
            if (options.hasOwnProperty(key)) {
                args.push('--' + key);
                args.push(options[key]);
            }
        }
        for (var i = 0; i < this.filesSrc.length; i++)
            args.push(this.filesSrc[i]);

        var child_process = require('child_process');

        var ext = /^win/.test(process.platform) ? '.cmd' : '';

        var done = this.async();
        var executable = path.resolve(__dirname, 'node_modules', '.bin', 'typedoc' + ext);

        var child = child_process.spawn(executable, args, {
            stdio: 'inherit',
            env: process.env
        }).on('exit', function (code) {
            if (code !== 0) {
                done(false);
                return;
            }
            if (child)
                child.kill();
            done();
        });
    });
};