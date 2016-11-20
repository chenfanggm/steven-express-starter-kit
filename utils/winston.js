var winston = require('winston')
var config = require('../config')

var logger = new (winston.Logger)({
  level: config.log.level,
  transports: [
    new winston.transports.Console({
      json: true,
      colorize: config.log.colorize
    })
  ]
})

module.exports = logger
