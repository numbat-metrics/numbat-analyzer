var util = require('util');
var Duplex = require('stream').Duplex;

var LoadAverage = module.exports = function LoadAverage(options)
{
	options = options || {};
	this.warn = options.warn;
	this.critical = options.critical;

	Duplex.call(this, { objectMode: true });
};
util.inherits(LoadAverage, Duplex);

LoadAverage.prototype._write = function _write(chunk, _, cb)
{
	var split = chunk.name.split('.');
	if (split[0] !== 'load-average') return cb();

	var period = parseInt(split[1], 10);
	if (!this.warn[period] || !this.critical[period])
		return cb();

	var nprocs = chunk.meta.nprocs;
	var value = chunk.value.toFixed(2) + '/' + nprocs + ' CPUs';

	var message = period + ' minute load average (' + value + ') on host ' + chunk.host;

	var incidentId = chunk.host + '.load-average';

	if (chunk.value > this.critical[period] * nprocs)
	{
		this.push({
			id: incidentId,
			name: chunk.name,
			host: chunk.host,
			message: message,
			status: 'critical',
			value: value
		});
	}
	else if (chunk.value > this.warn[period] * nprocs)
	{
		this.push({
			id: incidentId,
			name: chunk.name,
			host: chunk.host,
			message: message,
			status: 'warning',
			value: value
		});
	}

	cb();
};

LoadAverage.prototype._read = function() {};
