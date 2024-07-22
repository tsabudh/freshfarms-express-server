import express, { response } from "express";

const router = express.Router();


import * as customerController from "../controllers/customerController";
import * as authController from "../controllers/authController";
import { validateCustomerDetails } from "../Validations/customerValidator";
import { checkValidationErrors } from '../Validations/checkValidationErrors';

router
  .route("/login")
  .post(authController.validateCustomerAccount, authController.loginAccount);


//- Only access following endpoints authenticated (logged in users)
router.use(authController.checkAuthentication);

router.route("/refreshToken").get(authController.refreshJWTToken);

router.route("/getMyDetails").get(customerController.getMyDetailsAsCustomer)
router.route("/updateMyDetails").patch(
  validateCustomerDetails(true),
  checkValidationErrors,
  customerController.updateMyDetails
)

//- Restrict following endpoints to admin user only
router.use(authController.restrictTo('admin'));

router
  .route("/all")
  .get(customerController.getAllCustomers)
  .post(
    validateCustomerDetails(false),
    checkValidationErrors,
    customerController.addCustomer
  );


  router
  .route("/one/:id")
  .get(customerController.getCustomer)
  .patch(
    validateCustomerDetails(true),
    checkValidationErrors,
    customerController.updateCustomer
  )
  .delete(
    customerController.deleteCustomer
  );




export default router;
