const mongoose = require("mongoose");

const Schema = mongoose.Schema({
  firstName:{type:String,required:true},
  surName:{type:String,required:true},
  email:{type:String,required:true},
  password:{type:String,required:true},
  userType:{type:String,required:true}
})

module.exports = mongoose.model('user',Schema,'user');