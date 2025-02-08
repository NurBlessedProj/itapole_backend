// models/Cart.js
const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  items: [
    {
      productId: {
        type: String,
        required: true,
      },
      name: String,
      price: Number,
      quantity: {
        type: Number,
        required: true,
        min: 1,
      },
      size: {
        type: String,
        default: "default",
      },
      image: String,
    },
  ],
});


module.exports = mongoose.model("Cart", cartSchema);
