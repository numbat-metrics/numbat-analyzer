var
    util = require('util'),
    stream = require('stream'),
    request = require('request')
    ;

var Slack = module.exports = function Slack(options)
{
    this.webhookUrl = options.webhookUrl;
    this.username = options.username || 'numbat'

    stream.Writable.call(this, { objectMode: true });
};
util.inherits(Slack, stream.Writable);

Slack.prototype._renderAttachments = function(chunk)
{
    var text = chunk.message;
    var fields = [];
    var color;

    if (chunk.status)
    {
        fields.push(
        {
            title: 'Status',
            value: chunk.status
        });

        if (chunk.status === 'critical') color = '#ff0000';
        if (chunk.status === 'warning') color = '#ffff00';
        if (chunk.status === 'ok') color = '#00ff00';
    }

    return {
        attachments: [
            {
                author_name: this.username,
                color: color,
                fallback: text,
                text: text,
                fields: fields
            }
        ]
    }
};

Slack.prototype._write = function(chunk, encoding, cb)
{
    request(
    {
        url: this.webhookUrl,
        json: true,
        method: 'POST',
        body: this._renderAttachments(chunk)
    }, function(err, res, body)
    {
        if (err) return cb(err);

        if (res.statusCode !== 200)
            return cb(new Error('Unexpected Slack API status code: ' + res.statusCode));

        cb();
    });
};
