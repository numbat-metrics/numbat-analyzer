var
    EchoRule  = require('../lib/rules/echo.js'),
    Heartbeat = require('../lib/rules/heartbeat.js')
    ;

var rules = [];

rules.push(new EchoRule());
rules.push(new Heartbeat());

module.exports = rules;
