
/**
 * Define metacritic app object that inherits from base App.
 */
var ConverterApp = function() {

	// have some local variables ready for our convenience.
	var me 			= this,
		debug 		= this.debug,
		parent 		= this.parent,
		dom 		= this.dom,

		lock		= this.lock,
		unlock		= this.unlock,

		enableDebug = false,

		firstLoad	= true,

		keyboard;

	this.pages = ['main'];

	/**
	 * Initializes the application.
	 */
	this.init = function() {

		// make general App initializations.
		parent.init.call(this, {
			'browserHistory': touchyjs_config.browserHistory,
			'onStateChanged': this.onStateChanged
		});

		// define the elements that comprise the state of our application and their default values.
		this.defineState({
			'category'		: 'length',
			'source_unit'	: '',
			'target_unit'	: '',
			'number'		: '1',
			'reverse'		: false, // when set to true the target label will be used as the source of the conversion.
			'appPage'		: 'main'
		});
	};

	/**
	 * Called when the DOM and Touchy are ready.
	 */
	this.ready = function() {

		parent.ready.call(this);

		// Cache DOM elements we'll use later on.
		dom('categories', 			$('#categories .inner'));
		dom('sourceLabel',			$('#main .source label.number'));
		dom('sourceUnits',			$('#main .source .units .inner'));
		dom('sourceScroller',		$('#main .source .units'));
		dom('targetLabel',			$('#main .target label.number'));
		dom('targetUnits',			$('#main .target .units .inner'));
		dom('targetUnitsScroller',	$('#main .target .units'));
		dom('toggleKeyboard', 		$('#toggle_keyboard'));
		dom('keyboard',				$('#keyboard'));
		dom('unitsDisabler',		$('#units_disabler'));
		dom('main',					$('#main'));

		dom('toggleDebug', 			$('#debug')).click(function() { enableDebug = !enableDebug; if (enableDebug) { $(this).removeClass('disabled'); } else { $(this).addClass('disabled'); } });

		TouchyJS.Env.addEventListener("orientationchange", orientationChanged);

		// add 'undesign' on firefox os.
		if (TouchyJS.Env.getInfo().os.name == 'firefoxos') {
			dom('body').addClass('undesign');
		}

		// var v1 = initCategories(),
		// 	v2 = v1.then(initUnitsScrollers),
		// 	v3 = v2.then(initKeyboard),
		// 	v4 = v3.then(sortCurrencies),
		// 	v5 = v4.then(startRocking);

		//updateMainHeight();

		initCategories();

		initUnitsScrollers(function() {
			initKeyboard();
			// sortCurrencies();
			startRocking();
		});
	};

	var startRocking = me.createMethod(function(done) {
		me.onStateChanged({'currentElement': { 'id': 'main' }, 'urlParams': queryAnalyzer.getInitialState() });
	});

	var initKeyboard = me.createMethod(function(done) {

		keyboard = new Keyboard('keyboard', {
			onOpen: onKeyboardOpen,
			onClose: onKeyboardClose
		});

		// open keyboard when tapping on the source label.
		smartClick(dom('sourceLabel'), function() { toggleKeyboard('sourceLabel'); });
		dom('sourceLabel').bind(START_EVENT, function(e) { e.preventDefault(); }); // temporary! don't forget to unremark!
		smartClick(dom('targetLabel'), function(e) { e.preventDefault(); toggleKeyboard('targetLabel'); });
		dom('targetLabel').bind(START_EVENT, function(e) { e.preventDefault(); });
		dom('toggleKeyboard').bind(START_EVENT, function(e) { e.preventDefault(); });
		smartClick(dom('toggleKeyboard'), function(e) { toggleKeyboard('sourceLabel'); });

		//done();
	});

	function onKeyboardOpen() {

		scrolls.refresh('units');

		if (!isPortrait()) return;

		// if there is not enough space for scrolling, disable the units scroll.
		var windowHeight = window.innerHeight,
			keyboardHeight = dom('keyboard').height(),
			labelHeight = dom('sourceLabel').height(),
			unitHeight = dom('sourceUnits').children().get(0).offsetHeight,
			MIN_VISIBLE_UNITS = 3,

			availableHeight = windowHeight - keyboardHeight - labelHeight;


		if (availableHeight < MIN_VISIBLE_UNITS * unitHeight) {
			dom('body').addClass('units-scroll-disabled');
		}
	}

	function onKeyboardClose() {

		dom('body').removeClass('units-scroll-disabled');
		scrolls.refresh('units');
	}

	var initUnitsScrollers = me.createMethod(function(done) {

		// initialize the units scrollers.
		setTimeout(function() {
			scrolls.setup('source');
			scrolls.setup('target');
			setTimeout(function() {
				dom('body').addClass('units-carousels-ready'); // wait again?
				done();
			}, 100);
		}, 0);

		// inits the disabler (dom element that is responsible for disabling the scroll when needed).
		dom('unitsDisabler').bind(START_EVENT, function(e) {
			e.preventDefault();
			keyboard.close();
		});
		// smartClick(dom('unitsDisabler'), function() {
		// 	keyboard.close();
		// });
	});

	var firstOrientationChange = true;
	function orientationChanged(e) {
		var newOrientation = e.name;
		scrolls.taintedOrientation = true;

		dom('body').removeClass('units-carousels-ready').removeClass('loaded');
		setTimeout(function() {
			if ((isPortrait() && newOrientation == 'portrait') || (!isPortrait() && newOrientation == 'landscape')) {
				scrolls.refresh('categories');
				scrolls.refresh('units');
				setTimeout(function() { dom('body').addClass('units-carousels-ready').addClass('loaded'); }, 0);
			}
		}, 500);


		//updateMainHeight();

		// if the keyboard is open while changing the orientation things get fucked up.
		if (keyboard.isOpen()) {
			keyboard.close();
		}
	}

	// function updateMainHeight() {

	// 	// update #main height.
	// 	// unfortunately, a bug is causing the values of innerWidth and innerHeight to be switched sometimes.
	// 	var screenHeight = window.innerHeight;
	// 	setTimeout(function() {
	// 		//$('#main').css('height', screenHeight + 'px');
	// 	}, 0);
	// }

	var sortCurrencies = me.createMethod(function(done) {

		time('sorting currencies');

		var newUnits = {},
			unitsArr = [],
			units = UNITS.money.units;

		for (var unit in units) {
			if (units.hasOwnProperty(unit)) {
				unitsArr.push(unit);
			}
		}
		unitsArr.sort();

		for (var i = 0; i < unitsArr.length; i++) {
			newUnits[unitsArr[i]] = units[unitsArr[i]];
		}

		UNITS.money.units = newUnits;

		howlong('sorting currencies');

		//done();
	});

	this.eachUnit = function(cb) {

		me.eachCategory(function(cat) {
			for (var unit in UNITS[cat].units) {
				if (UNITS[cat].units.hasOwnProperty(unit)) {
					cb(unit, cat);
				}
			}
		});
	}

	this.eachCategory = function(cb) {

		for (var cat in UNITS) {
			if (UNITS.hasOwnProperty(cat)) {
				cb(cat);
			}
		}
	}

	var initCategories = me.createMethod(function(done) {

		var html = "", c;

		NUMBER_OF_CATEGORIES = 0;

		for (var u in UNITS) {
			if (UNITS.hasOwnProperty(u)) {
				html += '<button class="' + u + '">' + UNITS[u].category + '</button>';
				NUMBER_OF_CATEGORIES++;
			}
		}

		dom('categories').html(html);

		var $cats = dom('categories').find('button');

		smartClick($cats, function() {
			var catName = $(this).hasClass('active') ? ($(this).removeClass('active')[0].className) : this.className,
				cat = UNITS[catName],
				sourceUnit = cat.defaults[0],
				targetUnit = cat.defaults[1];

			me.goTo({
				'category': this.className,
				'source_unit': sourceUnit,
				'target_unit': targetUnit,
				//'number': me.state.number,
				'number': '1',
				'reverse': me.state.reverse
			});
		});

		// setup scrolls.
		scrolls.setup('categories');

		//done();
	});

	function openKeyboard(target) {

		var cat = UNITS[me.state.category],
			allowNegatives = cat.hasOwnProperty('allowNegatives') ? cat.allowNegatives : false,
			reverse;

		if (target == 'sourceLabel') {
			target = dom('sourceLabel');
			reverse = false;
		} else if (target == 'targetLabel') {
			target = dom('targetLabel');
			reverse = true;
		} else {
			return;
		}

		keyboard.open(target, function(val) {
			me.state.number = val;
			me.state.reverse = reverse;
			convert();
		}, allowNegatives);
	}

	function toggleKeyboard(target) {

		// keyboard isn't open => open with new target.
		if (!keyboard.isOpen()) {
			openKeyboard(target);
			return;
		}

		var currentTarget = keyboard.getTarget();
		if (currentTarget.parent().hasClass('source')) {
			currentTarget = 'sourceLabel';
		} else {
			currentTarget = 'targetLabel';
		}

		// different targets => open with new target.
		if (currentTarget !== target) {
			keyboard.close();
			openKeyboard(target);
		}

		// same targets => close the keyboard.
		if (currentTarget == target) {
			keyboard.close();
		}
	}

	/**
	 * Handles the app view while loading.
	 */
	this.loading = function(show) {

		parent.loading.call(this, show);

		if (show) {
			getActiveTargetLabel().html('...');
		} else {
			if (getActiveTargetLabel().html() == '...') {
				getActiveTargetLabel().html('');
			}
		}
	};

	this.showMain = function() {

		var cat_key = this.state.category,
			cat = UNITS[cat_key],
			sourceUnit = this.state.source_unit,
			targetUnit = this.state.target_unit;
		if (sourceUnit == "") debugger;

		time('showMain');

		var label = getActiveSourceLabel();// me.state.reverse ? dom('targetLabel') : dom('sourceLabel');
		label.html(me.normalizeLabel(me.state.number));

		// should the units HTML be recaclculated?
		// if we're in the same category as previous state, then no.
		if (me.prevState.category !== me.state.category || dom('sourceUnits').children().length == 0) {
			var unitsHtml = "";

			// units.
			for (var u in cat.units) {
				if (cat.units.hasOwnProperty(u)) {
					if (cat.category == "Money" || true) { // trying how it looks.
						var u_ = u.replace('³', '<u>3</u>').replace('²', '<u>2</u>');
						unitsHtml += "<button data-unit='" + sluggize(u) + "'><em class='key'>" + u_ + "</em><small>" + cat.units[u][0] + "</small>" + "</button>";
					} else {
						unitsHtml += "<button data-unit='" + sluggize(u) + "'><em>" + cat.units[u][0] + "</em><small class='key'>" + u + "</small></button>";
					}
				}
			}

			dom('sourceUnits').html(unitsHtml);
			dom('targetUnits').html(unitsHtml);

			smartClick(dom('sourceUnits').find('button'), function() {
				var unit = unsluggize($(this).data('unit'));
				me.updateState({
					'source_unit': unit
				});
			});

			smartClick(dom('targetUnits').find('button'), function() {
				var unit = unsluggize($(this).data('unit'));
				me.updateState({
					'target_unit': unit
				});
			});

			// refresh the units scrollers.
			scrolls.refresh('units');
		} // units created

		// make sure the following changes are made after the recent changes have taken effect.
		// (not sure why and if it's still needed.)
		whenUnitsAreReady(function() {

			// mark the defaults.
			dom('sourceUnits').find('button.active').removeClass('active');
			dom('targetUnits').find('button.active').removeClass('active');
			dom('sourceUnits').find("button[data-unit='" + sluggize(sourceUnit) + "']").addClass('active');
			dom('targetUnits').find("button[data-unit='" + sluggize(targetUnit) + "']").addClass('active');

			if (dom('sourceUnits').find("button[data-unit='" + sluggize(sourceUnit) + "']").length == 0) {
				console.log('WARNING!!! actives not found');
			}

			ifNotMoving(function() {
				scrolls.scrollToActive('units', true); // I'm not sure that animating doesn't cause problems. If problems occur, change true to false.
			});

			convert();
		});

		function whenUnitsAreReady(cb) {

			//setTimeout(function() {
				if (dom('sourceUnits').find("button[data-unit='" + sluggize(sourceUnit) + "']").length == 0) {
					setTimeout(function() { whenUnitsAreReady(cb); }, 10);
				} else {
					cb();
				}
			//}, 0);
		}

		//howlong('showMain');
	};

	function convert() {

		var source = getActiveSourceLabel().html(),// me.state.reverse ? dom('targetLabel').html() : dom('sourceLabel').html(),
			result,
			cat = me.state.category,
			sourceUnit = me.state.source_unit,//unsluggize(dom('sourceUnits').find('.active').data('unit')),
			targetUnit = me.state.target_unit;//unsluggize(dom('targetUnits').find('.active').data('unit'));

		if (me.state.reverse) {
			var temp = sourceUnit;
			sourceUnit = targetUnit;
			targetUnit = temp;
		}

		if (source == '-') {
			source = '0';
		}

		_convert(source, cat, sourceUnit, targetUnit, function(result) {
			injectResult(result);
		});

		function injectResult(result) {

			// maximum length should be 4 characters, not including a decimal point.
			// TODO
			result = me.normalizeLabel(result);

			var target = getActiveTargetLabel(); // me.state.reverse ? dom('sourceLabel') : dom('targetLabel');
			target.html(result);

			// debug against google.
			if (enableDebug) {
				var query = source + " " + category.units[sourceUnit][0].toLowerCase() + " in " + category.units[targetUnit][0].toLowerCase();
				window.open("https://www.google.co.il/search?q=" + encodeURIComponent(query), "debug");
			}
		}
	}

	function getActiveSourceLabel() { return me.state.reverse ? dom('targetLabel') : dom('sourceLabel'); }
	function getActiveTargetLabel() { return me.state.reverse ? dom('sourceLabel') : dom('targetLabel'); }

	function _convert(source, cat, sourceUnit, targetUnit, cb) {

		// remove 'small' tags.
		if (source.toString().indexOf('small') > -1) {
			source = source.replace('<small>', '').replace('</small>', '');
		}
		source = parseFloat(source);

		if (sourceUnit == targetUnit) { cb(source); return; };

		var category = UNITS[cat];

		if (isNaN(source)) {
			getActiveSourceLabel().html('0');
			//dom('sourceLabel').html('0');
			//dom('targetLabel').html('0');
			cb(0);
			return;
		}

		// the money category uses a remote API.
		if (category.remote) {
			me.getData({
				'url': category.getUrl(source, sourceUnit, targetUnit),
				'callback': function(result) {
					var result = result.rhs.split(' ')[0];
					cb(result);
				}
			});
		} else {
			result = category.units[sourceUnit][1](source);
			result = category.units[targetUnit][2](result);
			cb(result);
		}
	}

	this.normalizeLabel = function(label) {
		if (!label.toString().match(/e/)) {
			var integer = Math.floor(label),
				fraction = label.toString().split('.')[1],
				leadingZeros = fraction ? fraction.match(/^0*/)[0].length : 0,
				hasDot = false;

			if (parseFloat(label) < 0) {
				hasDot = label.toString().indexOf('.') > -1;
			} else {

				if (leadingZeros) {

					if (leadingZeros > 4) {
						label = integer + '.' + fraction.substring(0,leadingZeros+2);
					} else if (leadingZeros > 3) {
						label = integer + '.' + fraction.substring(0,leadingZeros);
					} else {
						label = integer + '.' + fraction.substring(0,4);
					}

				} else {

					fraction = parseFloat(0 + '.' + fraction);

					if (integer < 1) {
						// take at most 4 digits from the fraction.
						fraction *= 10000;
					} else if (integer < 10) {
						// take at most 3 digits from the fraction.
						fraction *= 1000;
					} else if (integer < 100) {
						// take at most 2 digits from the fraction.
						fraction *= 100;
					} else if (true || integer < 1000) {
						// take at most 1 digit from the fraction.
						fraction *= 10;
					}

					if (fraction > 0 && Math.floor(fraction) == 0) {
						fraction *= 1000;

						if (integer == 0) {
							fraction *= 10;
						}
					}

					// discard other digits if any.
					fraction = Math.floor(fraction);

					// remove unnecessary zeros.
					fraction = parseInt(fraction.toString().replace(/0*$/, ''));

					if (fraction > 0) {
						label = integer + '.' + fraction;
						hasDot = true;
					} else {
						label = integer;
					}

				}
			}
		} else {
			var label = label.toString().split('.'),
				integer = label[0],
				fraction = label[1].split('e');
			if (fraction[0].length > 4) {
				fraction[0] = fraction[0].substring(0, 4);
			}
			label = integer + '.' + fraction.join('e');
		}

		label = label.toString();
		if (hasDot && label.length > 5) {
			label = "<small>" + label + "</small>";
		} else if (!hasDot && label.length > 4) {
			label = "<small>" + label + "</small>";
		}

		return label;
	}

	/**
	 * Called when the state of the application has changed.
	 * The call to this method is defined in the base App.
	 * When this method is called the global state object (this.state) is already updated with its new state.
	 * @param  {event} e Containing information regarding the event the caused the state-change.
	 */
	this.onStateChanged = function(e) { // 10-20ms

		//time('onStateChanged');

		if (!lock('onStateChanged')) { return; }

		// if the source and target units are empty, use the default ones for the
		// selected category.
		var params = e.urlParams;
		//alert([params.category, params.source_unit, params.target_unit]);
		if (!params) {
			params = {};
		}

		// for when a query without a category is received.
		if (!params.category) {
			params.category = me.defaultState.category;
			params.source_unit = UNITS[params.category].defaults[0];
			params.target_unit = UNITS[params.category].defaults[1];
		}

		params.source_unit || (params.source_unit = UNITS[params.category].defaults[0]);
		params.target_unit || (params.target_unit = UNITS[params.category].defaults[1]);

		// TODO: update touchy's bind to pass the original scope.
		parent.onStateChanged.call(me, e);

		// update category 'active' class.
		dom('categories').find('button.active').removeClass('active');
		//console.log(dom('categories').find("button[class='" + params.category + "']")); // this doesn't work.
		//console.log(dom('categories').find("button." + params.category)); // this works
		//dom('categories').find("button[class='" + params.category + "']").addClass('active');
		dom('categories').find("button." + params.category).addClass('active');


		// if the category has changed and we're still in the same category 200 ms from now, then show.
		// or, if only a unit was changed and we're still in the same category, show immediately.


		// if the category has changed, wait for 200ms to make sure it hasn't changed again, and only then show
		// the new category.

		// if (me.state.catgory !== me.prevState.category) {

		// 	var category = me.state.category;
		// 	var state = $.extend({}, me.state);
		// 	setTimeout(function() {
		// 		// if the state has changed, we shouldn't apply previous changes.
		// 		if (state.category == me.state.category &&
		// 			state.source_unit == me.state.source_unit &&
		// 			state.target_unit == me.state.target_unit) {

		// 			// remove previous state category and add current state's category as a CSS class.
		// 			dom('body').removeClass('category-' + me.prevState.category).addClass('category-' + params.category);

		// 			show.call(me);

		// 		} // state hasn't changed.

		// 	}, 200);
		// } else {
		// 	show.call(me);
		// }


		// show when the touch ends.
		showWhenNotMoving();


		//howlong('onStateChanged');
	};

	var movingTimeout = null;
	function showWhenNotMoving() {

		if (movingTimeout) {
			clearTimeout(movingTimeout);
		}

		if (!isMoving) {

			me.show();

			// scroll to the active item.
			var animate = true;
			if (firstLoad) {
				setTimeout(function() { dom('body').addClass('loaded'); }, 0); // I don't think this timeout is needed.
				animate = false;
				firstLoad = false;
			}
			//ifNotMoving(function() {
				scrolls.scrollToActive('categories', animate);
				setTimeout(function() {
					scrolls.scrollToActive('units', animate);
				}, 20);
			//});

			unlock('onStateChanged');

		} else {
			movingTimeout = setTimeout(showWhenNotMoving, 50);
		}
	}

	this.validateState = function(state) {

		// category must be present.
		if (!state.category) {
			state.category = this.defaultState.category;
		}

		// unist must be present.
		if (!state.source_unit) {
			state.source_unit = UNITS[state.category].defaults[0];
		}
		if (!state.target_unit) {
			state.target_unit = UNITS[state.category].defaults[1];
		}

		// make sure that both units belong to the given category.
		if (!UNITS[state.category].units.hasOwnProperty(state.source_unit)) {
			state.source_unit = UNITS[state.category].defaults[0];
		}
		if (!UNITS[state.category].units.hasOwnProperty(state.target_unit)) {
			state.target_unit = UNITS[state.category].defaults[1];
		}

		return state;
	};

	this.isStateValid = function(state) {

		var valid = true;

		// category and units must be present.
		if (!state.category || !state.source_unit || !state.target_unit) {
			valid = false;
		}

		// make sure that both units belong to the given category.
		if (!UNITS[state.category].units.hasOwnProperty(state.source_unit)) {
			valid = false;
		}
		if (!UNITS[state.category].units.hasOwnProperty(state.target_unit)) {
			valid = false;
		}

		return valid;
	};

	this.capitalize = function(word) {

    	if (word == 'tv') return 'TV';
    	else return parent.capitalize.call(this, word);
	};

	this.goToCategory = function(catName) {

		me.goTo({
			'category': catName,
			'source_unit': UNITS[catName].defaults[0],
			'target_unit': UNITS[catName].defaults[1]
		});
	};

	this.init(); // init
}

// Inherit our app object from the base App object.
extend(ConverterApp, App);

// Instanciate an app object.
var app = new ConverterApp();
