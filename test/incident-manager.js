var
	assert = require('assert'),
	IncidentManager = require('../lib/incident-manager')
	;

var incidentManager = new IncidentManager({ ttl: 100 });
var gotIncident = false;
var gotExpiry = false;

incidentManager.on('readable', function()
{
	var incident = incidentManager.read();
	assert.equal(incident.host, 'test');
	assert.equal(incident.name, 'heartbeat');
	assert(incident.id);

	if (incident.status === 'critical')
	{
		assert(!gotIncident, 'incident should not have expired');
		gotIncident = true;
	}
	else
	{
		assert.equal(incident.status, 'ok', 'incident should have expired');
		gotExpiry = true;
	}
});

function ping()
{
	incidentManager.write({
		host: 'test',
		name: 'heartbeat',
		status: 'critical'
	});
}

ping();
setTimeout(ping, 50);

process.on('exit', function()
{
	assert(gotIncident);
	assert(gotExpiry);
});
