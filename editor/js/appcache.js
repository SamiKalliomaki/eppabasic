
define([], function () {
    if (window.applicationCache) {
        // Event handlers
        function onCached(e) {
            // Caching is done
            console.log('Application is now cached');
        }
        function onChecking(e) {
            this.notificationSystem.notify('Checking if there is an update for EppaBasic');
        }
        function onDownloading(e) {
            this.notificationSystem.notify('Downloading EppaBasic for offline use');
        }
        function onError(e) {
            this.notificationSystem.notify('An error occured while downloading');
        }
        function onNoUpdate(e) {
            this.notificationSystem.notify('EppaBasic for offline is up to date');
        }
        function onObsolete(e) {
            // Manifest couldn't be found
            console.log('Application cache is obsolete');
        }
        function onProgress(e) {
            // TODO: Show to user
            console.log('Progress: ' + e.loaded + '/' + e.total);
        }
        function onUpdateReady(e) {
            this.notificationSystem.notify('EppaBasic for offline is now updated');
            console.log('Current cache status: ' + cacheStatusValues[window.applicationCache.status]);
            window.applicationCache.swapCache();
            if (confirm('EppaBasic is now updated and wants to be reloaded. Can EppaBasic be reloaded now?'))
                location.reload();
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
        }
        AppCache.prototype = {
            isOnline: function isOnline() {
                return navigator.onLine;
            },

            isCached: function isCached() {
                return window.applicationCache.status === window.applicationCache.IDLE;
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