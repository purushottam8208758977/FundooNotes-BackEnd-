/****************************************************************************************************
* Execution : 1. default node cmd> mocha resetApiTest.js
*
* @Purpose  : To test the complete API
* @file     : resetApiTest.js
* @author   : Purushottam Khandebharad 
* @since    : 23-08-2019
****************************************************************************************************/
const mongoose = require('mongoose')
const chai = require('chai')
const chaiHttp = require('chai-http')
const server = require('../server')
chai.should();
const fs = require('fs')


chai.use(chaiHttp)

//filepath=path.join(`${_dirname}/sampleRequests.json`)
let filepath = "/home/admin1/javascript/fundoNotes/backEnd/testing/sampleRequests.json"
let requestedData = fs.readFileSync(filepath)
requestedData = JSON.parse(requestedData)

/**
 * @description - All types of negative test cases are written .
 */
describe("Negative testing for reset password", () => {

    /**
    * @description - Request is sent without token 400 bad request is expected .
    *                It should Pass !
    */
    it("Request without token is sent ... expecting a 400 status code ", (done) => {
        chai.request(server)
            .post('/resetPassword')
            .send(requestedData.resetEmpty)
            .end((err, res) => {
                res.should.have.status(400);
                done();
            })
    })

    /**
      * @description - An empty password is sent with token ... a 422 response
      *                is expected 
      *                It should Pass ! 
      */
    it("An empty password with token request is sent ... expecting a 422 status code ", (done) => {
        chai.request(server)
            .post('/resetPassword')
            .send(requestedData.resetEmpty)
            .set(requestedData.headers)
            .end((err, res) => {
                res.should.have.status(422);
                done();
            })
    })

    /**
    * @description - Password less than 6 is sent with token .. a 422 response is expected 
    *                It should Pass !
    */
    it("Password less than 6 length with token as a request is sent ... expecting a 422 status code ", (done) => {
        chai.request(server)
            .post('/resetPassword')
            .send(requestedData.resetMinPassword)
            .set(requestedData.headers)
            .end((err, res) => {
                res.should.have.status(422);
                done();
            })
    })

    /**
    * @description - Password greater than 20 is sent with token .. a 422 response is expected 
    *                It should Pass !
    */
    it("Password greater than 20 length with token as a request is sent ... expecting a 422 status code ", (done) => {
        chai.request(server)
            .post('/resetPassword')
            .send(requestedData.resetMaxPassword)
            .set(requestedData.headers)
            .end((err, res) => {
                res.should.have.status(422);
                done();
            })
    })

   
})


/**
 * @description - Positive testing for reset API 
 */

describe("Positive testing for reset password",()=>{
    /**
     * @description - Valid password is sent with token .. a 200 response is expected 
     *                It should Pass !
     */
    it(" Valid password is sent with token  as a request ... expecting a 200 status code ", (done) => {
        chai.request(server)
            .post('/resetPassword')
            .send(requestedData.resetCorrect)
            .set(requestedData.headers)
            .end((err, res) => {
                res.should.have.status(200);
                done();
            })
    })
})