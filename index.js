(function () {
   'use strict';
}());

var fns = require('date-fns');

var functionMappings = {
	'diff' : {
		'years' : fns.differenceInYears,
		'quarters' : fns.differenceInQuarters,
		'months' : fns.differenceInMonths,
		'weeks' : fns.differenceInWeeks,
		'days' : fns.differenceInDays,
		'hours' : fns.differenceInHours,
		'minutes' : fns.differenceInMinutes,
		'seconds' : fns.differenceInSeconds,
		'milliseconds' : fns.differenceInMilliseconds
	},
	'add' : {
		'years' : fns.addYears,
		'quarters' : fns.addQuarters,
		'months' : fns.addMonths,
		'weeks' : fns.addWeeks,
		'days' : fns.addDays,
		'hours' : fns.addHours,
		'minutes' : fns.addMinutes,
		'seconds' : fns.addSeconds,
		'milliseconds' : fns.addMilliseconds
	}
};

var formatFunctions = {
	'default' : function(obj) {
		return obj.getFullYear() + '-' + FastDate.pad(obj.getMonth() + 1,2) + '-' + FastDate.pad(obj.getDate(),2) + 'T' + FastDate.pad(obj.getHours(),2) + ':' + FastDate.pad(obj.getMinutes(),2) + ':' + FastDate.pad(obj.getSeconds(),2) + formatUTCOffset(obj);
	}
};

var parseMappings = {};

var FastDate = function(obj,format) {

  if (!(this instanceof FastDate)) {
    return new FastDate(obj,format);
  } else if(obj instanceof FastDate) {
  	return obj;
  } else {
  	if(!obj) {
	  	obj = new Date();
	  } else if (format) {
	  	// https://date-fns.org/v2.16.1/docs/parse
		obj = fns.parse(obj,convertFormat(format),new Date());
	  } else {
	  	obj = new Date(obj);
	  }
  }
  

  this.obj = obj;
};

var convertFormat = function(format) {
	var newFormat = format;
	if(parseMappings[format]) {
		newFormat = parseMappings[format];
	} else {
		throw 'Invalid parse format: ' + format;
	}
	return newFormat;
};

var formatUTCOffset = function(obj) {
	var tzo = -obj.getTimezoneOffset();
	var dif = tzo >= 0 ? '+' : '-';
	return dif + FastDate.pad(tzo / 60,2) + ':' + FastDate.pad(tzo % 60,2);
};

FastDate.formatUTCOffset = formatUTCOffset;

FastDate.pad = function(num, size) {
    var s = num + '';
    while (s.length < size) s = '0' + s;
    return s;
};

FastDate.addFormatFunction = function(format,func) {
	formatFunctions[format] = func;
};

FastDate.addParseMapping = function(format,val) {
	parseMappings[format] = val;
};

FastDate.prototype.format = function(format) {
	var returnVal = null;
	if(!format) {
		format = 'default';
	}
	if(formatFunctions[format]) {
		returnVal = formatFunctions[format](this.obj);
	} else {
		throw 'Unsupported format: ' + format;
	}
	return returnVal;
};


FastDate.prototype.diff = function(date2,datepart) {
	var returnValue = null;
	var compareDate = date2;
	if(date2 instanceof FastDate) {
		compareDate = date2.obj;
	}
	try {
		returnValue = functionMappings.diff[datepart](this.obj, compareDate);
	} catch(e) {
		throw 'Invalid datepart: ' + datepart;
	}
	return returnValue;	
};

FastDate.prototype.add = function(amount,datepart) {
	try {
		this.obj = functionMappings.add[datepart](this.obj, amount);
	} catch(e) {
		throw 'Invalid datepart: ' + datepart;
	}
	return this;	
};

FastDate.prototype.subtract = function(amount,datepart) {
	try {
		this.obj = functionMappings.add[datepart](this.obj, -amount);
	} catch(e) {
		throw 'Invalid datepart: ' + datepart;
	}
	return this;	
};

FastDate.prototype.set = function(params) {
	for (var param in params) {
		if(param == 'year') {
			this.obj.setFullYear(params[param]);
		} else if(param == 'month') {
			this.obj.setMonth(params[param]);
		} else if(param == 'date') {
			this.obj.setDate(params[param]);
		} else if(param == 'hour' || param == 'hours') {
			this.obj.setHours(params[param]);
		} else if(param == 'minute' || param == 'minutes') {
			this.obj.setMinutes(params[param]);
		} else if(param == 'second' || param == 'seconds') {
			this.obj.setSeconds(params[param]);
		} else if(param == 'millisecond' || param == 'milliseconds') {
			this.obj.setMilliseconds(params[param]);
		} else {
			throw 'Invalid datepart' + param;
		}
	}
	return this;	
};

FastDate.prototype.toDate = function() {
	return this.obj;	
};

FastDate.prototype.utcOffset = function() {
	return -this.obj.getTimezoneOffset();
};

FastDate.prototype.day = function() {
	return this.obj.getDay();	
};

FastDate.prototype.clone = function () {
	return new FastDate(this.obj);
};

FastDate.unix = function format(unixTime) {
	return new FastDate(fns.fromUnixTime(unixTime));
};

module.exports = FastDate;