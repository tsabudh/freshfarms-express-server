const express = require("express");
const fs = require("fs");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");

const transactionRouter = require("./routes/transactionRoutes");
const productRouter = require("./routes/productRoutes");
const customerRouter = require("./routes/customerRoutes");

const { createAdmin } = require("./controller/adminController");

const {
  validateAccount,
  loginAccount,
  checkClearance,
  logoutAccount,
} = require("./controller/authController");



const app = express();
app.use(cors());
app.use(bodyParser.json());

const customers = JSON.parse(fs.readFileSync("./customer.json", "UTF-8"));


app.route("/admins").post(createAdmin);

app.route("/login").post(validateAccount, loginAccount);
app.use("/logout", logoutAccount);

app.use("/api/v1/products", productRouter);
app.use("/api/v1/transactions", transactionRouter);
app.use("/api/v1/customers", customerRouter)

app.all("*", (req, res, next) => {
  res.send("Welcome to Shree Krishna Dairy's API");
});

module.exports = app;
