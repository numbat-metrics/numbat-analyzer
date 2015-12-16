var
	util = require('util'),
	stream = require('stream')
	;

var Console = module.exports = function Console()
{
	stream.Writable.call(this, { objectMode: true });
};
util.inherits(Console, stream.Writable);

Console.prototype._write = function(chunk, encoding, cb)
{
	console.log(JSON.stringify(chunk, null, 2));
	cb();
};
