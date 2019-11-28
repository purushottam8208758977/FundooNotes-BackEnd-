/****************************************************************************************************
* Execution : 1. default node cmd> mocha apiTest.js
*
* @Purpose  : To test the complete registration API
* @file     : registrationApiTest.js
* @author   : Purushottam Khandebharad 
* @since    : 13-08-2019
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
requestedData = JSON.parse(requestedData) // now ready to test





/**
 * @description - All types of negative test cases are written.
 */
describe('Negative Testing for Registration API', () => {

    /**
     * @description - We are passing a wrong request i.e fields are left empty while send and
     *                we are expecting a "unprocessable entity " response off 422 to test our API . 
     *                It should pass !
     */
    it("Registeration fields are sent empty , expected status code --> 422  ", (done) => {
        chai.request(server)
            .post('/registration')
            .send(requestedData.registrationEmpty)
            .end((err, res) => {
                res.should.have.status(422); // unprocessable entity
                done();
            })
    })


    /**
     * @description - First name field has numbers in it we are trying to send it and expecting a 
     *                "unprocessable entity " response of 422 to test our API .
     *                It should pass !
     */
    it("First name field contains numbers ... expecting status code 422 ", (done) => {
        chai.request(server)
            .post('/registration')
            .send(requestedData.registrationNumberData)
            .end((err, res) => {
                res.should.have.status(422); // unprocessable entity
                done();
            })
    })

    /**
    * @description - An invalid email had been sent in the request and we are expecting a 
    *                "unprocessable entity" response of 422 to test our API .
    *                It should Pass ! 
    */
    it("Invalid email is passed  ... expecting status code 422 ", (done) => {
        chai.request(server)
            .post('/registration')
            .send(requestedData.registrationInvalidEmail)
            .end((err, res) => {
                res.should.have.status(422); // unprocessable entity
                done();
            })
    })

    /**
     * @description - Password length has been entered less than 6 and expecting a 
     *                "unprocessable entity" response of 422 to test our API.
     *                It should Pass !
     */
    it("Password length is set to less than 6 ... expecting status code 422 ", (done) => {
        chai.request(server)
            .post('/registration')
            .send(requestedData.registrationPasswordLength)
            .end((err, res) => {
                res.should.have.status(422); // unprocessable entity
                done();
            })
    })

    /**
    * @description - Password length is set greater than 20 and expecting a  we are expecting a 
   *                "unprocessable entity" response of 422 to test our API .
   *                 It should Pass ! 
    */
    it("Password length is set greater than 20 ... expecting status code 422 ", (done) => {
        chai.request(server)
            .post('/registration')
            .send(requestedData.registrationMaxPassword)
            .end((err, res) => {
                res.should.have.status(422); // unprocessable entity
                done();
            })
    })



    /**
    * @description - A request is passed to the API with a email id which is already present in 
    *                the database . We are expecting a "conflict" response of 409  .
    *                It should Pass ! 
    */
    it("Duplicate email is passed  ... expecting status code 409 ", (done) => {
        chai.request(server)
            .post('/registration')
            .send(requestedData.registrationDuplicateEmail)
            .end((err, res) => {
                res.should.have.status(409);
                done();
            })
    })
})

    /**
     * @description - A ideal positive test case is written !
     */
describe("Positive testing for registraion API", () => {
    /**
     * @description - We have passed a valid request and we are expecting a "OK" response of 200 
     *                It should pass .
     */
    it("Correct registration ... expecting status code 200 ", (done) => {
        chai.request(server)
            .post('/registration')

            // NOTE : EVERYTIME YOU RUN THIS TEST THE DETAILS OF THE USER HAS TO BE NEW BECAUSE WHEN 
            //        THIS TEST CODE WAS RUN LAST TIME THE BELOW USER WAS REGISTERED SUCCESSFULLY !  

            .send(requestedData.registrationValid)
            .end((err, res) => {
                res.should.have.status(200);
                done();
            })
    })
})

