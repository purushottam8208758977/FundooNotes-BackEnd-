/****************************************************************************************************
* Execution : 1. default node cmd> mocha allNoteApiTest.js
*
* @Purpose  : To test the complete API of getting all notes of a user 
* @file     : allNoteApiTest.js
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
let filepath = "/home/admin1/javascript/fundoNotes/backEnd/testing/sampleRequests.json"
let requestedData = fs.readFileSync(filepath)
requestedData = JSON.parse(requestedData)

/**
 * @description - All negative test cases are written !
 */
describe("Negative testing for getting all notes of a user  ", () => {
    /**
     * @description - A request is sent without a token 
     */
    it("A request is sent without token expecting a 400 response ", (done) => {
        chai.request(server)
            .get('/allNotes')
            .send(requestedData.allNotesWOToken)
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
            .get('/allNotes')
            .send(requestedData.allNotesWIToken)
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
    it("A ideal request is sent to get all notes ..expecting 200 ", (done) => {
        chai.request(server)
            .get('/allNotes')
            .send(requestedData.allNotesValid)
            .set(requestedData.headers)
            .end((err, res) => {
                res.should.have.status(200);
                done();
            })
    })
})