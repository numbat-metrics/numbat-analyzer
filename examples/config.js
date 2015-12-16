
module.exports =
{
    rules: require('./ruleset'),
    outputs: require('./outputset'),
    incoming: { host: '0.0.0.0', port: 3337 },
    dashboard: { port: 3338 },
};
