var fs = require('fs');
var path = require('path');
var glob = require('glob');
var format = require('string-format');

var tracker;
module.exports = function (grunt) {
    // Settings
    var wwwDir = path.resolve(grunt.option('www') || 'www');
    var tmpDir = path.resolve(grunt.option('tmp') || wwwDir + '/tmp');

    // Config
    var config = new ConfigHandler(grunt, wwwDir, tmpDir);
    config.load();

    // Add targets
    config.addRequirejsTarget('main', ['app', 'ace.build.js', 'editor/main'], wwwDir + '/js/app.js');
    config.addRequirejsTarget('runtime', ['runtime/app', 'runtime/Runtime'], wwwDir + '/js/runtime/app.js');

    config.addRequirejsMultiTarget('ace-mode-{0}',
                                    tmpDir + '/ace/mode/*.js',
                                    'ace/mode/{0}', wwwDir + '/js/mode-{0}.js',
                                    /_highlight_rules|_test|_worker|xml_util|_outdent|behaviour|completions/);
    config.addRequirejsMultiTarget('ace-worker-{0}',
                                    tmpDir + '/ace/mode/*_worker.js',
                                    [
                                        'ace/worker/worker',
                                        'ace/mode/{0}_worker',
                                        'ace/lib/es5-shim'
                                    ],
                                    wwwDir + '/js/worker-{0}.js',
                                    /_highlight_rules|_test|xml_util|_outdent|behaviour|completions/,
                                    10);
    config.addRequirejsMultiTarget('ace-extension-{0}',
                                    tmpDir + '/ace/ext/*.js',
                                    'ace/ext/{0}',
                                    wwwDir + '/js/ext-{0}.js',
                                    /_test/);
    config.addRequirejsMultiTarget('ace-theme-{0}',
                                    tmpDir + '/ace/theme/*.js',
                                    'ace/theme/{0}',
                                    wwwDir + '/js/theme-{0}.js',
                                    /_test/);
    config.addRequirejsMultiTarget('runtime-module-{0}',
                                    tmpDir + '/runtime/modules/*Module.js',
                                    'runtime/modules/{1}',
                                    wwwDir + '/js/runtime/modules/{1}.js',
                                    null,
                                    9,
                                    {
                                        'runtime/modules/{1}': 'define([\'runtime/modules/{0}Module\'],function(module){{return module;}});'
                                    }
                                    );

    config.addTypeScriptTarget('all', ['src/**/*.ts', 'lib/**/*.d.ts'], tmpDir);

    config.addSyncMultiTarget('src', 'src', ['**/*', '!**/*.ts'], tmpDir);
    config.addSyncMultiTarget('lib', 'lib', ['**/*', '!**/*.ts'], tmpDir);
    config.addSyncMultiTarget('static', 'static', ['**/*'], wwwDir);

    config.addLessTarget('main', 'static/css/main.less', wwwDir + '/css/editor.css');

    // Setup config
    grunt.initConfig(config.config);

    // Load all external tasks
    grunt.loadNpmTasks('grunt-contrib-requirejs');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-ts');
    grunt.loadNpmTasks('grunt-newer');
    grunt.loadNpmTasks('grunt-sync');
    grunt.loadNpmTasks("grunt-anon-tasks");

    // Register own tasks
    grunt.registerTask('build', function () {
        grunt.task
            .run('sync')
            .run('ts')
            .then(function () {
                config.updateTargets();
            })
            .run('newer:requirejs')
            .run('newer:less');
    });
    grunt.registerTask('develop', function () {
        grunt.task
            .run('build')
            .run('watch');
    });
    grunt.registerTask('rebuild', function () {
        grunt.task
            .run('clean')
            .run('build');
    });
};

/**
 * A class for handling grunt configurations
 */
