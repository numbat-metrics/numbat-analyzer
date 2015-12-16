/*global describe:true, it:true, before:true, after:true, beforeEach: true, afterEach:true */
'use strict';

var
	demand = require('must'),
	sinon = require('sinon'),
	stream = require('stream'),
	Rules  = require('../index').rules
	;

describe('echo', function()
{
	it('echo rule can be constructed', function()
	{
		Rules.Echo.must.be.a.function();
		var echo = new Rules.Echo();
		echo.must.be.instanceof(stream.Writable);
	});

	it('makes a logger', function()
	{
		var echo = new Rules.Echo();
		echo.must.have.property('logger');
		echo.logger.info.must.be.a.function();
	});

	it('the logger is invoked on write', function(done)
	{
		var echo = new Rules.Echo();
		var spy = sinon.spy(echo.logger, 'info');

		echo.write({name: 'test', value: 4}, function(err)
		{
			demand(err).not.exist();
			spy.calledOnce.must.be.true();
			done();
		});
	});
});

describe('heartbeat', function()
{
	it('has tests');

	it('can be constructed', function()
	{
		Rules.Heartbeat.must.be.a.function();
		var heartbeat = new Rules.Heartbeat();
		heartbeat.must.be.instanceof(stream.Duplex);
	});
});

describe('load-average', function()
{
	it('has tests');

	it('can be constructed', function()
	{
		Rules.Loadaverage.must.be.a.function();
		var lav = new Rules.Loadaverage();
		lav.must.be.instanceof(stream.Duplex);
	});
});

describe('memory', function()
{
	it('has tests');

	it('can be constructed', function()
	{
		Rules.Memory.must.be.a.function();
		var memory = new Rules.Memory();
		memory.must.be.instanceof(stream.Duplex);
	});
});
