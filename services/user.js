/*************************************************************************
 * Execution        : 1. default node       cmd> nodemon userService.js
 * 
 * Purpose          : Request's set data from the controller is being received in 
 *                    the service and then sent forward to the model  .
 * 
 * @file            : service.js
 * @author          : Purushottam
 * @version         : 1.0
 * @since           : 23-09-2019
 * 
 **************************************************************************/

let userModel = require('../models/user.js')
const bycrypt = require('bcrypt')
const generateMail = require('../middlewares/nodeMailer')
const generateToken = require('../middlewares/token')
const redisService = require('./redis')
const ejs = require('ejs')
const path = require('path')
/**
 * @description - It hashes(encrypts) the password entered by the user .
 * @param {@} password 
 * @param {*} callback 
 */
hash = (password) => {
    return new Promise((resolve, reject) => {
        let hashPromise = bycrypt.hash(password, 10)
        hashPromise.then((data) => {
            resolve(data)
        })
            .catch((err) => {
                reject(err)
            })
    })
}

class User {
    /**
     * @description - Using promises registering service is carried out 
     * @param {*} registeringData 
     */
    registeringService(registeringData) {
        try {
            console.log(`\n\n\tIn user service , registering service .... ---->${JSON.stringify(registeringData)}`);
            return new Promise((resolve, reject) => {
                let response = {};
                let registeringPromise = userModel.findUser(registeringData)
                registeringPromise.then((data) => {
                    console.log(`\n\n\tIn registering promise .then ------>`);
                    if (data.length > 0) { //conflict 409
                        response.success = false;
                        response.message = " Email already registered ! Try with a different email "
                        console.log(`\n\n\tEmail already registered !`);
                        resolve(response)
                    }
                    else {
                        console.log(`\n\n\tUser Not found so registering him ... invoking user model for saving `);
                        let encryptionPromise = hash(registeringData.password)
                        encryptionPromise.then((data) => {
                            console.log(`\n\n\tEncrypted password ${data}\n\n`);
                            console.log(`\n\n\tRegistration Data`);
                            let newUserObject = {
                                "firstName": registeringData.firstName,
                                "lastName": registeringData.lastName,
                                "email": registeringData.email,
                                "password": data //hashed password inserted
                            }
                            let userSavedPromise = userModel.registerUser(newUserObject)
                            userSavedPromise.then((data) => {
                                console.log(`\n\n\tREGISTERATION SUCCESSFULL !`)
                                console.log('\n\n\tNow sending mail for email verification ... ')
                                console.log('\n\n\tData received from  model ---->', data._id);
                                let payload = {
                                    _id: data._id
                                }
                                console.log("\n\n\t payload printed : " + JSON.stringify(payload))
                                let tokenObject = generateToken.generateToken(payload)
                                console.log("\n\ntoken object :" + tokenObject.token);

                                let url = "http://localhost:3000/emailVerification/" + tokenObject.token

                                let template = ejs.renderFile(path.join(__dirname, '../view/template.ejs'), { name: registeringData.email, url: url })


                                    .then((templateResponse) => {
                                        let mailPromise = generateMail.nodeMailer(registeringData.email, templateResponse)
                                            .then((mailResult) => {
                                                console.log(`result of mailing service ...........`, mailResult.responseCode);
                                                if (mailResult.responseCode != 535 && mailResult.port != 587) {
                                                    console.log(`\n\n\tREGISTRATION SUCCESSFULL ! VERIFICATION LINK SENT TO EMAIL ID !`);
                                                    response.success = true;
                                                    response.message = "REGISTRATION SUCCESSFULL ! VERIFICATION LINK SENT TO EMAIL ID !"
                                                    response.data = data;
                                                    resolve(response);
                                                }
                                                else { // either 535 (incorrect credentials) occurred or 587(wrongly mentioned email service) occurred 
                                                    console.log(`\n\n\tError occure while sending mail ---> nodemailer failed !`);
                                                    response.success = false;
                                                    response.message = "Error occured in mailing service !"
                                                    response.data = data;
                                                    resolve(response);
                                                }
                                            })
                                    })


                                console.log("\n\n\tTemplate ---->", template)


                            })
                                .catch((err) => {
                                    console.log(`\n\nError occured while saving the user in database ...${err}`);
                                    reject(err)
                                })
                        })
                            .catch((err) => {
                                reject(err)
                            })
                    }
                })
                    .catch((err) => {
                        reject(err)
                    })
            })
        } catch (error) {
            console.log(error);
        }
    }

    //only async await
    async verifyingService(verificationData) {
        try {
            console.log("\n\n\tVerification data in service ----> ", verificationData);
            let response = {}
            let activateAccount = await userModel.verifyingEmail(verificationData)
            if (activateAccount) {
                console.log(`\n\n\tEMAIL VERIFIED AND ACCOUNT HAS BEEN NOW ACTIVATED !`);
                response.success = true;
                response.message = "EMAIL VERIFIED AND ACCOUNT HAS BEEN NOW ACTIVATED !";
                return response
            } else {
                console.log(`\n\n\tERROR WAS ENCOUNTERED IN USER MODEL THE RESULT DIDNT REACH USER SERVICE`);
                response.success = false;
                response.message = "ERROR WAS ENCOUNTERED IN USER MODEL THE RESULT DIDNT REACH USER SERVICE";
                return response
            }

        } catch (error) {
            console.log(error);
        }
    }

