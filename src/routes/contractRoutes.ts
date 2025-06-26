import express from "express";
import {
  confirmDeliveries,
  createContract,
  deleteContract,
  getAllContracts,
  markTodaysDelivery,
} from "../controllers/contractController";
import * as authController from "../controllers/authController";

const router = express.Router();

//- Restrict following endpoints to admin user only
router.use(authController.restrictTo("admin"));

router.route("/").get(getAllContracts).post(createContract);

router.route("/deliveryCheck").post(confirmDeliveries, markTodaysDelivery);

router.route("/:id").delete(deleteContract);

export default router;
