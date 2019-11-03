const dbConfig = require('../config/database')
const logger = require('../logger')
const mongoose = require('mongoose')
/**
 * @description - Connection with the database is set through mongoose framework
 */

exports.mongooseConnection=()=> {
    mongoose.connect(dbConfig.url, { useNewUrlParser: true }, (err) => {
        if (err) {
            logger.error("Connection failed", err)
        } else {
            logger.info(`MongoDB database established succesfully !`);
        }
    });
}