    //promises with async await
    loginService(loginData) {
        try {
            return new Promise((resolve, reject) => {
                let response = {}
                let loginPromise = userModel.findUser(loginData) // first entered email must be present in the DB
                loginPromise.then((resultData) => {
                    if (resultData.length > 0) { //user found also account is verified
                        let payload = { // payload generation using id
                            _id: resultData[0]._id
                        }
                        let tokenGenerated = generateToken.generateToken(payload)
                        let passwordPromise = bycrypt.compare(loginData.password, resultData[0].password)
                        passwordPromise.then((data) => {
                            if (data) { // for true acknowlegment of bycrypt result
                                let loginObject = {
                                    id: resultData[0]._id,
                                    firstName: resultData[0].firstName,
                                    lastName: resultData[0].lastName,
                                    email: resultData[0].email,
                                    url: resultData[0].url,
                                    token: tokenGenerated.token,
                                    data: data
                                }
                                response.success = true;
                                response.message = "LOGGED IN SUCCESSFULLY !"
                                response.data = loginObject;

                                redisService.setCache(resultData[0]._id + 'afterLoginToken', tokenGenerated.token)
                                    .then((redisData) => {
                                        if (redisData == 'OK') {
                                            console.log("--->data ", redisData)
                                            resolve(response)
                                        }
                                    }).catch((error) => {
                                        reject(error)
                                    })
                            } else { // for wrongly entered password
                                console.log(`\n\n\tWrong password entered ! ... try again `);
                                response.success = false;
                                response.message = "You have entered a wrong password !"
                                response.data = data;
                                resolve(response)
                            }
                        })
                            .catch((error) => {
                                response.success = false;
                                response.message = "Bycrypt unable to compare passwords !"
                                response.error = error;
                                reject(response)
                            })
                    }
                    else if (!resultData) { //account not verified (empty object is returned)
                        console.log(`\n\n\tservice ---> account not verified !`)
                        response.success = false;
                        response.message = "EMAIL IS NOT VERIFIED , PLEASE VERIFY YOUR EMAIL"
                        response.data = resultData
                        resolve(response)
                    }
                    else { // user not found
                        console.log(`\n\n\tEntered email id is not present in database !`)
                        response.success = false;
                        response.message = "Entered email id not present in database "
                        response.data = resultData
                        resolve(response)
                    }
                })
                    .catch((error) => {
                        console.log(`\n\nError occured in the LOGIN API !`);
                        reject(error)
                    })
            })
        } catch (error) {
            console.log(error);
        }
    }
    //only async await
    async forgettingService(forgetPasswordData) {
        let response = {}
        try {
            console.log(`\n\n\tIn forgetting service --> `);
            let data = await userModel.findUser(forgetPasswordData)
            if (data) {
                if (data.length > 0) {//email found in DB
                    console.log('\n\n\n\tMailing process started ... ')
                    console.log('\n\n\tData received from  model ---->', data[0]._id);
                    let payload = {
                        _id: data[0]._id
                    }
                    console.log("\n\n\t payload printed : " + JSON.stringify(payload))
                    let tokenObject = generateToken.generateToken(payload)
                    console.log("\n\ntoken object :" + tokenObject.token);
                    let url = "http://localhost:3000/resetPassword/" + tokenObject.token

                    let mailResult = await generateMail.nodeMailer(forgetPasswordData.email, url)
                    console.log(`result...............`, mailResult.responseCode);
                    if (mailResult.responseCode != 535 && mailResult.port != 587) {
                        console.log(`\n\n\tLink for resetting password sent to mail !`);
                        response.success = true;
                        response.message = "Link for resetting password sent to mail !"
                        response.data = data;
                        return response;
                    }
                    else {
                        console.log(`\n\n\tError occure while sending mail ---> nodemailer failed !`);
                        response.success = false;
                        response.message = "Error occured in mailing service !"
                        response.data = data;
                        return response;
                    }
                }
                else {
                    console.log(`\n\n\tEntered email not present !`);
                    response.success = false;
                    response.message = "Entered email not present !"
                    response.data = data;
                    return response;
                }
            }
            else {
                response.success = false;
                response.message = "ACCOUNT NOT VERIFIED !"
                response.data = data;
                return response;
            }
        } catch (error) {
            console.log(error)
            return error;
        }
    }

    //only async await
    async resettingPasswordService(resetPasswordData) {
        let response = {}
        try {
            console.log(`\n\n\tIn resetting password service ... ${resetPasswordData}`)
            let hashedPassword = await hash(resetPasswordData.password)
            let resetResult = await userModel.resetPassword(resetPasswordData, hashedPassword)
            if (resetResult) {
                console.log("\n\n\tPASSWORD UPDATED SUCCESSFULLY !", resetResult);
                response.success = true;
                response.message = "PASSWORD UPDATED SUCCESSFULLY !";
                response.data = resetResult;
                return response
            }
            else {
                console.log("\n\n\tPASSWORD NOT UPDATED  !", resetResult);
                response.success = false;
                response.message = "OOPS... PASSWORD NOT UPDATED !";
                response.data = resetResult;
                return response;
            }

        } catch (error) {
            console.log(error)
            return error;
        }
    }

    async uploadingService(id, url) {
        try {
            let response = {}
            let result = await userModel.savingImage(id, url)
            if (result) {
                response.success = true
                response.message = "IMAGE UPLOADED SUCCESFULLY !"
                response.data = result
                return response
            }
            else {
                response.success = false
                response.message = "IMAGE NOT UPLOADED !"
                return response
            }
        } catch (error) {
            console.log(error);
            return error
        }
    }
}


let userInstance = new User()

module.exports = userInstance 