/*************************************************************************
 * Execution        : 1. default node       cmd> nodemon noteService.js
 * 
 * Purpose          : Request's set data from the controller is being received in 
 *                    the service and then sent forward to the model  .
 * 
 * @file            : noteService.js
 * @author          : Purushottam
 * @version         : 1.0
 * @since           : 4-10-2019
 * 
 **************************************************************************/

let noteModel = require('../models/note')
const logger = require('../logger')
const redisDb = require('./redis')

class Note {

    /**
     * @description - First gets the login token of that paticular user then flushes of all the cache in redis
     *                then again adds the token to ensure that the user doesnt gets logged out ! 
     * @param {*} userId 
     */
    async refreshRedis(userId) {//routine
        try {
        
            let arrayOfKeysInRedis=[userId+"allNotes",userId+"allReminders",userId+"allTrash",userId+"allArchives"]
            let redisResult = await redisDb.deleteKeys(arrayOfKeysInRedis)
            logger.info("redis result",redisResult)
            if(redisResult){
                return redisResult
            }
            else{
                return false
            }
        } catch (error) {
            logger.error(error)
            return error
        }
    }

    /**
     * @description - Note response from the model is received after invoking note model 
     * @param {*} creatingData 
     */
    async creatingService(creatingData) { // new note details are passed
        try {
            //passed on to the model for communicating with the database
            let noteResult = await noteModel.create(creatingData)
            if (noteResult) {// succesfull operation
                let refreshResult = await this.refreshRedis(creatingData.userId)
                if (refreshResult) {
                    logger.info(`Redis refreshed !`)
                    return { "success": true, "message": "NOTE CREATED SUCCESFULLY !", "data": noteResult }
                } else { // problem occured while refreshing redis
                    logger.info(`Redis not refreshed .`)
                    return { "success": true, "message": "NOTE CREATED SUCCESFULLY (NO DATA IN REDIS TO REFRESH )", "data": noteResult }
                }
            }
            else {//unsuccess full operation 
                return { "success": false, "message": "NOTE NOT SAVED", "data": noteResult }
            }
        } catch (error) {
            logger.error(error)
            return { "success": false, "message": "ERROR IN NOTE SERVICE", "data": error }
        }
    }

    /**
     * @description -  A new or existing label is added on to the note  
     * @param {*} labelData 
     */
    async addingLabelOnNote(labelData) {
        try {
            let toFindQuery = {//the first argument for findOneAndUpdate for finding the document is made here itself
                "_id": labelData.noteId,
                "userId": labelData.userId
            }
            let updatingQuery = {//the second argument for findOneAndUpdate to update a particular field is made here itself
                $push: { "label": labelData.labelId }  // pushing into the array of labels
            }
            //now both queries are passed further
            let result = await noteModel.updatingNote(toFindQuery, updatingQuery);
            if (result) {//successfull
                let refreshResult = await this.refreshRedis(labelData.userId)
                if (refreshResult) {
                    logger.info(`Redis refreshed !`)
                    logger.info(`LABEL ADDED ON NOTE '${result.title}' id :-(${result._id}) SUCCESFULLY !`);
                    return { "success": true, "message": `LABEL ADDED ON NOTE '${result._id}' SUCCESFULLY ! (REDIS REFRESHED)`, "data": result }
                } else { // problem occured while refreshing redis
                    logger.info(`Redis not refreshed .`)
                    return { "success": false, "message": `LABEL ADDED ON NOTE '${result._id}' SUCCESFULLY !  (NO DATA IN REDIS TO REFRESH)`, "data": result }
                }
            }
        } catch (error) {
            logger.error(error);
            return { "success": false, "message": ` Error in service  !`, "error": error }
        }
    }

    /**
     * @description - A label id deleted from a note  
     * @param {*} labelData 
     */
    async deletingLabelOnNote(labelData) {
        try {
            let toFindQuery = { // what is to be found
                "_id": labelData.noteId,
                "userId": labelData.userId
            }
            let updatingQuery = {
                $pull: { "label": labelData.labelId }   // pulling out of the array 
            }
            //both queries passed
            let result = await noteModel.updatingNote(toFindQuery, updatingQuery);
            if (result) { // successfull 
                let refreshResult = await this.refreshRedis(labelData.userId)
                if (refreshResult) {
                    logger.info(`Redis refreshed !`)
                    logger.info(`LABEL DELETED FROM NOTE '${result.title}' id :-(${result._id}) SUCCESFULLY !`);
                    return { "success": true, "message": `LABEL DELETED FROM NOTE '${result._id}' SUCCESFULLY ! (redis refreshed)`, "data": result }
                } else { // problem occured while refreshing redis
                    logger.info(`Redis not refreshed .`)
                    return { "success": false, "message": `LABEL DELETED FROM NOTE '${result._id}' SUCCESFULLY ! (no data in redis to refresh)`, "data": result }
                }
            }
        } catch (error) {
            logger.error(error);
            return { "success": false, "message": ` Error in service  !`, "error": error }
        }
    }

