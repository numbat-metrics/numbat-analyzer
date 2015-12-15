module.exports =
{
	Analyzer: require('./lib/analyzer'),
	rules:
	{
		Echo:        require('./lib/rules/echo'),
		Heartbeat:   require('./lib/rules/heartbeat'),
		Loadaverage: require('./lib/rules/load-average'),
		Memory:      require('./lib/rules/memory'),
	}
};
