const express = require("express");
const fs = require("fs");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");

const transactionRouter = require("./routes/transactionRoutes");
const productRouter = require("./routes/productRoutes");
const customerRouter = require("./routes/customerRoutes");
const redisRouter = require("./routes/redisRoute");

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

app.route("/api/v1/admins").post(createAdmin);

app.route("/api/v1/login").post(validateAccount, loginAccount);
app.use("/api/v1/logout", logoutAccount);

app.use("/api/v1/products", productRouter);
app.use("/api/v1/transactions", transactionRouter);
app.use("/api/v1/customers", customerRouter);

app.use("/api/v1/redis", redisRouter);

app.all("*", (req, res, next) => {
  res.json({
    status: "failure",
    message: "Missed the route.",
  });
});

module.exports = app;
