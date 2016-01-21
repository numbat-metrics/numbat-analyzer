var util = require('util');
var Duplex = require('stream').Duplex;

var LoadAverage = module.exports = function LoadAverage(options) {
    this.warn = options.warn;
    this.critical = options.critical;

    Duplex.call(this, { objectMode: true });
};
util.inherits(LoadAverage, Duplex);

LoadAverage.prototype._write = function(chunk, _, cb) {
    var split = chunk.name.split('.');
    if (split[0] !== 'load-average') return cb();

    var period = parseInt(split[1], 10);
    if (!this.warn[period] || !this.critical[period]) return cb();

    var nprocs = (chunk.meta && chunk.meta.nprocs) || 1;
    var host = chunk.host;
    var value = chunk.value.toFixed(2) + '/' + nprocs + ' CPUs';

    var message = period + ' minute load average (' + value + ') on host ' + host;

    var criticalTreshold = (this.critical[host] && this.critical[host][period]) ||
        this.critical[period];

    var warnTreshold = (this.warn[host] && this.warn[host][period]) ||
        this.warn[period];

    if (chunk.value > criticalTreshold * nprocs)
    {
        this.push(
        {
            name: chunk.name,
            host: chunk.host,
            message: message,
            status: 'critical',
            value: value
        });
    }
    else if (chunk.value > warnTreshold * nprocs)
    {
        this.push(
        {
            name: chunk.name,
            host: chunk.host,
            message: message,
            status: 'warning',
            value: value
        });
    }
    else
    {
        this.push(
        {
            name: chunk.name,
            host: chunk.host,
            status: 'ok'
        });
    }

    cb();
};

LoadAverage.prototype._read = function(){};
