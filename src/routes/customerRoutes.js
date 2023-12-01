const express = require("express");

const router = express.Router();

const {customerController, authController} = require("../controllers/");

router
  .route("/")
  .get(authController.checkClearance, customerController.getAllCustomers)
  .post(authController.checkClearance, customerController.addCustomer);

router
  .route("/:id")
  .get(authController.checkClearance, customerController.getCustomer)
  .patch(authController.checkClearance, customerController.updateCustomer)
  .delete(authController.checkClearance, customerController.deleteCustomer);


  module.exports = router;
