// Websocket handlers here.

var
    _        = require('lodash'),
    assert   = require('assert'),
    bole     = require('bole'),
    socketio = require('socket.io')
    ;

var Sockets = module.exports = function Sockets(server)
{
    this.log = bole('websockets');
    this.server = server;
    this.io = socketio(this.server);

    // add listeners
    this.io.on('connection', this.onConnection.bind(this));
};

Sockets.prototype.onConnection = function onConnection(c)
{
    this.log.info('incoming websocket connection');
};
