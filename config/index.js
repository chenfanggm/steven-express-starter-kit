var debug = require('debug')('app:config')
var path = require('path')

// ========================================================
// Default Configuration
// ========================================================
debug('Init configuration...')
var config = {
  env : process.env.NODE_ENV || 'development',

  // ----------------------------------
  // Project Structure
  // ----------------------------------
  root_path  : path.resolve(__dirname, '..'),
  dir_test   : 'tests',

  // ----------------------------------
  // Server Configuration
  // ----------------------------------
  server_host: 'localhost',
  server_port: process.env.PORT || 8080,
  cors: {
    origin: [
      'http://express-starter.com'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    preflightContinue: false
  },
  proxy: {
    enabled: true,
    target: '<your-proxy-server>',
    changeOrigin: true
  },
  // ----------------------------------
  // Database Configuration
  // ----------------------------------
  mongo: {
    uri: process.env.MONGO_URI || 'mongodb://localhost/express_starter'
  },
  // ----------------------------------
  // JWT Configuration
  // ----------------------------------
  jwt: {
    tokenCookie: 'create_token',
    refreshTokenCookie: 'create_refresh',
    tokenExpire: '5m',
    tokenCookieExpire: 300000,
    refreshTokenExpire: '30d',
    refreshTokenCookieExpire: 86400000,
    secret: 'eyJ0aXRsZSI6ImZ1Y2sgeW91IHBheSBtZSIsImxlYWQiOiJ0'
  },
  pwd:{
    secret: 'express_starter_secret'
  },
  // ----------------------------------
  // Logger Configuration
  // ----------------------------------
  log: {
    level: "debug",
    colorize: true,
    requestLogFile: path.resolve('../logs/start-kit.log')
  },
  // ----------------------------------
  // Test Configuration
  // ----------------------------------
  coverage_reporters : [
    { type : 'text-summary' },
    { type : 'html', dir : 'coverage' }
  ]
}

module.exports = config
