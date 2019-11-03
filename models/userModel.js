
/*************************************************************************
 * Execution        : 1. default node       cmd> nodemon model.js
 * 
 * Purpose          : Model contains the schema for database as mongodb is without
 *                    schema and the data received from the service is put in the 
 *                    schema and that schema variable's model is saved in the 
 *                    MONGODB DATABASE .
 * 
 * @file            : model.js
 * @author          : Purushottam
 * @version         : 1.0
 * @since           : 23-09-2019
 * 
 **************************************************************************/

const mongoose = require('mongoose');

let user = mongoose.Schema({ //schema is a class in mongoose library
    firstName: {
        type: String,
        require: [true, 'first name should not be empty']
    },
    lastName: {
        type: String,
        require: [true, 'last name should not be empty']
    },
    email: {
        type: String,
        require: [true, 'email should not be empty'],
        unique: true
    },
    password: {
        type: String,
        require: [true, 'password should not be empty']
    },
    emailVerification: {
        type: Boolean
    },
    url: {
        type: String
    } 
}, {
    timestamps: true
});

/**
 * @description - Using a schema named 'user' and collection named 'modelSchema' a new model is made .
 */
let userDataModel = mongoose.model('user', user) //creating a new model
//modelSchema is the collection's name 

class UserModel {
    findUser(registeringData) {
        return new Promise((resolve, reject) => {

            let userPromise = userDataModel.find({ 'email': registeringData.email })
            userPromise.then((data) => {
                if (data.length > 0) {
                    let emailActivatedPromise = userDataModel.find({ '_id': data[0]._id, "emailVerification": true })
                    emailActivatedPromise.then((isActivated) => {
                        if (isActivated.length > 0) {
                            resolve(isActivated);
                        }
                        else {//empty object 
                            let activated = false
                            resolve(activated);
                        }
                    })
                }
                else { // user not found
                    resolve(data)
                }
            })
                .catch((err) => {
                    console.log("\n\n\tEmail id not found in database ")
                    reject(err)
                })
        })
    }

    registerUser(newUserObject) {
        let newUser = new userDataModel(newUserObject)
        return new Promise((resolve, reject) => {
            let savePromise = newUser.save()
            savePromise.then((data) => {
                resolve(data)
            })
                .catch((err) => {
                    reject(err)
                })
        })
    }

    async verifyingEmail(verificationData) {
        try {
            console.log(`\n\n\tIn user model to update the email verification field with id --->  ${verificationData}`);
            let updateResult = await userDataModel.findOneAndUpdate({ '_id': verificationData }, { $set: { 'emailVerification': true } })
            if (updateResult) {
                console.log("\n\ACCOUNT ACTIVATED SUCCESSFULLY !");
                return true
            }
            else {
                console.log(`\n\nProblem occured in updating email verification field `);
                return false;
            }
        } catch (error) {
            console.log(erro);
        }
    }

    async resetPassword(resetPasswordData, hashedPassword) {
        try {
            let updateResult = await userDataModel.findOneAndUpdate({ '_id': resetPasswordData._id }, { $set: { 'password': hashedPassword } })
            if (updateResult) {
                console.log("\n\nPassword updated successfully !");
                return true
            }
            else {
                console.log(`\n\nProblem occured in updating password`);
                return false;
            }
        }
        catch (error) {
            console.log(error)
            return error
        }
    }

    /**
     * @description - Finds the particular document by the id mentioned and sets the url received from the request 
     * @param {*} id 
     * @param {*} url 
     */
    async savingImage(id, url) {
        try {
            let result = await userDataModel.findOneAndUpdate({ '_id': id }, { $set: { 'url': url } })
            if (result) {
                console.log("\n\n\tIMAGE UPLOADED SUCCESSFULLY !");
                return true
            }
            else {
                console.log(`\n\n\tPROBLEM OCCURED IN UPLOADING IMAGE !`);
                return false;
            }
        } catch (error) {
            console.log(error);
        }
    }
}

let userModel = new UserModel()

module.exports = userModel