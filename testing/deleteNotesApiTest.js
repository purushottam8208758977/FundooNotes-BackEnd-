/****************************************************************************************************
* Execution : 1. default node cmd> mocha deleteNotesApiTest.js
*
* @Purpose  : To test the complete API of deelting a note
* @file     : deleteNotesApiTest.js
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
let filepath = "/home/userq/purushottam/FundooNotes-BackEnd--master/testing/sampleRequests.json"
let requestedData = fs.readFileSync(filepath)
requestedData = JSON.parse(requestedData)

/**
 * @description - All negative test cases are written !
 */
describe("Negative testing for deleting a note ", () => {
    /**
     * @description - A request is sent without a token 
     */
    it("A request is sent without token expecting a 400 response ", (done) => {
        chai.request(server)
            .post('/deleteNote')
            .send(requestedData.deleteNoteWOToken)
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
            .post('/deleteNote')
            .send(requestedData.deleteNoteWoNoteId)
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
            .post('/deleteNote')
            .send(requestedData.deleteNoteInvalidNoteId)
            .set(requestedData.headers)
            .end((err, res) => {
                res.should.have.status(400);
                done();
            })
    })
})

describe("Positive testing for delete notes api ",()=>{
    /**
     * @describe - A valid request for deleting a note is given
     *             NOTE : EVERYTIME YOU DELETE A NOTE BY RUNNING THIS TEST MAKE SURE THE NEXT TIME YOU USE A DIFFERENT NOTE
     *             ID BECAUSE THE PREVIOUS NOTE HAS BEEN DELETED.
     */
    it("A valid request is sent ...expecting a 200 response ", (done) => {
        chai.request(server)
            .post('/deleteNote')
            .send(requestedData.deleteNoteValidNoteId)
            .set(requestedData.headers)
            .end((err, res) => {
                res.should.have.status(200);
                done();
            })
    })
})