const express1 = require("express");
const connection1 = require("./connection/Connection");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");
const cors = require("cors");
const session = require("express-session");
const cookieParser = require("cookie-parser");

const session_secret = "ProMentorTechs";
const app = express1();
const SALT = 10;
// const DB_PORT = 27017;
const DB_NAME = "ProMentorTechs";
// const con = connection1.getConnection({ port: DB_PORT, dbname: DB_NAME });
const con = mongoose.createConnection(
   "mongodb+srv://sontinagina:sontinagina@cluster0.jdszp.mongodb.net/Pro-mentor-techs?retryWrites=true&w=majority",
   {
      useNewUrlParser: true,
      useUnifiedTopology: true,
   }
);
app.use(express1.json());
app.use(cookieParser());
// app.set('trust proxy', 1);
mongoose.set("useFindAndModify", false);
const loginSchema = new mongoose.Schema({
   ACCOUNTTYPE: String,
   USERNAME: String,
   EMAILID: String,
   USERPASSWORD: String,
});

const otpSchema = new mongoose.Schema({
   USEREMAIL: String,
   OTP: String,
   DATETIME: String,
});
const profileSchema = new mongoose.Schema({
   Name: String,
   // Image: Buffer,
   Gender: String,
   dob: Date,
   Email: String,
   LinkedLink: String,
   GitLink: String,
   MobileNumber: Number,
   Address: String,
   City: String,
   State: String,
   Experience: Number,
   JobType: String,
   TextArea: String,
   CurrentDesignation: String,
});
const stateCitySchema = new mongoose.Schema({
   StateName: String,
   StateCode: String,
   CityName: Array,
});
const testSchema = new mongoose.Schema({
   email: String,
   otp: Number,
   date: String,
});
//models~~~!
const loginModel = con.model("Login", loginSchema);
const otpModel = con.model("otp", otpSchema);
const profileModel = con.model("profile", profileSchema);
const stateCityModel = con.model("stateCityData", stateCitySchema);
const testModel = con.model("test", testSchema);


app.use(
   cors({
      methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
      credentials: true,
      origin: ['https://pro-mentor-techs.herokuapp.com','http://localhost:3000']   
   })
);
// app.use(cors());
const oneDay = 1000 * 60 * 60 * 24;
app.use(express1.json({ limit: "40mb", extended: true }));
app.use(express1.urlencoded({ limit: "40mb", extended: true }));
app.set("trust proxy", 1);

app.use(
   session({
      // secret: session_secret,
      // cookie: { maxAge: 30 * 24 * 60 * 60 * 1000 },
      // resave: true,
      // saveUninitialized: true,
      // secret: 'whatever',
      // saveUninitialized: true,
      // resave: true,
      // unset: 'destroy',
      // cookie: {
      //     sameSite: 'Lax',
      //     maxAge: 600000,
         //  secure: true
      // secret: "thisismysecrctekeyfhrgfgrfrty84fwir767",
   //  saveUninitialized:true,
   //  cookie: { maxAge: oneDay },
   saveUninitialized: true,
    resave: false,
    name: "LHsession",
    secret: "thisismysecrctekeyfhrgfgrfrty84fwir767",
    resave: true,
    cookie: {
      sameSite: false,
      maxAge: 8.64e7,
      secure: false,
      httpOnly: false,
     
   }
})
);
const AuthMiddleware = async (req, res, next) => {
   console.log("middle ware hit")
   if (
      isNullOrUndefined(req.session) ||
      isNullOrUndefined(req.session.userId)
   ) {
      console.log("middleware error",req.session)
      res.status(401).send({ err: "not logged in" });
   } else {
      console.log("middleware success",req.session,req.session.userId)
      next();
   }
};
app.get("/userinfo", AuthMiddleware, async (req, res) => {
   const user = await loginModel.findById(req.session.userId);
   res.send({ email: user.USEREMAIL });
});

