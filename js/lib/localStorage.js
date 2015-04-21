var MINUTE = 60,
	HOUR = MINUTE * 60,
	DAY = HOUR * 24,
	WEEK = DAY * 7;


var LocalStorage = {
	set: function(key, value, ttl) {

		if (this.check_availability()) {
			try {
				ttl || (ttl = 30*MINUTE);
				var store = {
					'ttl': ttl,
					'created': (new Date()).getTime(),
					'value': value
				};
				localStorage.setItem(key, JSON.stringify(store)); //saves to the database, "key", "value"
			} catch (e) {
			 	if (e == QUOTA_EXCEEDED_ERR) {
			 	 	 //alert('Quota exceeded!'); //data wasn't successfully saved due to quota exceed so throw an error
				}
			}
		} else {
			return false;
		}
	},

	get: function(key) {
		if (this.check_availability()) {
			var store = localStorage.getItem(key),
				now = (new Date()).getTime();

			if (!store) { return null; }
			
			store = JSON.parse(store);

			// check the date this item was created and its time to live. is it expired?
			if (store.created + store.ttl <= now) {
				return null;
			}

			return store.value;
		} else {
			return null;
		}
	},

	remove: function(key) {
		localStorage.removeItem(key);
	},

	check_availability: function() {			
		if (typeof(localStorage) == 'undefined' ) {
			//alert('Your browser does not support HTML5 localStorage. Try upgrading.');
			return false;
		} else {
			return true;
		}
	}
};