    /**
     * @description - A note is deleted 
     * @param {*} deletingData 
     */
    async deletingService(deletingData) {
        try {
            let deletingQuery = {
                'userId': deletingData.userId,
                '_id': deletingData.noteId
            }
            //query is being made and passed on to the db for deleting the particular note 
            let result = await noteModel.deletingNote(deletingQuery)
            if (result.deletedCount == 1) { // deleteOne method of mongoose returns a 'deletedCount' field 
                let refreshResult = await this.refreshRedis(deletingQuery.userId)
                if (refreshResult) {
                    logger.info(`Redis refreshed !`)
                    logger.info(`NOTE DELETED SUCCESFULLY !`);
                    return { "success": true, "message": `NOTE DELETED SUCCESFULLY ! (redis refreshed)`, "data": result }
                } else { // problem occured while refreshing redis
                    logger.info(`Redis not refreshed .`)
                    return { "success": false, "message":  `NOTE DELETED SUCCESFULLY ! (no data in redis to refresh)`, "data": result }
                }
            }
            else {// w/o the ' deletedCount ' field
                return { "success": false, "message": `NOTE NOT DELETED .`, "data": result }
            }
        } catch (error) {
            logger.error(error)
            return { "success": false, "message": "ERROR IN NOTE SERVICE", "erorr": error }
        }
    }

    /**
     * @description - A particular field from a note is updated 
     * @param {*} updatingData 
     */
    async updatingNote(updatingData) { // particular note is being first found and then updated in same method
        try {
            let query = { '_id': updatingData.noteId }
            let updatingQuery = { $set: updatingData.updating }
            //both queries passed on to the model to find and update that note .
            let result = await noteModel.updatingNote(query, updatingQuery)
            if (result._id) { // if successfull updation is carried out then the result contains a id
                var keys = Object.keys(updatingData.updating);
                let refreshResult = await this.refreshRedis(updatingData.userId)
                if (refreshResult) {
                    logger.info(`Redis refreshed !`)
                    logger.info(` '${keys[0]}' of note '${updatingData.noteId}' updated succesfully !`);
                    return { "success": true, "message": ` '${keys[0]}' of note '${updatingData.noteId}' updated succesfully ! (redis refreshed)`, "data": result }
                } else { // problem occured while refreshing redis
                    logger.info(`Redis not refreshed .`)
                    return { "success": false, "message": ` '${keys[0]}' of note '${updatingData.noteId}' updated succesfully ! (no data in redis to refresh)`, "data": result }
                }
            }
            else { // unsuccesfull updation doesnt send a id
                return { "success": false, "message": ` Error occured in database while finding and updating !`, "data": result }
            }
        } catch (error) {
            logger.error("In note Service", error)
            return { "success": false, "message": "ERROR IN NOTE SERVICE", "error": error }
        }
    }