app.post("/test", async (req, res) => {
   console.log("test api heated.....");
   res.send("success");
});
app.get("/getUsername",AuthMiddleware, async (req, res) => {
   const userId = req.session.userId;

   console.log("user id : ", userId);
   const existingUser = await loginModel.find(
      { _id: userId },
      { USERNAME: 1, EMAILID: 1, _id: 0 }
   );
   console.log("user email:::", existingUser);

   if (isNullOrUndefined(existingUser)) {
      res.status(401).send({ err: null });
   } else {
      res.send({ user: existingUser });
   }
});
app.post("/signup", async (req, res) => {
   const { username, email, password, accounttype } = req.body;
   console.log(username, email, password, accounttype);
   const exinstingUser = await loginModel.findOne({ EMAILID: email });
   console.log(exinstingUser, "this is existing user");
   if (isNullOrUndefined(exinstingUser)) {
      const encryptpassword = bcrypt.hashSync(password, SALT);
      console.log(encryptpassword);
      const userDetail = {
         ACCOUNTTYPE: accounttype,
         USERNAME: username,
         EMAILID: email,
         USERPASSWORD: encryptpassword,
      };
      const user = new loginModel(userDetail);
      let errorExist=false;
      await user.save(userDetail).catch((e) => {
         console.log("error::: ",e);
         res.status(400).send({ err: "failed :" + e });
         errorExist=true;
      });
      if(!errorExist){
      console.log("user::",user);
      req.session.userId = user._id;
      console.log("success:::",req.session.userId);
      res.status(201).send({ msg: "success" });
      }
   } else {
      res.status(400).send({ err: `email already exist` });
   }
});
function isNullOrUndefined(val) {
   return val === undefined || val === null;
}
app.get("/getSession",async (req,res)=>{
// const {name}=req.body;
console.log("sesssion api heated.....","sessionId",req.session.userId,"session",req.session)
res.send({"sessionId":req.session.userId,"session":req.session});

})
app.post("/signin", async (req, res) => {
   console.log("url hit");
   try {
      const { email, password, accounttype } = req.body;
      console.log(email, password, accounttype, "front end paramas");
      const existingUser = await loginModel.findOne({
         EMAILID: email,
         ACCOUNTTYPE: accounttype,
      });
      console.log(existingUser, "abc");
      if (isNullOrUndefined(existingUser)) {
         res.status(401).send({ err: `Invalid username/password` });
      } else {
         const hashedPwd = existingUser.USERPASSWORD;
         if (bcrypt.compareSync(password, hashedPwd)) {
            req.session.userId = existingUser._id;
            console.log("user::",existingUser);
            console.log("sesssion::",req.session.userId);
            
            res.status(200).send({
               msg: `log in successfully`,
            });
         } else {
            res.status(401).send({
               err: `Invalid usename/password`,
            });
         }
      }
   } catch (e) {
      res.status(500).send({
         err: `${e}`,
      });
   }
});
app.get("/logout", async (req, res) => {
   console.log("logout called");
   if (!isNullOrUndefined(req.session)) {
      req.session.destroy(() => {
         res.sendStatus(200);
      });
   } else {
      res.sendStatus(200);
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
      const { email } = req.body;
      console.log("user: ", email);
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
            { USEREMAIL: email },
            { OTP: otp, DATETIME: time }
         );
         console.log(result);
         if (result == null) {
            console.log("iff null");
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
               res.status(400).send({ err: "mail not sent" });
            } else {
               console.log("Email sent: " + info.response);
               res.status(200).send({ msg: "mail sent" });
            }
         });
      } else {
         res.status(400).send({ err: "Invalid email id" });
      }
   }
   //type== email
   if (type === "otp") {
      const { otp, email } = req.body;
      const existEmail = await otpModel.findOne(
         { USEREMAIL: email },
         { OTP: 1, DATETIME: 1, _id: 0 }
      );
      console.log("this is nagina ki line", existEmail);
      const currTime = new Date();
      if (existEmail !== null) {
         console.log(existEmail.OTP, "otp line");
         const sec = TimeDiff(currTime, new Date(existEmail.DATETIME));
         console.log("seconds out:", sec);
         console.log(existEmail.OTP);
         console.log(otp);
         if (existEmail.OTP == otp && sec < 180) {
            console.log(sec, "seconds");
            res.status(200).send({ msg: "success" });
         } else {
            res.status(200).send({ err: "otp doesn't match" });
         }
      } else {
         res.status(400).send({ err: "error" });
      }
   }
   if (type === "confirmpass") {
      const { email, password } = req.body;
      console.log("last password", email, password);
      if (password !== null && password !== "" && password !== undefined) {
         const encryptpassword = bcrypt.hashSync(password, SALT);
         console.log(encryptpassword);
         const existEmail = await loginModel.findOneAndUpdate(
            { EMAILID: email },
            { USERPASSWORD: encryptpassword }
         );
         if (existEmail !== null) {
            res.status(200).send({ msg: "success" });
         } else {
            res.status(400).send({ err: "email doesn't exist" });
         }
      } else {
         res.status(400).send({ err: "Invalid password" });
      }
   }
});
//used for storing state and city (admin use only)
app.post("/saveStateCity", (req, res) => {
   const { data } = req.body;
   console.log(data);

   data.data.forEach(async (element) => {
      console.log(element);
      const stateCity = new stateCityModel(element);
      await stateCity.save().catch((e) => {
         res.status(400).send({ err: "failed :" + e });
      });
   });
   res.status(201).send({ msg: "success inserted" });
});
app.get("/getProfileDetails", AuthMiddleware, async (req, res) => {
   const userId = req.session.userId;
   const existingProfile = await profileModel.findOne(
      { _id: userId },
      { _id: 0, __v: 0 }
   );
   res.send({ getProfileInfo: existingProfile });
});
app.post("/saveProfile", AuthMiddleware, async (req, res) => {
   const {
      name,
      // img,
      gender,
      dob,
      email,
      linkedin,
      gitlink,
      mobilenumber,
      address,
      cityName,
      stateName,
      experience,
      jobtype,
      textDetail,
      currentDesignation,
   } = req.body;
   const userId = req.session.userId;
   const userDetail = {
      _id: userId,
      Name: name,
      // Image: img,
      Gender: gender,
      DOB: dob,
      Email: email,
      LinkedLink: linkedin,
      GitLink: gitlink,
      MobileNumber: mobilenumber,
      Address: address,
      City: cityName,
      State: stateName,
      Experience: experience,
      JobType: jobtype,
      TextArea: textDetail,
      CurrentDesignation: currentDesignation,
   };
   let error = "";
   if (isNullOrUndefined(name)) {
      error += "Name is mandatory, ";
   }
   if (isNullOrUndefined(dob)) {
      error += "DOB is mandatory, ";
   }
   if (isNullOrUndefined(email)) {
      error += "Email is mandatory, ";
   }
   if (isNullOrUndefined(gender)) {
      error += "Gender is mandatory, ";
   }
   if (isNullOrUndefined(currentDesignation)) {
      error += "CurrentDesignation is mandatory, ";
   }
   if (error.length > 0) {
      error = error.substring(0, error.length - 2);
      res.status(400).send({ err: error });
   }
   const user = new profileModel(userDetail);
   let error1=false;
   await user.save().catch(async (e) => {
      console.log("error 1 ::", e);
      
      await profileModel
         .findOneAndUpdate({ _id: userId }, userDetail)
         .catch((e) => {
            error1=true;
            console.log("error 2:: ", e);
            res.status(400).send({ err: "failed :" + e });
         });
   });
   if(!error1){
   res.status(201).send({ msg: "success" });
   }
});
app.get("/getStates", async (req, res) => {
   const states = await stateCityModel
      .find({}, { StateName: 1, StateCode: 1, _id: 0 })
      .catch((e) => {
         res.status(400).send({ err: "failed :" + e });
      });
   console.log(states);
   res.status(200).send({ states: states });
});
app.get("/getCities", async (req, res) => {
   const { state } = req.query;
   console.log(state);
   const cities = await stateCityModel
      .find({ StateName: state }, { CityName: 1, _id: 0 })
      .catch((e) => {
         res.status(400).send({ err: "failed :" + e });
      });
   console.log(cities);
   res.status(200).send({ cities: cities });
});
app.get("/", (req, res) => {
   console.log("server working here------>");
   res.send("server works------->");
});
app.listen(process.env.PORT || 3001);
