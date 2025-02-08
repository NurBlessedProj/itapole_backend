const Cart = require("../models/Cart");

const cartController = {
  getCart: async (req, res) => {
    try {
      const { userId } = req.query;
      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }

      let cart = await Cart.findOne({ userId });
      if (!cart) {
        cart = await Cart.create({ userId, items: [] });
      }

      res.json(cart);
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error fetching cart", error: error.message });
    }
  }, // In cartController.js
  addToCart: async (req, res) => {
    try {
      const { userId, productId, name, price, quantity, image } = req.body;

      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }

      if (!productId) {
        return res.status(400).json({ message: "Product ID is required" });
      }

      let cart = await Cart.findOne({ userId });
      if (!cart) {
        cart = await Cart.create({ userId, items: [] });
      }

      const productIdString = productId.toString();
      const existingItemIndex = cart.items.findIndex(
        (item) => item.productId === productIdString
      );

      if (existingItemIndex > -1) {
        // Update existing item
        cart.items[existingItemIndex] = {
          ...cart.items[existingItemIndex],
          quantity: parseInt(quantity),
          price: price, // Update price in case it changed
          name: name, // Update name in case it changed
          image: image, // Update image in case it changed
        };
      } else {
        // Add new item
        cart.items.push({
          productId: productIdString,
          name,
          price,
          quantity: parseInt(quantity),
          image,
        });
      }

      await cart.save();

      // Return the complete cart
      const updatedCart = await Cart.findOne({ userId });
      res.json(updatedCart);
    } catch (error) {
      console.error("Cart addition error:", error);
      res.status(500).json({
        message: "Error adding to cart",
        error: error.message,
      });
    }
  },
  removeFromCart: async (req, res) => {
    try {
      const { userId } = req.query;
      const { productId, size } = req.params;

      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }

      const cart = await Cart.findOne({ userId });
      if (!cart) {
        return res.status(404).json({ message: "Cart not found" });
      }

      cart.items = cart.items.filter(
        (item) => !(item.productId === productId && item.size === size)
      );

      const updatedCart = await cart.save();
      res.json(updatedCart);
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error removing from cart", error: error.message });
    }
  },

  updateQuantity: async (req, res) => {
    try {
      const { userId } = req.query;
      const { productId, size } = req.params;
      const { quantity } = req.body;

      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }

      if (parseInt(quantity) < 1) {
        return res.status(400).json({ message: "Quantity must be at least 1" });
      }

      const cart = await Cart.findOne({ userId });
      if (!cart) {
        return res.status(404).json({ message: "Cart not found" });
      }

      const item = cart.items.find(
        (item) => item.productId === productId && item.size === size
      );

      if (!item) {
        return res.status(404).json({ message: "Item not found in cart" });
      }

      item.quantity = parseInt(quantity);
      const updatedCart = await cart.save();
      res.json(updatedCart);
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error updating quantity", error: error.message });
    }
  },
};

module.exports = cartController;
