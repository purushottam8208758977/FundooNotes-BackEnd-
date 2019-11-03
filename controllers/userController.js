

let userService = require('../services/userService')
let s3 = require('../services/s3.js')
const redis = require('redis')
let client = redis.createClient()

require('dotenv').config()

/*************************************************************************
 * Execution        : 1. default node       cmd> nodemon controller.js
 * 
 * Purpose          : Request from the route is received and sent forward to service .
 *                    Also separate fields are retrieved from the request body. 
 * @file            : controller.js
 * @author          : Purushottam
 * @version         : 1.0
 * @since           : 23-08-2019
 * 
 **************************************************************************/

class userController {
    registering(req, res) {
        console.log(`\n\n\tIn user controller, registering controller ..... ---> `);
        req.checkBody('firstName', 'first name should not be empty').notEmpty();
        req.checkBody('firstName', 'first name should not contain anything other than alphabets').isAlpha()

        req.checkBody('lastName', 'last name should not be empty').notEmpty();
        req.checkBody('firstName', 'last name should not contain anything other than alphabets').isAlpha()

        req.checkBody('email', 'email name should not be empty').notEmpty();
        req.checkBody('email', 'email should be valid').isEmail();

        req.checkBody('password', 'password name should not be empty').notEmpty();
        req.checkBody('password', 'password should be atleast 8 letters').isLength({ min: 8 });
        req.checkBody('password', 'password cannot be greater than 20 characters').isLength({ max: 20 });

        let errorsGenerated = req.validationErrors()  //inbuilt method
        let response = {}; //empty array is declared

        console.log(`\n\n\tValidation error : ${JSON.stringify(errorsGenerated)}`);
        /**
          * @description - Validating the request 
          */
        if (errorsGenerated) {
            response.success = false;
            response.message = "Erros are generated while validating in controller ";
            response.error = errorsGenerated;
            return res.status(422).send(response);  //The 422 (Unprocessable Entity)
        }
        else {
            /**
              * @description - From registration data's body fields are made and a object
              *                is passed on to service below . 
              */
            let registeringData = {
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                email: req.body.email,
                password: req.body.password
            }
            let registeringPromise = userService.registeringService(registeringData);
            registeringPromise.then((data) => {
                console.log(`\n\n\tRegistration result -->`, data);
                if (data.success) {
                    return res.status(200).send(data) //ok
                }
                else {
                    return res.status(409).send(data) //conflict 
                }
            })
                .catch((err) => {
                    console.log(`\n\n\tOops... Problem occured while registering !`);
                    return res.status(400).send(err)
                })
        }
    }

    async verifyingEmail(req, res) {
        try {
            console.log('\n\n\tRequesting for account activation with this id ---> ', req.token._id);
            let verificationResult = await userService.verifyingService(req.token._id)
            if (verificationResult.success) {
                return res.status(200).send(verificationResult)
            } else {
                return res.status(400).send(verificationResult)
            }
        } catch (error) {
            console.log(error);
            return res.status(400).send(error)
        }
    }

    async loggingIn(req, res) {
        try {
            req.checkBody('email', 'email id should not be empty').notEmpty();
            req.checkBody('email', 'email should be valid').isEmail();

            req.checkBody('password', 'password name should not be empty').notEmpty();
            req.checkBody('password', 'password should be atleast 6 letters').isLength({ min: 6 });
            req.checkBody('password', 'password cannot be greater than 20 characters').isLength({ max: 20 });

            let errorsGenerated = req.validationErrors()  //inbulit method
            let response = {}; //empty array is declared
            /**
              * @description - Validating the request 
              */
            if (errorsGenerated) {
                response.success = false;
                response.error = errorsGenerated;
                return res.status(422).send(response);  //The 422 (Unprocessable Entity)
            }
            else {
                /**
                * @description - From login data's body fields are made and a object
                *                is passed on to service below .
                */
                let loginData = {
                    email: req.body.email,
                    password: req.body.password
                }
                let loginPromise = await userService.loginService(loginData) // if error is received it directly jumps to catch block
                if (loginPromise.success) {
                    console.log("\n\n\tLOGGED IN SUCCESFULLY  ...  !")
                    return res.status(200).send(loginPromise)
                } else if (loginPromise.message === "Entered email id not present in database ") {
                    return res.status(404).send(loginPromise)
                }
                else // for wrongly entered password
                {
                    return res.status(401).send(loginPromise)  //unauthorized access
                }
            }

        } catch (error) {
            console.log(error)
            return res.status(400).send(error)
        }
    }

