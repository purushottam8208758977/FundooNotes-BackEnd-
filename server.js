/*************************************************************************
 * Execution        : 1. default node       cmd> nodemon server.js
 * 
 * Purpose          : Server acts as the entry point of the backend of fundo notes
 * 
 * @file            : server.js
 * @author          : Purushottam
 * @version         : 1.0
 * @since           : 23-09-2019
 * 
 **************************************************************************/

const express = require('express');
const validator = require('express-validator')
const bodyParser = require('body-parser');
const app = express()
const mongoose = require('mongoose');
const logger = require('./logger')
const mongooseService = require('./services/databaseConnection')
const route = require('./routes/route');
const cors = require('cors')
const swaggerUi = require('swagger-ui-express')
const swaggerDocument = require('./swagger/swagger.json')

mongoose.set('useCreateIndex', true)
mongoose.set('useFindAndModify', false);
mongoose.set('useUnifiedTopology', true)
 
require('dotenv').config()
app.use(cors())
app.use(bodyParser.json());
app.use(validator());
app.use('/swagger', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use('/', route)

/**
 * @description - An event is emitted or listened when PORT is turned on
 */
app.listen(process.env.PORT, () => {
    logger.info(`Server is running on Port : ${process.env.PORT}`);
    mongooseService.mongooseConnection()
})

module.exports = app

