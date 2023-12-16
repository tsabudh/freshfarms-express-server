
import express from 'express';

const cleanCache = require("../middlewares/cleanCache.js");
const router = express.Router();

const { customerController, authController } = require("../controllers/");

router
  .route("/")
  .get(authController.checkClearance, customerController.getAllCustomers)
  .post(
    authController.checkClearance,
    cleanCache,
    customerController.addCustomer
  );

router
  .route("/:id")
  .get(authController.checkClearance, customerController.getCustomer)
  .patch(authController.checkClearance, customerController.updateCustomer)
  .delete(
    authController.checkClearance,
    cleanCache,
    customerController.deleteCustomer
  );

export default router;
