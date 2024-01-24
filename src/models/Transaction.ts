import mongoose from "mongoose";

import Product from "./Product";
import Customer from "./Customer";

enum TransactionType {
  purchase = "purchase",
  payment = "payment",
}
interface ITransaction {
  issuedTime: Date;
  type: TransactionType;
  customer: {
    customerId?: mongoose.Schema.Types.ObjectId;
    name?: string;
  };
  items: Array<{
    priceThen: number;
    productName: string;
    productId: mongoose.Schema.Types.ObjectId;
    // productId:mongoose.Types.ObjectId,
    quantity: number;
  }>;
  cost: number;
  paidInFull: boolean;
  paid: number;
  createdBy: mongoose.Schema.Types.ObjectId;
}
const transactionSchema = new mongoose.Schema<ITransaction>(
  {
    issuedTime: { type: Date, immutable: true },
    type: {
      type: String,
      enum: [TransactionType.purchase, TransactionType.payment],
      default: TransactionType.purchase,
    },
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
      required: true,
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
    paidInFull: { type: Boolean, default: true },
    paid: { type: Number },
    createdBy: { type: mongoose.Types.ObjectId, ref: 'Admin', required: true }
  },
  {
    toObject: {
      virtuals: true,
    },
    toJSON: {
      virtuals: true,
    }, timestamps: true
  }
);

//- DATE CHECKING
transactionSchema.pre("save", function (next) {
  console.log(new Date());
  this.issuedTime = new Date();
  next();
});

//- VIRTUAL PATH COST IMPLEMENTATION
transactionSchema.virtual("cost").get(function () {
  if (this.type != "purchase") return 0;
  let totalCost = 0;
  // console.log(this);
  this.items.forEach((item) => {
    totalCost += item.priceThen * item.quantity || 0;
  });
  return totalCost;
});

//- customer object validation
transactionSchema.path("customer").validate(function (value) {
  if (this.customer.customerId || this.customer.name) return true;
});

//- CHECK TRANSACTION TYPE
transactionSchema.pre("save", async function (next) {
  if (this.type == "payment") {
    this.items = [];
    return next();
  }
});

//- reference attachment of product with price at that date
transactionSchema.pre("save", async function (next) {
  if (this.type != "purchase") return next();

  let products = await Product.find().select("name _id price");
  this.items.forEach((item) => {
    if (item.productId) {
      let product1 = products.find((product) => {
        return product._id.toString() === item.productId.toString();
      });
      if (!product1)
        throw new Error(`Product with id ${item.productId} not found.`);

      // let product1 = await Product.findById(item.productId);
      item.productName = product1.name;
      item.priceThen = product1.price;
    } else if (item.productName) {
      let product2 = products.find((product) => {
        if (item.productName && product.name == item.productName)
          return item.productName.trim().toLocaleLowerCase();
      });
      if (!product2)
        throw new Error(`Product with name "${item.productName}" not found.`);

      item.productId = product2._id;
      // item.productId = product2._id.toString();
      item.productName = product2.name;
      item.priceThen = product2.price;
    } else throw new Error("provide product name or id");
  });
  next();
});

//- assigning customer name from given customer reference _id
transactionSchema.pre("save", async function (next) {
  if (this.customer.customerId) {
    let customer = await Customer.findById(this.customer.customerId);
    if (customer) {
      this.customer.name = customer.name;
    } else {
      next(new Error("Customer not found with that ID"));
    }
  }
});

//- rejecting if items for transaction is empty
transactionSchema.pre("save", async function (next) {
  if (this.type != "purchase") return next();

  console.log(this.issuedTime);
  if (this.items.length == 0) throw new Error(`Items can't be empty`);
  next();
});

//- ADDING TRANSACTION COST TO CUSTOMER ACCOUNT TAB
transactionSchema.pre("save", async function (next) {
  try {
    if (this.customer.customerId) {
      let customer = await Customer.findById(this.customer.customerId);
      if (customer) {
        console.log("Registered customer found, Adding to customer's tab.");

        //- ADDING TRANSACTION TO PURCHASE
        customer.tab.purchase = this.cost + customer.tab.purchase;

        //- IF IT IS A PURCHASE, CHECK IF PURCHASE IS PAID IN FULL
        if (this.type == "purchase" && this.paidInFull) {
          customer.tab.paid = customer.tab.paid + this.cost;
          this.paid = this.cost;
        } else {
          // add to tab.paid even if transaction type is not 'purchase'
          customer.tab.paid = customer.tab.paid + this.paid;
        }
        await customer.save();
      }
    }
    next();
  } catch (error: any) {
    console.log(error);
    next(error);
  }
});

//- DECREMENTING STOCK OF ITEMS INVOLVED IN TRANSACTIONS
transactionSchema.pre("save", async function (next) {
  if (this.type != "purchase") return next();
  try {
    // Extracting productIds of all items purchased
    let productIdArray: Array<mongoose.Types.ObjectId> = this.items.map(
      (item) => item.productId
    );

    // Querying product document within extracted productIds
    let products = await Product.find().where("_id").in(productIdArray);

    for (let item of this.items) {
      // Match product with the _id equating item's productId
      let matchedProduct = products.find((product, index, array) => {
        return product._id.toString() == item.productId.toString();
      });

      // Add to sales and decrease from stock of matched product
      if (matchedProduct) {
        (matchedProduct.stock as number) -= item.quantity as number;
        (matchedProduct.sales as number) += item.quantity as number;
        await matchedProduct.save();
      } else {
        let err = new Error(
          "LOGIC ERROR:PRODUCT ID MISMATCH || Product not in Stock"
        );
        throw err;
      }
    }

    next();
  } catch (error: any) {
    console.log(error);
    next(error);
  }
});

const Transaction = mongoose.model<ITransaction>(
  "Transaction",
  transactionSchema
);

export default Transaction;
