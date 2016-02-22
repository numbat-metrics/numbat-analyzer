module.exports =
{
	Analyzer: require('./lib/analyzer'),
	rules:
	{
		Echo:        require('./lib/rules/echo'),
		Heartbeat:   require('./lib/rules/heartbeat'),
		Loadaverage: require('./lib/rules/load-average'),
		Memory:      require('./lib/rules/memory'),
		StatusRates: require('./lib/rules/status-rates'),
	},
	outputs:
	{
		Console:   require('./lib/outputs/console'),
		PagerDuty: require('./lib/outputs/pagerduty'),
		Slack:     require('./lib/outputs/slack'),
	}
};
