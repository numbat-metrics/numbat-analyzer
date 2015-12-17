#!/usr/bin/env node

var
	_        = require('lodash'),
	Analyzer = require('../index').Analyzer,
	assert   = require('assert'),
	bole     = require('bole'),
	path     = require('path'),
	argv     = require('yargs')
		.option('l', {
			alias: 'listen',
			default: '0.0.0.0:3337',
			description: 'host:port pair to listen on'
		})
		.option('silent', {
			description: 'silence analyzer-specific logging',
			type: 'boolean',
			default: false
		})
		.version(function() { return require('../package').version; })
		.describe('version', 'show version information')
		.alias('h', 'help')
		.help('help')
		.usage('Usage: $0 --listen localhost:3333 config.json')
		.showHelpOnFail(true)
		.demand(1)
		.argv
	;

// set up logging
if (!argv.silent)
{
	if (process.env.NODE_ENV === 'dev')
	{
		var prettystream = require('bistre')({time: true});
		prettystream.pipe(process.stdout);
		bole.output({ level: 'debug', stream: prettystream });
	}
	else
		bole.output({level: 'info', stream: process.stdout});
}
var logger = bole('config');

var config = require(path.resolve(process.cwd(), argv._[0]));
assert(config.rules, 'You must provide a rule set in the `rules` section of your config.');

var pair = argv.listen.split(':');
var runoptions = {
	listen: {
		host: pair[0],
		port: pair[1]
	},
	rules: [],
	outputs: []
};

// Now we attempt to load the requested modules & yell if we can't.
_.each(config.rules, function(config, name)
{
	var item = construct('rules', name, config);
	if (item)
	{
		runoptions.rules.push(item);
		logger.info('configured rule ' + name);
	}
	else
		logger.warn('could not load rule ' + name);
});

_.each(config.outputs, function(config, name)
{
	var item = construct('outputs', name, config);
	if (item)
	{
		runoptions.outputs.push(item);
		logger.info('configured output ' + name);
	}
	else
		logger.warn('could not load output ' + name);
});

function construct(type, name, config)
{
	var Item;

	try { Item = require('../lib/' + type + '/' + name); }
	catch (ex) { }

	if (!Item)
	{
		try { Item = require(name); }
		catch (ex) { }
	}

	if (Item)
		return new Item(config);
}

var server = new Analyzer(runoptions);
server.listen();
