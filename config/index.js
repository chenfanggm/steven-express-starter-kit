var debug = require('debug')('app:config')
var path = require('path')
var argv = require( 'yargs').argv

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
    colorize: true
  },
  // ----------------------------------
  // Test Configuration
  // ----------------------------------
  coverage_reporters : [
    { type : 'text-summary' },
    { type : 'html', dir : 'coverage' }
  ]
}

// ========================================================
// Environment Configuration
// ========================================================
debug('Looking for environment overrides for NODE_ENV' + config.env)
const environments = require('./environments').default
const overrides = environments[config.env]
if (overrides) {
  debug('Found overrides, applying to default configuration.')
  Object.assign(config, overrides(config))
} else {
  debug('No environment overrides found, defaults will be used.')
}

module.exports = config
