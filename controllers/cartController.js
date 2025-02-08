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
  }, // In your backend cart controller
  addToCart: async (req, res) => {
    try {
      const { userId, productId, name, price, quantity, image } = req.body;

      // Find existing cart for user
      let cart = await Cart.findOne({ userId });

      if (!cart) {
        // Create new cart if doesn't exist
        cart = new Cart({ userId, items: [] });
      }

      // Check if item already exists
      const existingItemIndex = cart.items.findIndex(
        (item) => item.productId === productId
      );

      if (existingItemIndex > -1) {
        // Update existing item quantity
        cart.items[existingItemIndex].quantity = quantity;
      } else {
        // Add new item
        cart.items.push({
          productId,
          name,
          price,
          quantity,
          image,
        });
      }

      // Save cart
      await cart.save();

      res.status(200).json({
        success: true,
        items: cart.items,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error updating cart",
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
