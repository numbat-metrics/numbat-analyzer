var util = require('util');
var Duplex = require('stream').Duplex;

var Memory = module.exports = function Memory(options)
{
	options = options || {};
	this.warn = options.warn || 0.75;
	this.critical = options.critical || 0.9;
	Duplex.call(this, { objectMode: true });
};
util.inherits(Memory, Duplex);

Memory.prototype._write = function(chunk, _, cb)
{
	if (chunk.name !== 'memory') return cb();

	var memoryUsed = (chunk.value * 100).toFixed(2) + ' %';
	var message = 'Memory usage (' + memoryUsed + ' memory used) ' +
		'on host ' + chunk.host;

	if (chunk.value > this.critical)
	{
		this.push({
			name: 'memory',
			host: chunk.host,
			message: message,
			status: 'critical',
			value: memoryUsed
		});
	}
	else if (chunk.value > this.warn)
	{
		this.push({
			name: 'memory',
			host: chunk.host,
			message: message,
			status: 'warning',
			value: memoryUsed
		});
	}
	else
	{
		this.push({
			name: 'memory',
			host: chunk.host,
			status: 'ok'
		});
	}

	cb();
};

Memory.prototype._read = function() {};
