const express = require("express");
const mongoose = require("mongoose");
const {
  listProducts,
  createProduct,
  getProduct,
  updateProduct,
  deleteProduct,
} = require("./productController.js");

const router = express.Router();

router.param("id", (req, res, next, id) => {
  if (!mongoose.isObjectIdOrHexString(id)) {
    return res.status(400).json({ message: "상품 번호가 올바르지 않습니다." });
  }

  next();
});

router.get("/", listProducts);
router.post("/", createProduct);
router.get("/:id", getProduct);
router.patch("/:id", updateProduct);
router.delete("/:id", deleteProduct);

module.exports = router;
