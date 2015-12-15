var
	util = require('util'),
	Writable = require('stream').Writable
	;

var Memory = module.exports = function Memory(options)
{
	options = options || {};
	this.warn = options.warn || 0.75;
	this.critical = options.critical || 0.9;

	Writable.call(this, { objectMode: true });
};
util.inherits(Memory, Writable);

Memory.prototype._write = function _write(chunk, _, cb)
{
	if (chunk.name !== 'memory') return cb();

	if (chunk.value > this.critical)
	{
		console.log('CRITICAL MEMORY', chunk);
	}
	else if (chunk.value > this.warn)
	{
		console.log('WARNING MEMORY', chunk);
	}

	cb();
};
