#!/usr/bin/env node

var
	Analyzer     = require('../index').Analyzer,
	createLogger = require('../lib/logging'),
	path         = require('path')
	;

var config = require(path.resolve(process.argv[2]));
config.log = createLogger(config.logging);

var server = new Analyzer(config);
server.listen();
