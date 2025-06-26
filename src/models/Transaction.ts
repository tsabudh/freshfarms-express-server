import mongoose from "mongoose";

import Product from "./Product";
import Customer from "./Customer";
import AppError from "../utils/appError";
import Contract from "./Contract";

enum TransactionType {
  purchase = "purchase",
  payment = "payment",
}

interface ITransaction {
  issuedTime: Date;
  type: TransactionType;
  contract: boolean;
  contractId: mongoose.Types.ObjectId;
  customer: {
    customerId?: mongoose.Types.ObjectId;
    name?: string;
  };
  items: Array<{
    priceThen: number;
    productName: string;
    productId: mongoose.Types.ObjectId;
    quantity: number;
    code: string;
  }>;
  cost: number;
  paidInFull: boolean;
  paid: number;
  createdBy: mongoose.Types.ObjectId;
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
        code: { type: String },
      },
    ],
    paidInFull: { type: Boolean, default: true },
    contract: { type: Boolean, default: false },
    contractId: {
      type: mongoose.Schema.ObjectId,
      ref: "Contract",
      required: [
        function () {
          return this.contract === true;
        },
        "Please provide a contract id for reference.",
      ],
    },

    paid: { type: Number },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
  },
  {
    toObject: {
      virtuals: true,
    },
    toJSON: {
      virtuals: true,
    },
    timestamps: true,
  }
);

//- DATE CHECKING
transactionSchema.pre("save", function (next) {
  this.issuedTime = new Date();
  next();
});

//- CONTRACT CASES
transactionSchema.pre("save", async function (next) {
  if (this.contract != true) next();

  let contract = await Contract.findById(this.contractId);
  if (!contract)
    throw new AppError("Contract not found of given contract Id.", 400);

  if (contract) {
    this.items = await Promise.all(
      contract.items.map(async (item) => {
        const product = await Product.findById(item.productId);
        if (!product) throw new AppError("Product not found", 400);

        return {
          quantity: item.quantity,
          productId: item.productId,
          priceThen: item.price,
          productName: product.name,
          code: product.code,
        };
      })
    );
    this.paid = 0;
    contract.commencedDate.push(new Date());
    await contract.save();
  }

  next();
});

//- VIRTUAL PATH COST IMPLEMENTATION
transactionSchema.virtual("cost").get(function () {
  if (this.type != "purchase") return 0;
  let totalCost = 0;
  this.items.forEach((item) => {
    totalCost += item.priceThen * item.quantity || 0;
  });
  return totalCost;
});

//- customer object validation
transactionSchema.path("customer").validate(function () {
  return !!(this.customer.customerId || this.customer.name);
});

//- CHECK TRANSACTION TYPE
transactionSchema.pre("save", async function (next) {
  if (this.type == "payment") {
    this.items = [];

    // Refuse to make payment of 0
    if (this.paid <= 0) {
      throw new AppError("Payment cannot be zero or negative.", 400);
    }
    // Refuse to make payment of float
    if (this.paid % 1 != 0) {
      throw new AppError("Payment cannot be a decimal number", 400);
    }

    return next();
  }
});

//- reference attachment of product with price at that date
transactionSchema.pre("save", async function (next) {
  if (this.type != "purchase") return next();

  let products = await Product.find().select("name _id price code");
  this.items.forEach((item) => {
    if (item.productId) {
      let productById = products.find((product) => {
        return product._id.toString() === item.productId.toString();
      });
      if (!productById)
        throw new Error(`Product with id ${item.productId} not found.`);

      // let productById = await Product.findById(item.productId);
      item.productName = productById.name;
      item.priceThen = productById.price;
      item.code = productById.code;
    } else if (item.productName) {
      let productByName = products.find((product) =>{
        return item.productName
          ? product.name.toLocaleLowerCase() ===
            item.productName.trim().toLocaleLowerCase()
          : false
      });
      if (!productByName)
        throw new Error(`Product with name "${item.productName}" not found.`);

      item.productId = productByName._id;
      // item.productId = productByName._id.toString();
      item.productName = productByName.name;
      item.priceThen = productByName.price;
      item.code = productByName.code;
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
      next();
    } else {
      next(new Error("Customer not found with that ID"));
    }
  } else if (this.customer.name) {
    let customers = await Customer.find({ name: this.customer.name });
    if (!Array.isArray(customers))
      throw new AppError("Something went wrong!", 500);
    if (customers.length > 1)
      throw new AppError("More than one customer matches given name.", 400);
    if (customers.length == 0)
      throw new AppError("No customer matches given name.", 400);
  } else {
    this.customer.name = "unknown";
  }
});

//- rejecting if items for transaction is empty
transactionSchema.pre("save", async function (next) {
  if (this.type != "purchase") return next();

  if (this.items.length == 0) throw new Error(`Items can't be empty`);
  next();
});

//- SETTING PAID AMOUNT IF PAID IN FULL & NOT A CONTRACT
transactionSchema.pre("save", async function (next) {
  try {
    //- IF IT IS A PURCHASE, & IS PAID IN FULL
    if (this.type == "purchase" && this.paidInFull && this.contract == false) {
      this.paid = this.cost;
    }
    next();
  } catch (error: any) {
    console.log(error);
    next(error);
  }
});

//- ADDING TRANSACTION COST TO CUSTOMER ACCOUNT TAB
transactionSchema.pre("save", async function (next) {
  try {
    if (this.customer.customerId) {
      let customer = await Customer.findById(this.customer.customerId);
      if (customer) {
        //- ADDING TRANSACTION TO PURCHASE
        customer.tab.purchase = this.cost + customer.tab.purchase;

        // add to tab.paid even if transaction type is not 'purchase'
        customer.tab.paid = customer.tab.paid + this.paid;

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
      let matchedProduct = products.find((product) => {
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
