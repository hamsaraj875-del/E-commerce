//external modules
const path = require('path');
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

//Local modules
const fs = require("fs");
const database = require('../models/database');
const cartDatabase = require("../models/cartDatabase");
const historyDatabase = require("../models/historyDatabase");

//Message handler function 

async function createMessage(req){
  let message = req.session.message;
  req.session.message = null;
  await req.session.save();
  return message;
}

exports.homePage = async(req,res,next)=>{
  try{
    const itemList = await(database.find());
    const notify = await cartDatabase.find({userId:req.session.userId});
    const historyNotify = await historyDatabase.find({userId:req.session.userId});
    let mes = await createMessage(req);
    if(req.session.isLoggedIn){
      const userName = req.session.userName;
      return res.render("index",{message:mes,historyNotify:historyNotify,notify:notify,userType:req.session.userType,userName,itemList,page:"home"});
    }
    res.render("index",{message:mes,notify:notify,itemList,page:"home",userType:req.session.userType});
  }
  catch(err){
    console.log(err);
    res.redirect("/home");
  }
}

//Adding login Page 
exports.loginPage = async (req,res,next)=>{
  const message =await createMessage(req);
  res.render("login",{message:message,userType:req.session.userType});
}

//Adding to the home page
exports.add = async (req,res,next)=>{
  try{
    const notify = await  cartDatabase.find({userId:req.session.userId});
    const historyNotify = await historyDatabase.find({userId:req.session.userId});
    return res.render("add",{historyNotify:historyNotify,notify:notify.length,page:"add",userType:req.session.userType});
  }
  catch(err){
    req.session.message = "Unabled to Load the page!";
    req.session.save((err)=>{
      return res.redirect("/home")
    });
  }
}

//Saving the data given
exports.savingData = async (req,res,next)=>{
  const {itemName,realPrice,discountPrice,description,key1,key2} = req.body;
  const photo = req.file.filename;
  try{
    const oldDetails = await database.findById(req.body.id)
    if(!oldDetails){
      const details = new database({itemName,realPrice,discountPrice,photo,description,key1,key2});
      await details.save();
        req.session.message = "Data saved successfully";
        req.session.save((err)=>{
          return res.redirect("/home")
        });
    }else{
      oldDetails.itemName = itemName,
      oldDetails.realPrice = realPrice,
      oldDetails.discountPrice = discountPrice,
      oldDetails.description = description
      req.session.message = "Data saved successfully";
      await oldDetails.save();
      res.redirect("/home");
    }
  }
  catch(err){
    req.session.message = "Error occured while fetching the data Please try again!!"
    return res.redirect("/home");
  }
}

//displaying the editing page
exports.edit=async (req,res,next)=>{
  const itemId = req.params.id;
  try{
    const itemDetails = await database.findById(itemId);
    return res.render("add",{oldInput:itemDetails,page:"add",userType:req.session.userType,userName:req.session.userName});
  }
  catch(err){
    console.log(err);
    req.session.message="Unabled to load the page";
    await req.session.save();
    return res.redirect("/home")
  }
}

//deleting a value
exports.delete = async (req, res, next) => {
  try {
    const item = await database.findById(req.params.id);

    if (!item) {
      req.session.message = "⚠️ Item Not Found";
      await req.session.save();
      return res.redirect("/home");
    }

    await fs.promises.unlink(path.join(__dirname, "../public/uploads", item.photo));

    await database.findByIdAndDelete(req.params.id);

    req.session.message = "🧹 Item Removed Successfully !";
    await req.session.save();
    return res.redirect("/home");

  } 
  catch (err) {
    console.log(err);
    req.session.message = "⚠️ Couldn't Delete — Try Again";
    await req.session.save();
    return res.redirect("/home");
  }
}
//Checking Cart
exports.checkCart=async (req,res,next)=>{
  const itemId = req.params.id;
  try{
    if(typeof req.session.userId==='undefined'){
      req.session.message = "login to use Cart";
      await req.session.save()
      return res.redirect("/home");
    }
    const userId = new mongoose.Types.ObjectId(req.session.userId);
    const cartDetails = new cartDatabase({itemId,userId});
    const found = await cartDatabase.findOne({itemId:itemId,userId:userId})
    if(!found){
      await cartDetails.save()
      req.session.message="🛍️ Nice choice! Item added";
      await req.session.save()
      return res.redirect("/home")
    }else{
      req.session.message="🛍️ Nice choice! Item already there"
      await req.session.save();
      return res.redirect("/home");
    }
  }
  catch(err){
    console.log(err);
    req.session.message = "⚠️ Failed to Add to Cart";
    await req.session.save();
    return res.redirect("/home");
  }
}

//Deleting from cart 