    /**
     * @description - Searching is carried out all along the notes ... 
     * @param {*} searchingData 
     */
    async searchingNotes(searchingData) {
        try {
            let enteredData = searchingData.search
            //searching query for the notes schema is made first
            let findingQuery = {
                $and: [{
                    $or: // the $or carries out the optional functionality
                        [   //options i	Case insensitivity to match upper and lower cases. 
                            { 'title': { $regex: enteredData, $options: 'i' } },
                            { 'description': { $regex: enteredData, $options: 'i' } },
                            { 'reminder': { $regex: enteredData, $options: 'i' } },
                            { 'color': { $regex: enteredData, $options: 'i' } }
                        ]
                }, { 'userId': searchingData.userId }]
            }
            //firstly in the notes schema searching is done
            let searchResultArray = await noteModel.searchingNotes(findingQuery)
            logger.info("\n\n\tResult of searching --> ", searchResultArray);

            //we got the result of searching in note schema now lets move to labels
            if (searchResultArray.length >= 0) {
                //userQuery is necessary as we need to find the documents of that particular user only 
                // two users can have labels of same name
                let userQuery = { "userId": searchingData.userId }
                //now the search is carried out in labels documents 

                let labelSearchArray = await noteModel.labelSearch(enteredData, userQuery);
                if (labelSearchArray.length > 0) { // if the entered search string is found as a label name in one of the documents
                    //to eliminate duplicate searches we need to carry out two for loops
                    for (let i = 0; i < labelSearchArray.length; i++) {
                        for (let j = 0; j < searchResultArray.length; j++) {
                            if (labelSearchArray[i]._id.equals(searchResultArray[j]._id)) {//comparing note ids
                                searchResultArray.splice(j, 1)
                            }
                        }
                        searchResultArray.push(labelSearchArray[i]); // both searches are combined here 
                    }
                    //combined search is returned
                    return { "success": true, "message": "ALL NOTES AND LABELS FOUND !", "data": searchResultArray }
                } else if (searchResultArray.length > 0) { // no labels are found but only other fields are found
                    // only search in notes Schema result is returned
                    return { "success": true, "message": "ALL NOTES FOUND !", "data": searchResultArray }
                } else {                    //no labels are found 
                    return { "success": false, "message": "NO ITEMS FOUND !", "data": searchResultArray }
                }
            }
            // no else need because we have give ' >= 0 ' in if statement 
        } catch (error) {
            logger.error(error);
            let response = {}
            response.success = false
            response.message = `ERROR IN SERVICE`
            response.error = error
            return response
        }
    }

    /**
     * @description - All notes of the user are loaded . 
     * @param {*} userData 
     */
    async allNotesOfUser(userData) {
        try {
            console.log("user id ", userData.userId);

            let result = await redisDb.getCache(userData.userId + "allNotes")
            if (result) {//checking for the data present in redis cache
                //notes retrieved from redis database
                console.log();//adding a space for a better console view

                // normal request to get all notes without giving page no and size 
                if (userData.pageNo === undefined || userData.size === undefined) {
                    logger.info(`A request is being made without pagination !`)
                    return { "success": true, "message": "ALL NOTES LOADED SUCCESSFULLY !", "data": JSON.parse(result) }
                }
                else { // request with page no and size
                    let pageNo = parseInt(userData.pageNo) //page number is given in the query of the request
                    let size = parseInt(userData.size) // size describes how many notes you want to show on a single page
                    logger.info(`A request is being made with pagination ! Page no - ${pageNo} , Size - ${size}`)
                    let parsedResult = JSON.parse(result)
                    logger.info('All notes --->', parsedResult)
                    //slice used for pagination 
                    let sliceResult = await parsedResult.slice((pageNo - 1) * size, pageNo * size)//range is set here 
                    if (sliceResult) {
                        logger.info('Redis result', sliceResult)
                        return { "success": true, "message": "ALL NOTES LOADED SUCCESSFULLY !", "data": sliceResult }
                    }
                }
            }
            else {//checking for the data present in mongodb
                // let query = {} // for pagination
                // let pageNo = parseInt(userData.pageNo) //page number is given in the query of the request
                // let size = parseInt(userData.size) // size describes how many notes you want to show on a single page
                // if (pageNo < 0 || pageNo == 0) {
                //     return { "success": false, "message": "INVALID REQUEST" }
                // }
                // query.skip = size * (pageNo - 1) // the number of notes to skip (of previous pages) will be determined here 
                // query.limit = size // cant exceed this count to show the notes on the page

                // let notesResult = await noteModel.allNotesOfUser(userData, query) // all notes of that particular user are expected
                let notesResult = await noteModel.allNotesOfUser(userData) // all notes of that particular user are expected
                if (notesResult) {
                    //setting the notes array in redis in order to get the redis data in if block itself , it saves time
                    logger.info(`NOTES LOADED FROM DATABASE -->`, notesResult)
                    let key = userData.userId + "allNotes"
                    let redisResult = await redisDb.setCache(key, JSON.stringify(notesResult))
                    logger.info('redis result ', redisResult)
                    return { "success": true, "message": "ALL NOTES LOADED SUCCESSFULLY !", "data": notesResult }
                }
                else {
                    return { "success": false, "message": "NOTES NOT FOUND" }
                }
            }
        } catch (error) {
            logger.error(error)
            return { "success": false, "message": "ERROR IN NOTE SERVICE", "error": error }
        }
    }

