var
    _          = require('lodash'),
    util       = require('util'),
    assert     = require('assert'),
    Collector  = require('numbat-collector');
    ;

var Analyzer = module.exports = function Analyzer(opts)
{
    Collector.call(this, opts);

    this.activeRules = [];

    if (opts.rules && Array.isArray(opts.rules))
    {
        for (var i = 0; i < opts.rules.length; i++)
            this.addRule(opts.rules[i]);
    }

    if (opts.outputs && Array.isArray(opts.outputs))
    {
        this.outputs = opts.outputs;
    }
};
// Usually one would create an instance of Collector and use the `.sink` property,
// but this is easier due to the size of Analyzer.
util.inherits(Analyzer, Collector);

Analyzer.prototype.activeRules = [];

Analyzer.prototype.addRule = function addRule(rule)
{
    this.activeRules.push(rule);
    this.sink.pipe(rule);
    this.outputs.forEach(function(output) { rule.pipe(output); });
};

Analyzer.prototype.removeRule = function removeRule(rule)
{
    _.pull(this.activeRules, rule);
    this.sink.unpipe(rule);
    this.outputs.forEach(function(output) { rule.unpipe(output); });
};
};
