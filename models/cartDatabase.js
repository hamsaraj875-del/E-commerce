const mongoose = require("mongoose");
const cartSchema = mongoose.Schema({
  itemId:{type:mongoose.Schema.Types.ObjectId,
    ref:"items",
    required:true},
  userId:{type:mongoose.Schema.Types.ObjectId,
    ref:"user",
    required:true},
});

module.exports = mongoose.model("cart",cartSchema);