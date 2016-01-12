var
	bole    = require('bole'),
	util    = require('util'),
	stream  = require('stream'),
	trigger = require('pagerduty-trigger'),
	resolve = trigger.resolve
	;

var PagerDuty = module.exports = function PagerDuty(options)
{
	stream.Writable.call(this, { objectMode: true });

	if (options.redis) this.redis = options.redis;
	this.logger = bole('pagerduty');
};
util.inherits(PagerDuty, stream.Writable);

PagerDuty.prototype.redis = null;

PagerDuty.prototype._write = function _write(event, encoding, callback)
{
	// event is an alert-able incident
	// if status == ok, then we look up the PD incident in our map & we resolve it.
	// if status is anything else, we create a PD incident & record the ID in redis

	if (!event.status)
		return callback();

	if (event.status === 'ok' || event.status === 'okay')
		this.handleResolve(event, callback);

	this.handleAlert(event, callback);
};

PagerDuty.prototype.handleResolve = function handleResolve(incident, callback)
{
	var self = this;
	var rkey = 'incident:' + incident.id;

	self.redis.get(rkey, function(err, key)
	{
		if (err)
		{
			self.logger.error('cannot resolve alert ' + incident.id + '; error talking to redis: ');
			self.logger.error(err);
			return callback();
		}
		if (!key)
		{
			self.logger.warn('cannot find pager duty incident key for ' + incident.id);
			return callback();
		}

		self.logger.info('resolving alert ' + key);
		resolve(key, function(err, response)
		{
			if (err)
			{
				self.logger.error('error talking to pagerduty: ');
				self.logger.error(err);
			}
			self.redis.del(rkey, function(err)
			{
				if (err)
				{
					self.logger.error('error talking to redis: ');
					self.logger.error(err);
				}
				callback();
			});
		});
	});
};

PagerDuty.prototype.handleAlert = function handleAlert(incident, callback)
{
	var self = this;

	var alert = {
		description: incident.message,
		details: incident
	};

	trigger.alert(alert, function(err, key)
	{
		if (err)
		{
			self.logger.error('error talking to pagerduty: ');
			self.logger.error(err);
			return callback();
		}

		self.logger.info('triggered alert ' + key);

		self.redis.set('incident:' + incident.id, key, function(err, result)
		{
			if (err)
			{
				self.logger.error('error talking to redis: ');
				self.logger.error(err);
			}
			callback();
		});
	});
};
