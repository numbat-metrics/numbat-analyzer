var util = require('util');
var Duplex = require('stream').Duplex;

var Memory = module.exports = function Memory(options)
{
	options = options || {};
	Duplex.call(this, { objectMode: true });
};
util.inherits(Memory, Duplex);

Memory.prototype._write = function(chunk, _, cb)
{
	if (chunk.name !== 'reachability') return cb();

	if (chunk.value === 0) {
		this.push({
			id: 'reachability.' + chunk.host + '.' + chunk.target,
			name: 'reachability',
			host: chunk.host,
			message: chunk.host + ' cannot reach ' + chunk.target,
			status: 'critical'
		});
	}
	else {
		this.push({
			id: 'reachability.' + chunk.host + '.' + chunk.target,
			name: 'reachability',
			host: chunk.host,
			status: 'ok'
		});
	}

	cb();
};

Memory.prototype._read = function() {};
