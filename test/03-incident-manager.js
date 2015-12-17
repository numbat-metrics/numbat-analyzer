/*global describe:true, it:true, before:true, after:true, beforeEach: true, afterEach:true */
'use strict';

var
	demand = require('must'),
	IncidentManager = require('../lib/incident-manager')
	;

describe('incident manager', function()
{
	var incidentManager;

	function ping()
	{
		incidentManager.write({
			host: 'test',
			name: 'heartbeat',
			status: 'critical'
		});
	}

	before(function()
	{
		incidentManager = new IncidentManager({ ttl: 100 });
	});

	it('can read an incident from it', function(done)
	{
		incidentManager.once('readable', function()
		{
			var incident = incidentManager.read();
			incident.host.must.equal('test');
			incident.name.must.equal('heartbeat');
			incident.must.have.property('id');
			incident.must.have.property('status');
			incident.status.must.equal('critical');

			done();
		});

		ping();
	});

	it('expiring a ping incident makes it go okay again', function(done)
	{
		// NOTE! This depends on the previous test so it can't be run in isolation. sorry.
		incidentManager.on('readable', function()
		{
			var incident = incidentManager.read();
			incident.host.must.equal('test');
			incident.name.must.equal('heartbeat');
			incident.status.must.equal('ok');

			done();
		});

		ping();
	});
});
