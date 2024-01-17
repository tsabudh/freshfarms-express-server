import express from "express";

import * as adminController from "../controllers/adminController";
import * as authController from "../controllers/authController";
import { validateAdminDetails } from "../Validations/adminValidator";
import { checkValidationErrors } from "../Validations/checkValidationErrors";
import cleanCache from "../middlewares/cleanCache";
const router = express.Router();

router.route("/signup").post(validateAdminDetails(false), checkValidationErrors, cleanCache, adminController.signupAdmin);

router.route("/getMyDetails").get(authController.checkClearance, adminController.getMyDetails)
//! NOT DONE YET!! Include clearance

router.route("/upload")
  .post(adminController.uploadFile, adminController.resizeImage, adminController.uploadPhoto);

router
  .route("/login")
  .post(authController.validateAccount, authController.loginAccount);


router.route("/logout").post(authController.logoutAccount);

export default router;
