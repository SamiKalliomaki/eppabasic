define([
    // Require all tests here.
    'test/dummy'
], function() {
    // Describe suites
    var suiteModules = Array.prototype.slice.call(arguments);
    suiteModules.forEach(function (module) {
        for (var key in module) {
            if (module.hasOwnProperty(key)) {
                var suiteConstructor = module[key];

                var suite = new suiteConstructor();
                console.log(suite)
                for (var key in suite.__proto__) {
                    console.log(key)
                    if (suite.__proto__.hasOwnProperty(key)) {
                        var func = suite.__proto__[key];
                        switch (key) {
                            case 'beforeEach':
                                beforeEach(func);
                                break;
                            case 'afterEach':
                                afterEach(func);
                                break;
                            case 'beforeAll':
                                beforeAll(func);
                                break;
                            case 'afterAll':
                                afterAll(func);
                                break;
                            default:
                                if (key.endsWith('Test'))
                                    it(key, func);
                        }
                    }
                }
            }
        }
    });
});
