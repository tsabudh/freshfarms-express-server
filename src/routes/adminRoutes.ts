import express from "express";

import * as adminController from "../controllers/adminController";
import * as authController from "../controllers/authController";
import { validateAdminDetails } from "../Validations/adminValidator";
import { checkValidationErrors } from "../Validations/checkValidationErrors";
import cleanCache from "../middlewares/cleanCache";


const router = express.Router();

router
  .route("/login")
  .post(authController.validateAccount, authController.loginAccount);

router.route("/signup").post(validateAdminDetails(false), checkValidationErrors, cleanCache, adminController.signupAdmin);

//- Check clearance at all routes except login or signup
router.use(authController.checkClearance);

router.route("/getMyDetails").get(adminController.getMyDetails)

router.route("/upload")
  .post(adminController.uploadFile, adminController.resizeImage, adminController.uploadPhoto);

router.route("/logout").post(authController.logoutAccount);

export default router;