function ConfigHandler(grunt, wwwDir, tmpDir) {
    this.grunt = grunt;
    this.wwwDir = wwwDir;
    this.tmpDir = tmpDir;
    this.config = {
        requirejs: {
            options: {
                baseUrl: tmpDir,
                paths: {
                    jquery: '//ajax.googleapis.com/ajax/libs/jquery/1.11.0/jquery.min',
                    jqueryui: '//ajax.googleapis.com/ajax/libs/jqueryui/1.10.4/jquery-ui.min',
                    i18n: 'i18next.amd.withJQuery-1.7.3.min',
                    text: 'requirejs_text'
                },
                optimize: grunt.option('minify') ? 'uglify2' : 'none'
            },
        },
        watch: {
            options: {
                spawn: false
            }
        },
        newer: {
            options: {
                override: function (detail, cb) {
                    var task = detail.task;
                    var target = detail.target;
                    var time = detail.time;

                    var fileCount = this.config.watch[task + '-' + target].files.length;
                    var include = false;

                    // Lstat every file and compare mtimes with reference.
                    this.config.watch[task + '-' + target].files.forEach(function (file) {
                        fs.lstat(file, function (err, stat) {
                            if (!err) {
                                if (time < stat.mtime) {
                                    include = true;
                                }
                            }

                            fileCount--;
                            if (fileCount == 0)
                                cb(include);
                        });
                    });
                }.bind(this)
            }
        },
        sync: {},
        less: {
            options: {
                compress: !!grunt.option('minify')
            }
        },
        ts: {
            options: {
                module: 'amd',
                target: 'es5',
                fast: 'always',
                declaration: true
            }
        },
        clean: {
            www: [wwwDir + '/**/*', wwwDir],
            tmp: [tmpDir + '/**/*', tmpDir, '.tscache']
        }
    };
    this.targetUpdaters = [];

    // Event handlers
    grunt.event.on('less.compiled', function (target, output) {
        try {
            // Add dependencies
            var files = output.imports.map(function (file) {
                return path.resolve(file);
            });
            this.config.watch['less-' + target].files = files;
            this.save();
        } catch (e) {
            grunt.log.error(e);
        }
    }.bind(this));
}
ConfigHandler.prototype = {
    /**
     * Adds a single requirejs target to configuration. May have dependencies.
     */
    addRequirejsTarget: function (name, files, out, src, rawText) {
        // Enforce files is array
        if (!Array.isArray(files))
            files = [files];

        if (!src) {
            // Make sure every file ends with .js
            src = files.map(function (file) {
                var p = path.join(this.config.requirejs.options.baseUrl, file);
                if (!/\.js$/.test(p))
                    p += '.js';
                return p;
            }.bind(this));
        }

        // Add to config
        this.config.requirejs[name] = {
            options: {
                include: files,
                out: out,
                rawText: rawText,
                done: function (done, output) {
                    // Parse r.js output
                    output = require('rjs-build-analysis').parse(output);

                    // Collect sources
                    var files = output.bundles[0].children;
                    files = files.map(function (file) {
                        if (/.*!/.test(file))
                            return path.join(this.config.requirejs.options.baseUrl, file.substr(file.indexOf('!') + 1));
                        return file;
                    }.bind(this)).map(function (file) {
                        return path.resolve(file);
                    });

                    // Add as dependency
                    this.config.watch['requirejs-' + name].files = files;
                    this.save();

                    // Signal that we are done here
                    done();
                }.bind(this)
            },
            src: src,
            dest: out
        };

        // Add to watch
        var watchFiles = [];
        if (this.config.watch['requirejs-' + name])
            watchFiles = this.config.watch['requirejs-' + name].files;
        this.config.watch['requirejs-' + name] = {
            files: watchFiles,
            tasks: ['newer:requirejs:' + name]
        };

        this.save();
    },
    /**
     * Adds multiple requirejs targets to configuration. Files are pointed by glob regex.
     */
    addRequirejsMultiTarget: function (name, dir, files, out, exclude, ext, rawText) {
        // Enforce tyes
        if (!ext)
            ext = 3;
        if (!Array.isArray(files))
            files = [files];

        // Lists all targets
        var updateTargets = function () {
            var globfiles = glob.sync(dir);
            globfiles.forEach(function (origfile) {
                var file = path.basename(origfile).slice(0, -ext);

                if (rawText) {
                    var newRawText = {};
                    for (var key in rawText) {
                        if (rawText.hasOwnProperty(key)) {
                            newRawText[format(key, file, file.toLowerCase())] = format(rawText[key], file, file.toLowerCase());
                        }
                    }
                }

                if (exclude && exclude.test(file))
                    return;

                var include = files.map(function (f) {
                    return format(f, file, file.toLowerCase());
                });

                // Add as target
                this.addRequirejsTarget(
                    format(name, file, file.toLowerCase()),
                    include,
                    format(out, file, file.toLowerCase()),
                    origfile,
                    newRawText);
            }.bind(this));
        }.bind(this);

        updateTargets();
        this.targetUpdaters.push(updateTargets);

        this.save();
    },
    /**
     * Adds multiple sync targets to configuration. Files are pointed by glob regex.
     */
    addSyncMultiTarget: function (name, cwd, src, dest) {
        // Sync config
        this.config.sync[name] = {
            files: [{
                expand: true,
                cwd: cwd,
                src: src,
                dest: dest,
                dot: true
            }]
        };

        // Watch config
        this.config.watch['sync-' + name] = {
            options: {
                cwd: cwd
            },
            files: src,
            tasks: ['sync:' + name]
        };

        this.save();
    },
    /**
     * Adds a single less target to configuration. May have dependencies.
     */
    addLessTarget: function (name, files, out) {
        if (!Array.isArray(files))
            files = [files];

        if (!this.config.less[name])
            this.config.less[name] = {
                files: {}
            };
        this.config.less[name].files[out] = files;

        this.config.watch['less-' + name] = {
            files: files,
            tasks: ['newer:less:' + name]
        };
    },
    /**
     * Adds multiple files to configuration.
     */
    addTypeScriptTarget: function (name, src, dest) {
        this.config.ts[name] = {
            src: src,
            outDir: dest
        };

        this.config.watch['typescript-' + name] = {
            files: src,
            tasks: ['ts:' + name]
        }
    },

    /**
     * Updates all targets. Should be called after sync.
     */
    updateTargets: function () {
        this.targetUpdaters.forEach(function (updater) {
            updater();
        });
    },

    /**
     * Cache file location. Cache file is used for dependency mapping.
     */
    getCachePath: function () {
        return path.join(this.tmpDir, 'cache.cache');
    },
    /**
     * Version of config. Must be changed when Gruntfile changes radically.
     * TODO: Replace with hash of Gruntfile
     */
    getVersion: function () {
        return '1';
    },

    /**
     * Saves configuration to a file pointed by this.getCachePath().
     */
    save: function () {
        var file = {
            watch: {},
            version: this.getVersion()
        };
        for (var i in this.config.watch) {
            if (this.config.watch.hasOwnProperty(i) && i !== 'options') {
                file.watch[i] = this.config.watch[i];
            }
        }
        this.grunt.file.write(this.getCachePath(), JSON.stringify(file));
    },
    /**
     * Loads configuration from the file pointed by this.getCachePath().
     */
    load: function () {
        if (!fs.existsSync(this.getCachePath()))
            return;
        var data = JSON.parse(fs.readFileSync(this.getCachePath()));
        if (data.version !== this.getVersion())
            return;
        for (var i in data.watch) {
            if (data.watch.hasOwnProperty(i)) {
                this.config.watch[i] = data.watch[i];
            }
        }
    }
}
