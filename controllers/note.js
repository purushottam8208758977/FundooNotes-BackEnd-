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
let noteService = require('../services/note')
let labelService = require('../services/label')
const logger = require('../logger')
const cron = require('node-cron')

/**
 * @description - Handles all the CRUD operations done on the notes .
 */
class Note {
    /**
     * @description - A new note is created based on the data received form the request .
     * @param {*} req // request received
     * @param {*} res // response sent 
     */
    async creatingNote(req, res) {
        try {
            //google keep doesnt create new notes with no titles or description
            if ((req.body.title == "") && (req.body.description == "")) {
                logger.info("Request made without title or description")
                res.status(400).send({
                    "success": false,
                    "message": "EITHER ADD A TITLE OR DESCRIPTION TO CREATE A NEW NOTE !"
                })
            }
            else {
                /**
                * @description - All the content of the note made ready here by extracting data from the request 
                 */
                let noteObject = { //note object is made ready to operate later in the model 
                    "userId": req.token._id,
                    "title": (req.body.title == null) ? "" : req.body.title,
                    "description": (req.body.description == null) ? "" : req.body.description,
                    "trash": (req.body.trash == null) ? false : req.body.trash,
                    "archive": (req.body.archive == null) ? false : req.body.archive,
                    "reminder": (req.body.reminder == null) ? "" : req.body.reminder,
                    "color": (req.body.color == null) ? "" : req.body.color
                }
                //now note object has to be passed to the service 
                let noteCreationResult = await noteService.creatingService(noteObject)
                if (noteCreationResult.success) { // success -true
                    logger.info(`\n\n\tNOTE ADDED SUCCESSFULLY !`);
                    res.status(201).send(noteCreationResult)  // created status code 
                }
                else {
                    logger.error(`\n\n\tNOTE NOT ADDED.`)
                    res.status(400).send(noteCreationResult)
                }
            }
        } catch (error) {
            logger.error(error);
            res.status(400).send(error)
        }
    }
    /**
    * @description - A label is added on a note after clicking on to the note 
    * @param {*} req // request received
    * @param {*} res // response sent 
    */
    async addingLabelOnNote(req, res) {
        try {
            req.body.userId = req.token._id
            //after clicking on to the note the request has to have a note id , w/o note id db doesnt know 
            // on which note to add the label
            req.checkBody('noteId', 'NOTE ID SHOULD NOT BE EMPTY').notEmpty()
            let errorsGenerated = req.validationErrors();
            let response = {}
            if (errorsGenerated) {
                response.success = false;
                response.message = "Erros are generated in the request ! ";
                response.error = errorsGenerated;
                return res.status(422).send(response);  //The 422 (Unprocessable Entity)
            } else {
                let labelData; // this common variable will be used to store the object or request
                if (!req.body.labelId) { //it means user is trying to add a new label on to the note 
                    logger.info(`\n\n\tLabel not present so creating a new label first ...`);

                    /* A request for adding a label on to the note will for sure have a label id (existing label)
                    or label name (new label), if not --> BAD REQUEST*/
                    /* Here we are in if block which says this request doesnt have label id that means it should have 
                    label name for sure and it cant be left empty . 
                    Also we need not need to check the respective else block as the req will either have a label id or not*/

                    req.checkBody('labelName', "PLEASE ENTER A LABEL NAME ").notEmpty()
                    errorsGenerated = req.validationErrors();
                    if (errorsGenerated) {
                        response.success = false;
                        response.message = "Errors are generated in the request (EMPTY LABEL NAME FIELD) ! ";
                        response.error = errorsGenerated;
                        return res.status(400).send(response);  //The 400 (BAD REQUEST)
                    }
                    else {// now the request has noteId and labelName
                        let labelObject = {
                            "userId": req.token._id,
                            "labelName": req.body.labelName
                        }
                        let result = await labelService.createLabel(labelObject)
                        if (result.success) {
                            logger.info("\n\n\tLabel id generated -->", result.data._id);
                            //now the label id of the newly entered label is generated 
                            //now we have the label id and note id to add the label on to the note 
                            labelData = {
                                "noteId": req.body.noteId,
                                "userId": req.token._id,
                                "labelId": result.data._id
                            }//now labelData is ready to add the label on to the paticular note 
                        }
                        else if (result.message === `LABEL WITH NAME '${req.body.labelName}' ALREADY EXISTS !`) {
                            res.status(409).send(result) //conflict
                        }
                        else {
                            res.status(400).send(result) // bad request 
                        }
                    }
                } else {//it means user is trying to add a existing label on to the note 
                    labelData = req.body
                    //now labelData is ready to add the label on to the particular note
                }

                if (labelData) {
                    /**
                    * @description - Adding the label to the note with label id and note id
                     */
                    let result = await noteService.addingLabelOnNote(labelData)
                    if (result) {
                        res.status(200).send(result)
                    }
                    else {
                        res.status(400).send(result)
                    }
                }
            }
        } catch (error) {
            logger.error(error);
            res.status(400).send(error)
        }
    }

