/****************************************************************************************************
* Execution : 1. default node cmd> mocha createNoteTest.js
*
* @Purpose  : To test the complete API of creating a note
* @file     : createNoteTest.js
* @author   : Purushottam Khandebharad 
* @since    : 9-08-2019
****************************************************************************************************/
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
describe("Negative testing for create new note ", () => {
    /**
     * @description - A request is sent without a token 
     */
    it("A request is sent without token expecting a 400 response ", (done) => {
        chai.request(server)
            .post('/createNote')
            .send(requestedData.createNoteWOToken)
            .end((err, res) => {
                res.should.have.status(400);
                done();
            })
    })
    /**
     * @description - An empty request (with token) is sent where the title and the description is note provided 
     */
    it("Empty request (w/o title or description )--> expecting a 400 response ", (done) => {
        chai.request(server)
            .post('/createNote')
            .send(requestedData.createNoteWOToken)
            .set(requestedData.headers)
            .end((err, res) => {
                res.should.have.status(400);
                done();
            })
    })
})

describe("Positive testing for create note  API", () => {
    /**
     * @describe - A ideal request to create a new note is sent 
     */
    it("A ideal request is sent to create a note ...expecting a 201 response ", (done) =>{
        chai.request(server)
            .post('/createNote')
            .send(requestedData.createNoteIdeal)
            .set(requestedData.headers)
            .end((err, res) => {
                res.should.have.status(201);
                done();
            })
})
})