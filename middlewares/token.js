let jwt = require('jsonwebtoken');
const redisService = require('../services/redisService')
require('dotenv').config()

module.exports = {

    generateToken(payload) {

        //let token = jwt.sign(payload, process.env.UNIQUE_KEY, { expiresIn: '24h' }) //combines the unique id and the private key 

        let token = jwt.sign(payload, 'p$%#u$%43r@123u**/', { expiresIn: '24h' }) //combines the unique id and the private key 

        let object = {
            success: true,
            message: "token generated",
            token: token
        }

        return object;

    },

    verifyToken(req, res, next) {

         //console.log('request', req.headers.token);
        let token = req.headers.token;
        // console.log("\n\n\tToken in verify token method :", token);

        if (token) {
            console.log("in token verification ")
            //jwt.verify(token, process.env.UNIQUE_KEY, (err, data) => {
            jwt.verify(token, 'p$%#u$%43r@123u**/', (err, verifyData) => {

                if (err) {
                    console.log(`\n\n\tINVALID TOKEN `);
                    res.status(400).send(err)
                }
                else {

                    redisService.getCache(verifyData._id + 'afterLoginToken').then((data) => {
                        console.log("\n\n\tReceived token-->",token)
                        console.log("\n\n\tToken from redis-->",data)
                        if (token === data) {
                            req.token = verifyData; //token added in the request process
                            console.log(`\n\n\tToken verified successfully !`);
                            next(); //passes to the next argument in route --->controller
                        }
                        else {

                            res.status(400).send('Error in verifying token ')
                        }
                    }).catch((error) => {
                        res.status(400).send("error in token file")
                    })

                }
            })
        }
        else {
            console.log("\n\n\tTOKEN NOT RECEIVED",req.body);
            res.status(400).send(" TOKEN NOT RECEIVED !!! ")
        }

    }
,
    verifyRegistrationToken(req, res, next) {

        console.log('request', req.headers.token);
       let token = req.headers.token;
       // console.log("\n\n\tToken in verify token method :", token);

       if (token) {
           console.log("in verify")
           //jwt.verify(token, process.env.UNIQUE_KEY, (err, data) => {
           jwt.verify(token, 'p$%#u$%43r@123u**/', (err, verifyData) => {

               if (err) {
                   console.log(`\n\n\tINVALID TOKEN `);
                   res.status(400).send(err)
               }
               else {

                      
                           req.token = verifyData; //token added in the request process
                           console.log(`\n\n\tToken verified successfully !`);
                           next(); //passes to the next argument in route --->controller
                      
               }
           })
       }
       else {
           console.log("\n\n\tTOKEN NOT RECEIEVED",req.body);
           res.status(400).send(" TOKEN NOT RECEIVED !!! ")
       }

   },

    
}
