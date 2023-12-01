const mongoose = require("mongoose");

const productSchema = mongoose.Schema({
  name: { type: String, lowercase: true, required: true },

  price: { type: Number, required: true },

  stock: Number,

  productType: { type: String, enum: ["cow", "buffalo", "mixed"] },

  sales: { type: Number },
});

const Product = new mongoose.model("Product", productSchema);
module.exports = Product;
