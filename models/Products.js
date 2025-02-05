// models/Product.js
const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please provide product name"],
    trim: true,
    maxLength: [100, "Product name cannot exceed 100 characters"],
  },
  category: {
    type: String,
    required: [true, "Please provide product category"],
    trim: true,
  },
  price: {
    type: Number,
    required: [true, "Please provide product price"],
    min: [0, "Price cannot be negative"],
  },
  stock: {
    type: Number,
    required: [true, "Please provide product stock"],
    min: [0, "Stock cannot be negative"],
    default: 0,
  },
  description: {
    type: String,
    trim: true,
  },
  // Changed from single image object to array of image objects
  images: [
    {
      public_id: {
        type: String,
      },
      url: {
        type: String,
      },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Product", productSchema);
