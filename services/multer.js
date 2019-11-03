/*************************************************************************
 * Execution        : 1. default node     
 * 
 * Purpose          : Multer used to upload images using s3 bucket 
 * 
 * @file            : multer.js
 * @author          : Purushottam
 * @version         : 1.0
 * @since           : 30-09-2019
 * 
 **************************************************************************/

const multer = require('multer');
const multerS3 = require('multer-s3')
const s3 = require('../services/s3.js');

require('dotenv').config()

var upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: process.env.BUCKET,
        key: (req, file, callback) => {
            
            // console.log("\n\n\tFile received in config --> multer ", file);
            callback(null, file.originalname);
        }
    })
});

module.exports = upload;