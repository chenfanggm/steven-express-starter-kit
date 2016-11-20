var httpStatus = require('http-status')
var config = require('../config')

module.exports = function () {
  return function (err, req, res, next) {
    if (res.headersSent) {
      return next(err)
    }
    res.status(err.status).json({
      message: err.isPublic ? err.message : httpStatus[err.status],
      stack: config.env === 'development' ? err.stack : {}
    })
  }
}

