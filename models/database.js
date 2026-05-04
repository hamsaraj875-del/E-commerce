const mongoose = require("mongoose");

const itemSchema = mongoose.Schema({
  itemName : {type:String,required:true},
  realPrice : {type:Number,requierd:true},
  discountPrice : {type:Number,required:true},
  photo:{type:String,required:true},
  key1:{type:String,required:true},
  key2:{type:String,required:true},
  description : {type:String,required:true}
})

module.exports = mongoose.model("items",itemSchema);