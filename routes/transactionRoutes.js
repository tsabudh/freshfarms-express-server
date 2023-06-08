const express = require("express");

const transactionController = require("../controller/transactionController");
const authController = require("../controller/authController");

const router = express.Router();

// Routes
router
  .route("/")
  .get(transactionController.getAllTransactions)
  .post(authController.checkClearance, transactionController.createTransaction);

module.exports = router;
