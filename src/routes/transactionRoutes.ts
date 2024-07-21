import express from 'express';

import * as authController from "../controllers/authController";
import * as transactionController from "../controllers/transactionController"
const router = express.Router();



//- Only access following endpoints authenticated (logged in users)
router.use(authController.checkAuthentication);


// Routes
router
  .route("/")
  .get(transactionController.getAllTransactions)
  .post(authController.restrictTo('admin'), transactionController.createTransaction);

export default router;