exports.deleteCart = async(req,res,next)=>{
  try{
    await cartDatabase.findByIdAndDelete(req.params.id);
    req.session.message="👍 Gone! Item removed";
    req.session.save((err)=>{
      return res.redirect("/cart")
    });
  }
  catch(err){
    console.log(err);
    req.session.message = "⚠️ Couldn’t Delete — Try Again";
    req.session.save((err)=>{
      return res.redirect("/home")
    });
  }
}


//Cart summing function
function cartSum(cartList){
  let payPrice = 0;
  let discountPrice = 0;
  for(let i=0;i<cartList.length;i++){
    payPrice += cartList[i].itemId.realPrice;
    discountPrice += cartList[i].itemId.discountPrice;
  }
  return {payPrice,discountPrice};
}


//Display Cart 
exports.displayCart = async(req,res,next)=>{
  try{
    const cartList = await cartDatabase.find({userId:new mongoose.Types.ObjectId(req.session.userId)}).populate("itemId");
    const sum = cartSum(cartList);
    const notify = await cartDatabase.find({userId:req.session.userId})
    const historyNotify =await historyDatabase.find({userId:req.session.userId})
    let message = await createMessage(req);
    return res.render("cart",{historyNotify:historyNotify,message:message,sum:sum,notify:notify,page:"cart",cartList:cartList,userType:req.session.userType,userName:req.session.userName});
  }
  catch(err){
    req.session.message = "🔄 Error Loading Page";
    await req.session.save()
    return res.redirect("/home");
  }
}


// Item Details display
exports.itemDetails = async (req,res,next)=>{
  const itemId = req.params.id;
  try{
    const itemData = await database.findById(itemId);
    const historyNotify = await historyDatabase.find({userId:req.session.userId});
    const notify = await cartDatabase.find({userId:req.session.userId});
    return res.render("details",{historyNotify:historyNotify,notify:notify,itemData:itemData,userType:req.session.userType,page:"home"});
  }
  catch(err){
    req.session.message = "❌ Something went wrong";
    console.log(err);
    await req.session.save();
    return res.redirect("/home");
  }
  
}



// Buy Check
exports.buyCheck = async (req,res,next)=>{
  const itemId = req.params.id;
  try{
    const itemData = await database.findById(itemId);
    if(!itemData){
      req.session.message = "item not found";
      await req.session.save()
        return res.redirect("/home")
    }
    const userId = req.session.userId;
    const date = new Date().toISOString().split("T")[0];
    const details = new historyDatabase({itemId,userId,date});
    await details.save();
    req.session.message = "Order Successfully Placed !";
    await req.session.save();
    return res.redirect("/history");
  }catch(err){
    console.log(err);
    req.session.message = "⚠️ Failed to Place Order"
    await req.session.save();
    return res.redirect("/home")
  }
}

//Display History 
exports.displayHistory = async (req,res,next)=>{
  try{
    const notify = await cartDatabase.find({userId:new mongoose.Types.ObjectId(req.session.userId)}).populate("itemId");
    const historyNotify = await historyDatabase.find({userId:new mongoose.Types.ObjectId(req.session.userId)}).populate("itemId");
    const mes = await createMessage(req);
    let {payPrice,discountPrice} = cartSum(historyNotify);
    return res.render("history",{message:mes,payPrice:payPrice,discountPrice:discountPrice,historyNotify:historyNotify,notify:notify,page:"history",userName:req.session.userName,userType:req.session.userType});
  }
  catch(err){
    console.log(err);
    req.session.message = "🔍 No History Found";
    await req.session.save();
    return res.redirect("/home");
  }
}


//code
exports.displayCode = async (req,res,next)=>{
  const id = req.params.id;
  try{
    const details = await historyDatabase.findById(id)
    details.payment = true;
    await details.save();
    req.session.message = "✅ Payment Successful 💳";
    await req.session.save()
    return res.redirect("/history");
  }
  catch(err){
    req.session.message = "🔴 Payment Failed ! 💳 ";
    await req.session.save()
    return res.redirect("/history");
  }
}

//logout handling 
exports.logout = async (req,res,next)=>{
  try{
    req.session.message = "Logged Out Successfully !";
    req.session.userName = null;
    req.session.userType = null;
    req.session.isLoggedIn = false;
    req.session.userId = null;
    await req.session.save()
    return res.redirect("/login");
  }
  catch(err){
    req.session.message = "Error while Logging Out !";
    await req.session.save();
    return res.redirect("/home");
  }
}

//page not Found
exports.pageNotFound = async (req,res,next)=>{
  try{
    const notify = await cartDatabase.find({userId:req.session.userId});
    return res.render("notFound",{notify:notify.length,page:"home",userName:req.session.userName,userType:req.session.userType});
  }
  catch(err){
    console.log(err);
    return res.redirect("/home");
  }
}