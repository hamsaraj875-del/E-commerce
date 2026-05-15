const mongoose = require("mongoose");

const offerSchema = mongoose.Schema({
  offerImage:{type:String,required:true},
});

module.exports = mongoose.model("offers",offerSchema);