/*************************************************************************
 * Execution        : 1. default node       cmd> nodemon labelService.js
 * 
 * Purpose          : Request's set data from the controller is being received in 
 *                    the service and then sent forward to the model  .
 * 
 * @file            : labelService.js
 * @author          : Purushottam
 * @version         : 1.0
 * @since           : 4-10-2019
 * 
 **************************************************************************/

let labelModel = require('../models/labelModel')

class labelService {

    async createLabel(labelData) {
        try {

            let response = {}
            let query = { 'userId': labelData.userId, 'labelName': labelData.labelName }
            let result = await labelModel.findLabel(query)
            if (result.length > 0) { // label name already exists
                console.log(`\n\n\tLabel name already present !`);
                response.success = false
                response.message = `LABEL WITH NAME '${labelData.labelName}' ALREADY EXISTS !`
                return response
            }
            else { // unique
                console.log(`\n\n\tCreating a new label with name '${labelData.labelName}'.`);
                let savingResult = await labelModel.saveLabel(labelData)
                if (savingResult) {
                    response.success = true
                    response.message = `LABEL '${labelData.labelName}' SAVED SUCCESFULLY !`
                    response.data = savingResult
                    return response
                }
                else {
                    response.success = false
                    response.message = `LABEL '${labelData.labelName}' NOT SAVED . !`
                    response.data = savingResult
                    return response
                }
            }

        } catch (error) {
            console.log(error);
            let response = {}
            response.success = false
            response.message = `ERROR OCCURED IN LABEL SERVICE WHILE CREATING A LABEL`
            response.error = error

            return response
        }
    }

    async allLabelsOfUser(allLabelsData) {
        try {
            let response = {}
            let query = { 'userId': allLabelsData.userId }
            let result = await labelModel.findLabel(query)
            if (result.length > 0) {
                console.log(`\n\n\tAll labels loaded succesfully !`);
                response.success = true
                response.message = `ALL LABELS LOADED SUCCESSFULLY !`
                response.data = result
                return response
            }
            else {
                console.log(`\n\n\tNo labels found for user --> '${allLabelsData.userId}'`);
                response.success = false
                response.message = `NO LABELS FOUND FOR USER --> '${allLabelsData.userId}'`
                response.data = result
                return response
            }
        } catch (error) {
            console.log(error);
            let response = {}
            response.success = false
            response.message = `ERROR OCCURED IN LABEL SERVICE WHILE LOADING ALL LABELS`
            response.error = error
            return response
        }
    }

    async updatingLabel(updatingData) {
        try {
            let result = await labelModel.updatingLabel(updatingData)
            let response = {}
            if (result._id) {
                console.log("\n\n\tResult --> service ----> ", result);
                response.success = true
                response.message = `LABEL '${updatingData.userId}' NAME UPDATED SUCCESFULLY AS '${updatingData.labelName}'`
                response.result = result
                return response
            }
            else {
                response.success = false
                response.message = ` Error occured in database while finding and updating !`
                response.data = result
                return response
            }
        } catch (error) {
            console.log(error);
            let response = {}
            response.success = false
            response.message = `ERROR OCCURED IN LABEL SERVICE WHILE UPDATING A LABEL`
            response.error = error
            return response
        }
    }

    async deletingLabel(deletingData) {
        try {

            let response = {}

            let deleteQuery = { '_id': deletingData.labelId }

            let result = await labelModel.deletingLabel(deleteQuery)

            if (result.deletedCount == 1) {

                response.success = true
                response.message = "LABEL DELETED SUCCESFULLY !"
                response.data = result
                return response
            }
            else {
                response.success = false
                response.message = "LABEL NOT DELETED "
                response.data = result
                return response
            }
        } catch (error) {
            console.log(error);
            let response = {}
            response.success = false
            response.message = `ERROR OCCURED IN LABEL SERVICE WHILE DELETING A LABEL`
            response.error = error

            return response
        }
    }
}

let labelServiceInstance = new labelService()

module.exports = labelServiceInstance