// routes/productRoutes.js
const express = require("express");
const router = express.Router();
const { upload } = require("../config/cloudinary");
const {
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductById,
} = require("../controllers/productController");

router.get("/:id", getProductById);
router.get("/", getAllProducts);
router.post("/", upload.array("productImage", 5), createProduct);
router.put("/:id", upload.array("productImage", 5), updateProduct);
router.delete("/:id", deleteProduct);

module.exports = router;
