var
	assert        = require('assert'),
	MovingAverage = require('moving-average'),
	util          = require('util'),
	Duplex        = require('stream').Duplex
	;

var AVERAGE_INTERVAL = 5 * 60 * 1000; // 5 minutes

var StatusCodeRates = module.exports = function StatusCodeRates(options)
{
	options = options || {};
	this.rateAllowed = options.rateAllowed || 0.1;
	assert(this.rateAllowed < 1, 'you really want a rate below 1 or this will never fire');

	this.interval = options.interval || AVERAGE_INTERVAL;
	this.alerts = {};
	this.apps = {};

	Duplex.call(this, { objectMode: true });

};
util.inherits(StatusCodeRates, Duplex);

StatusCodeRates.prototype.matcher = new RegExp('^(.*)\.response');
StatusCodeRates.prototype.rateAllowed = null;
StatusCodeRates.prototype.alerts = null;
StatusCodeRates.prototype.app = null;

StatusCodeRates.prototype._write = function(chunk, _, callback)
{
	if (!chunk.statusCode) return callback();

	var matches = chunk.name.match(this.matcher);
	if (!matches) return callback();

	var self = this,
		app = matches[1];

	if (!this.apps[app])
	{
		this.apps[app] = new AppRates(this.interval);
		setInterval(function() { self.checkRates(app); }, this.interval * 2);
	}
	var service = this.apps[app];

	service.recordRequest(chunk);

	callback();
};

StatusCodeRates.prototype.checkRates = function checkRates(app)
{
	var service = this.apps[app];
	var requests = service.requestRate.movingAverage();

	var codes = Object.keys(service.averages);
	for (var i = 0; i < codes.length; i++)
	{
		var code = codes[i];
		if (code === '200') continue; // we want these :)
		var average = service.averages[code].movingAverage();
		var rate = average / requests;

		if (rate > this.rateAllowed)
		{
			this.push({
				name:       'status-code-rates.' + app,
				statusCode: code,
				status:     'critical', // TODO warning level & critical level
				value:      rate
			});
			this.alerts[code] = rate;
		}
		else if (this.alerts[code])
		{
			this.push({
				name:       'status-code-rates.' + app,
				statusCode: code,
				status:     'ok',
				value:      rate
			});
			delete this.alerts[code];
		}
	}
};

StatusCodeRates.prototype._read = function() {};

var AppRates = function AppRates(interval)
{
	this.interval = interval;
	this.averages = {};
	this.requestRate = new MovingAverage(interval);
	this.timer = setInterval(this.updateAverages.bind(this), interval / 10);

	this.requests = 0;
	this.statuses = {};
};
StatusCodeRates.AppRates  = AppRates; // I'd like to name this DogRates

AppRates.prototype.name        = null;
AppRates.prototype.averages    = null;
AppRates.prototype.requestRate = null;
AppRates.prototype.timer       = null;
AppRates.prototype.requests    = 0;
AppRates.prototype.statuses    = {};
AppRates.prototype.interval    = AVERAGE_INTERVAL;

AppRates.prototype.recordRequest = function recordRequest(chunk)
{
	if (!this.averages[chunk.statusCode])
	{
		this.averages[chunk.statusCode] = new MovingAverage(this.interval);
		this.statuses[chunk.statusCode] = 0;
	}

	this.statuses[chunk.statusCode]++;
	this.requests++;
};

AppRates.prototype.updateAverages = function updateAverages()
{
	if (this.requests === 0) return;
	var now = Date.now();

	this.requestRate.push(now, this.requests);

	var codes = Object.keys(this.averages);
	for (var i = 0; i < codes.length; i++)
	{
		var code = codes[i];
		this.averages[code].push(now, this.statuses[code]);
		this.statuses[code] = 0;
	}

	this.requests = 0;
};
