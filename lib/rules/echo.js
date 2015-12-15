// simple echo action

var
	bole   = require('bole'),
	stream = require('stream'),
	util   = require('util')
	;

var EchoRule = module.exports = function EchoRule()
{
	stream.Writable.call(this, { objectMode: true });
	this.logger = bole('echo');
};
util.inherits(EchoRule, stream.Writable);

EchoRule.prototype._write = function _write(event, encoding, callback)
{
	this.logger.info('event', event);
	callback();
};
