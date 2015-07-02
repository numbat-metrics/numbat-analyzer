var Analyzer = require('../');

var analyzer = new Analyzer(
{
    listen: { host: 'localhost', port: 3337 },
    rules: require('./ruleset')
});

require('bole').output(
{
    level: 'debug',
    stream: process.stderr
});

analyzer.listen();
