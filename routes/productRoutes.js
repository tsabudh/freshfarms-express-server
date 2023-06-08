const express = require("express");

const productController = require("../controller/productController");
const authController = require("../controller/authController");

const router = express.Router();

router
  .route("/")
  .post(authController.checkClearance, productController.addProduct)
  .patch(authController.checkClearance, productController.updateManyProducts);

router
  .route("/:id")
  .get(authController.checkClearance, productController.getProduct)
  .patch(authController.checkClearance, productController.updateProduct);

module.exports = router;
