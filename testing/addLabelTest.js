/****************************************************************************************************
* Execution : 1. default node cmd> mocha addLabelTest.js
*
* @Purpose  : To test the complete API of adding a label on note
* @file     : addLabelTest.js
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
describe("Negative testing for adding a label onto a note ", () => {
    /**
     * @description - A request is sent without a token 
     */
    it("A request is sent without token expecting a 400 response ", (done) => {
        chai.request(server)
            .post('/addLabelOnNote')
            .send(requestedData.addLabelWOToken)
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
            .post('/addLabelOnNote')
            .send(requestedData.addLabelWoNoteId)
            .set(requestedData.headers)
            .end((err, res) => {
                res.should.have.status(422);
                done();
            })
    })

    /**
    * @description - A request is sent with existing label name  
    */
    it("A request is sent with existing label name expecting a 409 response ", (done) => {
        chai.request(server)
            .post('/addLabelOnNote')
            .send(requestedData.addLabelSameName)
            .set(requestedData.headers)
            .end((err, res) => {
                res.should.have.status(409);
                done();
            })
    })

    /**
    * @description - A request is sent with note id but not with either label id or label name .
    *                A request for adding a label on to the note will for sure have a label id (existing label)
    *                or label name (new label) . So, after clicking on to the note either of the one is expected.
    *                This case is without label id ---> i.e with label Name (expected) -->if not --> 400 
    */
    it("Request with note id and w/o label name/id is sent ...expecting a 400 ", (done) => {
        chai.request(server)
            .post('/addLabelOnNote')
            .send(requestedData.addLabelOnlyNoteId)
            .set(requestedData.headers)
            .end((err, res) => {
                res.should.have.status(400);
                done();
            })
    })


})

describe("Positive testing for add label on note API", () => {

    /**
     * @description - A ideal request with note id and label name is given ... this means we need to add that
     *                lable first in the database so that we will get the label id og that label name ---so later with 
     *                that label id and note id we ccan successfully add the label on to the note .
     *                NOTE - BEFORE RUNNING THIS REQUEST ALWAYS CHANGE THE LABEL NAME BECAUSE EVERYTIME YOU RUN THE 
     *                LABEL WILL GET CREATED AND ADDED SO THE NEXT TIME IT WILL NOT ALLOW TO CREATE THE SAME LABEL AGAIN
     *                (409) CONFLICT!
     */
    it("Request with noteId and LabelName (new label) ... expecting a 200", (done) => {
        chai.request(server)
            .post('/addLabelOnNote')
            .send(requestedData.addLabelNewLabel)
            .set(requestedData.headers)
            .end((err, res) => {
                res.should.have.status(200);
                done();
            })
    })

    /**
     * @description - A ideal request with note id and label id is given to add on to the note.
     */
    it("Request with noteId and LabelId (existing label) ... expecting a 200", (done) => {
        chai.request(server)
            .post('/addLabelOnNote')
            .send(requestedData.addLabelExistingLabel)
            .set(requestedData.headers)
            .end((err, res) => {
                res.should.have.status(200);
                done();
            })
    })

})