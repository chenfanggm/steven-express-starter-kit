'use strict'

var express = require('express')
var bodyParser = require('body-parser')
var cookieParser = require('cookie-parser')
var methodOverride = require('method-override')
var logger = require('morgan')
var cors = require('cors')
var validator = require('express-validator')
var compression = require('compression')
var helmet = require('helmet')
var httpStatus = require('http-status')
var mongoose = require('mongoose')
var util = require('util')
var debug = require('debug')('app:server')
// var expressWinston = require('express-winston')
// var winstonInstance = require('./utils/winston')
var errorHandler = require('./middlewares/errorHandler')
var APIError = require('./utils/APIError')
var routes = require('./routes')
var config = require('./config')

var app = express()

// ========================================================
// Middleware
// ========================================================
debug('Init mongoose...')
mongoose.Promise = require('bluebird')
mongoose.connect(config.mongo.uri, { server: { socketOptions: { keepAlive: 1 } } })
mongoose.connection.on('error', function () {
  throw new Error('Failed to connect to database:' + config.mongo.uri)
})
if (config.env === 'development') {
  mongoose.set('debug', function (collectionName, method, query, doc) {
    debug(collectionName + '.' + method, util.inspect(query, false, 20), doc)
  })
}

debug('Init middleware...')
if (config.env === 'development') { app.use(logger('dev')) }
app.use(compression())
app.use(cors(config.cors))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(validator())
app.use(cookieParser())
app.use(methodOverride())
app.use(helmet())

/* if (config.env === 'development') {
  expressWinston.requestWhitelist.push('body')
  expressWinston.responseWhitelist.push('body')
  app.use(expressWinston.logger({
    winstonInstance: winstonInstance,
    msg: 'HTTP {{req.method}} {{req.url}} {{res.statusCode}} {{res.responseTime}}ms',
    meta: true,
    colorize: true
  }))
} */

// routes
app.use('/api/v1', routes)
// 404
app.use('/', function (req, res, next) {
  next(new APIError('Method Not Found', httpStatus.NOT_FOUND, true))
})

// error transform
app.use(function (err, req, res, next) {
  if (Array.isArray(err)) {
    var unifiedErrorMessage = err.map(function (error) { return error.msg }).join(' and ')
    var error = new APIError(unifiedErrorMessage, httpStatus.BAD_REQUEST, true)
    return next(error)
  } else if (!(err instanceof APIError)) {
    return next(new APIError(err.message, err.status, err.isPublic))
  }
  return next(err)
})

// log error
/* if (config.env !== 'test') {
  app.use(expressWinston.errorLogger({
    winstonInstance: winstonInstance
  }))
} */

// error handler
app.use(errorHandler())

module.exports = app

