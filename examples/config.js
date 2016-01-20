module.exports = {
	rules:
	{
		heartbeat: {},
		'load-average':
		{
			warn:
			{
				1: 2.0,
				5: 1.5,
				15: 0.7
			},
			critical:
			{
				1: 3.0,
				5: 2.5,
				15: 1.7
			}
		},
		memory:
		{
			warn: 0.7,
			critical: 0.9
		}
	},
	outputs:
	{
		console: {}
	}
};
