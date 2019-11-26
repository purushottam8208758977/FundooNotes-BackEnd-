const mailer = require('nodemailer')
require('dotenv').config()

module.exports = {

    async nodeMailer(requestEmail, urlReceived) {

        try {
          // console.log("user  ---->", process.env.USEREMAIL)

            //console.log("url received" + urlReceived);
            let transporter =  mailer.createTransport({
            
                
                service: process.env.USERSERVICE,
                auth: {
                    user: process.env.USEREMAIL,
                    pass: process.env.USERPASSWORD
                }
            })

            let mailoptions = {
                from: process.env.USEREMAIL,
                to: requestEmail,
                subject: "Forget password : Fundoo Notes",
                html: urlReceived
            }

            let data=await transporter.sendMail(mailoptions)

            console.log("\n\n\tData in send mail method ",data);
            
                if(data)  {

                    return true // for successfully sent mail
                }
                else{
                    console.log("\n\n\tMail was not sent .. sendMail function of node mailer failed ...!");
                    return false //for mail not sent 
                }

        } catch (error) {
            console.log(error)
            return error;
        }


    }


}
