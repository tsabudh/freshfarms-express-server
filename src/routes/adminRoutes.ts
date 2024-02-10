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

router.route("/refreshToken").get(authController.refreshJWTToken);

//- Check clearance at all routes except login or signup
router.use(authController.checkClearance);

router.route("/getMyDetails").get(adminController.getMyDetails)

router.route("/updateMe").patch(validateAdminDetails(true), checkValidationErrors, cleanCache, adminController.updateMe)
router.route("/uploadProfilePicture")
  .post(adminController.uploadFile, adminController.resizeImage, cleanCache, adminController.uploadPhotoToS3);

router.route("/logout").post(authController.logoutAccount);

export default router;
