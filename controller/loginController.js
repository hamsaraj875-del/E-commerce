//external modules
const express = require("express");
const {check,validationResult} = require("express-validator");
const bcrypt = require("bcrypt");
const dotenv = require("dotenv");
dotenv.config();
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.EMAIL_API);

//internal modules
const userDatabase = require("../models/userDatabase");
const database = require("../models/database");
const cartDatabase = require("../models/cartDatabase");



//display signup page
exports.signUp = (req,res,next)=>{
  const message = messageCreator(req);
  res.render("sign",{message,details:req.session.details});
}


//login message creator.
const messageCreator = (req)=>{
  const message = req.session.message;
  req.session.message = null;
  return message;
}

//display login page
exports.login = (req,res,next)=>{
  const message = messageCreator(req);
  res.render("login",{message:message});
}

//Confirming login
exports.loginCheck=(req,res,next)=>{
  const email = req.body.email;
  userDatabase.findOne({email}).then((details)=>{
    if(details.userType === req.body.userType){
      bcrypt.compare(req.body.password,details.password).then(result=>{
        if(result){
          req.session.isLoggedIn=true;
          req.session.userName=details.firstName;
          req.session.userType=details.userType;
          req.session.userId=details._id.toString();
          database.find().then(list=>{     
            req.session.message = "👋 Welcome back! 🎉 Login successful ✔️";
            req.session.save((err)=>{
              return res.redirect("/home");
            });
          })
          .catch(err=>{
            console.log(err);
            req.session.message = "❌ Failed to load data. Kindly try again later."
            req.session.save((err)=>{
              return res.redirect("/home")
            });
          });
        }else{
          console.log("no matches found");
          req.session.message = "🔑 Invalid username or password";
          req.session.save((err)=>{
            return res.redirect("/login")
          });
        }
      })
    }
    else{
      console.log("invalid type");
      req.session.message = "🔑 Invalid username or password";
      req.session.save((err)=>{
        return res.redirect("/login")
      });
    }
  })
  .catch(err=>{
    console.log(err);
    req.session.message = "🔑 Invalid username or password";
    req.session.save((err)=>{
      return res.redirect("/login")
    });
  })
}

//Generate Otp 

const generateOtp = ()=>{
  return Math.round(100000+Math.random()*900000);
}

//Email function

const generateEmail = async(email,otpValue) =>{
  try{
    await sgMail.send({
      to: email,
      from: "todo.aim.09@gmail.com", 
      subject: "Your OTP",
      html:`
        <div style="background-color:#f4f4f4; padding:20px;">
          <div>
            <h2 style="text-align:center; color:#333;">🔐 Verify Your Email</h2>
            
            <p style="font-size:16px;">
              Hello,
            </p>
            
            <p style="font-size:16px; color:#555;">
              Use the OTP below to complete your sign up for <b>E-Commerce-App </b>:
            </p>
            
            <div style="text-align:center;">
              <span style="font-size:28px; letter-spacing:5px;color:#2c3e50; background:#f1f1f1; padding:10px 20px; border-radius:8px;">
                ${otpValue}
              </span>
            </div>
            
            <p style="font-size:14px; color:#777;">
              ⏳ This OTP is valid for <b>2 minutes</b>.
            </p>
            
            <p style="font-size:14px; color:#777;">
              If you didn’t request this, you can safely ignore this email.
            </p>
            
            <hr style="margin:20px 0;">
            
          </div>
        </div>
      `
    });
  }
  catch(err){
    console.log(err);
    console.log("email is not sent error occured");
    throw err;
  }
}

//confirming signing value
exports.confirmSignUp = [
  check('firstName')
  .notEmpty()
  .withMessage('⚠️ Please enter your name to continue.')
  .isLength({min:2})
  .withMessage('❌ Minimum 2 characters required for name.')
  .matches(/^[a-zA-Z]+$/)
  .withMessage('🚫 Special characters are not permitted in name.'),

  check('surName')
  .notEmpty()
  .withMessage('❌ Minimum 2 characters required for Surname.')
  .isLength({min:1})
  .withMessage('Atleast 1 character')
  .matches(/^[a-zA-Z]/)
  .withMessage('🚫 Special characters are not permitted in Surname.'),

  check('email')
  .isEmail()
  .withMessage('🔴 Invalid email entered.')
  .custom(async(value)=>{
    const user = await userDatabase.findOne({email:value});
    if(user){
      throw new Error("⚠️ Email already exists. Please log in.");
    }
  }),
  check('userType')
  .notEmpty()
  .withMessage('⚠️ Please select a user type.'),

  check('password')
  .notEmpty()
  .withMessage('🚫 Invalid password. Password field cannot be empty.')
  .isLength({min:8})
  .withMessage('⚠️ Password must contain at least 8 characters.')
  .matches(/[a-z]/)
  .withMessage('⚠️ Password must contain lowercase characters.')
  .matches(/[A-Z]/)
  .withMessage('⚠️ Password must contain uppercase  characters.')
  .matches(/[0-9]/)
  .withMessage('⚠️ Password must contain number.')
  .matches(/[^a-zA-Z0-9]/)
  .withMessage('⚠️ Password must contain special characters.'),

  check('confirmPassword')
  .trim()
  .custom((value,{req})=>{
    if(value!=req.body.password){
      throw new Error('🔒 The passwords entered are different.')
    }
    return true;
  }),
  async (req,res,next)=>{
    const errors = validationResult(req);
    if(errors.isEmpty()){
      const {userType,firstName,surName,email,password} = req.body;
      try{
        const hashPassword = await bcrypt.hash(password,12)
        req.session.details = {firstName,surName,email,password:hashPassword,userType};
        req.session.otp={
          otpCode:generateOtp(),
          otpExpiry:Date.now()+1000*60*2
        }
        await generateEmail(email,req.session.otp.otpCode);
        req.session.message = `📧 Email has been successfully sent to  ID: ${email.toString().slice(0,11)} ....`;
        req.session.save(err=>{
          return res.redirect("/otp");
        });
      }
      catch(err){
        console.log(err);
        req.session.message = "❌ Failed to send OTP. Kindly try again later.";
        req.session.save((err)=>{
          return res.redirect("/otp")
        });
      }
    }
    else{
      req.session.message = errors.array()[0].msg;
      req.session.save(err=>{
        return res.redirect("/signUp");
      })
    }
  }
]

//OTP Checking
exports.otpChecker = async(req,res,next) =>{
  const {first,second,third,fourth,fifth,sixth} = req.body;
  if(req.session.otp.otpCode == Number(first+second+third+fourth+fifth+sixth) && req.session.otp.otpExpiry > Date.now()){
    const userDetails = new userDatabase(req.session.details);
    try{
      const details = await userDetails.save();
      req.session.isLoggedIn = true;
      req.session.userName = details.firstName;
      req.session.userId = details._id.toString();
      req.session.userType = details.userType;
      req.session.message = "👋 Welcome 🎉 Login successful ✔️";
      req.session.save(err=>{
        return res.redirect("/home");
      })
    }
    catch(err){
      console.log(err);
      req.session.message = "❌ Login Unsuccessfull . Kindly try again later.";
      req.session.save(err=>{
        return res.redirect("/home");
      })
    }
    
  }else{
    req.session.message = "🔐 Invalid or expired OTP. Please try again.";
    req.session.save(err=>{
      return res.redirect("/otp");
    })
  }
}
//OTP checking handler
exports.otp= (req,res,next)=>{
  const message = messageCreator(req);
  return res.render("otp",{message});
}