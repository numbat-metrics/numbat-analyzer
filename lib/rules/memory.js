var util = require('util');
var Duplex = require('stream').Duplex;

var Memory = module.exports = function Memory(options) {
  this.warn = options.warn;
  this.critical = options.critical;

  Duplex.call(this, { objectMode: true });
};
util.inherits(Memory, Duplex);

Memory.prototype._write = function(chunk, _, cb) {
  if (chunk.name !== 'memory') return cb();

  var message = 'Memory usage (' + (chunk.value * 100).toFixed(2) + ' % memory used) ' +
    'on host ' + chunk.host;

  if (chunk.value > this.critical) {
    this.push(
    {
        host: chunk.host,
        message: message,
        status: 'critical'
    });
  }
  else if (chunk.value > this.warn) {
    this.push(
    {
        host: chunk.host,
        message: message,
        status: 'warning'
    });
  }

  cb();
};

Memory.prototype._read = function(){};
