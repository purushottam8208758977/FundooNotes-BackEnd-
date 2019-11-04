/*************************************************************************
 * Execution        : 1. default node       cmd> nodemon noteModel.js
 * 
 * Purpose          : Model contains the schema for database as mongodb is without
 *                    schema and the data received from the service is put in the 
 *                    schema and that schema variable's model is saved in the 
 *                    MONGODB DATABASE .
 * 
 * @file            : noteModel.js
 * @author          : Purushottam
 * @version         : 1.0
 * @since           : 23-09-2019
 * 
 **************************************************************************/

const mongoose = require('mongoose')
const logger = require('../logger')
const cron = require('node-cron')

let note = mongoose.Schema({

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: [true, "userId id required !"]
    },
    title: {
        type: String
    },
    description: {
        type: String
    },
    trash: {
        type: Boolean
    },
    archive: {
        type: Boolean
    },
    reminder: {
        type: String
    }
    ,
    color: {
        type: String
    },
    label: [{ type: mongoose.Schema.Types.ObjectId, ref: "labels", unique: true }]
},
    {
        timestamps: true
    })

let notesModel = mongoose.model('notes', note)

class noteModel {
    /**
     * @description - A new node is saved in database 
     * @param {*} noteData 
     */
    async create(noteData) {
        try {
            let newNote = new notesModel(noteData)
            let savingNoteResult = await newNote.save()  // by making a new model a new note is saved in db
            if (savingNoteResult) {
                logger.info(`New note successfully saved !`);
                return savingNoteResult
            }
            else {
                logger.error(`New note not saved !`);
                return false
            }
        } catch (error) {
            logger.error(error);
            return error
        }
    }

    /**
     * @description - A note (document) is deleted .
     * @param {*} deleteData 
     */
    async deletingNote(deleteData) {
        try {
            logger.info(`\n\n\tData in model --> ${deleteData}`);
            let result = await notesModel.deleteOne(deleteData)
            if (result.deletedCount == 1) {
                logger.info(`NOTE DELETED SUCCESSFULLY !`);
                return result
            }
            else {
                logger.error(`NOTE NOT DELETED`);
                return result
            }
        } catch (error) {
            logger.error(`Entered note id not found`);
            logger.error("Error in model ", error);
            return error
        }
    }

    /**
     * @description - A note is being founded and updated !
     * @param {*} query 
     * @param {*} updatingQuery 
     */
    async updatingNote(query, updatingQuery) {
        try {
            let result = await notesModel.findOneAndUpdate(query, updatingQuery)
            if (result) {
                return result
            }
        } catch (error) {
            logger.error("Error in update note model", error);
            return error
        }
    }

    /**
     * @description - Finds the string typed by the user to find in the db (in this schema only)
     * @param {*} findingQuery 
     */
    async searchingNotes(findingQuery) {
        try {
            let result = await notesModel.find(findingQuery)
            if (result.length > 0) {
                logger.info(`Notes found --->\n\n\t ${result}`);
                return result
            }
            else {
                logger.error(`No notes found !`);
                return result
            }
        } catch (error) {
            logger.error(error);

            return error
        }
    }

    /**
     * @description - Finds the string typed by the user to find (in label collection - using reference )
     * @param {*} enteredValue 
     * @param {*} userQuery 
     */
    async labelSearch(enteredValue, userQuery) {
        return new Promise((resolve, reject) => {
            notesModel.find(userQuery).populate({
                path: 'label', // path signifies which field in this schema to search
                match: { labelName: { $regex: enteredValue } } // labelName is the name of the field in label collection
            }).exec(function (err, allDocuments) {
                logger.info("All documents ", allDocuments);
                let matchedDocuments = allDocuments.filter(function (singleDocument) {
                    if (singleDocument.label.length > 0)
                        return singleDocument;
                });
                logger.info("Matched Documents --> ", JSON.stringify(matchedDocuments));
                resolve(matchedDocuments);
            });
        });
    }

    /**
    * @description - All notes of user are retrieved from db
    * @param {*} userData 
    */
    async allNotesOfUser(userData) {
        try {
            // we need to display those notes which are not trashed and which are not archived 
            let result = await notesModel.find({ 'userId': userData.userId, "trash": false, "archive": false }, {})
            if (result.length > 0) {// if those are found a array is returned
                logger.info(`${result.length} notes found`);
                return result
            }
            else {
                logger.error(`No notes found `);
                return result  //it is a empty object 
            }
        } catch (error) {
            logger.error(error);
            return error
        }
    }

