var
    stream = require('stream'),
    request = require('request')
    ;

var Slack = module.exports = function Slack(options)
{
    this.webhookUrl = options.webhookUrl
    stream.Writable.call(this, { objectMode: true });
};

Slack.prototype._write = function(chunk, encoding, cb)
{
    request(
    {
        url: this.webhookUrl,
        json: true,
        method: 'POST',
        body: { text: text }
    }, function(err, res, body)
    {
        if (err) return cb(err);

        if (res.statusCode !== 200)
            return cb(new Error('Unexpected Slack API status code: ' + res.statusCode));

        cb();
    });
};
