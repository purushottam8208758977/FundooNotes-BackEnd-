/****************************************************************************************************
* Execution : 1. default node cmd> mocha allLabelsApiTest.js
*
* @Purpose  : To test the complete API of getting all labels of a user 
* @file     : allLabelsApiTest.js
* @author   : Purushottam Khandebharad 
* @since    : 9-08-2019
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
 * @description - All negative test cases are written !
 */
describe("Negative testing for getting all labels of a user  ", () => {
    /**
     * @description - A request is sent without a token 
     */
    it("A request is sent without token expecting a 400 response ", (done) => {
        chai.request(server)
            .get('/allLabels')
            .send(requestedData.allLabelsWOToken)
            .end((err, res) => {
                res.should.have.status(400);
                done();
            })

    })

    /**
     * @description - A request is sent with a invalid token 
     */
    it("A request is sent with a token expecting a 400 response ", (done) => {
        chai.request(server)
            .get('/allLabels')
            .send(requestedData.allLabelsWOToken)
            .set(requestedData.invalidToken)
            .end((err, res) => {
                res.should.have.status(400);
                done();
            })

    })
})

describe("Positive testing for all notes API ", () => {
    /**
     * @description - A valid request is sent  
     */
    it("A ideal request is sent to get all labels ..expecting 200 ", (done) => {
        chai.request(server)
            .get('/allLabels')
            .send(requestedData.allLabelsValid)
            .set(requestedData.headers)
            .end((err, res) => {
                res.should.have.status(200);
                done();
            })
    })
})