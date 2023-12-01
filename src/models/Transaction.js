const mongoose = require("mongoose");
const Product = require("./Product");
const Customer = require("./Customer");

const transactionSchema = new mongoose.Schema(
  {
    issuedTime: { type: Date, default: Date.now(), immutable: true },
    
    customer: {
      type: {
        customerId: { type: mongoose.Types.ObjectId, ref: "Customer" },
        name: {
          type: String,
          default: "Unknown Customer",
          lowercase: true,
          trim: true,
          maxLength: 50,
        },
      },
    },
    items: [
      {
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
      },
    ],
  },
  {
    toObject: {
      virtuals: true,
    },
    toJSON: {
      virtuals: true,
    },
  }
);

//* virtuals

transactionSchema.virtual("cost").get(function () {
  let totalCost = 0;
  // console.log(this);
  this.items.forEach((item) => {
    totalCost += item.priceThen;
  });
  return totalCost;
});

//* customer object validation
transactionSchema.path("customer").validate(function (value) {
  if (this.customer.customerId || this.customer.name) return true;
});

//* reference attachment of product with price at that date
transactionSchema.pre("save", async function (next) {
  let products = await Product.find().select("name _id price");
  this.items.forEach((item) => {
    if (item.productId) {
      let product1 = products.find(
        (product) => product._id.toString() == item.productId
      );
      if (!product1)
        throw new Error(`Product with id "${item.productId}" not found.`);

      // let product1 = await Product.findById(item.productId);
      item.productName = product1.name;
      item.priceThen = product1.price;
    } else if (item.productName) {
      let product2 = products.find(
        (product) => product.name == item.productName.trim().toLocaleLowerCase()
      );
      if (!product2)
        throw new Error(`Product with name "${item.productName}" not found.`);
      item.productId = product2._id;
      item.productName = product2.name;
      item.priceThen = product2.price;
    } else throw new Error("provide product name or id");
  });
  next();
});

//* assigning customer name from given customer reference _id
transactionSchema.pre("save", async function (next) {
  if (this.customer.customerId) {
    let customer = await Customer.findById(this.customer.customerId);
    this.customer.name = customer.name;
  }
});

const Transaction = mongoose.model("Transaction", transactionSchema);

module.exports = Transaction;
