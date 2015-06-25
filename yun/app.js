var logger = require('winston');
logger.remove(logger.transports.Console);
logger.add(logger.transports.Console, {
  colorize: true,
  timestamp: true
});
var SerialPort = require("serialport").SerialPort
var serialPort = new SerialPort("/dev/ttyATH0", {
  baudrate: 115200
}, false);
var express = require('express');
var parser = require('body-parser');
var app = express();

app.use(parser.json());

serialPort.open(function(error) {
  if (error) {
    logger.error('error connecting to board');
  }
  logger.info('connected to board');
  serialPort.on('data', function(data) {
    logger.info('data received: ' + data);
  });
  app.post('/switch', function(req, res) {
    var params = req.body;
    serialPort.write('SW ' + params.signal + '\n', function(error, result) {
      if (error) {
        res
          .status(503)
          .send(error);
      }
      res
        .status(200)
        .send(result);
    });
  });
  app.listen(8080, function () {
    logger.info('started server');
  });
});

// var firmata = require('firmata');
// logger.info('loaded firmata');
// var express = require('express');
// logger.info('loaded express');
// var parser = require('body-parser'); 
// logger.info('loaded body-parser');
// var app = express();

// app.use(parser.json());

// var board = new firmata.Board('/dev/ttyATH0', function(err) {
//   if (err) {
//     logger.info(err);
//     process.exit(1);
//   }
//   logger.info('connected to board');
//   app.post('/switch', function(req, res) {
//     var params = req.body;
//     logger.info('switched pin %d to %d', params.pin, params.value)
//     board.digitalWrite(params.pin, params.value);
//     res
//       .status(200)
//       .send('OK');
//   });
//   var server = app.listen(8080, function () {
//     logger.info('started server');
//   });
// });