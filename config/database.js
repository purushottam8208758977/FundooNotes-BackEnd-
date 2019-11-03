/*************************************************************************
 * Execution        : 1. default node       cmd> nodemon database.js
 * 
 * Purpose          : Contains the url which is used in the server.js to connect
 *                    to the database . 
 * 
 * @file            : database.js
 * @author          : Purushottam
 * @version         : 1.0
 * @since           : 23-09-2019
 * 
 **************************************************************************/
require('dotenv').config()

 module.exports={
    url: process.env.MONGODBURL // name of db given here 
}