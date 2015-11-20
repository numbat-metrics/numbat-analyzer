var
    Slack = require('../lib/outputs/slack.js'),
    Console = require('../lib/outputs/console.js')
    ;

var outputs = [];
outputs.push(new Console());

module.exports = outputs;
