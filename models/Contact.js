const mongoose = require("mongoose");

const ContactSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, "First name is required"],
  },
  lastName: {
    type: String,
    required: [true, "Last name is required"],
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    match: [/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/, "Please enter a valid email"],
  },
  subject: {
    type: String,
    required: [true, "Subject is required"],
  },
  message: {
    type: String,
    required: [true, "Message is required"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Contact", ContactSchema);
