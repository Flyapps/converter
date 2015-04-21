var dom = app.dom,
	lock = app.lock,
	unlock = app.unlock;

var scrolls = function() {
	
	var _me,

		_categoriesLeftDummies = 0,

		_scrolls = {
			'categories': null
		},

		_firstTimes = {
			'categories': true,
			'source': true,
			'target': true
		},

		_isScrolling = {
			'categories': false,
			'source': false,
			'target': false
		},

		_checkLock = {
			'categories': false,
			'source': false,
			'target': false
		},

		_setups = {

			'source': function() {
				_setups.units('source');
			},

			'target': function() {
				_setups.units('target');
			},

			'units': function(which) {

				resizeUnits(which);	

				// setup style classes that handle the width of the units in different orientations.
				// var portraitWidth, landscapeWidth;
				// if (isPortrait()) {
				// 	portraitWidth = window.innerWidth;
				// 	landscapeWidth = window.innerHeight;
				// } else {
				// 	landscapeWidth = window.innerWidth;
				// 	portraitWidth = window.innerHeight;
				// }
				// landscapeWidth = landscapeWidth / 2 - 58;
				// portraitWidth = portraitWidth / 2 - 58;
				// var stylePortrait = "<style>.orientation-portrait #main .units button em:not(.key) { max-width: " + portraitWidth + "px; }</style>",
				// 	styleLandscape = "<style>.orientation-landscape #main .units button em:not(.key) { max-width: " + landscapeWidth + "px; }</style>";
				// $('head').append(stylePortrait).append(styleLandscape);


				var $unitsWrapper = $('#' + which + '_units .inner'),
					$units = $unitsWrapper.find('button'),
					itemSize = 45, //$units[0].innerHeight,
					unitsCategory = app.state.category,
					lastCheckTime = (new Date()).getTime();
				
				// init iscroll.
				var timeout,
					options = {
						snap: 'button',
						momentum: false,
						hScrollbar: false,
						vScrollbar: false,
						bounce: false,
						hScroll: false,
						useTransition: true,
						onBeforeScrollStart: function() { },
						//useTransform: touchyjs_config.runSpecs ? false : true,
						onScrollStart: function(e) {
							_isScrolling[which] = true;
							$unitsWrapper = $('#' + which + '_units .inner');
							$units = $unitsWrapper.find('button');
						},
						onScrollMove: function(e) { 
							checkUnit();
						},
						onScrollEnd: function(e) { 
							checkUnit();
						},
						onTouchEnd: function(e) {
							_isScrolling[which] = false;
							//if (lock(which + 'UnitsScroll')) { return; }
							//checkUnit();
						}
					};

				_scrolls[which] = new iScroll(which + '_units', options);

				function checkUnit() {

					var now = (new Date()).getTime(),
						delta = now - lastCheckTime;
					lastCheckTime = now;

					// if (lock) { console.log(delta + ': unit check cancelled'); return; }
					// lock = true;
					//console.log(delta + ': unit check');
					// make sure the lock is released either way.
					
					if (!lock(which + 'UnitsScroll')) { return; }

					try
					{
						if ($units.length == 0 || unitsCategory != app.state.category) {
							$unitsWrapper = $('#' + which + '_units .inner');
							$units = $unitsWrapper.find('button');
							unitsCategory = app.state.category;
						}

						// has the current item changed?
						var offset = -_scrolls[which].y,
							itemIndex = Math.ceil(offset / itemSize - 0.5),
							item = $units[itemIndex],
							unit = $(item).data('unit');

						if (typeof unit == 'undefined') { 
							console.log("WARNING!!! undefined unit detected. cancelling current unit check.");
							unlock(which + 'UnitsScroll');
							return;
						}
						unit = unsluggize(unit);
						
						// has the unit changed?
						if (unit !== app.state[which + '_unit'] && !_firstTimes[which]) {
							var changes = {};

							$('#' + which + '_units').find('button.active').removeClass('active');							
							$('#' + which + '_units button[data-unit=\'' + sluggize(unit) + '\']').addClass('active');

							changes[which + '_unit'] = unit;
							app.updateState.call(app,changes);			
						}

						_firstTimes[which] = false;
					}
					finally {
						//lock = false;	
						unlock(which + 'UnitsScroll');				
					}
				}

			},

			'categories': function() { 

				var first = true;

				resizeCategories();
				
				// init iscroll.
				var timeout,
					options = {
						snap: 'button',
						momentum: false,
						hScrollbar: false,
						vScrollbar: false,
						bounce: false,
						useTransition: true,
						onBeforeScrollStart: function() { },
						onScrollStart: function(e) {
							_isScrolling['categories'] = true;
						},
						onScrollMove: function(e) { 
							checkCategory();
						},
						onScrollEnd: function(e) {
							if (!checkCategory()) {
								_me.scrollToActive('units');								
							}
						},
						onTouchEnd: function(e) {
							_isScrolling['categories'] = false;
						}
					};

				_scrolls.categories = new iScroll('categories', options);

				var checkCategoryLock = false,
					$categoriesContainer = $('#categories'),
					$categories = dom('categories').find('button');

				function calcItemIndex(offset, scroll, itemSize, screenSize) {

					var midPos = offset + scroll + 0.5*screenSize,
						index = Math.floor(midPos / itemSize);

					if (!isPortrait()) {
						//index = Math.round(midPos / itemSize + 0.5);
					}

					//console.log('midPos=' + midPos + ' ' + ' floor=' + Math.floor(midPos/itemSize) + ' ceil=' + Math.floor(midPos/itemSize) + ' round=' + Math.round(midPos/itemSize));
					return index;
				}

				function checkCategory() {

					if (_scrolls.categories.animating || _me.taintedOrientation || checkCategoryLock) {
						console.log('checkCategory cancelled.'); return;
					}
					checkCategoryLock = true;
		
					var portrait = isPortrait(),
						firstItem = dom('categories').find('button:first-child'),
						itemSize = portrait ? firstItem[0].offsetWidth : firstItem[0].offsetHeight,
						//screenSize = portrait ? window.innerWidth : window.innerHeight,
						screenSize = portrait ? app.dom('main')[0].offsetWidth : app.dom('main')[0].offsetHeight,
						newCat = false;
					
					time('checkCategory');

					// if an error occurs we must free the lock.
					try {

						// has the current item changed?
						var offset = $categoriesContainer[0].offsetLeft,
							scroll = portrait ? _scrolls.categories.x : _scrolls.categories.y,
							itemIndex = calcItemIndex(-offset, -scroll, itemSize, screenSize),
							catItem = $categories[itemIndex],
							catName = $(catItem).html().toLowerCase();

						console.log(['checkCategory', scroll, itemIndex, catItem, catName]);

						if (catName && catName !== app.state.category && !_firstTimes.categories) {
							var cat = UNITS[catName],
								sourceUnit = cat.defaults[0],
								targetUnit = cat.defaults[1];

							newCat = true;

							// when using goTo, history.pushState is called which takes some time.
							// In the future, if we want to save time, we should first change the state manually,
							// and only after a few milliseconds change the history state as well.
							app.goTo({
								'category': catName,
								'source_unit': sourceUnit,
								'target_unit': targetUnit,
								'number': app.state.number,
								'reverse': app.state.reverse
							});		
						}

						if (catName == "") {
							//_me.scrollToActive('categories');
						}

						_firstTimes.categories = false;
					}
					finally {
						checkCategoryLock = false;						
					}

					return newCat;

					//howlong('checkCategory');
				}
			} // categories
		}; // setups

	var _refreshes = {

		// refresh categories scroll.
		'categories': function() {
			// the timeout of 0 is  used to make sure that by the time calculations are done
			// latest DOM changes are fully rendered. Otherwise we'd be working on old values.
			setTimeout(function() { 
				resizeCategories();
			
				setTimeout(function() {
					_scrolls.categories.refresh();

					setTimeout(function() {
						_me.scrollToActive('categories', false);
						_me.taintedOrientation = false;
					}, 0);
				}, 0);
			}, 0);
		},

		'units': function() {
			dom('body').removeClass('units-carousels-ready');

			resizeUnits('source');
			resizeUnits('target');

			setTimeout(function() {
				_scrolls.source.refresh();
				_scrolls.target.refresh();

				setTimeout(function() {
					if (!isMoving && !_scrolls.source.animating && !_scrolls.target.animating) {
						_me.scrollToActive('units', false);
					} else {
						console.log('scroll units scrollToActive is cancelled inside refresh.');
					}
				}, 0);

				setTimeout(function() {
					dom('body').addClass('units-carousels-ready');
					$('#debugme').html('ready');
				}, 100);
			}, 0);
		}
	}

	function resizeCategories() {
		
		var portrait = isPortrait(),
			firstItem = dom('categories').find('button:first-child'),
			itemSize = portrait ? firstItem[0].offsetWidth : firstItem[0].offsetHeight,

			// unfortunately, a bug is causing the values of innerWidth and innerHeight to be switched sometimes.
			//screenSize = portrait ? window.innerWidth : window.innerHeight; //portrait ? getMinWindowSize() : getMaxWindowSize(); //Math.min(window.innerWidth, window.innerHeight) : Math.max(window.innerWidth, window.innerHeight);
			screenSize = portrait ? app.dom('main')[0].offsetWidth : app.dom('main')[0].offsetHeight;

		var visibleItems = Math.floor(screenSize / itemSize),
			remainder = screenSize / itemSize - visibleItems,
			completelyVisibleItems = visibleItems;

		if (isEven(visibleItems)) {
			completelyVisibleItems--;
		}

		var step = (remainder==0) && (visibleItems == completelyVisibleItems);

		//$('#debugme').html(portrait + ' ' + screenSize + ' ' + visibleItems + ' ' + completelyVisibleItems + ' ' + step);
		$('#debugme').html(portrait + ' ' + screenSize);

		var scrollerSize = (completelyVisibleItems + (step ? 0 : 2)) * itemSize,
			scrollerOffset = -(scrollerSize - screenSize) / 2,
			dummyItems = (completelyVisibleItems-1)/2 + (((remainder!=0)||(visibleItems!=completelyVisibleItems)) ? 1 : 0),  
			wrapperSize = (NUMBER_OF_CATEGORIES + dummyItems*2) * itemSize;
		
		_categoriesLeftDummies = dummyItems;

		// apply these values to the DOM.
		$scroller = $('#categories');
		
		// remove previously added stylesheets.
		$scroller[0].removeAttribute('style');
		dom('categories')[0].removeAttribute('style');
		dom('categories').removeAttr('style');
		dom('categories').css('width', 'auto');
		dom('categories').css('height', 'auto');

		$scroller.css(portrait ? 'left' : 'top', scrollerOffset + 'px');
		$scroller.css(portrait ? 'width' : 'height', scrollerSize + 'px');

		dom('categories').css(portrait ? 'width' : 'height', wrapperSize + 'px');

		// clear all dummy items (if any).
		dom('categories').find("button[data-type='dummy']").remove();

		// add dummy items to make sure all items can be scrolled to the middle.
		for (var i = 0; i < dummyItems; i++) {
			dom('categories').prepend("<button data-type='dummy' class='dummy'></button>");
			dom('categories').append("<button data-type='dummy' class='dummy'></button>");
		}
	}

	function resizeUnits(which) {

	}

	return {

		'setup': function(id) {

			if (_setups.hasOwnProperty(id)) {
				_setups[id]();
			}
		},

		'refresh': function(id) {

			if (_refreshes.hasOwnProperty(id)) {
				_refreshes[id]();
			}
		},

		'scrollToActive': function(id, animate) { 
			
			if (typeof animate == 'undefined') {
				animate = true;
			}

			var time = animate ? 300 : 0,
				timeout = 0;

			switch(id) {
				case 'units':
					if (!_me.isScrolling('source')) {	
						setTimeout(function() {
							lock('sourceUnitsScroll');
							_scrolls.source.scrollToElement('.active', time);
							setTimeout(function() { unlock('sourceUnitsScroll'); }, time+10);
						}, 0);
					}

					if (!_me.isScrolling('target')) {
						setTimeout(function() {
							lock('targetUnitsScroll');
							_scrolls.target.scrollToElement('.active', time);
							setTimeout(function() { unlock('targetUnitsScroll'); }, time+10);
						},0);
					}

					break;

				case 'categories':
					if (!_scrolls.categories.animating) {
						// find the active category.
						var $active = $('#categories .active'),
							prevs = _categoriesLeftDummies;

						for (var i = 0; i < prevs; i++) {
							$active = $active.prev();
						}

						//if ($active.length > 0) {
							_checkLock['categories'] = true;
							_scrolls.categories.scrollToElement($active[0], time);
							setTimeout(function() { _checkLock['categories'] = false; }, time+10);							
						//}
					} else {
						console.log("WARNING!!! is scrolling");
					}
					break;

				default:
					break;
			}
		},

		'isScrolling': function(id) {
			return _isScrolling[id] || _scrolls[id].animating;
		},

		'init': function() {
			_me = this;
		},

		'scrolls': function() { return _scrolls; },

		'get': function(id) { return _scrolls[id]; },

		'taintedOrientation': false // when true, checkCategory will not perform.
	}
}();

scrolls.init();