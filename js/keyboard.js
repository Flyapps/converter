var Keyboard = function (container, options) {

	var	me,
		$container = $('#' + container),
		$target = null,
		changedCallback = null,
		firstAdd = true,
		allowNegatives = true,
		rememberDot = false;

	this.options = {
		onOpen: null,
		onClose: null
	};

	this.init = function() {

		me = this;

		$.extend(me.options, options);

		var buttons = ['wrap_start', '1','2','3','4','5','6','7','8','9','.','0','backspace', 'wrap_end', 'c','plusminus', 'ok'],
			html = "";

		$container.hide();

		for (var i = 0; i < buttons.length; i++) {
			switch (buttons[i]) {
				case 'wrap_start': 
					html += "<div class='numbers'>"
					break;
				case 'wrap_end':
					html += "</div>";
					break;
				default:
					html += "<button data-type='" + buttons[i] + "'>" + buttons[i] + "</button>";
					break;
			}
		}

		var EVENT_START = TouchyJS.Env.isMobile() ? 'touchstart' : 'mousedown',
			EVENT_END = TouchyJS.Env.isMobile() ? 'touchend' : 'mouseup';

		$container.bind(EVENT_START, function(e) { e.preventDefault(); });

		$container.html(html).find('button').bind(EVENT_START, function() {
			
			$(this).addClass('active');

			if ($target) {
				var button = $(this).data('type'),
					number;

				if (!isNaN(button)) {
					number = parseInt(button);
					if (rememberDot) { 
						rememberDot = false;
						number = '.' + number;
					}
					add(number);
					return;
				}

				switch (button) {
					case '.':
						// only allow adding a dot if the current text doesn't contain a dot.
						if ($target.html().indexOf('.') < 0) {
							//add('.');
							rememberDot = true;
						}
						break;

					case 'backspace':
						if (rememberDot) rememberDot = false; // forget dot.
						else remove();
						break;

					case 'c':
						clear();
						break;

					case 'plusminus': 
						if (allowNegatives) {
							plusminus();
						}
						break;

					case 'ok':
						me.close();
						break;
				}				
			}
		}).bind(EVENT_END, function() {
			$(this).removeClass('active');
		});
	};

	/* returns the target content without any html code (if exists). */
	function getContent() {

		return $target.text();
	}

	function update(html) {

		var html2 = html;

		if (html !== '-') {
			html2 = app.normalizeLabel(html);
		}

		$target.html(html2);

		if (html == '-') {
			onChanged('0');
		} else {
			onChanged(html);
		}

		console.log('update ' + html + ',' + html2);
	}

	function add(ch) {

		var html = getContent();

		if (firstAdd) {
			// replace the current number with a new one.
			html = ch;
			firstAdd = false;
		} else if (html == '0') {
			html = ch;
		} else {
			html += ch;			
		}

		update(html);
	}

	function remove() {

		var html = $target.html();

		if (html.length > 0) {

			// remove <small> tag (if exists).
			html = html.replace('<small>', '').replace('</small>', '');			

			html = html.slice(0,html.length-1);
			if (html == '') { html = '0'; }
			if (html == '-') { html = '-'; }
			update(html);
		}
	}

	function clear() {

		update('0');

	}

	function plusminus() { 

		if (firstAdd) {
			// erase the whole number and write "-" instead.
			firstAdd = false;
			update("-");
		} else {
			// if the first character is "-" (minus) then remove it. Otherwise, add "-" at the beginning.
			var html = $target.html();

			if (html.length > 0) {
				if (html.charAt(0) == '-') {
					html = html.slice(1, html.length);
				} else if (html == '0') {
					// do nothing...
				} else {
					html = '-' + html;
				}
				update(html);			
			}			
		}
	}

	function onChanged(html) {
		if (changedCallback) {
			changedCallback(html);
		}
	}

	this.open = function(target, cb, _allowNegatives) {

		firstAdd = true;
		changedCallback = cb;
		allowNegatives = _allowNegatives;
		$container.addClass('allow-negatives-' + allowNegatives);
		$target = target;
		$container.css('display', 'block');
		$('body').addClass('keyboard_open');
		$target.addClass('active');

		if (me.options.onOpen) {
			me.options.onOpen();
		}
	};

	this.close = function() {

		// if the current text is "-" then we'll change it to "1".
		if ($target.html() == '-') {
			update('1');
		}

		$container.hide();
		$container.removeClass('allow-negatives-' + allowNegatives);
		$target.removeClass('active');
		$target = null;
		changedCallback = null;
		$('body').removeClass('keyboard_open');

		if (me.options.onClose) {
			me.options.onClose();
		}
	};

	this.isOpen = function() {
		return $('body').hasClass('keyboard_open');
	};

	this.getTarget = function() {
		return $target;
	};

	// initialize the keyboard!
	this.init();
};

