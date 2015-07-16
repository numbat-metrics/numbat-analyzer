var util = require('util');
var Writable = require('stream').Writable;

var LoadAverage = module.exports = function LoadAverage(options) {
  this.warn = options.warn;
  this.critical = options.critical;

  Writable.call(this, { objectMode: true });
};
util.inherits(LoadAverage, Writable);

LoadAverage.prototype._write = function(chunk, _, cb) {
  var split = chunk.name.split('.');
  if (split[0] !== 'load-average') return cb();

  var period = parseInt(split[1], 10);
  if (!this.warn[period] || !this.critical[period]) return cb();

  var nprocs = chunk.meta.nprocs;

  if (chunk.value > this.critical[period] * nprocs)
    console.log('CRITICAL LOAD', chunk);
  else if (chunk.value > this.warn[period] * nprocs)
    console.log('WARNING LOAD', chunk);

  cb();
};
