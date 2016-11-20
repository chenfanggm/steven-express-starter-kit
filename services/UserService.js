var jwt = require('jsonwebtoken')
var bcrypt = require('bcrypt')
var moment = require('moment')
var Promise = require('bluebird')
var config = require('../config')
var User = require('../models/UserModel')
var Token = require('../entities/TokenEntity')

var getById = function (userId) {
  return new Promise(function (resolve, reject) {
    return User.findOne({
        '_id': userId
      })
      .exec()
      .then(function (user) {
        if (user) {
          resolve(user)
        } else {
          reject('Don\'t get record')
        }
      })
      .catch(function (error) {
        reject(error)
      })
  })
}

var registerUser = function (email, password) {
  return new Promise(function (resolve, reject) {
    const salt = bcrypt.genSaltSync(8) + config.pwd.secret
    const hash = bcrypt.hashSync(password, salt)
    User.create({
        email: email,
        password: hash
      })
      .then(function (user) {
        resolve(user)
      })
      .catch(function (error) {
        reject(error)
      })
  })
}

var loginUser = function (email, password) {
  return new Promise(function (resolve, reject) {
    User.findOne({
        'email': email
      })
      .exec()
      .then(function (user) {
        if (user) {
          const hash = user.password
          const isValidPassword = bcrypt.compareSync(password, hash)
          if (isValidPassword) {
            const token = generateToken(user.id)
            resolve({
              user: user,
              token: token
            })
          } else {
            reject('Invalid password')
          }
        } else {
          reject('Don\'t get record')
        }

      })
      .catch(function (error) {
        reject(error)
      })

  })
}

var hasUser = function (email) {
  return new Promise(function (resolve, reject) {
    User.findOne({ email: email })
      .exec()
      .then(function (user) {
        if (user) {
          resolve(true)
        } else {
          resolve(false)
        }
      })
      .catch(function (error) {
        reject(error)
      })
  })
}

var hasUsername = function (username) {
  const usernameRegex = new RegExp('^' + username + '$', 'i')
  return new Promise(function (resolve, reject) {
    User.findOne({ username: { $regex: usernameRegex, $options: 'i' } })
      .exec()
      .then(function (user) {
        if (user) {
          resolve(true)
        } else {
          resolve(false)
        }
      })
      .catch(function (error) {
        reject(error)
      })
  })
}

var generateToken = function (userId) {
  const payload = {
    userId: userId
  }

  return jwt.sign(payload, config.jwt.secret, {
    tokenExpire: config.jwt.tokenExpire
  })
}

var generateRefreshToken = function (userId) {
  const payload = { userId: userId }

  return jwt.sign(payload, config.jwt.secret, {
    tokenExpire: config.jwt.refreshTokenExpire
  })
}

var getTokenExpireDate = function () {
  return new Date(Date.now() + config.jwt.tokenCookieExpire)
}

var getRefreshTokenExpireDate = function () {
  return new Date(Date.now() + config.jwt.refreshTokenCookieExpire)
}

var getRefreshToken = function (userId, device) {
  return new Promise(function (resolve, reject) {
    new Token({
      userId: userId,
      device: device
    })
      .fetch()
      .then(function (model) {
        if (model != null) {
          resolve(model.get('refresh'))
        } else {
          reject('Don\'t get record')
        }
      })
      .catch(function (error) {
        reject(error)
      })
  })
}

const updateRefreshToken = function (userId, device) {
  return new Promise(function (resolve, reject) {
    const refreshToken = generateRefreshToken(userId)
    const tokenSalt = bcrypt.genSaltSync(1)
    const hashedRefreshToken = bcrypt.hashSync(refreshToken, tokenSalt)
    const dbTimeNow = moment().format('YYYY-MM-DD HH:mm:ss')

    User.findByIdAndUpdate(userId, {updatedAt: dbTimeNow})
      .then(function (user) {
        if (user != null) {
          const token = new Token()
          token.device = device
          token.refreshToken = hashedRefreshToken
          token.updatedAt = dbTimeNow
          user.token = token
          user.updatedAt = dbTimeNow
          user.update({_id: userId}, user)
            .exec()
            .then(function (user) {
              resolve(user)
            })
            .catch(function (error) {
              reject(error)
            })
        } else {
          reject('Don\'t get record')
        }
      })
      .catch(function (error) {
        reject(error)
      })
  })
}

const removeRefreshToken = function (userId) {
  return new Promise(function (resolve, reject) {
    const dbTimeNow = moment().format('YYYY-MM-DD HH:mm:ss')

    User.findOneAndUpdate({_id: userId},
      { $set: {token: '', updatedAt: dbTimeNow} },
      { new: true })
      .then(function (user) {
        if (user) {
          resolve(user)
        } else {
          reject('Don\'t get updated user')
        }
      })
      .catch(function (error) {
        reject(error)
      })
  })
}

const updateUsername = function (userId, username) {
  return new Promise(function (resolve, reject) {
    const dbTimeNow = moment().format('YYYY-MM-DD HH:mm:ss')

    User.findOneAndUpdate({ _id: userId },
      { $set: { username: username, updatedAt: dbTimeNow } },
      { new: true })
      .then(function (user) {
        if (user) {
          resolve(user)
        } else {
          reject('Don\'t get updated user')
        }
      })
      .catch(function (error) {
        reject(error)
      })
  })
}

const updateLastReadMessageAt = function (userId) {
  return new Promise(function (resolve, reject) {
    const dbTimeNow = moment().format('YYYY-MM-DD HH:mm:ss')

    User.findOneAndUpdate({ _id: userId },
      { $set: { lastReadMessageAt: dbTimeNow } },
      {new: true})
      .then(function (user) {
        if (user) {
          resolve(user)
        } else {
          reject('Don\'t get record')
        }
      })
      .catch(function (error) {
        reject(error)
      })
  })
}

module.exports = {
  getById: getById,
  registerUser: registerUser,
  loginUser: loginUser,
  hasUser: hasUser,
  hasUsername: hasUsername,
  generateToken: generateToken,
  getTokenExpireDate: getTokenExpireDate,
  generateRefreshToken: generateRefreshToken,
  getRefreshToken: getRefreshToken,
  getRefreshTokenExpireDate: getRefreshTokenExpireDate,
  updateRefreshToken: updateRefreshToken,
  removeRefreshToken: removeRefreshToken,
  updateLastReadMessageAt: updateLastReadMessageAt,
  updateUsername: updateUsername
}
