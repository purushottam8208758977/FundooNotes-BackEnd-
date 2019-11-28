/****************************************************************************************************
* Execution : 1. default node cmd> mocha updateLabelApiTest.js
*
* @Purpose  : To test the complete API of deelting a note
* @file     : updateLabelApiTest.js
* @author   : Purushottam Khandebharad 
* @since    : 9-08-2019
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
 * @description - All negative test cases are written !
 */
describe("Negative testing for updating a label ", () => {
    /**
     * @description - A request is sent without a token 
     */
    it("A request is sent without token expecting a 400 response ", (done) => {
        chai.request(server)
            .post('/updateLabel')
            .send(requestedData.updateLabelWOToken)
            .end((err, res) => {
                res.should.have.status(400);
                done();
            })
    })

    /**
    * @description - A request is sent without a label id 
    */
    it("A request is sent without label id expecting a 422 response ", (done) => {
        chai.request(server)
            .post('/updateLabel')
            .send(requestedData.updateLabelWOToken) // blank object
            .set(requestedData.headers)
            .end((err, res) => {
                res.should.have.status(422);
                done();
            })
    })
    /**
   * @description - A request is sent with a valid label id but with empty updating field
   */
    it("A request is sent with a label id but with empty label Name field expecting a 422 response ", (done) => {
        chai.request(server)
            .post('/updateLabel')
            .send(requestedData.updateLabelEmptyLabel)
            .set(requestedData.headers)
            .end((err, res) => {
                res.should.have.status(422);
                done();
            })
    })
    /**
    * @description - A request is sent with a invalid note id
    */
    it("A request is sent with a invalid label id expecting a 400 response ", (done) => {
        chai.request(server)
            .post('/updateLabel')
            .send(requestedData.updateLabelInvalidLabelId)
            .set(requestedData.headers)
            .end((err, res) => {
                res.should.have.status(400);
                done();
            })
    })
})

describe("Positive testing for update label api ", () => {
    /**
     * @describe - A valid request is sent
     */
    it("A valid request is sent ... expecting a 200 response ", (done) => {
        chai.request(server)
            .post('/updateLabel')
            .send(requestedData.updateLabelValid)
            .set(requestedData.headers)
            .end((err, res) => {
                res.should.have.status(200);
                done();
            })
    })
})