    /**
    * @description - All reminders of the user are loaded . 
    * @param {*} userData 
    */
    async allRemindersOfUsers(reminderData) {
        try {
            console.log("user id ", reminderData.userId);

            let result = await redisDb.getCache(reminderData.userId + "allReminders")
            if (result) {//redis check
                //notes with reminders retrieved from redis database
                console.log();//adding a space for a better console view

                // normal request to get all notes with reminders without giving page no and size 
                if (reminderData.pageNo === undefined || reminderData.size === undefined) {
                    logger.info(`A request is being made without pagination !`)
                    return { "success": true, "message": "ALL NOTES WITH REMINDERS LOADED SUCCESSFULLY !", "data": JSON.parse(result) }
                }
                else { // request with page no and size
                    let pageNo = parseInt(reminderData.pageNo) //page number is given in the query of the request
                    let size = parseInt(reminderData.size) // size describes how many notes you want to show on a single page
                    logger.info(`A request is being made with pagination ! Page no - ${pageNo} , Size - ${size}`)
                    let parsedResult = JSON.parse(result)
                    logger.info('All notes --->', parsedResult)
                    //slice used for pagination 
                    let sliceResult = await parsedResult.slice((pageNo - 1) * size, pageNo * size)//range is set here 
                    if (sliceResult) {
                        logger.info('Redis result', sliceResult)
                        return { "success": true, "message": "ALL NOTES WITH REMINDERS LOADED SUCCESSFULLY !", "data": sliceResult }
                    }
                }
            }
            else {// PAGINATION NOT APPLIED HERE BECAUSE FOR THE FIRST TIME WE WANT TO SAVE ALL NOTES IN CACHE
                // SO IF PAGINATION IS APPLIED ONLY SPECIFIC NOTES WILL BE SAVED WHICH WE DONT WANT
                let notesResult = await noteModel.allRemindersOfUsers(reminderData) // notes with reminders will load
                if (notesResult.length > 0) {
                    //setting the reminders notes array in redis in order to get the redis data in if block itself , it saves time
                    logger.info(`NOTES WITH REMINDERS LOADED FROM DATABASE -->`, notesResult)
                    let key = reminderData.userId + "allReminders"
                    let redisResult = await redisDb.setCache(key, JSON.stringify(notesResult))
                    logger.info('redis result ', redisResult)
                    return { "success": true, "message": "ALL REMINDERS NOTES LOADED SUCCESFULLY !", "data": notesResult }
                }
                else {
                    return { "success": false, "message": "REMINDERS NOT LOADED !", "data": notesResult }
                }
            }
        } catch (error) {
            console.log(error)
            return { "success": false, "message": "ERROR IN NOTE SERVICE", "error": error }
        }
    }

    /**
    * @description - All archives of the user are loaded . 
    * @param {*} userData 
    */
    async allArchivesOfUsers(archiveData) {
        try {
            console.log("user id ", archiveData.userId);

            let result = await redisDb.getCache(archiveData.userId + "allArchives")
            console.log("\n\n\tResult of cache -->", result)
            if (result) {//redis check
                //archived retrieved from redis database
                console.log();//adding a space for a better console view

                // normal request to get all archived notes without giving page no and size 
                if (archiveData.pageNo === undefined || archiveData.size === undefined) {
                    logger.info(`A request is being made without pagination !`)
                    return { "success": true, "message": "ALL ARCHIVED NOTES LOADED SUCCESSFULLY !", "data": JSON.parse(result) }
                }
                else { // request with page no and size
                    let pageNo = parseInt(archiveData.pageNo) //page number is given in the query of the request
                    let size = parseInt(archiveData.size) // size describes how many notes you want to show on a single page
                    logger.info(`A request is being made with pagination ! Page no - ${pageNo} , Size - ${size}`)
                    let parsedResult = JSON.parse(result)
                    logger.info('All notes --->', parsedResult)
                    //slice used for pagination 
                    let sliceResult = await parsedResult.slice((pageNo - 1) * size, pageNo * size)//range is set here 
                    if (sliceResult) {
                        logger.info('Redis result', sliceResult)
                        return { "success": true, "message": "ALL ARCHIVED NOTES LOADED SUCCESSFULLY !", "data": sliceResult }
                    }
                }
            }
            else {// PAGINATION NOT APPLIED HERE BECAUSE FOR THE FIRST TIME WE WANT TO SAVE ALL NOTES IN CACHE
                // SO IF PAGINATION IS APPLIED ONLY SPECIFIC NOTES WILL BE SAVED WHICH WE DONT WANT
                let notesResult = await noteModel.allArchivesOfUsers(archiveData) // archive notes will load
                if (notesResult.length > 0) {
                    //setting the archived notes array in redis in order to get the redis data in if block itself , it saves time
                    logger.info(`ARCHIVED NOTES LOADED FROM DATABASE -->`, notesResult)
                    let key = archiveData.userId + "allArchives"
                    let redisResult = await redisDb.setCache(key, JSON.stringify(notesResult))
                    logger.info('redis result ', redisResult)
                    return { "success": true, "message": "ALL ARCHIVED NOTES LOADED SUCCESFULLY !", "data": notesResult }
                }
                else {
                    return { "success": false, "message": "ARCHIVED NOTES NOT LOADED !", "data": notesResult }
                }
            }
        } catch (error) {
            console.log(error)
            return { "success": false, "message": "ERROR IN NOTE SERVICE", "error": error }
        }
    }

