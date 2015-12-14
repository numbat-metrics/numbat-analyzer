// simple echo action

var
	stream       = require('stream'),
	util         = require('util')
	;

var EchoRule = module.exports = function EchoRule()
{
	stream.Writable.call(this, { objectMode: true });

};
util.inherits(EchoRule, stream.Writable);

EchoRule.prototype._write = function _write(event, encoding, callback)
{
	console.log(event);
	callback();
};
