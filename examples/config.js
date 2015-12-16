module.exports = {
	rules:
	{
		heartbeat: {},
		'load-average':
		{
			warn:
			{
				1: 1.5,
				5: 0.9,
				15: 0.7
			},
			critical:
			{
				1: 1.5,
				5: 1.5,
				15: 1.5
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
