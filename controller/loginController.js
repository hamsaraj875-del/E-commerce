//external modules
const express = require("express");
const {check,validationResult} = require("express-validator");
const bcrypt = require("bcrypt");

//internal modules
const userDatabase = require("../models/userDatabase");
const database = require("../models/database");
const cartDatabase = require("../models/cartDatabase");

//display signup page
exports.signUp = (req,res,next)=>{
  res.render("sign");
}

//display login page
exports.login = (req,res,next)=>{
  res.render("login");
}

//Confirming login
exports.loginCheck=(req,res,next)=>{
  const email = req.body.email;
  userDatabase.findOne({email}).then((details)=>{
    if(details.userType === req.body.userType){
      bcrypt.compare(req.body.password,details.password).then(result=>{
        if(result){
          req.session.loggedIn=true;
          req.session.userName=details.firstName;
          req.session.userType=details.userType;
          req.session.userId=details._id.toString();
          database.find().then(list=>{
            cartDatabase.find({userId:req.session.userId}).then((notify)=>{
              return res.render("index",{notify:notify.length,page:"home",itemList:list,userName:req.session.userName,userType:req.session.userType})
            })
            .catch(err=>{
              return res.render("index",{notify:0,page:"home",itemList:list,userName:req.session.userName,userType:req.session.userType})
            })
          })
          .catch(err=>{
            console.log(err);
            return res.render('login',{error:"invalid username or password"});
          });
        }else{
          console.log(err);
          return res.render('login',{error:"invalid username or password"});
        }
      })
    }
    else{
      return res.render('login',{error:"invalid username or password"});
    }
  })
  .catch(err=>{
    console.log(err);
    return res.render('login',{error:"invalid username or password"});
  })
}

//confirming signing value
exports.confirmSignUp = [
  check('firstName')
  .notEmpty()
  .withMessage('name cannot be empty')
  .isLength({min:2})
  .withMessage('Atleast 2 character')
  .matches(/^[a-zA-Z]+$/)
  .withMessage('Speacial Character not allowed'),

  check('surName')
  .notEmpty()
  .withMessage('Atleast 1 character')
  .isLength({min:1})
  .withMessage('Atleast 1 character')
  .matches(/^[a-zA-Z]/)
  .withMessage('Speacial Character not allowed'),

  check('email')
  .isEmail()
  .withMessage('Invalid Email')
  .custom(async(value)=>{
    const user = await userDatabase.findOne({email:value});
    if(user){
      throw new Error("Email already exists");
    }
  }),

  check('password')
  .notEmpty()
  .withMessage('Invalid Password')
  .isLength({min:8})
  .withMessage('Minimum 8 character')
  .matches(/[a-z]/)
  .withMessage('should have lower case')
  .matches(/[A-Z]/)
  .withMessage('should have upper case')
  .matches(/[0-9]/)
  .withMessage('should have numbers')
  .matches(/[^a-zA-Z0-9]/)
  .withMessage('should have speacial character'),

  check('confirmPassword')
  .trim()
  .custom((value,{req})=>{
    if(value!=req.body.password){
      throw new Error('password not matching')
    }
    return true;
  }),
  (req,res,next)=>{
    const {firstName,surName,email,password} = req.body;
    const errors = validationResult(req);
    if(errors.isEmpty()){
      const {userType,firstName,surName,email,password} = req.body;
      bcrypt.hash(password,8).then(hashPassword=>{
        const details = new userDatabase({firstName,surName,email,password,userType});
        details.save().then((details)=>{
          req.session.loggedIn = true;
          req.session.userName = details.firstName;
          req.session.userType = details.userType;
          req.session.userId = details._id;
          return res.redirect("/home");
        })
        .catch(err=>{
          console.log(err);
          return res.redirect("/signUp");
        })
      })
      .catch(err=>{
        return res.redirect("/login");
      })
    }
    else{
      return res.render("sign",{error:errors.array().map(error=>error.msg)});
    }
  }
]
