/*global describe:true, it:true, before:true, after:true, beforeEach: true, afterEach:true */
'use strict';

var
	_       = require('lodash'),
	demand  = require('must'),
	PD      = require('../lib/outputs/pagerduty'),
	redis   = require('redis'),
	sinon   = require('sinon'),
	trigger = require('pagerduty-trigger')
	;

describe('pager duty output', function()
{
	var pdOutput, savedPDKey, savedPDService;
	var incidentID;

	var alert = {
		id: 'localhost.testmetric',
		status: 'warning',
		name: 'testmetric',
		value: 9001,
		message: 'this is quite bad'
	};

	before(function()
	{
		savedPDService = process.env.PAGER_DUTY_SERVICE;
		process.env.PAGER_DUTY_SERVICE = 'e93facc04764012d7bfb002500d5d1a6';

		savedPDKey = process.env.PAGER_DUTY_API_KEY;
		process.env.PAGER_DUTY_API_KEY = 'e93facc04764012d7bfb002500d5d1a6'
	});

	it('can be constructed', function()
	{
		pdOutput = new PD({ redis: redis.createClient()});
	});

	it('calls trigger() to create a pagerduty alert on new incidents', function(done)
	{
		var spy = sinon.spy(pdOutput.logger, 'info');
		var redisSpy = sinon.spy(pdOutput.redis, 'set');

		pdOutput.write(alert, function(err)
		{
			demand(err).not.exist();
			redisSpy.called.must.be.true();
			redisSpy.restore();
			spy.calledOnce.must.be.true();
			spy.args[0][0].must.match(/triggered alert/);
			spy.restore();
			done();
		});
	});

	it('stores the pd incident key in redis for later lookup', function(done)
	{
		pdOutput.redis.get('incident:localhost.testmetric', function(err, result)
		{
			demand(err).not.exist();
			result.must.be.a.string();
			incidentID = result;
			done();
		});
	});

	it('resolves an alert once status has moved to okay', function(done)
	{
		var resolved = _.clone(alert);
		resolved.status = 'ok';

		var spy = sinon.spy(pdOutput, 'handleResolve');
		var redisSpy = sinon.spy(pdOutput.redis, 'del');

		pdOutput.write(resolved, function(err)
		{
			demand(err).not.exist();
			spy.called.must.be.true();
			spy.restore();
			redisSpy.called.must.be.true();
			redisSpy.calledWith('incident:localhost.testmetric').must.be.true();
			redisSpy.restore();
			done();
		});
	});

	it('removes the key from redis once resolved', function(done)
	{
		pdOutput.redis.get('incident:localhost.testmetric', function(err, result)
		{
			demand(err).not.exist();
			demand(result).not.exist();
			done();
		});
	});

	after(function()
	{
		process.env.PAGER_DUTY_SERVICE = savedPDService;
		process.env.PAGER_DUTY_API_KEY = savedPDKey;
	});
});