    /**
    * @description - A label is deleted from a note 
    * @param {*} req // request received
    * @param {*} res // response sent 
    */
    async deletingLabelOnNote(req, res) {
        try {
            req.body.userId = req.token._id
            //a request has to have a note id to delete the label on it.
            req.checkBody('noteId', 'NOTE ID SHOULD NOT BE EMPTY').notEmpty()
            let errorsGenerated = req.validationErrors();
            let response = {}
            if (errorsGenerated) {
                response.success = false;
                response.message = "Erros are generated in the request ! ";
                response.error = errorsGenerated;
                return res.status(422).send(response);  //The 422 (Unprocessable Entity)
            }
            else {
                let result = await noteService.deletingLabelOnNote(req.body)
                if (result) {
                    res.status(200).send(result)
                }
                else {
                    res.status(400).send(result)
                }
            }
        } catch (error) {
            logger.error(error);
            res.status(400).send(error)
        }
    }

    /**
    * @description -All notes of that particular user are loaded
    * @param {*} req // request received
    * @param {*} res // response sent 
    */
    async allNotesOfUser(req, res) {
        try {
            /**
             * @description - All the content of the note made ready here by extracting data from the request 
             */
            let noteObject = {// User id is extracted from the request 
                "userId": req.token._id,
                "pageNo": req.query.pageNo,
                "size": req.query.size
            }
            //now user id is passes on to receive all the notes 
            let result = await noteService.allNotesOfUser(noteObject)
            if (result.success) {
                logger.info(`\n\n\tNOTES LOADED SUCCESFULLY !`);
                res.status(200).send(result)
            }
            else {
                logger.error(`\n\n\tPROBLEM ARISED DURING LOADING NOTES `);
                res.status(400).send(result)
            }
        } catch (error) {
            logger.error(error);
            res.status(400).send(result)
        }
    }

    /**
    * @description - A particular note of a particular user is deleted
    * @param {*} req // request received
    * @param {*} res // response sent 
    */
    async deleteNote(req, res) {
        try {
            req.body.userId = req.token._id
            req.checkBody('noteId', 'NOTE ID SHOULD NOT BE EMPTY').notEmpty()
            let errorsGenerated = req.validationErrors();
            let response = {}
            if (errorsGenerated) {
                response.success = false;
                response.message = "Erros are generated in the request ! ";
                response.error = errorsGenerated;
                return res.status(422).send(response);
            }
            else {
                let result = await noteService.deletingService(req.body)
                if (result.success) {
                    res.status(200).send(result)
                }
                else {
                    res.status(400).send(result)
                }
            }
        } catch (error) {
            logger.error(error);
            res.status(400).send(error)
        }
    }

    /**
    * @description - Particular field in the note is updated .
    * @param {*} req // request received
    * @param {*} res // response sent 
    */
    async updatingNote(req, res) {
        try {
            req.body.userId = req.token._id
            //a request has to have a note id and updating field , w/o it cant pass 
            req.checkBody('noteId', 'NOTE ID SHOULD NOT BE EMPTY').notEmpty()
            req.checkBody('updating', 'UPDATING SHOULD NOT BE EMPTY').notEmpty()
            let errorsGenerated = req.validationErrors();
            let response = {}
            if (errorsGenerated) {
                response.success = false;
                response.message = "Errors are generated in the request ! ";
                response.error = errorsGenerated;
                return res.status(422).send(response);
            }
            else {// ideal request is received now 
                let result = await noteService.updatingNote(req.body)
                if (result.success) {
                    res.status(200).send(result)
                }
                else // invalid note id 
                {
                    logger.info("\n\n\tError while finding a note and updating ");
                    res.status(400).send(result)
                }
            }
        } catch (error) {
            logger.error("\n\n\tIn note update controller ", error)
            res.status(400).send(error)
        }
    }

