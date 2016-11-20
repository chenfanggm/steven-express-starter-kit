var Router = require('express').Router()
var APIError = require('../utils/APIError')
var UserService = require('../services/UserService')

Router.get('/:email',
  function (req, res, next) {
    req.checkParams('email', 'Invalid Email')
      .notEmpty().withMessage('Email is required')
      .isEmail()

    req.asyncValidationErrors()
      .then(function () { next() })
      .catch(function (errors) { next(errors) })
  },
  function (req, res, next) {
    UserService.hasUser(req.params.email)
      .then(function (hasUser) {
        res.json(hasUser)
      })
      .catch(function (error) {
        next(new APIError(error.msg))
      })
  })

module.exports = Router
