const express = require("express");
const { adminController, authController } = require("../controllers");

const router = express.Router();

router.route("/signup").post(adminController.createAdmin);

router
  .route("/login")
  .post(authController.validateAccount, authController.loginAccount);

router.route("/logout").post(authController.logoutAccount);

module.exports = router;
