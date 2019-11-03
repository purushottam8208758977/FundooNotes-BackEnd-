/****************************************************************************************************
* Execution : 1. default node cmd> mocha updateNotesApiTest.js
*
* @Purpose  : To test the complete API of deelting a note
* @file     : updateNotesApiTest.js
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
describe("Negative testing for updating a note ", () => {
    /**
     * @description - A request is sent without a token 
     */
    it("A request is sent without token expecting a 400 response ", (done) => {
        chai.request(server)
            .post('/updateNote')
            .send(requestedData.updateNoteWOToken)
            .end((err, res) => {
                res.should.have.status(400);
                done();
            })
    })

    /**
    * @description - A request is sent without a note id 
    */
    it("A request is sent without note id expecting a 422 response ", (done) => {
        chai.request(server)
            .post('/updateNote')
            .send(requestedData.updateNoteWoNoteId)
            .set(requestedData.headers)
            .end((err, res) => {
                res.should.have.status(422);
                done();
            })
    })
    /**
   * @description - A request is sent with a valid note id but with empty updating field
   */
    it("A request is sent with a valid note id but with empty updating field expecting a 422 response ", (done) => {
        chai.request(server)
            .post('/updateNote')
            .send(requestedData.updateNoteInvalidField)
            .set(requestedData.headers)
            .end((err, res) => {
                res.should.have.status(422);
                done();
            })
    })
    /**
    * @description - A request is sent with a invalid note id
    */
    it("A request is sent with a invalid note id expecting a 400 response ", (done) => {
        chai.request(server)
            .post('/updateNote')
            .send(requestedData.updateNoteInvalidNoteId)
            .set(requestedData.headers)
            .end((err, res) => {
                res.should.have.status(400);
                done();
            })
    })
})

describe("Positive testing for update note api ", () => {
    /**
     * @describe - A valid request is sent
     */
    it("A valid request is sent ... expecting a 200 response ", (done) => {
        chai.request(server)
            .post('/updateNote')
            .send(requestedData.updateNoteValid)
            .set(requestedData.headers)
            .end((err, res) => {
                res.should.have.status(200);
                done();
            })
    })
})