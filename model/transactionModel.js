const mongoose = require("mongoose");
const Product = require("../model/productModel");

const transactionSchema = new mongoose.Schema({
  issuedTime: { type: Date, default: Date.now(), immutable: true },
  priceThen: {
    type: Number,
  },
  productName: {
    type: String,
  },
  productId: {
    type: mongoose.Types.ObjectId,
    ref: "Product",
  },
  quantity: { type: Number, default: 1 },
});

transactionSchema.pre("save", async function (next) {
  if (this.productId) {
    console.log("found product id");
    let product = await Product.findById(this.productId);
    this.productName = product.name;
    this.priceThen = product.price;
    next();
  } else if (this.productName) {
    console.log("found product name");
    const products = new Set([
      "Cow Milk",
      "Buffalo Milk",
      "Mixed Milk",
      "Paneer",
      "Kurauni",
      "Yogurt",
    ]);
    if (!products.has(this.productName)) {
      throw new Error(`Product named '${this.productName}' not found.`);
    }

    const product = await Product.findOne({
      name: this.productName,
    });
    this.productId = product._id;
    this.productName = product.name;
    this.priceThen = product.price;
    next();
  } else throw new Error("provide product name or id");
});

const Transaction = mongoose.model("Transaction", transactionSchema);

module.exports = Transaction;
