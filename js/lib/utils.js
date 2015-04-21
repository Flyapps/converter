
var START_EVENT = TouchyJS.Env.isMobile() ? 'touchstart' : 'mousedown',
	MOVE_EVENT = TouchyJS.Env.isMobile() ? 'touchmove' : 'mousemove',
	END_EVENT = TouchyJS.Env.isMobile() ? 'touchend' : 'mouseup';

$body = $('body');

function sluggize(str) {
	return str.replace(' ', '_spc_').replace('/', '_slsh_');
}
function unsluggize(str) {
	return str.replace('_spc_', ' ').replace('_slsh_', '/');
}

/**
 * Determines if the mouse is down or if the finger is touching.
 * @return {Boolean} [description]
 */
var isMoving = false,
	__pos = null;
$body.bind(START_EVENT, function(e) {
	__pos = extractPosition(e);
}).bind(MOVE_EVENT, function(e) {
	if (!__pos) return;

	var pos = extractPosition(e);
	if (pos[0] !== __pos[0] || pos[1] !== __pos[1]) {
		isMoving = true;
	} else {
		//isMoving = false;
	}
}).bind(END_EVENT, function() {
	isMoving = false;
	__pos = null;
});

isMovingCounter = 0;
function ifNotMoving(cb) {
	if (!isMoving) {
		cb();
	} else {
		isMovingCounter++;
		//console.log('isMovingCounter ' + isMovingCounter);
	}
}

// function getMinWindowSize() {
// 	return Math.min(window.innerWidth, window.innerHeight);
// }
// function getMaxWindowSize() {
// 	return Math.max(window.innerWidth, window.innerHeight);
// }

function c(exp) {

	var code = "var func = function(v) { ";
	code += "return (" + exp + ")";
	code += "}"

	eval(code);

	// now func is available to us.
	return func;
}

function isPortrait() {
	var portrait = TouchyJS.Env.getInfo().orientation.name == 'portrait';
	return portrait;
	//return window.innerWidth < window.innerHeight;
}

function extractPosition(e) {
	
    var x = e.touches ? e.touches[0].pageX : e.clientX,
        y = e.touches ? e.touches[0].pageY : e.clientY;
	
	return [x, y];
}

function isEven(number) {

	return number % 2 == 0;
}

var times = {},
	TIMING_ENABLED = true;

function time(id) {
	if (TIMING_ENABLED) {
		times[id] = (new Date()).getTime();
	}
}

function howlong(id) {
	if (TIMING_ENABLED) {
		var time = null;

		if (times.hasOwnProperty(id)) {
			time = ((new Date()).getTime() - times[id]);
		}	

		console.log(id + ' time: ' + time);	
	}
}

function extend(child, parent) {

	parent.prototype.me = function() {
		return this;
	}

	var parent = new parent();

	child.prototype = parent;
	child.prototype.parent = parent;
}

/**
 * Capitalizes the first letter of the given word.
 * @param  {string} word Word to capitalize.
 * @return {string} capitalized word.
 */
function capitalize(word) {

 	return word.charAt(0).toUpperCase() + word.slice(1);
}

function isFunc(methodName) {
	return typeof methodName == 'function';
}

function parseQuery() {
   var r = {};
   (location.search || '').replace(/([^=^&^?]+)=([^&]*)/g, function(ig, k, v) {r[k] = v;});
   return r;
}

function loop(obj, cb) {

	for (var key in obj) {
		if (obj.hasOwnProperty(key)) {
			cb(key, obj[key]);
		}
	}
}

function pluralize(word) {

	var lastChar = word[word.length - 1],
		wordWithoutLast = word.slice(0, word.length - 1);

	if (lastChar == 'y') {
		word = wordWithoutLast + 'ies';
	} else if (lastChar == 's' || lastChar == 'z') { // and some other rules...
		word = word + 'es';
	} else {
		word += 's';
	}

	return word;
}

/* Smart click will trigger only when the user hasn't moved its finder between 
 * the touch start event and the touch end event. */
function smartClick($elm, cb) {

	var startPosition = null,
		currentPosition = null,
		click = false;

	$elm.bind(START_EVENT, function(e) {
		e.preventDefault();
		$elm.addClass('highlight');
		click = false;
		startPosition = currentPosition = extractPosition(e);

	}).bind(MOVE_EVENT, function(e) {

		currentPosition = extractPosition(e);

	}).bind(END_EVENT, function(e) {
		$elm.removeClass('highlight');
		if (startPosition && currentPosition) {
			if (Math.abs(startPosition[0] - currentPosition[0]) < 2 && Math.abs(startPosition[1] - currentPosition[1]) < 2) {
				click = true;
			}
		}

		startPosition = currentPosition = null;

		if (click) {
			cb.call(this, e);
		}
	});
}

function isEmpty(obj) {
    for(var prop in obj) {
        if(obj.hasOwnProperty(prop))
            return false;
    }

    return true;
}