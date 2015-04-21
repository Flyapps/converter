
window.onerror = function(message, url, linenumber) {

	if (window.location.href.indexOf('debug') > -1) {
   		alert("ERROR!\n" + message + "\nline: " + linenumber + "\nurl: " + url);		
	} else {
		// supress errors.
	}
};


function App() {

	var me = this,
		currentXhrs = {},
		xhrTimeouts = {},
		dom = {},
		goto_lock = false,
		locks = {},

		settings = {
			'browserHistory': true,
			'onStateChanged': null
		};

	this.debug = function(msg) {

		console.log(msg);
	};
	var debug = this.debug;

	this.defaultState = {}; // holds the fields that comprise the application's state and their values.

	// hold the current and previous state of the application.
	this.state = {};
	this.prevState = {};

	this.init = function(_settings) {

		// extend the default settings
		settings = $.extend(settings, _settings);

		var moi = this;
		TouchyJS.Events.ready(function(){
		    moi.ready();
		});

		// cache some dom elements that we need throughout most of our applications.
		this.dom('body', $('body'));
		this.dom('header', $('#header'));
		this.dom('logo', $('#logo'));
	};

	this.ready = function() {


		if (settings.browserHistory) {
			var moi = this; // for inheritence.
			for (var p = 0; p < this.pages.length; p++) {
				TouchyJS.Nav.bind(this.pages[p], 'in', 'onstart', moi.onStateChanged);			
				//TouchyJS.Nav.bind('items', 'in', 'oncomplete', moi.onItemsLeave);
			}
		}
	};

	/**
	 * Handles the locks arround the application.
	 * @param  {[type]} id [description]
	 * @return {Boolean}    true if the lock was obtained. False otherwise.
	 */
	this.lock = function(id) {

		var currentTime = (new Date()).getTime();

		if (locks.hasOwnProperty(id)) { 
			if (currentTime - lock[id] < 1000) { // after a second - release any lock.
				console.log('lock ' + id + ' fail'); return false; 
			}
		}

		//console.log('lock ' + id + ' grant');
		locks[id] = currentTime;

		return true;
	};

	this.unlock = function(id) {

		delete locks[id];
	};

	/**
	 * This was an attempt to create method chaining infrastructure that can be called like this:
	 * methodOne().then(methodTwo).then(methodThree);
	 * and be sure that a method is called only when the previous is done.
	 *
	 * But, it didn't work past a certain level. 
	 * Try implementing this with events instead of simple callbacks (done()).
	 */
	this.createMethod = function(method) {
		return method;
	};
	// this.createMethod = function(method) {
	// 	return function() {
	// 		var __cb = null,
	// 			__done = false;

	// 		function done() {
	// 			__done = true;
	// 			if (__cb) {
	// 				__cb();
	// 			}
	// 		}
	// 		var methodObj = {
	// 			'then': function(cb) {
	// 				__cb = cb;
	// 				if (__done) {
	// 					__cb();
	// 				}
	// 			}
	// 		}
	// 		method(done);
	// 		return methodObj;
	// 	}
	// };

	this.defineState = function(state) {

		me.defaultState = state;
	};

	this.onStateChanged = function(e) {

		time('parent_onStateChanged');

		// extract the current state from the parameters received by Touchy,
		// and fill it up with missing fields from defaultState.

		// loop through all fields in defaultState, and if they don't exist in the received state.
		var urlParams = e.urlParams || e.url, // depends on the version of the library.
			value;

		if (!urlParams) {
			urlParams = {};
		}

		// track state changes: we'll keep the state in the "prevState" variable
		// before we change it.
		this.prevState = $.extend({}, this.state);

		// reset state.
		this.state = {};

		// loop through all fields.
		var defaultState = this.defaultState;
		
		for (var k in defaultState) {
			if (this.defaultState.hasOwnProperty(k)) {
			  	value = urlParams[k];
				if (value) {
					// if the value is a number then make sure it is used as a number and not as a string.
					if (!isNaN(value)) { value = parseInt(value); }
					if (value == "true") { value = true; }
					if (value == "false") { value = false; }
					this.state[k] = value;
				} else {
					this.state[k] = this.defaultState[k];
				}
			}
		}

		// also, keep the current application page in the state.
		this.state.appPage = e.currentElement.id;
	};

	this.show = function() {

		// Look for show method of the current page. If it exists - call it.
		var methodName = 'show' + (me.capitalize(this.state.appPage));
		
		//howlong('parent_onStateChanged');

		if (typeof this[methodName] !== 'undefined') {
			this[methodName].call(this);
		}
	};

	this.onItemsLeave = function() {

	};

	this.search = function() {

	};

	this.getSearchQuery = function() {

		return TouchyJS.Searchbar.getValue();
	};

	this.dom = function(key, value) {

		if (!key && !value) {
			return null;
		}

		if (typeof value !== 'undefined') {
			dom[key] = value;
			return value;
		} else {
			if (dom.hasOwnProperty(key)) {
				return dom[key];
			}
		}

		return null;
	};
	var dom = this.dom;

	this.loading = function(show) {

		if (show) {
			dom('body').addClass('loading');
		} else {
			dom('body').removeClass('loading');
		}
	};

	/**
	 * Creates a url string containing the first parameter as a base url, 
	 * and the second parameter is an object of querystring parameters to be
	 * concatenated to the url.
	 * @param  {string} url    Base url.
	 * @param  {object} params Querystring parameters.
	 * @return {string} 
	 */
	this.buildUrl = function(url, params) {

		var hasQuestionMark = url.indexOf('?') > -1;

		if (params) {
			for (var k in params) {
				if (params.hasOwnProperty(k)) {
					if (hasQuestionMark) {
						url += '&';
					} else {
						url += '?';
						hasQuestionMark = true;
					}
					url += (k + '=' + params[k]);
				}
			}
		}

		return url;
	};

	// makes a json request to a given url and calls the callback when ready.
	// handles display of loading indication.
    this.getData = function(settings) { 

    	if (!settings.bucket) {
    		settings.bucket = 'default';
    	}

        if (currentXhrs[settings.bucket]) {
            currentXhrs[settings.bucket].abort();
            this.loading(false);
        }

        if (xhrTimeouts[settings.bucket]) {
        	clearTimeout(xhrTimeouts[settings.bucket]);
        }

        var url = settings.url;

        // try getting from local storage.
        var data = Storage.get(url);
        if (data) {
            settings.callback(data);
        } else {

        	var calledBack = false; // used for detecting a request timeout or failure.

        	if (!settings.preventLoadingIndication) {
            	this.loading(true);
        	}
            
            var xhr = $.getJSON(url, function(data){

            	if (data == "" || calledBack) return; // something's gone wrong. Hopefully the error handler has caught it.

            	calledBack = true;

				callback();

				function callback() {
	                if (!settings.preventAbort) {
	                	currentXhrs[settings.bucket] = null;	                	
	                }
	                
	                Storage.set(url, data);

	                me.loading(false);

	                if (settings['callback']) {
	                	settings.callback(data);
	                }
	            }
            });

            if (!settings.preventAbort) {
            	currentXhrs[settings.bucket] = xhr;
            }

            // after a few seconds, check if the response has returned. If not, consider this an error and act accordingly...
            if (!settings.preventAbort) {
	            xhrTimeouts[settings.bucket] = setTimeout(function(){
	            	if (calledBack) return;
	            	calledBack = true;
	            	xhr.abort();

	            	me.loading(false);
	            	me.onError();

	            	if (settings.error) {
	            		settings.error.call();
	            	}
	            }, 10000);
	        }
        }    
    };

    this.onError = function() {

		dom('body').addClass('error');
    };

    // not sure I want this... 
    this.storage = {
    	'get': Storage ? Storage.get : function(){},
    	'set': Storage ? Storage.set : function(){}
    };

    this.capitalize = capitalize;

    this.validateState = function(state) {

    	return true;
    };

    var lastGotoCallTime = null;
    this.goTo = function(state) {

    	time('parent_goto');

    	var t = '';
    	if (lastGotoCallTime) {
    		t = (new Date()).getTime() - lastGotoCallTime;
    		lastGotoCallTime = t + lastGotoCallTime;
    	} else {
    		lastGotoCallTime = (new Date()).getTime();
    	}
    	
    	console.log('+ (' + t + ') state: ' + state.category + ' ' + state.source_unit + ':' + state.target_unit);

    	if (goto_lock) return;
    	goto_lock = true;

    	state = this.validateState(state);

    	if (!this.isStateValid(state)) {
    		console.log('invalid'); debugger;
    		goto_lock = false;
    		return;
    	}

    	// extend the default state with the state received here.
    	state = $.extend({}, me.defaultState, state);

    	if (settings.browserHistory) {
    		TouchyJS.Nav.goTo(state.appPage, { 'url': state });
    	} else if (isFunc(settings.onStateChanged)) {
			settings.onStateChanged({'currentElement': { 'id': state.appPage }, 'urlParams': state });
    	}

		// release goto lock.
		goto_lock = false;
		
		// howlong('parent_goto');
    };

    this.updateState = function(changes) {

    	var newState = $.extend({}, this.state, changes);

    	this.goTo(newState);
    };
}