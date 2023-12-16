import express from 'express';

import * as authController from "../controllers/authController";
import * as transactionController from "../controllers/transactionController"
const router = express.Router();

// Routes
router
  .route("/")
  .get(transactionController.getAllTransactions)
  .post(authController.checkClearance, transactionController.createTransaction);

export default  router;
