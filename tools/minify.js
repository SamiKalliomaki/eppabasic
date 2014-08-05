var fs = require('fs');

function minify(filename) {
    fs.readFile(filename, 'utf8', function (err, input) {
        if (err) {
            console.error(err);
            return;
        }

        function prettify(str) {
            return str
                .replace(/\/\/.+[\r\n]/g, '')
                .replace(/\/\*.+\*\//g, ' ')
                .replace(/\s+/g, ' ')
                .replace(/(\w)\s+(\W)/g, '$1$2')
                .replace(/(\W)\s+(\w)/g, '$1$2')
                .replace(/(\W)\s+(\W)/g, '$1$2')
                .trim();
        }

        console.log(prettify(prettify(input)));
    });
}

process.argv.forEach(function (arg, i) {
    if (i <= 1)
        return;
    minify(arg);
});