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

function createHomeMessage(req){
  let message = req.session.message;
  req.session.message = null;
  return message;
}

exports.homePage = async(req,res,next)=>{
  try{
    const itemList = await(database.find());
    const notify = await cartDatabase.find({userId:req.session.userId});
    const historyNotify = await historyDatabase.find({userId:req.session.userId});
    let mes = createHomeMessage(req);
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
exports.loginPage = (req,res,next)=>{
  res.render("login",{userType:req.session.userType});
}

//Adding to the home page
exports.add = (req,res,next)=>{
  cartDatabase.find({userId:req.session.userId}).then((notify)=>{
    historyDatabase.find({userId:req.session.userId}).then((historyNotify)=>{
      return res.render("add",{historyNotify:historyNotify,notify:notify.length,page:"add",userType:req.session.userType});
    })
    .catch(err=>{
      req.session.message = "Unabled to Load the page!";
      return res.redirect("/home");
    })
  })
  .catch(err=>{
    req.session.message = "Unabled to add";
    return res.redirect("/home");
  })
}

//Saving the data given
exports.savingData = (req,res,next)=>{
  const {itemName,realPrice,discountPrice,description} = req.body;
  const photo = req.file.filename;
  database.findById(req.body.id).then((oldDetails)=>{
    if(!oldDetails){
      const details = new database({itemName,realPrice,discountPrice,photo,description});
      details.save().then(()=>{
        req.session.message = "Data saved successfully";
        return res.redirect("/home");
      })
    }else{
      oldDetails.itemName = itemName,
      oldDetails.realPrice = realPrice,
      oldDetails.discountPrice = discountPrice,
      oldDetails.description = description
      oldDetails.save().then(()=>{
        res.redirect("/home");
      })
    }
  })
  .catch((err)=>{
    return res.redirect("/home");
  })
}

//displaying the editing page
exports.edit=(req,res,next)=>{
  const itemId = req.params.id;
  console.log(itemId);
  database.findById(itemId).then((itemDetails)=>{
    cartDatabase.find({userId:req.session.userId}).then((notify)=>{
      historyDatabase.find({userId:req.session.userId}).then((historyNotify)=>{
        return res.render("add",{historyNotify:historyNotify,notify:notify,oldInput:itemDetails,page:"add",userType:req.session.userType,userName:req.session.userName});
      })
      .catch(err=>{
        console.log(err);
        req.session.message="Unabled to load the page";
        return res.redirect("/home");
      })
    })
    .catch(err=>{
      console.log(err);
      req.session.message = "Unabled to edit"
      return res.redirect("/home");
    })
  })
}

//deleting a value
exports.delete = (req,res,next)=>{
  database.findById(req.params.id).then((item)=>{
    fs.unlink(path.join(__dirname,"../public/uploads",item.photo),(err)=>{
      if(err){
        return res.redirect("/home");
      }
      database.findByIdAndDelete(req.params.id).then(()=>{
        return res.redirect("/home");
      })
    });
  });
}

//Checking Cart
exports.checkCart=(req,res,next)=>{
  const itemId = req.params.id;
  if(typeof req.session.userId==='undefined'){
    req.session.message = "login to use Cart";
    return res.redirect("/home");
  }
  const userId = new mongoose.Types.ObjectId(req.session.userId);
  const cartDetails = new cartDatabase({itemId,userId});
  cartDatabase.findOne({itemId:itemId,userId:userId}).then((found)=>{
    if(!found){
      cartDetails.save().then(()=>{
        req.session.message="🛍️ Nice choice! Item added";
        return res.redirect("/home");
      })
    }else{
      req.session.message="🛍️ Nice choice! Item already there"
      return res.redirect("/home");
    }
  })
  .catch((err)=>{
    console.log(err);
    res.redirect("/home");
  })
}

//Deleting from cart 

exports.deleteCart = async(req,res,next)=>{
  try{
    await cartDatabase.findByIdAndDelete(req.params.id);
    req.session.message="👍 Gone! Item removed";
    return res.redirect("/cart");
  }
  catch(err){
    console.log(err);
    res.redirect("/cart");
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

//cart message function
function createCartMessage(req){
  let message = req.session.message;
  req.session.message = null;
  return message;
}

//Display Cart 
exports.displayCart = async(req,res,next)=>{
  try{
    const cartList = await cartDatabase.find({userId:new mongoose.Types.ObjectId(req.session.userId)}).populate("itemId");
    const sum = cartSum(cartList);
    cartDatabase.find({userId:req.session.userId}).sort().then((notify)=>{
      historyDatabase.find({userId:req.session.userId}).then((historyNotify)=>{
        let message = createCartMessage(req);
        return res.render("cart",{historyNotify:historyNotify,message:message,sum:sum,notify:notify,page:"cart",cartList:cartList,userType:req.session.userType,userName:req.session.userName});
      })
      .catch(err=>{
        req.session.message = "Unabled to Load the page";
        return res.redirect("/home");
      })
    })
    .catch(err=>{
      req.session.message = "Unabled to Load the cart";
      return res.redirect("/home");
    });
  }
  catch(err){
    console.log(err);
    return res.redirect("/home");
  }
}


// Item Details display
exports.itemDetails = async(req,res,next)=>{
  const itemId = req.params.id;
  try{
    const itemData = await database.findById(itemId);
    return res.render("details",{itemData:itemData,userType:req.session.userType,page:"home"});
  }
  catch(err){
    req.session.message = "❌ Something went wrong";
    console.log(err);
    return res.redirect("/home");
  }
  
}



// Buy Check
exports.buyCheck = async(req,res,next)=>{
  const itemId = req.params.id;
  try{
    const itemData = await database.findById(itemId);
    if(!itemData){
      req.session.message = "item not found";
      return res.redirect("/home");
    }
    const userId = req.session.userId;
    const date = new Date().toISOString().split("T")[0];
    const details = new historyDatabase({itemId,userId,date});
    await details.save();
    return res.redirect("/history");
  }catch(err){
    console.log(err);
    req.session.message = "Error occured while ordering !"
    return res.redirect("/home")
  }
}

//Display History 
exports.displayHistory = (req,res,next)=>{
  cartDatabase.find({userId:new mongoose.Types.ObjectId(req.session.userId)}).populate("itemId").then((notify)=>{
    historyDatabase.find({userId:new mongoose.Types.ObjectId(req.session.userId)}).populate("itemId").sort({date:-1}).then((historyNotify)=>{
      let {payPrice,discountPrice} = cartSum(historyNotify);
      return res.render("history",{payPrice:payPrice,discountPrice:discountPrice,historyNotify:historyNotify,notify:notify,page:"history",userName:req.session.userName,userType:req.session.userType});
    }).catch(err=>{
      console.log(err);
      req.session.message = "Error in Displaying history;"
      return res.redirect("/home");
    })
  }).catch(err=>{
    console.log(err);
    req.session.message= "Error occured while Displaying the cart";
    return res.redirect("/home");
  })
}


//logout handling 
exports.logout = (req,res,next)=>{
  req.session.destroy(()=>{
    return res.redirect("/login");
  })
}

//page not Found
exports.pageNotFound = (req,res,next)=>{
  cartDatabase.find({userId:req.session.userId}).then((notify)=>{
    return res.render("notFound",{notify:notify.length,page:"home",userName:req.session.userName,userType:req.session.userType});
  })
  .catch(err=>{
    return res.redirect("/home");
  })
}