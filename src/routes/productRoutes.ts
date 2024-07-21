import express from "express";

import * as productController from "../controllers/productController";
import * as authController from "../controllers/authController";

const router = express.Router();



router
.route("/")
.get(productController.getAllProducts);

router
.route("/:id")
.get(productController.getProduct)

//- Only access following endpoints authenticated (logged in users)
router.use(authController.checkAuthentication);

//- Restrict following endpoints to admin user only
router.use(authController.restrictTo('admin'));

router.route("/")
  .post(productController.addProduct)
  .patch(productController.updateManyProducts);

router
  .route("/:id")
  .patch(productController.updateProduct);

export default router;
