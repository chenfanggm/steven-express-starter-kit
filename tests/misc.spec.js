var request = require('supertest-as-promised')
var httpStatus = require('http-status')
var chai = require('chai')
var expect = chai.expect
var app = require('../server')

chai.config.includeStack = true

describe('## Misc', function () {

  describe('# GET /api/v1/health', function () {
    it('should return status 200', function (done) {
      request(app)
        .get('/api/v1/health')
        .expect(httpStatus.OK)
        .then(function (res) {
          expect(res.body.message).to.equal('OK')
          done()
        })
        .catch(done)
    })
  })

  describe('# GET /api/v1/404', function () {
    it('should return status 404', function (done) {
      request(app)
        .get('/api/v1/404')
        .expect(httpStatus.NOT_FOUND)
        .then(function (res) {
          expect(res.body.message).to.equal('Method Not Found')
          done()
        })
        .catch(done)
    })
  })

  describe('# Error Handling', function () {
    it('should handle express-validator error - Invalid Email', function (done) {
      request(app)
        .get('/api/v1/user/1')
        .expect(httpStatus.BAD_REQUEST)
        .then(function (res) {
          expect(res.body.message).to.equal('Invalid Email')
          done()
        })
        .catch(done)
    })
  })
})
