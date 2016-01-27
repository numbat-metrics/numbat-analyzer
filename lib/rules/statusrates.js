var
	MovingAverage = require('moving-average'),
	util          = require('util'),
	Duplex        = require('stream').Duplex
	;

var AVERAGE_INTERVAL = 5 * 60 * 1000; // 5 minutes

var StatusCodeRates = module.exports = function StatusCodeRates(options)
{
	options = options || {};
	this.rateAllowed = options.rateAllowed || 0.1;
	this.alerts = {};
	this.apps = {};

	Duplex.call(this, { objectMode: true });
};
util.inherits(StatusCodeRates, Duplex);

StatusCodeRates.prototype.matcher = new RegExp('^(.*)\.response');
StatusCodeRates.prototype.rateAllowed = null;
StatusCodeRates.prototype.alerts = null;
StatusCodeRates.prototype.app = null;

StatusCodeRates.prototype.resolve = function resolve(app, host, code, rate)
{
	this.push({
		name:       'status-code-rates.' + app,
		statusCode: code,
		host:       host,
		status:     'ok',
		value:      rate
	});
	delete this.alerts[code];
};

StatusCodeRates.prototype._write = function(chunk, _, callback)
{
	if (!chunk.statusCode) return callback();

	var matches = chunk.name.match(this.matcher);
	if (!matches) return callback();

	var app = matches[1];

	if (!this.apps[app])
		this.apps[app] = new AppRates(app);
	var service = this.apps[app];

	service.recordRequest(chunk);

	callback();
};

StatusCodeRates.prototype.checkRates = function checkRates(appname)
{
	var service = this.apps[appname];
	var requests = service.requestRate.movingAverage();

	var codes = Object.keys(service.movingAverages);
	for (var i = 0; i < codes.length; i++)
	{
		var code = codes[i];
		if (code === 200) continue; // we want these :)
		var average = service.movingAverages[code].movingAverage();

		if ((average / requests) > this.rateAllowed)
		{
			// TODO create alert
		}
	}
};

StatusCodeRates.prototype._read = function() {};

var AppRates = function AppRates(name)
{
	this.name = name;
	this.averages = {};
	this.requestRate = new MovingAverage(AVERAGE_INTERVAL);
	this.timer = setInterval(this.updateAverages.bind(this), AVERAGE_INTERVAL / 10);

	this.requests = 0;
	this.statuses = {};
};

AppRates.prototype.name        = null;
AppRates.prototype.averages    = null;
AppRates.prototype.requestRate = null;
AppRates.prototype.timer       = null;
AppRates.prototype.requests    = 0;
AppRates.prototype.statuses    = {};

AppRates.prototype.recordRequest = function recordRequest(chunk)
{
	if (!this.movingAverages[chunk.statusCode])
	{
		this.movingAverages[chunk.statusCode] = new MovingAverage(AVERAGE_INTERVAL);
		this.status[chunk.statusCode] = 0;
	}

	this.status[chunk.statusCode]++;
	this.requests++;
};

AppRates.prototype.updateAverages = function updateAverages(chunk)
{
	var now = Date.now();

	this.requestRate.push(now, this.requests);
	this.requests = 0;

	var codes = Object.keys(this.movingAverages);
	for (var i = 0; i < codes.length; i++)
	{
		var code = codes[i];
		this.movingAverages[code].push(now, this.statuses[code]);
		this.statuses[code] = 0;
	}
};
