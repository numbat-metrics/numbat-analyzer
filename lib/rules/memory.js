var util = require('util');
var Writable = require('stream').Writable;

var Memory = module.exports = function Memory(options) {
  this.warn = options.warn;
  this.critical = options.critical;

  Writable.call(this, { objectMode: true });
};
util.inherits(Memory, Writable);

Memory.prototype._write = function(chunk, _, cb) {
  if (chunk.name !== 'memory') return cb();

  if (chunk.metric > this.critical) {
    console.log('CRITICAL MEMORY', chunk);
  }
  else if (chunk.metric > this.warn) {
    console.log('WARNING MEMORY', chunk);
  }

  cb();
};
