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
const userController = require('../controllers/user');
const noteController = require('../controllers/note')
const labelController = require ('../controllers/label')
const tokenFile = require('../middlewares/token')
const upload = require('../services/multer');
const singleUpload = upload.single('file')
/** USER CRUD */
route.post('/registration', userController.registering);
route.post('/emailVerification',tokenFile.verifyRegistrationToken,userController.verifyingEmail)
route.post('/login',userController.loggingIn)
// route.post('/upload',tokenFile.verifyToken,multer.single('file'),userController.imageUploading)
route.post('/upload',tokenFile.verifyToken, (req, res) => {
    singleUpload(req, res, (err, data) => {
        if(err){
        return res.status(422).send({errors: err})
        }else{
            console.log("req: ", req);
            console.log("data: ", data);
            
            
            console.log("file: ", req.file.location);
            return res.json({"imgUrl": req.file.location})
            
        }
    })
})

route.post('/forgetPassword',userController.forgettingPassword)
route.post('/resetPassword',tokenFile.verifyRegistrationToken,userController.resettingPassword)

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