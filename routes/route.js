/*************************************************************************
 * Execution        : 1. default node       cmd> nodemon route.js
 * 
 * Purpose          : Route collects the data from server.js and sends forward to
 *                    controller for further processing  . 
 * @file            : route.js
 * @author          : Purushottam
 * @version         : 1.0
 * @since           : 22-08-2019
 * 
 **************************************************************************/

const express = require('express');
const multer= require('../services/multer.js')
const route = express.Router();
const controllerUsed = require('../controllers/userController');
const noteController = require('../controllers/noteController')
const labelController = require ('../controllers/labelController')
const tokenFile = require('../middlewares/token')

/** USER CRUD */
route.post('/registration', controllerUsed.registering);
route.post('/emailVerification',tokenFile.verifyRegistrationToken,controllerUsed.verifyingEmail)
route.post('/login',controllerUsed.loggingIn)
route.post('/upload',tokenFile.verifyToken,multer.single('file'),controllerUsed.imageUploading)
route.post('/forgetPassword',controllerUsed.forgettingPassword)
route.post('/resetPassword',tokenFile.verifyRegistrationToken,controllerUsed.resettingPassword)

/** NOTES CRUD */
route.post('/createNote',tokenFile.verifyToken,noteController.creatingNote)
route.get('/allNotes',tokenFile.verifyToken,noteController.allNotesOfUser)
route.post('/deleteNote',tokenFile.verifyToken,noteController.deleteNote)
route.post('/updateNote',tokenFile.verifyToken,noteController.updatingNote)
route.post('/search',tokenFile.verifyToken,noteController.searchingNotes)

/** LABELS CRUD */
route.post('/createLabel',tokenFile.verifyToken,labelController.createLabel)
route.get('/allLabels',tokenFile.verifyToken,labelController.allLabelsOfUser)
route.post('/updateLabel',tokenFile.verifyToken,labelController.updatingLabel)
route.post('/deleteLabel',tokenFile.verifyToken,labelController.deletingLabel)

/**OPERATION ON NOTES AND LABELS */
route.post('/addLabelOnNote',tokenFile.verifyToken,noteController.addingLabelOnNote)
route.post('/deleteLabelOnNote',tokenFile.verifyToken,noteController.deletingLabelOnNote)

/**LISTING */
route.get('/allReminders',tokenFile.verifyToken,noteController.allRemindersOfUsers)
route.get('/allArchives',tokenFile.verifyToken,noteController.allArchivesOfUsers)
route.get('/allTrash',tokenFile.verifyToken,noteController.allTrashOfUsers)
route.get('/labelledNotes',tokenFile.verifyToken,noteController.labelledNotes)

module.exports = route;