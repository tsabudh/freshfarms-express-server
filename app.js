const express = require("express");
const fs = require("fs");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");

const {
  addCustomer,
  getAllCustomers,
  getCustomer,
  updateCustomer,
  deleteCustomer,
} = require("./controller/customerController");

const { createAdmin } = require("./controller/adminController");
const {
  validateAccount,
  loginAccount,
  checkClearance,
  logoutAccount,
} = require("./controller/authController");

const Customer = require("./model/customerModel");
const Product = require("./model/productModel");
const {
  addProduct,
  updateManyProducts,
  getProduct,
  updateProduct,
} = require("./controller/productController");
const {
  createTransaction,
  getAllTransactions,
} = require("./controller/transactionController");

const app = express();
app.use(cors());
app.use(bodyParser.json());

const customers = JSON.parse(fs.readFileSync("./customer.json", "UTF-8"));

app.route("/customers").get(checkClearance, getAllCustomers).post(addCustomer);

app
  .route("/customers/:id")
  .get(getCustomer)
  .patch(updateCustomer)
  .delete(deleteCustomer);

app.route("/admins").post(createAdmin);

app.route("/login").post(validateAccount, loginAccount);
app.use("/logout", logoutAccount);

app
  .route("/products")
  .post(checkClearance, addProduct)
  .patch(checkClearance, updateManyProducts);

app
  .route("/products/:id")
  .get(checkClearance, getProduct)
  .patch(checkClearance, updateProduct);

app
  .route("/transactions")
  .get(getAllTransactions)
  .post(checkClearance, createTransaction);

app.use("/", (req, res, next) => {
  res.send("Welcome to Shree Krishna Dairy's API");
});

module.exports = app;
