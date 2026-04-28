const mongoose = require("mongoose");
const historySchema = mongoose.Schema({
  userId:{type:mongoose.Schema.Types.ObjectId,
    ref:"user",
    required:true
  },
  itemId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"items",
    required:true
  },
  date:{
    type:String,
    required:true,
  },
  payment:{
    type:Boolean,
    required:true,
    default:false,
  }
})

module.exports = mongoose.model("history",historySchema,"history");