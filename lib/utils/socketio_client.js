// based on https://github.com/remy/Socket.io-node-client/blob/master/io-client.js

var EventEmitter = require('events').EventEmitter;
var WebSocket = require('websocket').WebSocket;
var encode = require('socket.io/utils').encode;
var decode = require('socket.io/utils').decode;

var Client = module.exports = function (host, options) {
  this.url = 'ws://' + host + ':' + options.port + '/socket.io/websocket';
  this.open = false;
  this.sessionId = null;
  this._heartbeats = 0;
  // this.options = { origin: options.origin || 'http://opendoorgonorth.com' };
};

Client.prototype = new EventEmitter;

Client.prototype.connect = function () {
  
  var self = this;
  
  function heartBeat() {
    self.send('~h~' + ++self._heartbeats);
    log('sent heartbeat ' + self._heartbeats );
  }
  
  this.connection = new WebSocket(this.url, 'com.opendoorgonorth.stonkers', this.options);
  
  this.connection.onopen = function () {
    self.open = true;
    self.emit('connect');
  };
  
  this.connection.onmessage = function (event) {
    var rawmsg = decode(event.data)[0],
        frame = rawmsg.substr(0, 3),
        msg;
    switch (frame) {
      case '~h~':
        return heartBeat();
      case '~j~':
        msg = JSON.parse(rawmsg.substr(3));
        break;
    }
    if (msg !== undefined) {
      self.emit('message', msg);
    }
  };
  
  this.connection.onclose = function () {
    self.emit('disconnect');
    self.open = false;
  };
};

Client.prototype.send = function (data) {
  if (this.open) {
    this.connection.send(encode(data));
  }
};

Client.prototype.disconnect = function () {
  if (this.open) {
    this.connection.close();
  }
};