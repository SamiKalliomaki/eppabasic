if (!Worker) {
    var Worker = function (scriptFile) {
        var http = new XMLHttpRequest();
        http.open('GET', scriptFile, false);
        http.send(null);

        var parent = this;

        (function () {
            // Context for worker
            var self = {};
            parent.workerContext = self;

            self.postMessage = function (data) {
                parent.onmessage({ "data": data });
            }

            eval(http.responseText);
        })();

        this.timer = null;
    }

    Worker.prototype.postMessage = function postMessage(data) {
        this.timer = setTimeout(this.workerContext.onmessage.bind(this.workerContext, { "data": data }), 1);
    }
}