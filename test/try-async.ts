import {Assertion} from "should";
import {Express} from "express";

var {describe, it} = require("mocha");
require('should');
var express = require("express");
var request = require("supertest");

const lib = require("../try-test-lib")
const indexRouter = require("../routes/index")
const app: Express = express();
app.use('/', indexRouter);

describe('async', function () {
  it('async', function (done: any) {
    lib.async(function (result: Assertion) {
      result.should.be.equals(10)
      done();
    });
  });
});

describe('should', function () {
  describe('#Promise', function () {
    it('should.reject', function () {
      (new Promise(function (resolve, reject) {
        reject(new Error('wrong'));
      })).should.be.rejectedWith('wrong');
    });

    it('should.fulfilled', function () {
      (new Promise(function (resolve, reject) {
        resolve({username: 'jc', age: 18, gender: 'male'})
      })).should.be.fulfilled().then(function (it) {
        it.should.have.property('username', 'jc');
      })
    });
  });
});

// Test route examples
describe('GET /testroute', function(){
  it('respond with json', function(done: any){
    request(app)
      .get('/testroute')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      .end(function (err: any, res: any) {
        if (err){
          done(err);
        }else{
          console.log(res.body)
          res.body.test.should.be.eql('OK');
          done();
        }
      })
  });
});