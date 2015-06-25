(function(module) {

  'use strict';

  var SocketHandler = function SocketHandler(io, config, db) {
    this.io = io;
    this.config = config;
    this.db = db;
  }

  SocketHandler.prototype.init = function init(socket, port) {
    var state;
    var _this = this;
    this.socket = socket;
    this.port = port;
    console.log('user connected');
    this.db.find({}, function(error, docs) {
      console.log(docs);
      _this.socket.emit('config:hello', docs);
    });
    this.socket.on('switch:raw', this._sendSignal.bind(this));
    this.socket.on('switch:light', this.switchLight.bind(this));
    this.socket.on('config:add', this.addLight.bind(this));

    return this;
  };

  SocketHandler.prototype.addLight = function addLight(light) {
    var _this = this;
    this.db.insert(light, function(error, added) {
      if (error) {
        _this.socket.emit('error', error);
      }
      _this.io.emit('config:added', added);
    });

    return this;
  };

  SocketHandler.prototype.switchLight = function switchLight(data) {
    var _this = this;
    this.db.findOne({ name: data.name }, function(error, doc) {
      var signalConfig;
      var codes;
      var state;
      if (error) {
        _this.socket.emit('error', error);

        return _this;
      }
      if (!doc) {
        _this.socket.emit('error', 'light not found');

        return _this;
      }
      state = data.state || _this._reverseState(doc.state);
      codes = doc.codes[state];
      signalConfig = {
        type: doc.type,
        signal: codes[Math.floor(Math.random() * codes.length)]
      };
      _this.db.update({ _id: doc._id }, { $set: { state: state } }, {}, function(error, numChanged) {
        if (error) {
          _this.socket.emit('error', error);
        }
        _this._sendSignal(signalConfig);
      });
    });

    return this;
  }

  SocketHandler.prototype._reverseState = function _reverseState(state) {
    var map = {
      on: 'off',
      off: 'on'
    };
    if (!state) {
      return 'on';
    }

    return map[state];
  };

  SocketHandler.prototype._sendSignal = function _sendSignal(data) {
    var _this = this;
    var segments = [
      data.type,
      data.signal,
      _this.config.terminator
    ];
    this.port.write(segments.join(_this.config.delimiter), function(error, response) {
      if (error) {
        _this.socket.emit('error', error);
      }
      _this.db.find({}, function(error, docs) {
        console.log(docs);
        _this.socket.emit('switch:switched', docs);
      });
    });

    return this;
  };

  module.exports = SocketHandler;

})(module);