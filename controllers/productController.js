const Product = require("../models/Products");
const { cloudinary } = require("../config/cloudinary");

exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json({ success: true, data: products });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};
exports.createProduct = async (req, res) => {
  try {
    console.log("Request body:", req.body);
    console.log("Request files:", req.files);

    const { name, category, price, stock, description } = req.body;

    let imagesData = [];

    if (req.files && req.files.length > 0) {
      imagesData = req.files.map((file) => ({
        public_id: file.filename || file.public_id,
        url: file.path || file.secure_url,
      }));
    }

    console.log("Processed images data:", imagesData);

    const product = await Product.create({
      name,
      category,
      price: Number(price),
      stock: Number(stock),
      description,
      images: imagesData,
    });

    console.log("Created product:", product);

    res.status(201).json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error("Create Product Error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Error creating product",
    });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    // Get the existing product
    const existingProduct = await Product.findById(id);
    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        error: "Product not found",
      });
    }

    // Handle image updates if new files are uploaded
    if (req.files && req.files.length > 0) {
      // Delete existing images from Cloudinary
      if (existingProduct.images && existingProduct.images.length > 0) {
        for (const image of existingProduct.images) {
          if (image.public_id) {
            await cloudinary.uploader.destroy(image.public_id);
          }
        }
      }

      // Add new images
      updateData.images = req.files.map((file) => ({
        public_id: file.filename,
        url: file.path,
      }));
    }

    const product = await Product.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error("Update Product Error:", error);
    res.status(400).json({
      success: false,
      error: error.message || "Error updating product",
    });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        error: "Product not found",
      });
    }

    // Delete all images from Cloudinary if they exist
    if (product.images && product.images.length > 0) {
      for (const image of product.images) {
        if (image.public_id) {
          await cloudinary.uploader.destroy(image.public_id);
        }
      }
    }

    await product.deleteOne();
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};
exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        error: "Product not found"
      });
    }

    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message || "Error fetching product"
    });
  }
};
