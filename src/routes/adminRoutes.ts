import express from "express";

import * as adminController from "../controllers/adminController";
import * as authController from "../controllers/authController";
import { validateAdminDetails } from "../Validations/adminValidator";
import { checkValidationErrors } from "../Validations/checkValidationErrors";


const router = express.Router();

router
  .route("/login")
  .post(authController.validateAdminAccount, authController.loginAccount);

router.route("/signup").post(validateAdminDetails(false), checkValidationErrors, adminController.signupAdmin);

router.route("/refreshToken").get(authController.checkAuthentication, authController.refreshJWTToken);

//- Check clearance at all routes except login or signup
router.use(authController.checkAuthentication);

router.route("/all").get(adminController.getAllAdmins);

//- Restrict following endpoints to admin user only
router.use(authController.restrictTo('admin'));

router.route("/getMyDetails").get(adminController.getMyDetailsAsAdmin);

router.route("/updateMe").patch(validateAdminDetails(true), checkValidationErrors, adminController.updateMe);
router.route("/uploadProfilePicture")
  .post(adminController.uploadFile, adminController.resizeImage, adminController.uploadPhotoToS3);

router.route("/logout").post(authController.logoutAccount);

export default router;
