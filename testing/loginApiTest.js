/****************************************************************************************************
* Execution : 1. default node cmd> mocha loginApiTest.js
*
* @Purpose  : To test the complete API
* @file     : loginApiTest.js
* @author   : Purushottam Khandebharad 
* @since    : 13-08-2019
****************************************************************************************************/
const mongoose = require('mongoose')
const chai = require('chai')
const chaiHttp = require('chai-http')
const server = require('../server.js')
chai.should();
const fs = require('fs')




chai.use(chaiHttp)

//filepath=path.join(`${_dirname}/sampleRequests.json`)
let filepath = "/home/userq/purushottam/FundooNotes-BackEnd--master/testing/sampleRequests.json"
let requestedData = fs.readFileSync(filepath)
requestedData = JSON.parse(requestedData)


/**
 * @description - All types of negative test cases are written .
 */
describe('\n\n\tNegative Testing for Login API', () => {

    /**
     * @description - A empty fields request is sent to the the API and a 422 
     *                "unprocessable entity" response is being expected. 
     *                It should Pass ! 
     */
    it("Empty fields are sent ... expecting a 422 status ", (done) => {
        chai.request(server)
            .post('/login')
            .send(requestedData.loginEmpty)
            .end((err, res) => {
                res.should.have.status(422);
                done();
            })
    })

    /**
     * @description - An invalid email is sent in the request and a response of 422 is expected .
     *                It should Pass !
     */
    it("Invalid email is sent ... expecting a 422 status ", (done) => {
        chai.request(server)
            .post('/login')
            .send(requestedData.loginInvalidEmail)
            .end((err, res) => {
                res.should.have.status(422);
                done();
            })
    })

    /**
     * @description - An request with password length less than 6 is sent to test the api .
     *                422 unprocessable entity is expected .
     *                It should Pass ! 
     */
    it("Password length less than 6 is sent ... expecting a 422 status ", (done) => {
        chai.request(server)
            .post('/login')
            .send(requestedData.loginMinLength)
            .end((err, res) => {
                res.should.have.status(422);
                done();
            })
    })

    /**
     * @description - An request with password length greater than 20 is sent to test the api .
     *                422 unprocessable entity is expected .
     *                It should Pass ! 
     */
    it("Password length greater than 20 is sent ... expecting a 422 status ", (done) => {
        chai.request(server)
            .post('/login')
            .send(requestedData.loginMaxLength)
            .end((err, res) => {
                res.should.have.status(422);
                done();
            })
    })

    /**
     * @description - An email which is not present in DB is sent and a try is made to receive 
     *                "not found " 404 response .
     *                It should Pass !
     */
    it("Email id not present in database is sent ... expecting a 404 status ", (done) => {
        chai.request(server)
            .post('/login')
            .send(requestedData.loginEmailAbsent)
            .end((err, res) => {
                res.should.have.status(404);
                done();
            })
    })

    /**
     * @description- An request is made with correct email but wrong password , a 401 "unauthorised "response 
     *               is expected .
     */
    it("Correct email but wrong password ... expecting a 401 status  ", (done) => {
        chai.request(server)
            .post('/login')
            .send(requestedData.loginIncorrectCredentials)
            .end((err, res) => {
                res.should.have.status(401);
                done();
            })
    })


})

/**
 * @description - And ideal postive request is sent !
 */
describe("Positive testing for Login API ", () => {

    /**
     * @description- An request is made with correct credentials , a 200 OK response 
     *               is expected . 
     */
    it("Correct credentials sent  ... expecting a 200 status  ", (done) => {
        chai.request(server)
            .post('/login')
            .send(requestedData.loginCorrectCredentials)
            .end((err, res) => {
                res.should.have.status(200);
                done();
            })
    })


})