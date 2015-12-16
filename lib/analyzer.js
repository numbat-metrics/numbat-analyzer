var
	_          = require('lodash'),
	assert     = require('assert'),
	JSONStream = require('json-stream'),
	stream     = require('stream'),
	net        = require('net'),
	IncidentManager = require('./incident-manager')
	;

var Analyzer = module.exports = function Analyzer(opts)
{
	assert(opts && _.isObject(opts), 'you must pass an options object');
	assert(opts.incoming && _.isObject(opts.incoming), 'you must pass a host/port object in `incoming`');
	assert(opts.log, 'you must pass a bunyan logger in `opts.log`');

	this.options = opts;
	this.log = opts.log;

	this.incoming = net.createServer(this.onConnection.bind(this));

	this.activeRules = [];
	this.activeOutputs = [];

	this.sink = new stream.PassThrough({ objectMode: true });
	this.sunk = new IncidentManager({ ttl: opts.incidentTtl });

	if (opts.rules && Array.isArray(opts.rules))
	{
		for (var i = 0; i < opts.rules.length; i++)
			this.addRule(opts.rules[i]);
	}

	if (opts.outputs && Array.isArray(opts.outputs))
		opts.outputs.forEach(this.addOutput, this);
};

Analyzer.prototype.incoming    = null;
Analyzer.prototype.activeRules = [];
Analyzer.prototype.activeOutputs = [];
Analyzer.prototype.options     = null;
Analyzer.prototype.log         = null;
Analyzer.prototype.sink        = null;
Analyzer.prototype.sunk        = null;

Analyzer.prototype.listen = function listen()
{
	var opts = this.options.incoming;
	this.incoming.listen(opts.port, opts.host, function()
	{
		this.log.info('analyzer listening for metrics @ ' + opts.host + ':' + opts.port);
	}.bind(this));

};

Analyzer.prototype.destroy = function destroy(callback)
{
	this.incoming.close(function()
	{
		// TODO
		// unpipe, close socket, etc
		if (callback) callback();
	});
};

Analyzer.prototype.onConnection = function onConnection(socket)
{
	var self = this;
	var address = socket.address();
	this.log.info('new tcp connection', { socket:  address });

	var transform = new JSONStream();
	socket.pipe(transform, { end: false }).pipe(this.sink, { end: false });

	socket.on('end', function()
	{
		transform.unpipe(self.sink);
		self.log.info('tcp connection ending', { socket: address });
	});
};

Analyzer.prototype.addRule = function addRule(rule)
{
	this.activeRules.push(rule);
	this.sink.pipe(rule);
	if (rule.readable) rule.pipe(this.sunk);
};

Analyzer.prototype.removeRule = function removeRule(rule)
{
	_.pull(this.activeRules, rule);
	this.sink.unpipe(rule);
	if (rule.readable) rule.unpipe(this.sunk);
};

Analyzer.prototype.addOutput = function addOutput(output)
{
	this.activeOutputs.push(output);
	this.sunk.pipe(output);
};

Analyzer.prototype.removeOutput = function removeOutput(output)
{
	_.pull(this.activeOutputs, output);
	this.sunk.unpipe(output);
};
