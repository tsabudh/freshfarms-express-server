const express = require("express");
const fs = require("fs");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");

const {
  addCustomer,
  getAllCustomers,
  getCustomer,
  updateCustomer,
  deleteCustomer,
} = require("./controller/customerController");

const{ createAdmin} = require("./controller/adminController");

const Customer = require("./model/customerModel");
const Product = require("./model/productModel");

const app = express();
app.use(bodyParser.json());

const customers = JSON.parse(fs.readFileSync("./customer.json", "UTF-8"));

app.route("/customers").get(getAllCustomers).post(addCustomer);

app
  .route("/customers/:id")
  .get(getCustomer)
  .patch(updateCustomer)
  .delete(deleteCustomer);

app.route("/admins").post(createAdmin);


app.use("/", (req, res, next) => {
  res.send("Welcome to Shree Krishna Dairy's API");
  next();
});

module.exports = app;
