import express from 'express';

import {productController, authController} from "../controllers/";

const router = express.Router();

router
  .route("/")
  .post(authController.checkClearance, productController.addProduct)
  .patch(authController.checkClearance, productController.updateManyProducts);

router
  .route("/:id")
  .get(authController.checkClearance, productController.getProduct)
  .patch(authController.checkClearance, productController.updateProduct);

export default router;
