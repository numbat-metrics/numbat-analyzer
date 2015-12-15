#!/usr/bin/env node

var
	Analyzer     = require('../index').Analyzer,
	bole         = require('bole'),
	path         = require('path')
	;

var config = require(path.resolve(process.argv[2]));

var opts = config.logging || {};
var outputs = [];
var level = opts.level || 'info';

if (!opts.silent)
{
	if (process.env.NODE_ENV === 'dev')
	{
		var prettystream = require('bistre')();
		prettystream.pipe(process.stdout);
		outputs.push({ level:  'debug', stream: prettystream });
	}
	else
		outputs.push({level: level, stream: process.stdout});
}

bole.output(outputs);
config.log = bole(opts.name || 'analyzer');

var server = new Analyzer(config);
server.listen();
