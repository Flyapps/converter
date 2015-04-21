(function() {

	/**
	 * Determines the initial state of the application.
	 * If a query is provided, the application will analyze it and determine the suitable
	 * category/units to display. Otherwise, it would just return the default state as
	 * defined previously.
	 */
	function getInitialState() {

		var qs = parseQuery(),
			useDefault = true,
			newState = null;

		if (qs.hasOwnProperty('do_query')) {

			var query = normalizeQuery(decodeURIComponent(qs['do_query']).toLowerCase()),
				queryWords = query.split(' '),
				matchedWords = [],
				detectedUnits = [],
				baseRegex = "(^cs{0,1}$|^cs{0,1}\\s|\\scs{0,1}\\s|\\scs{0,1}$)";

			// get numbers and remove them from the query.
			var numbers = query.match(/\d+\.?\d*/g);
			query = query.replace(/[\.\d\-]*/g, '').replace(/\s{2,}/g, ' ');
			
			if (query) {
				// build dictionary.
				var dic = buildDictionary();

				// build grams (max: 3 words).
				parseGrams(query, dic, function(grams, categories, units) {
					
					var cat,
						sourceUnit,
						targetUnit;

					if (categories.length >= 1) {
						cat = categories[0];
						// we cannot handle more than one categories so let's just ignore them.
					}

					// at least one unit - retreive it.
					if (units.length >= 1) {
						sourceUnit = units[0].toLowerCase();
					}

					// remove contained units (if any)
					if (units.length >= 2) {
						var cleared = false,
							newUnits = [],
							unit,
							ok, i,j;

						// if any unit is contained within another we'll ignore it.							
						for (i = 0; i < units.length; i++) {
							unit = units[i];
							ok = true;

							for (j = 0; j < newUnits.length; j++) {
								if (newUnits[j] == unit) {
									ok = false;
								}
							}

							if (ok) {
								for (j = 0; j < units.length; j++) {
									if (unit != units[j] && units[j].indexOf(unit) > -1) {
										ok = false;
									}
								}
							}

							if (ok) {
								newUnits.push(unit);
							}
						}

						units = newUnits;
					}

					if (units.length >= 2) {

						targetUnit = units[1].toLowerCase();
						// match each other?
						if (dic[sourceUnit].category.key != dic[targetUnit].category.key) {
							// ignore the targetUnit.
							targetUnit = null;
						} else if (!cat || dic[sourceUnit].category.key != cat) {
							// choose the category that matches the source unit.
							cat = dic[sourceUnit].category.key;
						}
						
						// we can't handle more than 2 categories so we just ignore the rest (if any).
					}

					if (!cat) {
						if (sourceUnit) {
							cat = dic[sourceUnit].category.key;
						} else {
							cat = app.defaultState.category;							
						}
					}

					if (!sourceUnit) {
						// get the default for this category.
						sourceUnit = UNITS[cat].defaults[0];
					}

					if (!targetUnit) {
						// get the default for this category.
						targetUnit = UNITS[cat].defaults[1];
					}

					newState = {
						'category': cat,
						'source_unit': sourceUnit,
						'target_unit': targetUnit,
						'number': (numbers && numbers.length) ? numbers[0] : '1'
					};

				});

			}
		}

		if (!newState) {
			newState = app.defaultState;
			newState.source_unit = UNITS[newState.category].defaults[0];
			newState.target_unit = UNITS[newState.category].defaults[1];
		}

		return newState;
	}

	function parseGrams(query, dic, cb) {

		var grams = [],
			words = query.split(' '),
			categories = [],
			units = [],
			gram,
			elm;

		for (var i = 0; i < words.length; i++) {

			for (var size = 1; size <= 3; size++) {
				switch (size) {
					case 1:
						gram = words[i];
						break;

					case 2: 
						if (i < words.length - 1) {
							gram = words[i] + ' ' + words[i + 1];
						}
						break;

					case 3: 
						if (i < words.length - 2) {
							gram = words[i] + ' ' + words[i+1] + ' ' + words[i+2];
						}
						break;
				}

				if (gram && dic.hasOwnProperty(gram)) {
					elm = dic[gram];
					grams.push(gram);

					if (elm.unit) { // this is a unit.
						units.push(elm.key);
					}
					else if (elm.category) { // this is a category
						categories.push(elm.key);
					}
				}

				gram = null;
			}
		}

		cb(grams, categories, units); // return the results.
	}

	function buildDictionary() {

		var dic = {}, cat_pointer, unit_pointer;

		loop(UNITS, function(cat_key, cat) {

			cat_pointer = {
				'key': cat_key,
				'category': cat
			};

			// add all keywords to the dictionary.
			dic[cat_key] = cat_pointer;
			dic[cat.category.toLowerCase()] = cat_pointer;

			for (var i = 0; i < cat.keywords; i++) {
				dic[cat.keywords[i]] = cat_pointer;
				dic[pluralize(cat.keywords[i])] = cat_pointer;
			}

			loop(cat.units, function(unit_key, unit) {
				unit_pointer = {
					'key': unit_key,
					'category': cat_pointer,
					'unit': unit
				};

				dic[unit_key.toLowerCase()] = unit_pointer;
				dic[unit[0].toLowerCase()] = unit_pointer;
				dic[pluralize(unit_key.toLowerCase())] = unit_pointer;
				dic[pluralize(unit[0].toLowerCase())] = unit_pointer;

				if (unit.length > 3) { // the 4th parameter, if epointerxists, contains additional keywords for this unit.
					for (var i = 0; i < unit[3].length; i++) {
						dic[unit[3][i]] = unit_pointer;
						dic[pluralize(unit[3][i])] = unit_pointer;
					}
				}
			});
		});

		return dic;
	}

	/**
	 * Normalizes a given query to a searchable form:
	 * removes extra spaces, puncuation marks.
	 */
	function normalizeQuery(query) {

		// remove punctuation marks:
		query = query.replace(/[,#!$%\^&\*;:{}=_`~]/g, ' ');
		// we don't remove - . / and \ at this point because they can be used for numbers.
		// we also don't remove () because they are sometimes used in units names.
		
		// extra spaces:
		query = query.replace(/\s{2,}/g, ' ');

		return query;
	}


	var query = {
		'getInitialState': getInitialState
	};

	window['queryAnalyzer'] = query;
}());