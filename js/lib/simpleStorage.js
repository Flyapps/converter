var SimpleStorage = function(){
    var me = this,
        storage = {};

    function contains(key) {

        if (typeof storage[key] !== 'undefined') {
            if (storage[key]['ttl'] + storage[key]['timeSaved'] < (new Date()).getTime()) {
                delete storage[key];
                return false;
            }
            return true;
        }

        return false;
    }

    this.contains = contains;

    this.get = function(key) {

        if (contains(key)) {
            return storage[key].value;
        } else {
            return null;
        }
    };

    this.set = function(key, value, ttl) {

        if (typeof ttl === 'undefined') {
            ttl = 20 * 60 * 1000; /* 20 minutes */
        }

        me.remove(key);

        storage[key] = {
            'ttl': ttl,
            'timeSaved': (new Date()).getTime(),
            'value': value
        }
    };

    this.remove = function(key) {

        if (contains(key)) {
            delete storage[key];
        }
    };

    this.removeAll = function() {

        for (var key in storage) {
            delete storage[key];
        }
    };
};

var Storage = new SimpleStorage();