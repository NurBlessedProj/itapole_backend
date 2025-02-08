const express = require("express");
const router = express.Router();
const cartController = require("../controllers/cartController");

// Get user's cart
router.get("/", cartController.getCart);

// Add item to cart
router.post("/add", cartController.addToCart);


// Remove item from cart
router.delete("/remove/:productId/:size", cartController.removeFromCart);

// Update item quantity
router.put("/update/:productId/:size", cartController.updateQuantity);

module.exports = router;
