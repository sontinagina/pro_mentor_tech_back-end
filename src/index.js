const express1 = require("express");
const connection = require("./connection/Connection");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");
const app = express1();
const PORT = 8081;
const SALT = 10;
const DB_PORT = 27017;
const DB_NAME = "ProMentorTechs";
const con = connection.getConnection({ port: DB_PORT, dbname: DB_NAME });
app.use(express1.json());
mongoose.set("useFindAndModify", false);
//schemas....
const loginSchema = new mongoose.Schema({
   USERNAME: String,
   EMAILID: String,
   USERPASSWORD: String,
});
const otpSchema = new mongoose.Schema({
   USEREMAIL: String,
   OTP: String,
   DATETIME: String,
});
const testSchema = new mongoose.Schema({
   email: String,
   otp: Number,
   date: String,
});
//models~~~!
const loginModel = con.model("Login", loginSchema);
const otpModel = con.model("otp", otpSchema);
const testModel = con.model("test", testSchema);

const Auth = (req, res, next) => {
   if (req.query.pass === "pass123") {
      console.log("if runs");
      next();
   } else {
      console.log("else runs");
      res.status(401).send({ err: "password not correct" });
   }
};
app.post("/test", async (req, res) => {
   const { otp, email } = req.body;
   var currentTime = new Date();
   let result = await testModel.findOneAndUpdate(
      { email: email },
      { otp: otp, date: currentTime }
   );
   if (result === null) {
      const testData = {
         email: email,
         otp: otp,
         date: currentTime,
      };
      const test = new testModel(testData);
      result = await test.save();
   }
   res.send(result);
});
app.post("/signup", async (req, res) => {
   const { username, email, password } = req.body;
   console.log(username, email, password);
   const exinstingUser = await loginModel.findOne({ EMAILID: email });
   if (isNullOrUndefined(exinstingUser)) {
      const encryptpassword = bcrypt.hashSync(password, SALT);
      console.log(encryptpassword);
      const userDetail = {
         USERNAME: username,
         EMAILID: email,
         USERPASSWORD: encryptpassword,
      };
      const user = new loginModel(userDetail);
      await user.save(userDetail).catch((e) => {
         res.status(400).send({ err: "failed :" + e });
      });
      res.status(201).send({ msg: "success" });
   } else {
      res.status(400).send({ err: `email already exist` });
   }
});
function isNullOrUndefined(val) {
   return val === undefined || val === null;
}

app.post("/signin", async (req, res) => {
   console.log("url hit");
   try {
      const { email, password } = req.body;
      const exinstingUser = await loginModel.findOne({ EMAILID: email });
      if (isNullOrUndefined(exinstingUser)) {
         res.status(401).send({ err:```email does not exit` });
      } else {
         const hashedPwd = exinstingUser.USERPASSWORD;
         if (bcrypt.compareSync(password, hashedPwd)) {
            res.status(200).send({
               success: `log in`,
            });
         } else {
            res.status(401).send({
               err: `password don't match`,
            });
         }
      }
   } catch (e) {
      res.status(500).send({
         err: `${e}`,
      });
   }
});
function generatOtp() {
   var otp4Digit = (Math.floor(Math.random() * 10000) + 10000)
      .toString()
      .substring(1);
   return otp4Digit;
}
function TimeDiff(startDate, endDate) {
   var sec = Math.abs(endDate.getTime() - startDate.getTime()) / 1000;
   console.log(sec);
   return sec;
}
app.post("/forgotpass", async (req, res) => {
   const { type } = req.query;
   if (type === "email") {
      const {email } = req.body;
      // console.log("user: ", email);
      const allData = await loginModel.find(
         { EMAILID: email },
         { USERNAME: 1, _id: 0 }
      );
      let time = new Date();
      const timeString = time.toGMTString();
      if (allData.length > 0) {
         console.log(allData);
         const name = allData[0].USERNAME;
         let otp = generatOtp();
         let result = await otpModel.findOneAndUpdate(
            { "USEREMAIL": email },
            { "OTP": otp, "DATETIME": time }
         );
         console.log(result);
         if (result == null) {
            console.log("iff null")
            const otpDetail = {
               OTP: otp,
               USEREMAIL: email,
               DATETIME: time,
            };
      
            const result3 = new otpModel(otpDetail);
            result = await result3.save();
}
         const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            ignoreTLS: false,
            secure: false,
            auth: {
               user: "beingidentified2022@gmail.com",
               pass: "setjx9999",
            },
         });
         const mailOptions = {
            from: "beingidentified2022@gmail.com",
            to: email,
            subject: "OTP for reset passsword",
            text: `
             Hi ${name} ,
             We received a request to reset the password on your PromentorTecs Account.

              OTP : ${otp}
             Enter this code to complete the reset.

             Thanks for helping us keep your account secure.

             The PromentorTecs Team

             When  this happened
              Date:

              ${timeString}
               `,
             };

             transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
               console.log(error);
               res.status(400).send("mail not sent");
            } else {
               console.log("Email sent: " + info.response);
               res.status(200).send("mail sent");
               console.log("here");
            }
         });
      } else {
         res.status(400).send("Invalid email id");
      }
   }
   //type== email
   if(type==="otp"){
      const {otp,email}=req.body;
      const existEmail = await otpModel.findOne({USEREMAIL:email},{OTP:1,DATETIME:1,"_id":0 });
console.log("this is nagina ki line",existEmail);
const currTime=new Date();
if(existEmail!==null){
   console.log(existEmail.OTP,"otp line")
   const sec=TimeDiff(currTime,new Date(existEmail.DATETIME));

   if(existEmail.OTP==otp&&sec<180){
      console.log(sec,"seconds")
      res.status(200).send({msg:"success"});
   }else{
      res.status(200).send({msg:"otp doesn't match"});
   }
}else{
   res.status(400).send({err:"error"});

}
   }
   if(type==="confirmpass"){
const {email,password}=req.body;
if(password!==null&&password!==""&&password!==undefined){
   const encryptpassword = bcrypt.hashSync(password, SALT);
   console.log(encryptpassword);
   const existEmail = await loginModel.findOneAndUpdate({EMAILID:email},{"USERPASSWORD":encryptpassword});
   if(existEmail!==null){
res.status(200).send({msg:"success"});
   }else{
      res.status(400).send({err:"email doesn't exist"});
   }
}else{
   res.status(400).send({err:"Invalid password"});

}
}
});

app.listen(PORT, () => {
   console.log(`app is listening on port: ${PORT} ............`);
});
