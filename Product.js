const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    tags: { type: [String], default: [] },
  },
  { timestamps: true },
);
productSchema.index({ createdAt: -1, _id: -1 });
module.exports = mongoose.model("Product", productSchema);
