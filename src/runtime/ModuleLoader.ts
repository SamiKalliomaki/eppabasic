import Module = require('./modules/Module');

/**
 * Handles loading modules
 */
class ModuleLoader {
    /**
     * Promise of loaded modules.
     */
    private _loadPromise: Promise<Module[]>;

    /**
     * Constructs a new module loader.
     * @param modules List of module names.
     */
    constructor(modules: string[]) {
        // Load every module
        var modulePromises = modules.map((module: string): Promise<Module> => {
            // Map module name to a promise
            return new Promise<Module>((resolve: (value: Module) => void, reject: (error: any) => void): void => {
                // Require module
                require(['runtime/modules/' + module.toLowerCase()], function (module) {
                    // Promise is fulfilled
                    resolve(module);
                });
            });
        });

        // Load promise is combination of all promises.
        // .then returns automatically list of all loaded modules.
        this._loadPromise = Promise.all(modulePromises);
    }

    /**
     * Adds a function to be called when modules are loaded.
     * @param cb Callback to be called when modules are loaded.
     */
    loaded(cb: (modules: Module[]) => void): void {
        this._loadPromise.then(cb);
    }
}

export = ModuleLoader;