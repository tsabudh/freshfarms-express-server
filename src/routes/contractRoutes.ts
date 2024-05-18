import mongoose from 'mongoose';

import express from 'express';

import { confirmDeliveries, createContract, deleteContract, getAllContracts, markTodaysDelivery } from '../controllers/contractController';

const router = express.Router();

router.route("/").get(getAllContracts).post(createContract);

router.route("/deliveryCheck").post( confirmDeliveries,markTodaysDelivery);

router.route("/:id").delete(deleteContract);


export default router;