var
    Heartbeat = require('../lib/rules/heartbeat.js'),
    LoadAverage = require('../lib/rules/load-average.js'),
    Memory = require('../lib/rules/memory.js')
    ;

var rules = [];

rules.push(new Heartbeat());
rules.push(new LoadAverage({
    warn: {
        1: 1.5,
        5: 0.9,
        15: 0.7
    },
    critical: {
        1: 1.5,
        5: 1.5,
        15: 1.5
    }
}));
rules.push(new Memory({
    warn: 0.7,
    critical: 0.9
}));

module.exports = rules;
