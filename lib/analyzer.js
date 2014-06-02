var
    _          = require('lodash'),
    assert     = require('assert'),
    JSONStream = require('json-stream'),
    stream     = require('stream'),
    net        = require('net')
    ;

var Analyzer = module.exports = function Analyzer(opts)
{
    assert(opts && _.isObject(opts), 'you must pass an options object');
    assert(opts.incoming && _.isObject(opts.incoming), 'you must pass a host/port object in `incoming`');
    assert(opts.web && _.isObject(opts.web), 'you must pass a host/port object in `web`');
    assert(opts.log, 'you must pass a bunyan logger in `opts.log`');

    this.options = opts;
    this.log = opts.log;

    this.incoming = net.createServer(this.onConnection.bind(this));

    this.activeRules = [];
    this.sink = new stream.PassThrough({ objectMode: true });

    if (opts.rules && Array.isArray(opts.rules))
    {
        for (var i = 0; i < opts.rules.length; i++)
            this.addRule(opts.rules[i]);
    }

    // TODO
};

Analyzer.prototype.incoming    = null;
Analyzer.prototype.activeRules = [];
Analyzer.prototype.options     = null;
Analyzer.prototype.log         = null;
Analyzer.prototype.sink        = null;

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
    // TODO
    // unpipe, close socket, etc
    this.incoming.close(function()
    {
        if (callback) callback();
    }.bind(this));

};

Analyzer.prototype.onConnection = function onConnection(socket)
{
    // TODO
    var transform;
    var transformer = function(chunk)
    {
        if (transform) return;

        transform = new JSONStream();
        transform.pipe(this.sink);
        transform.write(chunk);
        socket.pipe(transform);
    }.bind(this);

    socket.on('end', function()
    {
        if (transform)
        {
            socket.unpipe(transform);
            transform.unpipe();
            transform = null;
        }
    });

    socket.on('data', transformer);
    socket.on('close', function onCloseSocket()
    {
        // TODO
    }.bind(this));
};


Analyzer.prototype.addRule = function addRule(rule)
{
    this.activeRules.push(rule);
    this.sink.pipe(rule);
};

Analyzer.prototype.removeRule = function removeRule(rule)
{
    _.pull(this.activeRules, rule);
    this.sink.unpipe(rule);
};
