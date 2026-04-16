DB = "mongodb+srv://Hamsaraj:Chshha091420@bnb.jzkkvzd.mongodb.net/E-commerce?appName=bnb";
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