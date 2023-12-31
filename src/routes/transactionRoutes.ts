import express from 'express';

import * as authController from "../controllers/authController";
import * as transactionController from "../controllers/transactionController"
import cleanCache from '../middlewares/cleanCache';
const router = express.Router();

// Routes
router
  .route("/")
  .get(transactionController.getAllTransactions)
  .post(authController.checkClearance, cleanCache, transactionController.createTransaction);

export default  router;
