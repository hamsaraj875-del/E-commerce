//external modules
const path = require('path');
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

//Local modules
const fs = require("fs");
const database = require('../models/database');
const cartDatabase = require("../models/cartDatabase");

exports.homePage = async(req,res,next)=>{
  try{
    const itemList = await(database.find());
    const notify = await cartDatabase.find({userId:req.session.userId});
    if(req.session.isLoggedIn){
      const userName = req.session.userName;
      return res.render("index",{message:req.session.message,notify:notify.length,userType:req.session.userType,userName,itemList,page:"home"});
    }
    console.log(req.session.isLoggedIn);
    res.render("index",{message:"🎉 Welcome back! ",notify:notify.length,itemList,page:"home",userType:req.session.userType});
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
    return res.render("add",{notify:notify.length,page:"add",userType:req.session.userType});
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
      return res.render("add",{notify:notify.length,oldInput:itemDetails,page:"add",userType:req.session.userType,userName:req.session.userName});
    })
    .catch(err=>{
      console.log(err);
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
  const userId = new mongoose.Types.ObjectId(req.session.userId);
  const cartDetails = new cartDatabase({itemId,userId});
  cartDatabase.findOne({itemId:itemId,userId:userId}).then((found)=>{
    if(!found){
      cartDetails.save().then(()=>{
        req.session.message="🛍️ Nice choice! Item added";
        return res.redirect("/home");
      })
    }else{
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
    return res.redirect("/cart");
  }
  catch(err){
    console.log(err);
    res.redirect("/cart");
  }
}

//Display Cart 
exports.displayCart = async(req,res,next)=>{
  try{
    const cartList = await cartDatabase.find({userId:new mongoose.Types.ObjectId(req.session.userId)}).populate("itemId");
    cartDatabase.find({userId:req.session.userId}).then((notify)=>{
      return res.render("cart",{notify:notify.length,page:"cart",cartList:cartList,userType:req.session.userType,userName:req.session.userName});
    })
    .catch(err=>{
      return res.redirect("/home");
    });
  }
  catch(err){
    console.log(err);
    return res.redirect("/home");
  }
}

//Display History 
exports.displayHistory = (req,res,next)=>{
  cartDatabase.find({userId:req.session.userId}).then((notify)=>{
    return res.render("history",{notify:notify.length,page:"history",userName:req.session.userName,userType:req.session.userType});
  })
  .catch(err=>{
    return res.redirect("/home");
  })
}

//Display Buying details
exports.buyDetails = (req,res,next)=>{
  const itemId = req.params.id;
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