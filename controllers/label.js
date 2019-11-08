/*************************************************************************
 * Execution        : 1. default node       cmd> nodemon noteController.js
 * 
 * Purpose          : Request from the route is received and sent forward to service .
 *                    Also separate fields are retrieved from the request body. 
 * @file            : noteController.js
 * @author          : Purushottam
 * @version         : 1.0
 * @since           : 7-08-2019
 * 
 **************************************************************************/
let labelService = require('../services/label')

class Label {
    async createLabel(req, res) {
        try {
            console.log(`\n\n\tRequest received in controller --> ${req.body.labelName}`);

            req.checkBody('labelName', 'Label name should not be empty').notEmpty()
            let errorsGenerated = req.validationErrors();
            if (errorsGenerated) {
                response.success = false;
                response.message = "Erros are generated in the request ! ";
                response.error = errorsGenerated;
                return res.status(422).send(response);  //The 422 (Unprocessable Entity)
            }
            else {
                let labelObject = {
                    "userId": req.token._id,
                    "labelName": req.body.labelName
                }
                let result = await labelService.createLabel(labelObject)
                if (result.success) {
                    res.status(200).send(result)
                }
                else if (result.message === `LABEL WITH NAME '${req.body.labelName}' ALREADY EXISTS !`) {
                    res.status(409).send(result)
                }
                else {
                    res.status(400).send(result)
                }
            }
        } catch (error) {
            console.log(error);
            res.status(400).send(error)
        }
    }

    async allLabelsOfUser(req, res) {
        try {
            req.body.userId = req.token._id
            let result = await labelService.allLabelsOfUser(req.body)
            if (result.success) {
                res.status(200).send(result)
            }
            else {
                res.status(404).send(result)
            }
        } catch (error) {
            console.log(error);
            res.status(400).send(error)
        }
    }

    async updatingLabel(req, res) {
        try {
            req.body.userId = req.token._id
            req.checkBody('labelId',"LABEL ID CANT BE LEFT EMPTY").notEmpty()
            req.checkBody('labelName', 'Label name should not be empty').notEmpty()
            let errorsGenerated = req.validationErrors();
            let response = {}
            if (errorsGenerated) {
                response.success = false;
                response.message = "Errors are generated in the request ! ";
                response.error = errorsGenerated;
                return res.status(422).send(response);  //The 422 (Unprocessable Entity)
            }
            else {
                let result = await labelService.updatingLabel(req.body)
                if (result.success) {
                    res.status(200).send(result)
                }
                else{
                    res.status(400).send(result)
                }

            }
        } catch (error) {
            console.log(error);
            res.status(400).send(error)
        }
    }   

    async deletingLabel (req,res){
        try {
            req.body.userId = req.token._id
            req.checkBody('labelId', 'Label id should not be empty').notEmpty()

            let errorsGenerated = req.validationErrors();

            let response = {}

            if (errorsGenerated) {
                response.success = false;
                response.message = "Erros are generated in the request ! ";
                response.error = errorsGenerated;

                return res.status(422).send(response);  //The 422 (Unprocessable Entity)

            }
            else {
                let result = await labelService.deletingLabel(req.body)

                if (result) {
                    res.status(200).send(result)
                }
            }
        } catch (error) {
            console.log(error);
            res.status(400).send(error)
            
        }
    }
}

let labelInstance = new Label()

module.exports = labelInstance 