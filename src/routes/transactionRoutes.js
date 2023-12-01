const express = require("express");

const { transactionController, authController } = require("../controllers/");

const router = express.Router();

// Routes
router
  .route("/")
  .get(transactionController.getAllTransactions)
  .post(authController.checkClearance, transactionController.createTransaction);

module.exports = router;