    async forgettingPassword(req, res) {
        try {
            req.checkBody('email', 'email id should not be empty').notEmpty();
            req.checkBody('email', 'email should be valid').isEmail();

            let errorsGenerated = req.validationErrors()  //inbuilt method
            let response = {}; //empty array is declared
            console.log(`Validation error : ${errorsGenerated}`);
            /**
              * @description - Validating the request 
              */
            if (errorsGenerated) {
                response.success = false;
                response.error = errorsGenerated;
                return res.status(422).send(response);  //The 422 (Unprocessable Entity)
            }
            else {
                /**
                * @description - From forget data's body fields are made and a object
                *                is passed on to service below . 
                */
                let forgetPasswordData = {
                    email: req.body.email
                }
                console.log("\n\n\t forget password :", forgetPasswordData);
                let forgetPasswordPromise = await userService.forgettingService(forgetPasswordData)
                console.log(`\n\n\tForget API result --->`, forgetPasswordPromise);
                if (forgetPasswordPromise.success) {
                    res.status(200).send(forgetPasswordPromise)
                }
                else if (forgetPasswordPromise.message === "Error occured in mailing service !") { // insufficient account privileges (SMTP) 
                    res.status(535).send(forgetPasswordPromise)
                }
                else {
                    res.status(404).send(forgetPasswordPromise) //email id not found 
                }
            }
        } catch (error) {
            console.log(error);
            res.status(400).send(error)
        }
    }

    async resettingPassword(req, res) {
        try {
            console.log('Reset password body ', req.token._id);
            req.checkBody('password', 'password should not be empty').notEmpty();
            req.checkBody('password', 'password should be atleast 8 letters').isLength({ min: 8 });
            req.checkBody('password', 'password cannot be greater than 20 characters').isLength({ max: 20 });

            let errorsGenerated = req.validationErrors()  //inbulit method
            let response = {}; //empty array is declared
            console.log(`Validation error : ${JSON.stringify(errorsGenerated[0])}`);
            /**
              * @description - Validating the request 
              */
            if (errorsGenerated) {
                response.success = false;
                response.error = errorsGenerated;
                return res.status(422).send(response);  //The 422 (Unprocessable Entity)
            }
            else {
                /**
                * @description - From reset data's body fields are made and a object
                 *                is passed on to service below . 
                 */
                let resetPasswordData = {
                    password: req.body.password,
                    _id: req.token._id
                }
                let resetPasswordPromise = await userService.resettingPasswordService(resetPasswordData)
                console.log("\n\n\treset promise ", resetPasswordPromise);
                if (resetPasswordPromise.success) {
                    return res.status(200).send(resetPasswordPromise)
                }
                else {
                    return res.status(401).send(resetPasswordPromise)  // the request lacks id pr incorrect id in the payload, so unauthorized
                }
            }
        } catch (error) {
            console.log(error)
            return res.status(400).send(error)
        }
    }

    async imageUploading(req, res) {
        try {
            const s3url = await s3.getSignedUrl('getObject', { Bucket: process.env.BUCKET, Key: req.file.originalname });
            console.log(`\n\n\tUrl of ${req.file.originalname} image--> `, s3url);
            let result = await userService.uploadingService(req.token._id, s3url)
            if (result.success) {
                res.status(200).send(result)
            }
            else {
                res.status(400).send(result)
            }
        } catch (error) {
            console.log(error);
            res.status(400).send(error)
        }
    }
}

let exportedUserController = new userController()

module.exports = exportedUserController