    /**
    * @description - Anything typed in the search bar will be searched thoroughly through all notes and fields 
    * @param {*} req // request received
    * @param {*} res // response sent 
    */
    async searchingNotes(req, res) {
        try {
            req.body.userId = req.token._id
            //what is to be searched has to be mentioned , you cant leave it empty
            req.checkBody('search', 'SEARCH FIELD SHOULD NOT BE EMPTY').notEmpty()
            let errorsGenerated = req.validationErrors();
            let response = {}
            if (errorsGenerated) {
                response.success = false;
                response.message = "Errors are generated in the request ! ";
                response.error = errorsGenerated;
                return res.status(422).send(response); //UNPROCESSABLE ENTITY
            } else {
                let result = await noteService.searchingNotes(req.body)
                if (result.success) {
                    res.status(200).send(result) // OK
                }
                else {
                    res.status(404).send(result) // NOT FOUND
                }
            }
        } catch (error) {
            res.status(400).send(error)
            logger.error(error)
        }
    }

    /**
     * @description - All notes on whom reminders are logged will be extracted and shown .
     * @param {*} req 
     * @param {*} res 
     */
    async allRemindersOfUsers(req, res) {
        try {
            /**
            * @description - All the content of the note made ready here by extracting data from the request 
            */
            let noteObject = {// User id is extracted from the request 
                "userId": req.token._id,
                "pageNo": req.query.pageNo,
                "size": req.query.size
            }
            //now user id is passed on to receive all the notes 
            let result = await noteService.allRemindersOfUsers(noteObject)
            if (result.success) {
                logger.info(`REMINDERS LOADED SUCCESFULLY !`);
                res.status(200).send(result)
            }
            else {
                logger.info(`PROBLEM ARISED DURING LOADING REMINDERS `);
                res.status(400).send(result)
            }
        } catch (error) {
            logger.error(error);
            res.status(400).send(error)
        }
    }

     /**
     * @description - All notes which are archived will be extracted and shown .
     * @param {*} req 
     * @param {*} res 
     */
    async allArchivesOfUsers(req, res) {
        try {
            /**
            * @description - All the content of the note made ready here by extracting data from the request 
            */
            let noteObject = {// User id is extracted from the request 
                "userId": req.token._id,
                "pageNo": req.query.pageNo,
                "size": req.query.size
            }
            //now user id is passed on to receive all the notes 
            let result = await noteService.allArchivesOfUsers(noteObject)
            if (result.success) {
                logger.info(`ARCHIVES LOADED SUCCESFULLY !`);
                res.status(200).send(result)
            }
            else {
                logger.error(`PROBLEM ARISED DURING LOADING ARCHIVES `);
                res.status(400).send(result)
            }
        } catch (error) {
            logger.error(error);
            res.status(400).send(error)
        }
    }

    /**
     * @description - All notes which are trashed will be extracted and shown .
     * @param {*} req 
     * @param {*} res 
     */
    async allTrashOfUsers(req, res) {
        try {
            /**
            * @description - All the content of the note made ready here by extracting data from the request 
            */
            let noteObject = {// User id is extracted from the request 
                "userId": req.token._id,
                "pageNo": req.query.pageNo,
                "size": req.query.size
            }
            //now user id is passed on to receive all the notes 
            let result = await noteService.allTrashOfUsers(noteObject)
            if (result.success) {
                logger.info(`ALL TRASH LOADED SUCCESFULLY !`);
                res.status(200).send(result)
            }
            else {
                logger.error(`PROBLEM ARISED DURING LOADING TRASH `);
                res.status(400).send(result)
            }
        } catch (error) {
            logger.error(error);
            res.status(400).send(error)
        }
    }

    /**
     * @description - Notes with specific label will be loaded .
     * @param {*} req 
     * @param {*} res 
     */
    async labelledNotes(req, res) {
        try {
            /**
            * @description - All the content of the note made ready here by extracting data from the request 
            */
            let noteObject = {// User id is extracted from the request 
                "userId": req.token._id,
                "labelName": req.body.labelName,
                "pageNo": req.query.pageNo,
                "size": req.query.size
            }
            //now user id is passed on to receive all the notes 
            let result = await noteService.labelledNotes(noteObject)
            if (result.success) {
                logger.info(`ALL LABELLED NOTES LOADED SUCCESFULLY !`);
                res.status(200).send(result)
            }
            else {
                logger.error(`PROBLEM ARISED DURING LOADING LABELLED NOTES `);
                res.status(400).send(result)
            }
        } catch (error) {
            logger.error(error);
            res.status(400).send(error)
        }
    }

}

let noteIntance = new Note()

module.exports = noteIntance