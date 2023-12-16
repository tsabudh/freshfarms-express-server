import express from "express";

import * as adminController from  "../controllers/adminController" ;
import * as authController from "../controllers/authController";

const router = express.Router();

router.route("/signup").post(adminController.createAdmin);

router
  .route("/login")
  .post(authController.validateAccount, authController.loginAccount);

router.route("/logout").post(authController.logoutAccount);

export default router;
