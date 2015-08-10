var util = require('util');
var Duplex = require('stream').Duplex;

var MESSAGE = 'Memory usage';

var Memory = module.exports = function Memory(options) {
  this.warn = options.warn;
  this.critical = options.critical;

  Duplex.call(this, { objectMode: true });
};
util.inherits(Memory, Duplex);

Memory.prototype._write = function(chunk, _, cb) {
  if (chunk.name !== 'memory') return cb();

  if (chunk.value > this.critical) {
    this.push(
    {
        host: chunk.host,
        message: MESSAGE,
        status: 'critical'
    });
  }
  else if (chunk.value > this.warn) {
    this.push(
    {
        host: chunk.host,
        message: MESSAGE,
        status: 'warning'
    });
  }

  cb();
};

Memory.prototype._read = function(){};
