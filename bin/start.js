'use strict'

var server = require('../server')
var config = require('../config')
var _debug = require('debug')

var debug = _debug('app:bin:server')

var host = config.server_host
var port = config.server_port
server.listen(port, function () {
  debug('Server started listening to: %s:%s', host, port)
})
