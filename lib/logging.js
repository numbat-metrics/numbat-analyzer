var
    bole = require('bole'),
    fs   = require('fs'),
    path = require('path')
    ;

var createLogger = module.exports = function createLogger(opts)
{
    if (exports.logger) return exports.logger;
    opts = opts || {};

    var outputs = [];
    var level = opts.level || 'info';

    if (opts.path)
    {
        if (!fs.existsSync(opts.path))
            fs.mkdirSync(opts.path);

        var fname = path.join(opts.path, opts.botname + '.log');
        var fstream = fs.createWriteStream(fname, { flags: 'a', encoding: 'utf8', mode: 0666 });
        outputs.push({ level: level, stream: fstream });
    }
    else if (!opts.silent)
    {
        if (process.env.NODE_ENV === 'dev')
        {
            var prettystream = require('bistre')();
            prettystream.pipe(process.stdout);
            outputs.push({ level:  'debug', stream: prettystream });
        }
        else
            outputs.push({level: level, stream: process.stdout});
    }

    bole.output(outputs);
    exports.logger = bole(opts.name || 'analyzer');
    return exports.logger;
};