    /**
    * @description - All trashed notes of the user are loaded . 
    * @param {*} userData 
    */
    async allTrashOfUsers(trashData) {
        try {
            console.log("user id ", trashData.userId);

            let result = await redisDb.getCache(trashData.userId + "allTrash")
            console.log("\n\n\tResult of cache -->", result)
            if (result) {//redis check
                //trash retrieved from redis database
                console.log();//adding a space for a better console view

                // normal request to get all trashed notes without giving page no and size 
                if (trashData.pageNo === undefined || trashData.size === undefined) {
                    logger.info(`A request is being made without pagination !`)
                    return { "success": true, "message": "ALL TRASHED NOTES LOADED SUCCESSFULLY !", "data": JSON.parse(result) }
                }
                else { // request with page no and size
                    let pageNo = parseInt(trashData.pageNo) //page number is given in the query of the request
                    let size = parseInt(trashData.size) // size describes how many notes you want to show on a single page
                    logger.info(`A request is being made with pagination ! Page no - ${pageNo} , Size - ${size}`)
                    let parsedResult = JSON.parse(result)
                    logger.info('All notes --->', parsedResult)
                    //slice used for pagination 
                    let sliceResult = await parsedResult.slice((pageNo - 1) * size, pageNo * size)//range is set here 
                    if (sliceResult) {
                        logger.info('Redis result', sliceResult)
                        return { "success": true, "message": "ALL TRASHED NOTES LOADED SUCCESSFULLY !", "data": sliceResult }
                    }
                }
            }
            else {// PAGINATION NOT APPLIED HERE BECAUSE FOR THE FIRST TIME WE WANT TO SAVE ALL NOTES IN CACHE
                // SO IF PAGINATION IS APPLIED ONLY SPECIFIC NOTES WILL BE SAVED WHICH WE DONT WANT
                let notesResult = await noteModel.allTrashOfUsers(trashData) // trashed notes will load
                if (notesResult.length > 0) {
                    //setting the trashed notes array in redis in order to get the redis data in if block itself , it saves time
                    logger.info(`TRASHED NOTES LOADED FROM DATABASE -->`, notesResult)
                    let key = trashData.userId + "allTrash"
                    let redisResult = await redisDb.setCache(key, JSON.stringify(notesResult))
                    logger.info('redis result ', redisResult)
                    return { "success": true, "message": "ALL TRASHED NOTES LOADED SUCCESFULLY !", "data": notesResult }
                }
                else {
                    return { "success": false, "message": "TRASHED NOTES NOT LOADED !", "data": notesResult }
                }
            }
        } catch (error) {
            console.log(error)
            return { "success": false, "message": "ERROR IN NOTE SERVICE", "error": error }
        }
    }

    /**
    * @description - All particular labelled notes of the user are loaded . 
    * @param {*} userData 
    */
    async labelledNotes(labelledData) {
        try {
            let enteredData = labelledData.labelName
            let userQuery = { "userId": labelledData.userId }
            let query = {} // for pagination
            let pageNo = parseInt(labelledData.pageNo)//page number is given in the query of the request
            let size = parseInt(labelledData.size)// size describes how many notes you want to show on a single page

            if (pageNo < 0 || pageNo == 0) {
                return { "success": false, "message": "INVALID REQUEST" }
            }
            query.skip = size * (pageNo - 1)
            query.limit = size
            let notesResult = await noteModel.labelSearch(enteredData, userQuery); // labelled notes will load
            if (notesResult.length > 0) {
                return { "success": true, "message": "ALL LABELLED NOTES LOADED SUCCESFULLY !", "data": notesResult }
            }
            else {
                return { "success": false, "message": "LABELLED NOTES NOT LOADED !", "data": notesResult }
            }
        } catch (error) {
            logger.error(error)
            return { "success": false, "message": "ERROR IN NOTE SERVICE", "error": error }
        }
    }
}

let noteInstance = new Note()

module.exports = noteInstance