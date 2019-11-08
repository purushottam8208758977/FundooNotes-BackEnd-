/*************************************************************************
 * Execution        : 1. default node       cmd> nodemon labelModel.js
 * 
 * Purpose          : Model contains the schema for database as mongodb is without
 *                    schema and the data received from the service is put in the 
 *                    schema and that schema variable's model is saved in the 
 *                    MONGODB DATABASE .
 * 
 * @file            : labelModel.js
 * @author          : Purushottam
 * @version         : 1.0
 * @since           : 23-09-2019
 * 
 **************************************************************************/

const mongoose = require('mongoose')

let label = mongoose.Schema({

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: [true, "userId id required !"]
    },

    labelName: {
        type: String,
        required: [true, "label name is required "]
    },

    isDeleted: {
        type: Boolean
    }
},
    {
        timestamps: true
    })

let labelModel = mongoose.model("labels", label)

class Label {

    async findLabel(query) {
        try {
            let result = await labelModel.find(query, {})
            if (result.length > 0) {
                return result
            }
            else { //empty object i.e no label of the request's label name found
                console.log(`\n\n\tNo label with name '${query.labelName}' found .`);
                return result
            }
        } catch (error) {
            console.log(error);
            return error
        }
    }

    async saveLabel(labelData) {
        try {
            let newLabel = new labelModel(labelData)
            let result = await newLabel.save()

            if (result) {
                console.log(`\n\n\tLabel '${labelData.labelName}' saved successfully !`);
                return result
            }
            else {
                console.log(`\n\n\tNew label not saved .`);
                return false
            }
        } catch (error) {
            console.log(error);
            return error

        }
    }

    async updatingLabel(labelData) {
        try {
            let idQuery = { '_id': labelData.labelId }
            let result = await labelModel.findOneAndUpdate(idQuery, { $set: { 'labelName': labelData.labelName } })

            if (result) {
                console.log(`\n\n\tLabel '${labelData.labelId}' updated with new name --> '${labelData.labelName}' `);
                return result
            }
        } catch (error) {
            console.log("\n\n\tError in label model",error);
            return error

        }
    }

    async deletingLabel(deletingData) {
       
        let result = await labelModel.deleteOne(deletingData)

        if (result.deletedCount == 1) {
            console.log(`\n\n\t LABEL DELETED SUCCESSFULLY !`);
            return result
        }
        else {
            console.log(`\n\n\tLABEL NOT DELETED`);
            return result
        }
    } catch(error) {
        console.log(error);
        return error

    }
}


let labelInstance = new Label()

module.exports = labelInstance