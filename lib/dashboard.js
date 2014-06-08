var
    _          = require('lodash'),
    assert     = require('assert'),
    bodyparser = require('body-parser'),
    bole       = require('bole'),
    express    = require('express'),
    favicon    = require('serve-favicon'),
    http       = require('http'),
    https      = require('https'),
    morgan     = require('morgan'),
    path       = require('path'),
    Sockets    = require('./websockets')
    ;

var PUBLIC = path.join(__dirname, '..', 'public');

var Dashboard = module.exports = function Dashboard(opts)
{
    assert(opts && _.isObject(opts), 'you must pass an options object to the Dashboard');
    assert(opts.port && _.isNumber(opts.port), 'you must pass a listen port');
    this.options = opts;
    this.log = bole('dashboard');

    this.app = express();
    this.setup();

    // routes
    this.app.get('/', this.index.bind(this));
    this.app.get('/credits', this.credits.bind(this));

    this.server = http.createServer(this.app);
    this.io = new Sockets(this.server);
};

Dashboard.prototype.setup = function setup()
{
    var log = this.log;
    var app = this.app;

    var logstream = { write: function(message, encoding) { log.info(message.substring(0, message.length - 1)); } };

    app.set('port', process.env.PORT || 3000);
    app.set('views', path.join(__dirname, 'views'));
    app.set('view engine', 'jade');
    app.use(favicon(path.join(PUBLIC, 'favicon.ico')));
    app.use(morgan({stream: logstream, format: 'dev'}));
    app.use(express.static(PUBLIC));
    app.use(bodyparser());

    if ('development' == app.get('env'))
    {
        app.use(express.errorHandler());
        app.locals.pretty = true;
    }
};


Dashboard.prototype.listen = function listen()
{
    this.server.listen(this.options.port, function()
    {
        this.log.info('dashboard now serving on port ' + this.options.port);
    }.bind(this));
    // https.createServer(options, app).listen(443);
};

Dashboard.prototype.index = function index(request, response)
{
    response.render('index');
};

Dashboard.prototype.credits = function credits(request, response)
{
    response.render('credits');
};
