//External Modules
const express = require("express");
const login = express.Router();

//File modules
const loginController = require("../controller/loginController");
const controller = require("../controller/control");

//User input
login.use(express.urlencoded({extended:false}));

login.get("/signUp",loginController.signUp);
login.post("/confirmSign",loginController.confirmSignUp);
login.get("/login",loginController.login);
login.post("/loginCheck",loginController.loginCheck);
login.get("/otp",loginController.otp);
login.post("/otpChecker",loginController.otpChecker);

login.get("/",controller.pageNotFound);

module.exports = login;