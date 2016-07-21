/*global describe:true, it:true, before:true, after:true, beforeEach: true, afterEach:true */
'use strict';

var
	demand = require('must'),
	sinon = require('sinon'),
	stream = require('stream'),
	Rates  = require('../lib/rules/status-rates')
	;

describe('status rates', function()
{
	var rateChecker = new Rates({ interval: 250, rateAllowed: 0.5 });

	it('can be constructed', function()
	{
		Rates.must.be.a.function();
		var checker = new Rates();
		checker.must.be.instanceof(stream.Duplex);
	});

	it('respects its options', function()
	{
		var checker = new Rates({ interval: 1000, rateAllowed: 0.5 });
		checker.interval.must.equal(1000);
		checker.rateAllowed.must.equal(0.5);

		checker = new Rates();
		checker.interval.must.equal(300000);
		checker.rateAllowed.must.equal(0.1);
	});

	it('throws if you try to set a rate over 1', function()
	{
		function shouldThrow()
		{
			return new Rates({ interval: 1000, rateAllowed: 5 });
		}

		shouldThrow.must.throw(/rate/);
	});

	it('makes an app rate object for each app mentioned in a response metric', function(done)
	{
		var metric = { name: 'app.response', statusCode: 500 };
		rateChecker.write(metric, function()
		{
			rateChecker.apps.must.have.property('app');
			rateChecker.apps.app.must.be.instanceof(Rates.AppRates);
			rateChecker.apps.app.interval.must.equal(rateChecker.interval);

			rateChecker.write({ name: 'app2.response', statusCode: 200}, function()
			{
				rateChecker.apps.must.have.property('app2');
				rateChecker.apps.app2.must.be.instanceof(Rates.AppRates);
				done();
			});
		});
	});

	it('calls checkRates on a timer', function(done)
	{
		this.timeout(4000);
		var spy = sinon.spy(rateChecker, 'checkRates');
		setTimeout(function()
		{
			spy.called.must.be.true();
			spy.calledWith('app').must.be.true();
			spy.restore();
			done();
		}, 500);
	});

	it('writes an alert when the rate exceeds the allowed rate', function(done)
	{
		this.timeout(4000);

		for (var i = 0; i < 10; i++)
			rateChecker.write({ name: 'app.response', statusCode: 500});

		rateChecker.write({ name: 'app.response', statusCode: 500}, function()
		{
			setTimeout(function()
			{
				var alert = rateChecker.read();
				alert.must.be.an.object();
				alert.name.must.equal('status-code-rates.app');
				alert.must.have.property('statusCode');
				alert.statusCode.must.equal('500');
				alert.must.have.property('status');
				alert.status.must.match(/critical|warning/);
				alert.must.have.property('value');
				done();
			}, 500);
		});
	});

	it('revokes the alert when the rate falls below the allowed rate', function(done)
	{
		this.timeout(5000);

		for (var i = 0; i < 50; i++)
			rateChecker.write({ name: 'app.response', statusCode: 200});

		setTimeout(function()
		{
			var next, alert;
			while (next = rateChecker.read())
				alert = next;

			alert.must.be.an.object();
			alert.must.have.property('statusCode');
			alert.statusCode.must.equal('500');
			alert.must.have.property('status');
			alert.status.must.equal('ok');
			alert.must.have.property('value');
			alert.value.must.be.below(0.5);
			done();
		}, 500);
	});

});
