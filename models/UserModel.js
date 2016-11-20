var mongoose = require('mongoose')
var moment = require('moment')
var httpStatus = require('http-status')
var TokenEntity = require('../entities/TokenEntity')
var APIError = require('../utils/APIError')

/**
 * Define
 */
var STATUS = {
  INACTIVE: 0,
  ACTIVE: 1
}

var ROLE = {
  OWNER: 0,
  ADMIN: 1,
  USER: 2,
  GUEST: 3
}

/**
 * User Schema
 */
var Token = new TokenEntity
var UserSchema = new mongoose.Schema({
  role: { type: Number, min: 0, max: 3, default: ROLE.USER },
  email: { type: String, required: true, unique: true },
  username: { type: String, unique: true, sparse: true },
  password: { type: String, required: true },
  token: { type: Token },
  lastLogin: { type: Date, required: true, default: moment().format("YYYY-MM-DD HH:mm:ss") },
  lastReadMessageAt: { type: Date, required: true, default: moment().format("YYYY-MM-DD HH:mm:ss") },
  status: { type: Number, required: true, default: STATUS.ACTIVE },
  createdAt: { type: Date, required: true, default: moment().format("YYYY-MM-DD HH:mm:ss") },
  updatedAt: { type: Date, required: true, default: moment().format("YYYY-MM-DD HH:mm:ss") }
})

/**
 * Indexing
 */


/**
 * Virtual Property
 */
UserSchema
  .virtual('userInfo')
  .get(function() {
    return {
      id: this._id,
      role: this.role,
      email: this.email,
      username: this.username,
      status: this.status,
      lastLogin: this.lastLogin,
      createdAt: this.createdAt,
      updateAt: this.updateAt
    }
  })

/**
 * Validation
 */
// validate email format
UserSchema.path('email')
  .validate(function (email) {
    var emailRegex = /^([\w\-\.]+@([\w-]+\.)+[\w-]{2,4})?$/
    return emailRegex.test(email)
  }, 'email is invalid')

// validate email duplication
UserSchema.path('email')
  .validate(function (value, response) {
    mongoose.models['User']
      .findOne({'email': value}, function (err, user) {
        if(err) throw err
        if(user) return response(false)
        response(true)
      })
  }, 'email is already exist')

// validate username duplication
UserSchema.path('username')
  .validate(function (value, response) {
    mongoose.models['User']
      .findOne({'username': value}, function (err, user) {
        if(err) throw err
        if(user) return response(false)
        response(true)
      })
  }, 'username is already exist')

/**
 * Pre Save
 */
UserSchema.pre('save', function(next) {
  if (!this.isNew) {
    return next()
  }
  if (!isValidPassword(this.password)) {
    return next(new APIError('Invalid password', httpStatus.UNAUTHORIZED))
  }
  return next()
})

var isValidPassword = function (value) {
  return value && value.length
}

// method
UserSchema.methods = {
  generateHash: function (password) { return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null) },
  authenticate: function (password) { bcrypt.compareSync(password, this.local.password) }
}

UserSchema.statics = {
  getLastRecordId: function (cb) {
    mongoose.models['User'].find().sort({_id:-1}).limit(1).exec(function (err, user) {
      if(err) throw err
      if(user && user.length!=0){
        return cb(user[0].userId)
      }
      return cb(0)
    })
  }
}

var UserModel = mongoose.model('User', UserSchema)
UserModel.STATUS = STATUS
UserModel.ROLE = ROLE

module.exports = UserModel
