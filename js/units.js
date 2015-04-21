
time('units_compilation');

var	UNITS = {
		'temperature': {
			category: "Temperature",
			keywords: ['temp', 'heat'],
			base: 'k',
			defaults: ['c', 'f'],
			allowNegatives: true, // by default, negative values are not allowed.
			units: {
				'c': ['Celsius', 		c("v+273.15"),			c("v-273.15")],
				'k': ['Kelvin', 		c("v"),					c("v")],
				'f': ['Fahrenheit', 	c("(v + 459.67)*5/9"),	c("(v-273.15)*9/5+32")],
				'r': ['Rankine', 		c("v * 5/9"),			c("v*9/5")]
			}
		},
		'weight': {
			category: "Weight",
			keywords: ['weight', 'mass'],
			base: 'kg',
			defaults: ['kg', 'lb'],
			units: {
				'kg': ['Kilogram', 		c("v"),					c("v")],
				'g':  ['Gram', 			c("v/1000"), 			c("v*1000")],
				'ct': ['Carat (metric)',c("v/5000"),			c("v*5000")],
				'lb': ['Pound', 		c("v*0.45359237"),		c("v/0.45359237")],
				'oz': ['Ounce', 		c("v*0.028"),			c("v/0.028")],
				'oz t': ['Ounce Troy', 	c("v*0.0311034768"),	c("v/0.0311034768")],
				't': ['Ton (metric)',  	c("v*1000"),			c("v/1000")]
			}
		},
		'area': {
			category: "Area",
			keywords: ['area', 'expanse'],
			base: 'm²',
			defaults: ['ac', 'ha'],
			units: {
				'ac': ['Acre', 			c("v*4046.873"), 		c("v/4046.873"),							['acre']],
				'ha': ['Hectare',		c("v*10000"),			c("v/10000")],
				'cm²': ['Sq. Centimeter', c("v/10000"),			c("v*10000"),									['cm2']],
				'sq ft': ['Sq. Foot', 	c("v*0.09290304"),		c("v/0.09290304"),						['sq foot']],
				'sq in': ['Sq. Inch', 	c("v*6.4516/10000"),	c("v*10000/6.4516")],
				'km²': ['Sq. Kilometer',	c("v*1000000"),		c("v/1000000")],
				'm²': ['Sq. Meter',		c("v"),					c("v"),										['m2', 'sq m']],
				'sq mi': ['Sq. Mile', 	c("v*2589988.110336"),	c("v/2589988.110336")],
				'mm²': ['Sq. Millimeter', c("v/1000000"),			c("v*1000000"),								['mm2', 'sq mm']],
				'sq yd': ['Sq. Yard', 	c("v*0.83612736"),		c("v/0.83612736")]
			}
		},
		'length': {
			category: "Length",
			keywords: ['distance', 'long', 'width', 'height'],
			base: 'm',
			defaults: ['in', 'cm'],
			units: {
				'mm': ['Millimeter', 	c("v/1000"),			c("v*1000")],
				'cm': ['Centimeter', 	c("v/100"),				c("v*100")],
				'dm': ['Decimeter', 	c("v/10"),				c("v*10")],
				'dc': ['Decameter', 	c("v*10"),				c("v/10")],
				'ft': ['Feet', 			c("v*0.3048"),			c("v/0.3048")],
				'fur':['Furlong', 		c("v*201.168"),			c("v/201.168")],
				'hm': ['Hectometer', 	c("v*100"),				c("v/100")],
				'in': ['Inch', 			c("v*0.0254"),			c("v/0.0254"),								['"']],
				'km': ['Kilometer', 	c("v*1000"),			c("v/1000")],
				'm':  ['Meter', 		c("v"),					c("v")],
				'um': ['Micrometer', 	c("v/1000000"),			c("v*1000000")],
				'mi': ['Mile', 			c("v*1609.344"),		c("v/1609.344")],
				'nm': ['Nanometer', 	c("v/1000000000"),		c("v*1000000000")],
				'yd': ['Yard', 			c("v*0.9144"),			c("v/0.9144")]
			}
		},
		'volume': {
			category: "Volume",
			base: 'm³',
			defaults: ['cu ft', 'm³'],
			units: {
				'cm³':   ['Cubic Centimeter', 	c("v/1000000"), 			c("v*1000000"),						['cm3']],
				'cu ft': ['Cubic Foot', 		c("v*0.028316846592"), 		c("v/0.028316846592")],
				'cu in': ['Cubic Inch', 		c("v*0.000016387064"), 		c("v/0.000016387064")],
				'm³':    ['Cubic Meter', 		c("v"), 					c("v"),							['m3']],
				'cu yd': ['Cubic Yard', 		c("v*0.764554857984"), 		c("v/0.764554857984")],
				'c':     ['Cup', 				c("v*0.000236588"), 		c("v/0.000236588")], // cup (metric)
				'fl dr': ['Dram',			 	c("v*0.00000369669"), 		c("v/0.00000369669")],
				'gtt':   ['Drop', 				c("v*0.000000051342933268"),		c("v/0.000000051342933268")],
				'gal':   ['Gallon', 			c("v*0.00454609"), 			c("v/0.00454609")], // gallon (imperial)
				// 'beer gal': ['Gallon UK', 		c("v*0.00462115204"), 		c("v/0.00462115204")], // gallon (beer)
				'L':     ['Liter', 				c("v*0.001"), 				c("v/0.001")],
				'mL':    ['Milliliter', 		c("v/1000000"), 			c("v*1000000")],
				'US fl oz': ['Ounce', 			c("v*0.0000295"), 			c("v/0.0000295")],
				'fl oz (imp)': ['Ounce UK', 	c("v*0.000028413"), 		c("v/0.000028413")],
				'pt (imp)': ['Pint', 			c("v*0.0005682612"), 		c("v/0.0005682612")],
				'qt (US)': ['Quart', 			c("v*0.0009463529"), 		c("v/0.0009463529")],
				'tbsp': ['Tablespoon', 			c("v*0.000014787"), 		c("v/0.000014787")], // US food nutrition labeling
				'tsp': ['Teaspoon', 			c("v*0.0000049289"),			c("v/0.0000049289")] // US food nutrition labeling
			}
		},
		'time': {
			category: "Time",
			base: 's',
			defaults: ['d', 's'],
			units: {
				's': ['Seconds',		c("v"),					c("v")],
				'm': ['Minutes',		c("v*60"),				c("v/60")],
				'h': ['Hours',			c("v*60*60"),			c("v/60/60")],
				'd': ['Days',			c("v*86400"),			c("v/86400")],
				'w': ['Weeks',			c("v*604800"),			c("v/604800")],
				//'M': ['Months',			c("v*2592000"),			c("v/2592000")],
				'y': ['Years',			c("v*365*86400"),		c("v/365/86400")]
			}
		},
		'speed': {
			category: "Speed",
			keywords: ['velocity'],
			base: 'm/s',
			defaults: ['km/h', 'mph'],
			units: {
				'km/s': ['Kilometers per second', c("v*1000"), c("v/1000"),									['km\\s']],
				'm/s': ['Meters per second', c("v"), c("v")],
				'km/h': ['Kilometers per hour', c("v/3.6"), c("v*3.6")],
				'm/min': ['Meters per minute', c("v*60"), c("v/60")],
				'mps': ['Miles per second', c("v*1609.344"), c("v/1609.344")],
				'mph': ['Miles per hour', c("v*0.44704"), c("v/0.44704")],
				'fps': ['Feet per second', c("v*0.3048"), c("v/0.3048")],
				'fpm': ['Feet per minute', c("v*0.00508"), c("v/0.00508")]
			}
		}
	};

var NUMBER_OF_CATEGORIES;

howlong('units_compilation');


