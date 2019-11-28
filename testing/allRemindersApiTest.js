/****************************************************************************************************
* Execution : 1. default node cmd> mocha allRemindersApiTest.js
*
* @Purpose  : To test the complete API of getting all reminders - notes of a user 
* @file     : allRemindersApiTest.js
* @author   : Purushottam Khandebharad 
* @since    : 18-08-2019
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
describe("Negative testing for getting all notes with reminders on of a user  ", () => {
    /**
     * @description - A request is sent without a token 
     */
    it("A request is sent without token expecting a 400 response ", (done) => {
        chai.request(server)
            .get('/allReminders')
            .send(requestedData.allRemindersWOToken)
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
            .get('/allReminders')
            .send(requestedData.allRemindersWIToken)
            .set(requestedData.invalidToken)
            .end((err, res) => {
                res.should.have.status(400);
                done();
            })

    })
})

describe("Positive testing for all reminder notes API ", () => {
    /**
     * @description - A valid request is sent  
     */
    it("A ideal request is sent to get all notes with reminders ..expecting 200 ", (done) => {
        chai.request(server)
            .get('/allReminders')
            .send(requestedData.allRemindersValid)
            .set(requestedData.headers)
            .end((err, res) => {
                res.should.have.status(200);
                done();
            })
    })
})