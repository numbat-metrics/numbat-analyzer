var
    EchoRule  = require('../lib/rules/echo.js'),
    Heartbeat = require('../lib/rules/heartbeat.js'),
    LoadAverage = require('../lib/rules/load-average.js')
    ;

var rules = [];

rules.push(new EchoRule());
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

module.exports = rules;
