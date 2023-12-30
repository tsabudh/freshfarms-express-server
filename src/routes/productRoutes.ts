import express from "express";

import * as productController from "../controllers/productController";
import * as authController from "../controllers/authController";

const router = express.Router();

router
  .route("/")
  .get(authController.checkClearance, productController.getAllProducts)
  .post(authController.checkClearance, productController.addProduct)
  .patch(authController.checkClearance, productController.updateManyProducts);

router
  .route("/:id")
  .get(authController.checkClearance, productController.getProduct)
  .patch(authController.checkClearance, productController.updateProduct);

export default router;
