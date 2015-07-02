/*
    On first heartbeat, add host to list.
    Periodically sweep to expire.
    On missing host, fire alert.

{
    name: 'heartbeat',
    ttl: 16000,
    host: 'example-1',
    time: 1401651649819
}

*/


var
    _       = require('lodash'),
    assert  = require('assert'),
    bole    = require('bole'),
    stream  = require('stream'),
    TTLPool = require('ttl-pool'),
    util    = require('util')
    ;

var WARN_THRESHOLD = 0;

var Heartbeat = module.exports = function Heartbeat()
{
    stream.Writable.call(this, { objectMode: true });

    this.pool = TTLPool(this.handleExpire.bind(this));
    this.hosts = {};
    this.log = bole('heartbeat');
};
util.inherits(Heartbeat, stream.Writable);

Heartbeat.prototype.pool = null;
Heartbeat.prototype.hosts = null;

Heartbeat.prototype._write = function _write(event, encoding, callback)
{
    switch (event.name)
    {
    case 'heartbeat':
        return this.handleHeartbeat(event, callback);

    case 'shutdown':
        return this.handleShutdown(event, callback);
    }

    callback();
};

Heartbeat.prototype.handleHeartbeat = function handleHeartbeat(event, callback)
{
    // This one's fun.
    // If host skips a beat (for example, a temporary freeze), `TTLPool` will
    // remove it from its internal dictionary. That would be fine, if
    // `TTLPool#ping` implicitely added it back, but it doesn't. Thus, we
    // call both `TTLPool#ping` and `TTLPool#add` in order to make sure that
    // the entry is actually in there.
    this.pool.add(event.host, event.ttl);

    if (this.hosts[event.host])
    {
        this.pool.ping(event.host, event.ttl);
        this.hosts[event.host].skipped = 0;
    }
    else
    {
        this.log.info('now tracking heartbeats for ' + event.host);
        this.hosts[event.host] = event;
        event.skipped = 0;
    }

    callback();
};

Heartbeat.prototype.handleShutdown = function handleShutdown(event, callback)
{
    this.pool.remove(event.host);
    delete this.hosts[event.host];
    this.log.info('graceful shutdown for ' + event.host);

    callback();
};

Heartbeat.prototype.handleExpire = function handleExpire(host, explicit)
{
    if (explicit) return;

    var record = this.hosts[host];
    record.skipped++;

    if (record.skipped > WARN_THRESHOLD)
    {
        this.log.warn(host + ' heartbeat not heard for ' + record.skipped + ' beats!');
        setTimeout(this.handleExpire.bind(this, host), record.ttl);
    }
};