    /**
     * @description - All notes which are patched with reminders will be loaded of that particular user
     * @param {*} reminderData 
     * @param {*} query 
     */
    async allRemindersOfUsers(reminderData) {
        try {
            //we need to find those notes which are patched with reminders and not trashed at the same time
            let result = await notesModel.find({ 'userId': reminderData.userId, "reminder": { $nin: [null, ""] }, "trash": false }, {})
            logger.info("\n\n\t---->", result);
            if (result.length > 0) {// if those are found a array is returned
                logger.info(`${result.length} notes with reminders found`);
                return result
            }
            else {
                logger.error(`No notes with reminders found `);
                return result  //it is a empty object 
            }
        } catch (error) {
            logger.error(error);
            return error
        }
    }

    /**
     * @description - All notes which are archived will be loaded of that particular user
     * @param {*} reminderData 
     * @param {*} query 
     */
    async allArchivesOfUsers(archiveData, query) {
        try {
            //we need to find those notes which are archived and not trashed 
            let result = await notesModel.find({ 'userId': archiveData.userId, "archive": true, "trash": false }, {}, query)
            logger.info("---->", result);
            if (result.length > 0) {// if those are found a array is returned
                logger.info(`${result.length} notes who are archived found`);
                return result
            }
            else {
                logger.error(`No notes who are archived found `);
                return result  //it is a empty object 
            }
        } catch (error) {
            logger.error(error);
            return error
        }
    }

    /**
     * @description - All notes which are trashed will be loaded of that particular user
     * @param {*} reminderData 
     * @param {*} query 
     */
    async allTrashOfUsers(trashData, query) {
        try {
            let result = await notesModel.find({ 'userId': trashData.userId, "trash": true }, {}, query)
            logger.info("---->", result);
            if (result.length > 0) {// if those are found a array is returned
                logger.info(`${result.length} notes who are trashed found`);
                return result
            }
            else {
                logger.info(`No notes who are trashed found `);
                return result  //it is a empty object 
            }
        } catch (error) {
            logger.info(error);
            return error
        }
    }

    /**
     * @description - A notification for the reminder is being set up
     */
    async notificationSetup() {
        try {
            // first finding all notes of all users every second (because this method will be called inside a 
            // scheduler which will execute every second)
            let result = await notesModel.find({})
            if (result.length > 0) { // all notes found !
                // logger.info(`Notes found ! !\n\n`)
                for (let i = 0; i < result.length; i++) {
                    if (result[i].reminder != "" || result[i].reminder != null) { // we want on the notes which have valid reminders

                        //logger.info(`Reminders found --->\n\n`)

                        let todaysDate = new Date();// current date 
                        // console.log(Date.parse(todaysDate))
                        //console.log("console time -->",todaysDate)
                         // logger.info(`Date without parsing --->  ${todaysDate}\n\n`)

                        //parsing the date gives us a single number by which we can operate on it accordingly
                        todaysDate = Date.parse(todaysDate);
                        //   logger.info(`Today's date after parsing --> ${todaysDate}\n\n`)

                        let reminder = result[i].reminder; // reminder picked up for comparison
                        // logger.info(`Reminder for note '${result[i].title}' without parsing --> ${reminder}\n\n`)

                        reminder = Date.parse(reminder);
                        // logger.info(`Reminder after parsing --> ${reminder}\n\n`);

                        //logger.info(`reminder - todays Date ---> ${reminder-todaysDate}`)
                        // if ((reminder-todaysDate)<120000 && (reminder-todaysDate)>0 ) {
                        if (reminder == todaysDate) {
                            //logger.info(`Reminder for user '${result.userId}' --> Note --> ${result[i]}`)
                        }
                    }
                    else {
                        //  logger.info('Reminders for any note were not found !\n\n')
                    }
                }
            }
            else {
                //logger.info(`No notes present in  !\n\n`)
            }
        } catch (error) {
            // logger.error(error)
        }
    }


}
let noteModelInstance = new noteModel()
cron.schedule('* * * * * * ', () => { // this scheduler will execute every second 
    noteModelInstance.notificationSetup()
})
module.exports = noteModelInstance

