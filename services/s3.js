/*************************************************************************
 * Execution        : 1. default node      
 * 
 * Purpose          : S3 credentials provided here using aws jdk modoule
 * 
 * @file            : s3.js
 * @author          : Purushottam
 * @version         : 1.0
 * @since           : 30-09-2019
 * 
 **************************************************************************/

const AWS = require('aws-sdk');
require('dotenv').config()

const s3Client = new AWS.S3({
    signatureVersion: 'v4',                     // this enables the image to download
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,

});

module.exports = s3Client;