
define([], function () {
    if (window.applicationCache) {
        // Event handlers
        function onCached(e) {
            // Caching is done
            console.log('Application is now cached');
            if (!this.online) {
                this.online = true;
                this.emit('online');
            }
        }
        function onChecking(e) {
            this.notificationSystem.notify('Checking if there is an update for EppaBasic');
        }
        function onDownloading(e) {
            this.notificationSystem.notify('Downloading EppaBasic for offline use');
            if (!this.online) {
                this.online = true;
                this.emit('online');
            }
        }
        function onError(e) {
            this.notificationSystem.notify('An error occured while downloading');
            // An error occured when fetching the changes so propably offline
            if (this.online) {
                this.online = false;
                this.emit('offline');
            }
        }
        function onNoUpdate(e) {
            this.notificationSystem.notify('EppaBasic for offline is up to date');
            if (!this.online) {
                this.online = true;
                this.emit('online');
            }
        }
        function onObsolete(e) {
            // Manifest couldn't be found
            console.log('Application cache is obsolete');
        }
        function onProgress(e) {
            // TODO: Show to user
            console.log('Progress: ' + e.loaded + '/' + e.total);
            if (!this.online) {
                this.online = true;
                this.emit('online');
            }
        }
        function onUpdateReady(e) {
            this.notificationSystem.notify('EppaBasic for offline is now updated');
            window.applicationCache.swapCache();
            if (confirm('EppaBasic is now updated and wants to be reloaded. Can EppaBasic be reloaded now?'))
                location.reload();
            if (!this.online) {
                this.online = true;
                this.emit('online');
            }
        }

        function AppCache(notificationSystem) {
            this.notificationSystem = notificationSystem;

            window.applicationCache.addEventListener('cached', onCached.bind(this), false);
            window.applicationCache.addEventListener('checking', onChecking.bind(this), false);
            window.applicationCache.addEventListener('downloading', onDownloading.bind(this), false);
            window.applicationCache.addEventListener('error', onError.bind(this), false);
            window.applicationCache.addEventListener('noupdate', onNoUpdate.bind(this), false);
            window.applicationCache.addEventListener('obsolete', onObsolete.bind(this), false);
            window.applicationCache.addEventListener('progress', onProgress.bind(this), false);
            window.applicationCache.addEventListener('updateready', onUpdateReady.bind(this), false);

            this.online = navigator.onLine;

            // Call appropriate handlers based on the current status
            switch (window.applicationCache.status) {
                case window.applicationCache.CHECKING:
                    onChecking.call(this);
                    break;
                case window.applicationCache.DOWNLOADING:
                    onDownloading.call(this);
                    break;
                case window.applicationCache.OBSOLETE:
                    onObsolete.call(this);
                    break;
                case window.applicationCache.UPDATEREADY:
                    onUpdateReady.call(this);
                    break;
            }

            // Check for updates every 10 seconds
            var checkUpdates = function checkUpdates() {
                window.applicationCache.update();
                setTimeout(checkUpdates, 10000);
            }.bind(this);
            checkUpdates();
        }
        AppCache.prototype = {
            isOnline: function isOnline() {
                return this.online
            },

            isCached: function isCached() {
                return window.applicationCache.status === window.applicationCache.IDLE;
            },

            // Listener handlers
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
                    listeners.splice(index, 1);
            },
            emit: function emit(name, args) {
                this.events = this.events || {};

                var listeners = this.events[name] || [];
                if (!listeners.length) {
                    return;
                }

                listeners.forEach(function (listener) {
                    listener.apply(null, args);
                })
            }
        };

        return AppCache;
    } else {
        // A dummy version for browsers not supporting Application Cache
        function DummyAppCache() {

        }
        DummyAppCache.prototype = {
            isOnline: function isOnline() {
                return true;
            },

            isCached: function isCached() {
                return true;
            }
        };

        return DummyAppCache;
    }
});