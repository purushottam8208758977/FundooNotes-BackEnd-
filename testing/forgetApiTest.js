/****************************************************************************************************
* Execution : 1. default node cmd> mocha forgetApiTest.js
*
* @Purpose  : To test the complete API
* @file     : forgetApiTest.js
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
let filepath = "/home/userq/purushottam/FundooNotes-BackEnd--master/testing/sampleRequests.json"
let requestedData = fs.readFileSync(filepath)
requestedData = JSON.parse(requestedData)

/**
 * @description - All negative test cases are written !
 */
describe("Negative testing for forget password", () => {

    /**
     * @description - An empty email is sent for initiating forget password process... a 422 response
     *                is expected 
     *                It should Pass !
     */
    it("An empty email request is sent ... expecting a 422 status code ", (done) => {
        chai.request(server)
            .post('/forgetPassword')
            .send(requestedData.forgetEmptyEmail)
            .end((err, res) => {
                res.should.have.status(422);
                done();
            })
    })

    /**
     * @description - An invalid email is sent and an 422 response is expected.
     *                It should pass !
     */
    it("An invalid email request is sent ... expecting a 422 status code ", (done) => {
        chai.request(server)
            .post('/forgetPassword')
            .send(requestedData.forgetInvalidEmail)
            .end((err, res) => {
                res.should.have.status(422);
                done();
            })
    })

    /**
    * @description - An valid email is sent which is not in database and an 404 response is expected.
    *                It should pass !
    */
    it("An valid email which is not in database request is sent ... expecting a 404 status code ", (done) => {
        chai.request(server)
            .post('/forgetPassword')
            .send(requestedData.forgetValidAbsent)
            .end((err, res) => {
                res.should.have.status(404);
                done();
            })
    })
})

/**
 * @description - An ideal positive request is sent to the server and a 200 ok resposne is expected !
 */
describe("Positive Testing for forget API", () => {
    it("Valid email in database is sent  ... expecting a 200 status code ", (done) => {
        chai.request(server)
            .post('/forgetPassword')
            .send(requestedData.forgetAllValid)
            .end((err, res) => {
                res.should.have.status(200);
                done();
            })
    })
})