define(function () {
    function CompileError(line, msg, data) {
        this.line = line;
        this.msg = msg;
        // Convert data types to string
        for (var d in data) {
            if (data.hasOwnProperty(d) && data[d]) {
                data[d] = data[d].toString();
            }
        }
        this.data = data;
    }
    return CompileError;
});