define(['require'], function (require) {
    function Mirror() {
        function emit(name, args) {
            this.events = this.events || {};

            var listeners = this.events[name] || [];
            if (!listeners.length) {
                console.error('No listener assigned for event\'' + name + '\'');
                return;
            }

            listeners.forEach(function (listener) {
                listener.apply(null, args);
            })
        }
        emit = emit.bind(this);

        self.onmessage = function onmessage(e) {
            emit(e.data.cmd, e.data.args);
        }
    }

    Mirror.prototype = {
        on: function on(name, callback) {
            this.events = this.events || {};

            var listeners = this.events[name];
            if (!listeners)
                listeners = this.events[name] = [];

            if (listeners.indexOf(callback) === -1)
                listeners.push(callback);
            return callback;
        },
        off: function off(name, callback) {
            this.events = this.events || {};

            var listeners = this.events[name];
            if (!listeners)
                return;

            var index = listeners.indexOf(callback);
            if (index !== -1)
                listeners.splice(index, i);
        },

        send: function send(cmd, args) {
            self.postMessage({
                cmd: cmd,
                args: Array.prototype.slice.call(arguments, 1)
            });
        }
    };

    return Mirror;
});