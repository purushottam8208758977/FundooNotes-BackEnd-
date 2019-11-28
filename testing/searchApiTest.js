/****************************************************************************************************
* Execution : 1. default node cmd> mocha searchApiTest.js
*
* @Purpose  : To test the complete API of searching
* @file     : searchApiTest.js
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
describe("Negative testing for create new note ", () => {
    /**
     * @description - A request is sent without a token 
     */
    it("A request is sent without token expecting a 400 response ", (done) => {
        chai.request(server)
            .post('/search')
            .send(requestedData.searchWOToken)
            .end((err, res) => {
                res.should.have.status(400);
                done();
            })
    })
    /**
     * @description - An empty request (with token) is sent where search field is left empty  
     */
    it("Empty request (w/o search field) --> expecting a 422 response ", (done) => {
        chai.request(server)
            .post('/search')
            .send(requestedData.searchEmpty)
            .set(requestedData.headers)
            .end((err, res) => {
                res.should.have.status(422);
                done();
            })
    })

    /**
     * @description - An request is sent whose result is not found (no notes or labels are found)  
     */
    it("request whose result is empty (no notes or labels are found)  --> expecting a 404 response ", (done) => {
        chai.request(server)
            .post('/search')
            .send(requestedData.searchNoResult)
            .set(requestedData.headers)
            .end((err, res) => {
                res.should.have.status(404);
                done();
            })
    })
})

describe("Positive testing for searching  ",()=>{
/**
 * @description - valid request 
 */
    it("Ideal request for searching ... expecting 200 ",(done)=>{
        chai.request(server)
            .post('/search')
            .send(requestedData.searchValid)
            .set(requestedData.headers)
            .end((err, res) => {
                res.should.have.status(200);
                done();
            })
    })
})