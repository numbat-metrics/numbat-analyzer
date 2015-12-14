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
	this.heartbeats = {};
	this.log = bole('heartbeat');
};
util.inherits(Heartbeat, stream.Writable);

Heartbeat.prototype.pool = null;
Heartbeat.prototype.heartbeats = null;

Heartbeat.prototype._getHeartbeatName = function(event)
{
	var split = event.name.split('.');
	return [event.host].concat(split.slice(0, split.length - 1)).join('.');
};

Heartbeat.prototype._write = function _write(event, encoding, callback)
{
	var split = event.name.split('.');
	var name = split[split.length - 1];

	switch (name)
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
	var heartbeatName = this._getHeartbeatName(event);

	this.pool.add(heartbeatName, event.ttl);

	if (this.heartbeats[heartbeatName])
	{
		this.pool.ping(heartbeatName, event.ttl);
		this.heartbeats[heartbeatName].skipped = 0;
	}
	else
	{
		this.log.info('now tracking heartbeats for ' + heartbeatName);
		this.heartbeats[heartbeatName] = event;
		event.skipped = 0;
	}

	callback();
};

Heartbeat.prototype.handleShutdown = function handleShutdown(event, callback)
{
	var heartbeatName = this._getHeartbeatName(event);
	this.pool.remove(heartbeatName);
	delete this.heartbeats[heartbeatName];
	this.log.info('graceful shutdown for ' + heartbeatName);

	callback();
};

Heartbeat.prototype.handleExpire = function handleExpire(heartbeatName, explicit)
{
	if (explicit) return;

	var record = this.heartbeats[heartbeatName];
	record.skipped++;

	if (record.skipped > WARN_THRESHOLD)
	{
		this.log.warn(heartbeatName + ' heartbeat not heard for ' + record.skipped + ' beats!');
	}
};
