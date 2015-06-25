(function() {

  'use strict';

  var express = require('express');
  var parser = require('body-parser');
  var app = express();
  var server = require('http').Server(app);
  var io = require('socket.io')(server);
  var SocketHandler = require('./socketHandler');
  var twilio = require('twilio');
  var SerialPort = require("serialport").SerialPort;
  var serialPort = new SerialPort('/dev/ttyATH0', {
    baudrate: 115200
  }, false);
  var Datastore = require('nedb');
  var db = {
    lights: new Datastore({
      autoload: true,
      filename: './lights.db'
    })
  };
  
  var config = {
    delimiter: ' ',
    terminator: '\n'
  };
  var socketHandler = new SocketHandler(io, config, db.lights);

  app.use(express.static('public'));
  app.use(parser.urlencoded({ extended: false }));

  app.post('/sms', function(request, response) {
    var resp = new twilio.TwimlResponse();
    var light = request.body.Body.split(' ');
    db.lights.findOne({ name: light[0] }, function(error, doc) {
      var signalConfig;
      var codes;
      var state;
      if (error) {
        return _this;
      }
      if (!doc) {
        return _this;
      }
      state = light[1] || socketHandler._reverseState(doc.state);
      codes = doc.codes[state];
      signalConfig = {
        type: doc.type,
        signal: codes[Math.floor(Math.random() * codes.length)]
      };
      db.lights.update({ _id: doc._id }, { $set: { state: state } }, {}, function(error, numChanged) {
        if (!error) {
          var segments = [
            signalConfig.type,
            signalConfig.signal,
            config.terminator
          ];
          serialPort.write(segments.join(config.delimiter), function() {
            resp.message('OK');
            response
              .status(200)
              .type('text/xml')
              .send(resp.toString());
          });
        }
      });
    });
  });

  serialPort.open(boot);

  function boot(error) {
    if (error) {
      console.log('could not connect to board, exiting');
      process.exit(1);
    }
    io.on('connection', function(socket) {
      socketHandler.init(socket, serialPort);
    });
    server.listen(8080, function() {
      console.log('server started');
    });
  }

})();