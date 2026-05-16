//External modules
const express = require("express");
const app = express();
const path = require('path');
const mongoose = require("mongoose");
const multer = require("multer");
const session = require("express-session");
const mongoDBStore = require("connect-mongodb-session")(session);
const dotenv = require("dotenv");
dotenv.config();

//Internal modules
const port = 3000 || process.env.PORT;
const login = require("./login");
const controller = require("../controller/control.js");
const database = require("../models/database");
const cartDatabase = require("../models/cartDatabase");
const user = require("../models/userDatabase");

//View Engines 
app.set('views','views');
app.set('view engine','ejs');

//Including the cascading style sheet
app.use(express.static(path.join(__dirname,'../public')));

//Input Reading
app.use(express.urlencoded({extended:true}));


const store = new mongoDBStore({
  uri:process.env.DB,
  collection:'session',
  expires:60*60*24*5
})

//Handling sessions
app.use(session({
  secret:process.env.SECRETKEY,
  saveUninitialized:false,
  store:store,
  resave:false,
  rolling:true,
  cookie: {
    httpOnly: true,
    maxAge: 1000 * 60*60*5,
    secure: process.env.NODE_ENV === "production"
  }
}))

//File Input and Output handling
const storage = multer.diskStorage({
  destination:(req,file,cb)=>{
    cb(null,path.join(__dirname,"../public/uploads"));
  },
  filename:(req,file,cb)=>{
    cb(null,file.originalname);
  }
})

const fileFilter = (req,file,cb)=>{
  if(['image/jpg','image/png','image/jpeg'].includes(file.mimetype)){
    cb(null,true);
  }else{
    cb(null,false);
  }
}

app.use(multer({storage,fileFilter}).single('file'));

//Router initialisation
app.use(login)


//Checker function for the user and host
function checkHost(req,res,next){
  if(req.session.userType=="Host"){
    return next();
  }
  res.redirect("/");
}
function checkUser(req,res,next){
  if(req.session.userType == "User" || req.session.userType == "Guest"){
    return next();
  }
  res.redirect("/");
}

//cart User Usage
async function cartUser(req,res,next){
  if(req.session.isLoggedIn == true){
    return next();
  }
  req.session.message = "Login to use cart";
  res.redirect("/login");
}
app.set('trust proxy', 1); 
//session default Declaration
function sessionDefault(req,res,next){
  if(!req.session.userType){
    req.session.userType = "Guest";
    req.session.isLoggedIn = false;
    req.session.userName = "No Account Found !";
  }
  next();
}

app.use(sessionDefault);
//Request Handler
app.get("/home",controller.homePage);
app.post("/home",controller.homePage);
app.get("/add",checkHost,controller.add);
app.post("/add",checkHost,controller.savingData);
app.get("/addOffer",checkHost,controller.displayOffer);
app.post("/offer",checkHost,controller.saveOffer);
app.get("/edit/:id",checkHost,controller.edit);
app.post("/delete/:id",checkHost,controller.delete);
app.get("/cart",cartUser,checkUser,controller.displayCart);
app.get("/details/:id",controller.itemDetails);
app.post("/addToCart/:id",checkUser,cartUser,controller.checkCart);
app.post("/deleteCart/:id",checkUser,cartUser,controller.deleteCart);
app.post("/buyConfirm/:id",checkUser,cartUser,controller.buyCheck);
app.get("/history",cartUser,checkUser,controller.displayHistory);
app.get("/buyCode/:id",checkUser,cartUser,controller.displayCode);
app.get("/logout",cartUser,controller.logout);
app.get("/",controller.pageNotFound);

//Request listener
mongoose.connect(process.env.DB).then(()=>{
  console.log("mongoose and server are connected successfully");
  app.listen(process.env.PORT,()=>{
    console.log(`server is running in http://localhost:${port}/home`)
  })
})