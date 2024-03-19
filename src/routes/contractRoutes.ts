import mongoose from 'mongoose';

import express from 'express';

import { createContract, deleteContract, getAllContracts } from '../controllers/contractController';

const router = express.Router();

router.route("/").get(getAllContracts).post(createContract);

router.route("/:id").delete(deleteContract);


export default router;