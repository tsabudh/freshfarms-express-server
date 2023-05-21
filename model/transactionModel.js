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
  try {
    if (this.productId) {
      let priceThen = await Product.findById(this.productId).price;
      this.priceThen = priceThen;
    } else if (this.productName) {
      const product = await Product.findOne({
        name: this.productName,
      });
      this.productName = product.name;
      this.productId = product._id;
    } else throw new Error();
  } catch (error) {
    console.log(error);
  }

  next();
});

const Transaction = mongoose.model("Transaction", transactionSchema);

module.exports = Transaction;
