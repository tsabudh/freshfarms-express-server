const express = require("express");
const fs = require("fs");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");

const {
  transactionRouter,
  productRouter,
  customerRouter,
  redisRouter,
  adminRouter,
} = require("./routes/");

const {
  validateAccount,
  loginAccount,
  checkClearance,
  logoutAccount,
} = require("./controllers/authController");
const { authController } = require("./controllers");

const app = express();

app.use(cors());
app.use(bodyParser.json());

app.use("/api/v1/admins", adminRouter);

app.use(authController.checkClearance);

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
