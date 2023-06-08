const express = require("express");

const router = express.Router();

const customerController = require("../controller/customerController");
const authController = require("../controller/authController");

router
  .route("/")
  .get(authController.checkClearance, getAllCustomers)
  .post(authController.checkClearance, customerController.addCustomer);

router
  .route("/:id")
  .get(authController.checkClearance, customerController.getCustomer)
  .patch(authController.checkClearance, customerController.updateCustomer)
  .delete(authController.checkClearance, customerController.deleteCustomer);


  module.exports = router;
